/**
 * Local-only manual ledger store for DINARO+. No bank connectivity or production claims.
 * Node 22 --experimental-sqlite; schema v1; exact bounded integer DZD minor units.
 */
import {mkdirSync,copyFileSync,chmodSync} from "node:fs";
import {dirname} from "node:path";
import {randomBytes, randomUUID, createHash, scryptSync, timingSafeEqual} from "node:crypto";
import {DatabaseSync} from "node:sqlite";

const MAX_MINOR=9_000_000_000_000n;
// Prevent SQLite signed-64bit aggregate overflow on a single asset account.
const MAX_ASSET_BALANCE=9_000_000_000_000_000_000n;
const SESSION_AGE=7*24*60*60*1000;
const EMAIL=/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export class StoreError extends Error {
  constructor(status,message){super(message);this.name="StoreError";this.status=status;}
}
function requestId(value) {
  if(typeof value!=="string"||!/^[a-zA-Z0-9:_-]{8,80}$/.test(value))
    throw new StoreError(400,"Invalid request ID");
  return value;
}
function amountMinor(value,allowZero=false){
  if(typeof value!=="string"||!/^(0|[1-9]\d{0,12})$/.test(value))
    throw new StoreError(400,"Use a decimal string of DZD minor units");
  const n=BigInt(value);
  if(n>MAX_MINOR||(allowZero?n<0n:n<1n))
    throw new StoreError(400,"Amount out of allowed range");
  return n;
}
function emailValue(value){
  if(typeof value!=="string")throw new StoreError(400,"Invalid email");
  const email=value.trim().toLowerCase();
  if(email.length>254||!EMAIL.test(email))throw new StoreError(400,"Invalid email");
  return email;
}
function passwordValue(value){
  if(typeof value!=="string"||value.length<12||Buffer.byteLength(value,"utf8")>256)
    throw new StoreError(400,"Password length must be 12+ characters, max 256 bytes");
  return value;
}
function hashPassword(password){
  const salt=randomBytes(16).toString("hex");
  return salt+":"+scryptSync(password,salt,32).toString("hex");
}
const fakeHash=hashPassword("no-user-padding-for-validation");
function verifyPassword(password,record){
  const [salt,hash]=record.split(":");
  const expected=Buffer.from(hash,"hex");
  const actual=scryptSync(password,salt,expected.length);
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
const tokenHash=token=>createHash("sha256").update(token).digest("hex");

export function openStore(filename){
  if(typeof filename!=="string"||!filename)throw new TypeError("SQLite filename is required");
  if(filename!==":memory:")mkdirSync(dirname(filename),{recursive:true});
  const db=new DatabaseSync(filename);
  db.exec("PRAGMA foreign_keys=ON");
  db.exec("PRAGMA busy_timeout=5000");
  if(filename!==":memory:")db.exec("PRAGMA journal_mode=WAL");
  const version=Number(db.prepare("PRAGMA user_version").get().user_version);
  if(version>2){db.close();throw new Error("Database version is newer than the code");}
  if(version===0){
    db.exec("BEGIN IMMEDIATE");
    try{
      db.exec("CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL)");
      db.exec("CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL)");
      db.exec("CREATE TABLE accounts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('asset','system')), system_key TEXT, opening_minor INTEGER NOT NULL DEFAULT 0 CHECK(opening_minor>=0), request_id TEXT, created_at TEXT NOT NULL, UNIQUE(user_id,system_key), UNIQUE(user_id,request_id))");
      db.exec("CREATE TABLE journals (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, request_id TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('opening','income','expense','transfer')), from_account_id TEXT REFERENCES accounts(id), to_account_id TEXT REFERENCES accounts(id), amount_minor INTEGER NOT NULL CHECK(amount_minor>0), created_at TEXT NOT NULL, UNIQUE(user_id,request_id))");
      db.exec("CREATE TABLE postings (journal_id TEXT NOT NULL REFERENCES journals(id) ON DELETE CASCADE, account_id TEXT NOT NULL REFERENCES accounts(id), signed_minor INTEGER NOT NULL CHECK(signed_minor<>0), PRIMARY KEY(journal_id,account_id))");
      db.exec("CREATE INDEX idx_accounts_owner ON accounts(user_id,kind)");
      db.exec("CREATE INDEX idx_journals_owner ON journals(user_id,created_at)");
      db.exec("CREATE INDEX idx_postings_account ON postings(account_id)");
      db.exec("PRAGMA user_version=1");
      db.exec("COMMIT");
    }catch(e){db.exec("ROLLBACK");db.close();throw e;}
  }
  // Schema v2 is additive and transactional: existing users, journals and balances survive.
  // For non-demo data, copy the SQLite file (including WAL checkpoint) before upgrading.
  if(version<=1){
    // Migration safety: create a restorable, offline copy before changing an
    // existing on-disk v1 database. A checkpoint first includes WAL records.
    // Fail closed if a checkpoint/backup cannot complete.
    if(version===1&&filename!==":memory:"){
      const checkpoint=db.prepare("PRAGMA wal_checkpoint(TRUNCATE)").get();
      if(checkpoint.busy!==0){db.close();throw new Error("Database is busy; cannot back up before migration");}
      const backupPath=filename+".pre-v2-"+new Date().toISOString().replace(/[:.]/g,"-")+".backup";
      try{copyFileSync(filename,backupPath);chmodSync(backupPath,0o600);}
      catch(e){db.close();throw new Error("Database backup failed; migration aborted",{cause:e});}
    }
    db.exec("BEGIN IMMEDIATE");
    try{
      db.exec("CREATE TABLE goals (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, account_id TEXT NOT NULL UNIQUE REFERENCES accounts(id), name TEXT NOT NULL, target_minor INTEGER NOT NULL CHECK(target_minor>0), request_id TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(user_id,request_id))");
      db.exec("CREATE INDEX idx_goals_owner ON goals(user_id,created_at)");
      db.exec("CREATE TABLE budgets (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, category TEXT NOT NULL, limit_minor INTEGER NOT NULL CHECK(limit_minor>=0), updated_at TEXT NOT NULL, PRIMARY KEY(user_id,category))");
      db.exec("PRAGMA user_version=2");
      db.exec("COMMIT");
    }catch(e){db.exec("ROLLBACK");db.close();throw e;}
  }
  function atomic(callback){
    db.exec("BEGIN IMMEDIATE");
    try{const result=callback();db.exec("COMMIT");return result;}
    catch(e){try{db.exec("ROLLBACK");}catch{}throw e;}
  }
  function internal(userId,key){
    const row=db.prepare("SELECT id FROM accounts WHERE user_id=? AND system_key=?").get(userId,key);
    if(!row)throw new Error("Internal account missing");
    return row.id;
  }
  function asset(userId,id){
    if(typeof id!=="string")throw new StoreError(400,"Account ID missing");
    const row=db.prepare("SELECT id FROM accounts WHERE user_id=? AND id=? AND kind='asset'").get(userId,id);
    if(!row)throw new StoreError(404,"Account not found");
    return row.id;
  }
  function balanceOf(id){
    // CAST to TEXT before crossing SQLite -> JS: numeric API reads can silently
    // round integer balances above Number.MAX_SAFE_INTEGER.
    const row=db.prepare("SELECT CAST(COALESCE(SUM(signed_minor),0) AS TEXT) AS amount FROM postings WHERE account_id=?").get(id);
    return BigInt(row.amount);
  }
  function writePostings(journalId,postings){
    const sum=postings.reduce((s,p)=>s+p.signedMinor,0n);
    if(postings.length<2||sum!==0n||
       postings.some(p=>typeof p.signedMinor!=="bigint"||p.signedMinor===0n)||
       new Set(postings.map(p=>p.accountId)).size!==postings.length)
      throw new StoreError(422,"Unbalanced or invalid postings");
    const insert=db.prepare("INSERT INTO postings(journal_id,account_id,signed_minor) VALUES(?,?,?)");
    for(const posting of postings)insert.run(journalId,posting.accountId,posting.signedMinor);
  }
  function journal(userId,key,kind,from,to,amount,postings){
    const id=randomUUID();
    db.prepare("INSERT INTO journals(id,user_id,request_id,kind,from_account_id,to_account_id,amount_minor,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run(id,userId,key,kind,from,to,amount,new Date().toISOString());
    writePostings(id,postings);
    return {id,requestId:key,kind,fromAccountId:from,toAccountId:to,amountMinor:String(amount)};
  }
  const viewJournal=row=>({
    id:row.id,requestId:row.request_id,kind:row.kind,fromAccountId:row.from_account_id,
    toAccountId:row.to_account_id,amountMinor:String(row.amount_minor)
  });
  return {
    close(){db.close();},
    register(emailRaw,passwordRaw){
      const email=emailValue(emailRaw);
      const secret=hashPassword(passwordValue(passwordRaw));
      return atomic(()=>{
        if(db.prepare("SELECT id FROM users WHERE email=?").get(email))
          throw new StoreError(409,"Account already exists");
        const id=randomUUID(),now=new Date().toISOString();
        db.prepare("INSERT INTO users(id,email,password_hash,created_at) VALUES(?,?,?,?)").run(id,email,secret,now);
        const insert=db.prepare("INSERT INTO accounts(id,user_id,name,kind,system_key,created_at) VALUES(?,?,?,'system',?,?)");
        for(const key of ["opening","income","expense"])insert.run(randomUUID(),id,key,key,now);
        return {id,email};
      });
    },
    login(emailRaw,passwordRaw){
      const email=emailValue(emailRaw);
      const password=typeof passwordRaw==="string"&&Buffer.byteLength(passwordRaw)<512?passwordRaw:"";
      const row=db.prepare("SELECT id,email,password_hash FROM users WHERE email=?").get(email);
      const valid=verifyPassword(password,row?.password_hash??fakeHash);
      if(!row||!valid)throw new StoreError(401,"Invalid email or password");
      return {id:row.id,email:row.email};
    },
    createSession(userId){
      const token=randomBytes(32).toString("base64url");
      db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)")
        .run(tokenHash(token),userId,Date.now()+SESSION_AGE);
      return {token,maxAgeSeconds:SESSION_AGE/1000};
    },
    getSessionUser(token){
      if(typeof token!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
      const row=db.prepare("SELECT u.id,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?")
        .get(tokenHash(token),Date.now());
      return row?{id:row.id,email:row.email}:null;
    },
    revokeSession(token){
      if(typeof token==="string")db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash(token));
    },
    createAccount(userId,{name,openingMinor="0",requestId:key}){
      requestId(key);
      if(typeof name!=="string"||!name.trim()||name.trim().length>70)
        throw new StoreError(400,"Account name must have 1-70 characters");
      name=name.trim();
      const opening=amountMinor(openingMinor,true);
      return atomic(()=>{
        const prior=db.prepare("SELECT id,name,opening_minor FROM accounts WHERE user_id=? AND request_id=?").get(userId,key);
        if(prior){
          if(prior.name!==name||BigInt(prior.opening_minor)!==opening)
            throw new StoreError(409,"Request ID already used for different input");
          return {id:prior.id,name,openingMinor:String(opening),alreadyApplied:true};
        }
        const id=randomUUID();
        db.prepare("INSERT INTO accounts(id,user_id,name,kind,opening_minor,request_id,created_at) VALUES(?,?,?,'asset',?,?,?)")
          .run(id,userId,name,opening,key,new Date().toISOString());
        if(opening>0n){
          journal(userId,"open:"+key,"opening",null,id,opening,[
            {accountId:id,signedMinor:opening},{accountId:internal(userId,"opening"),signedMinor:-opening}
          ]);
        }
        return {id,name,openingMinor:String(opening),alreadyApplied:false};
      });
    },
    listAccounts(userId){
      const rows=db.prepare("SELECT a.id,a.name,CAST(a.opening_minor AS TEXT) AS opening_minor,CAST(COALESCE(SUM(p.signed_minor),0) AS TEXT) AS balance FROM accounts a LEFT JOIN postings p ON p.account_id=a.id WHERE a.user_id=? AND a.kind='asset' GROUP BY a.id ORDER BY a.created_at,a.id").all(userId);
      return rows.map(row=>({id:row.id,name:row.name,openingMinor:row.opening_minor,balanceMinor:row.balance}));
    },
    createTransaction(userId,{kind,fromAccountId=null,toAccountId=null,amountMinor:rawAmount,requestId:key}){
      requestId(key);
      if(!["income","expense","transfer"].includes(kind))throw new StoreError(400,"Invalid transaction kind");
      const amount=amountMinor(rawAmount);
      return atomic(()=>{
        const prior=db.prepare("SELECT id,request_id,kind,from_account_id,to_account_id,amount_minor FROM journals WHERE user_id=? AND request_id=?").get(userId,key);
        if(prior){
          if(prior.kind!==kind||prior.from_account_id!==fromAccountId||
            prior.to_account_id!==toAccountId||BigInt(prior.amount_minor)!==amount)
            throw new StoreError(409,"Request ID already used for different input");
          return {...viewJournal(prior),alreadyApplied:true};
        }
        let postings;
        if(kind==="income"){
          const to=asset(userId,toAccountId);
          if(fromAccountId!==null)throw new StoreError(400,"Income source must be empty");
          if(balanceOf(to)+amount>MAX_ASSET_BALANCE)throw new StoreError(422,"Account balance limit exceeded");
          postings=[{accountId:to,signedMinor:amount},{accountId:internal(userId,"income"),signedMinor:-amount}];
        }else if(kind==="expense"){
          const from=asset(userId,fromAccountId);
          if(toAccountId!==null)throw new StoreError(400,"Expense destination must be empty");
          if(balanceOf(from)<amount)throw new StoreError(409,"Insufficient balance");
          postings=[{accountId:from,signedMinor:-amount},{accountId:internal(userId,"expense"),signedMinor:amount}];
        }else{
          const from=asset(userId,fromAccountId),to=asset(userId,toAccountId);
          if(from===to)throw new StoreError(400,"Transfer requires different accounts");
          if(balanceOf(from)<amount)throw new StoreError(409,"Insufficient balance");
          if(balanceOf(to)+amount>MAX_ASSET_BALANCE)throw new StoreError(422,"Account balance limit exceeded");
          postings=[{accountId:from,signedMinor:-amount},{accountId:to,signedMinor:amount}];
        }
        return {...journal(userId,key,kind,fromAccountId,toAccountId,amount,postings),alreadyApplied:false};
      });
    },
    createGoal(userId,{name,targetMinor:rawTarget,requestId:key}){
      requestId(key);
      if(typeof name!=="string"||!name.trim()||name.trim().length>80)
        throw new StoreError(400,"Goal name must have 1-80 characters");
      const title=name.trim(),target=amountMinor(rawTarget);
      return atomic(()=>{
        const prior=db.prepare("SELECT id,name,target_minor FROM goals WHERE user_id=? AND request_id=?").get(userId,key);
        if(prior){
          if(prior.name!==title||BigInt(prior.target_minor)!==target)
            throw new StoreError(409,"Request ID already used for different goal");
          return {...db.prepare("SELECT id,account_id AS accountId FROM goals WHERE id=?").get(prior.id),alreadyApplied:true};
        }
        const goalId=randomUUID(),accountId=randomUUID(),now=new Date().toISOString();
        db.prepare("INSERT INTO accounts(id,user_id,name,kind,opening_minor,request_id,created_at) VALUES(?,?,?,'asset',0,?,?)")
          .run(accountId,userId,"هدف: "+title,"goal-account:"+goalId,now);
        db.prepare("INSERT INTO goals(id,user_id,account_id,name,target_minor,request_id,created_at) VALUES(?,?,?,?,?,?,?)")
          .run(goalId,userId,accountId,title,target,key,now);
        return {id:goalId,accountId,alreadyApplied:false};
      });
    },
    listGoals(userId){
      const rows=db.prepare("SELECT g.id,g.name,g.account_id,CAST(g.target_minor AS TEXT) AS target_minor,g.created_at,CAST(COALESCE(SUM(p.signed_minor),0) AS TEXT) AS balance_minor FROM goals g JOIN accounts a ON a.id=g.account_id AND a.user_id=g.user_id LEFT JOIN postings p ON p.account_id=a.id WHERE g.user_id=? GROUP BY g.id ORDER BY g.created_at DESC,g.id DESC").all(userId);
      return rows.map(g=>({id:g.id,name:g.name,accountId:g.account_id,targetMinor:g.target_minor,savedMinor:g.balance_minor,createdAt:g.created_at}));
    },
    upsertBudget(userId,{category,limitMinor:rawLimit}){
      if(typeof category!=="string"||!category.trim()||category.trim().length>48)
        throw new StoreError(400,"Budget category must have 1-48 characters");
      const cat=category.trim(),amount=amountMinor(rawLimit,true);
      db.prepare("INSERT INTO budgets(user_id,category,limit_minor,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id,category) DO UPDATE SET limit_minor=excluded.limit_minor,updated_at=excluded.updated_at")
        .run(userId,cat,amount,new Date().toISOString());
      return {category:cat,limitMinor:String(amount)};
    },
    listBudgets(userId){
      return db.prepare("SELECT category,CAST(limit_minor AS TEXT) AS limitMinor FROM budgets WHERE user_id=? ORDER BY category").all(userId);
    },
    listTransactions(userId){
      const rows=db.prepare("SELECT id,kind,request_id,from_account_id,to_account_id,CAST(amount_minor AS TEXT) AS amount_minor,created_at FROM journals WHERE user_id=? AND kind!='opening' ORDER BY created_at DESC,id DESC LIMIT 100").all(userId);
      return rows.map(row=>({...viewJournal(row),createdAt:row.created_at}));
    },
    // Seek pagination for the complete user-visible transaction history.
    // The legacy 100-row listTransactions feed remains unchanged.
    listTransactionsPage(userId,{limit=50,cursor=null}={}){
      if(!Number.isInteger(limit)||limit<1||limit>100)
        throw new StoreError(400,"Transaction page limit must be 1-100");
      let rows;
      const fields="id,kind,request_id,from_account_id,to_account_id,CAST(amount_minor AS TEXT) AS amount_minor,created_at";
      if(cursor!==null){
        if(typeof cursor!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor))
          throw new StoreError(400,"Invalid transaction cursor");
        // A cursor is valid only for a journal owned by this user.
        const anchor=db.prepare("SELECT created_at FROM journals WHERE user_id=? AND id=? AND kind!='opening'").get(userId,cursor);
        if(!anchor)throw new StoreError(400,"Invalid transaction cursor");
        rows=db.prepare(`SELECT ${fields} FROM journals WHERE user_id=? AND kind!='opening' AND (created_at<? OR (created_at=? AND id<?)) ORDER BY created_at DESC,id DESC LIMIT ?`)
          .all(userId,anchor.created_at,anchor.created_at,cursor,limit+1);
      }else{
        rows=db.prepare(`SELECT ${fields} FROM journals WHERE user_id=? AND kind!='opening' ORDER BY created_at DESC,id DESC LIMIT ?`)
          .all(userId,limit+1);
      }
      const hasMore=rows.length>limit;
      const transactions=rows.slice(0,limit).map(row=>({...viewJournal(row),createdAt:row.created_at}));
      return {transactions,nextCursor:hasMore?transactions.at(-1).id:null};
    },
    /**
     * Complete, read-only journal snapshot for this authenticated user.
     * Unlike listTransactions (a 100-row UI feed), this API intentionally includes
     * EVERY journal, including opening entries, and BOTH sides of each posting.
     * Values remain exact decimal centime strings, even above JS safe integers.
     * The result is an audit/export format, NOT a writable restore format.
     */
    exportLedger(userId){
      const accounts=db.prepare("SELECT id,name,kind,system_key,CAST(opening_minor AS TEXT) AS opening_minor,created_at FROM accounts WHERE user_id=? ORDER BY created_at,id").all(userId)
        .map(row=>({id:row.id,name:row.name,kind:row.kind,systemKey:row.system_key,
          openingMinor:row.opening_minor,createdAt:row.created_at}));
      const journals=db.prepare("SELECT id,request_id,kind,from_account_id,to_account_id,CAST(amount_minor AS TEXT) AS amount_minor,created_at FROM journals WHERE user_id=? ORDER BY created_at,id").all(userId)
        .map(row=>({...viewJournal(row),createdAt:row.created_at}));
      const postings=db.prepare("SELECT p.journal_id,p.account_id,CAST(p.signed_minor AS TEXT) AS signed_minor FROM postings p JOIN journals j ON j.id=p.journal_id WHERE j.user_id=? ORDER BY j.created_at,j.id,p.account_id").all(userId)
        .map(row=>({journalId:row.journal_id,accountId:row.account_id,signedMinor:row.signed_minor}));
      const owned=new Set(accounts.map(a=>a.id));
      // Every journal must have exactly two opposite postings of its declared
      // amount. A zero-sum pair alone is insufficient: both legs could be
      // corrupted to the same incorrect magnitude while remaining balanced.
      const byJournal=new Map(journals.map(j=>[j.id,{count:0,sum:0n,amount:BigInt(j.amountMinor)}]));
      for(const p of postings){
        const j=byJournal.get(p.journalId);
        if(!j||!owned.has(p.accountId))throw new StoreError(500,"Ledger ownership invariant violated");
        const signed=BigInt(p.signedMinor);
        if(signed===0n||(signed<0n?-signed:signed)!==j.amount)
          throw new StoreError(500,"Journal amount does not match its postings");
        j.count++;j.sum+=signed;
      }
      for(const j of byJournal.values()){
        if(j.count!==2||j.sum!==0n)throw new StoreError(500,"Unbalanced journal detected during export");
      }
      return {accounts,journals,postings,counts:{accounts:accounts.length,journals:journals.length,postings:postings.length}};
    }
  };
}
