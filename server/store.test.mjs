import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {openStore,StoreError} from "./store.mjs";

test("SQLite persists exact balances, atomic transfers and isolated users",()=>{
  const dir=mkdtempSync(join(tmpdir(),"dinaro-store-"));
  const filename=join(dir,"ledger.sqlite");
  let db=openStore(filename);
  try{
    const alice=db.register("ALICE@example.com","this_is_a_secure_test_passphrase");
    const bob=db.register("bob@example.com","another_very_long_test_password");
    assert.equal(alice.email,"alice@example.com");
    assert.equal(db.login("alice@example.com","this_is_a_secure_test_passphrase").id,alice.id);
    assert.throws(()=>db.login("alice@example.com","bad password"),e=>e.status===401);
    assert.throws(()=>db.register("alice@example.com","third_even_longer_password"),e=>e.status===409);
    assert.throws(()=>db.register("a@example.com","short"),e=>e.status===400);

    const cash=db.createAccount(alice.id,{name:"Cash",openingMinor:"100000",requestId:"create-cash-0001"});
    const savings=db.createAccount(alice.id,{name:"Savings",openingMinor:"0",requestId:"create-save-0001"});
    const bobCash=db.createAccount(bob.id,{name:"Cash",openingMinor:"500",requestId:"create-cash-0001"});
    assert.equal(db.createAccount(alice.id,{name:"Cash",openingMinor:"100000",requestId:"create-cash-0001"}).alreadyApplied,true);
    assert.throws(()=>db.createAccount(alice.id,{name:"Changed",openingMinor:"100000",requestId:"create-cash-0001"}),e=>e.status===409);
    assert.equal(db.listAccounts(bob.id)[0].balanceMinor,"500");
    assert.equal(db.listAccounts(alice.id).length,2);

    const transferArgs={kind:"transfer",fromAccountId:cash.id,toAccountId:savings.id,amountMinor:"17500",requestId:"move-0001"};
    const moved=db.createTransaction(alice.id,transferArgs);
    assert.equal(moved.alreadyApplied,false);
    assert.equal(db.createTransaction(alice.id,transferArgs).alreadyApplied,true);
    assert.throws(()=>db.createTransaction(alice.id,{...transferArgs,amountMinor:"20000"}),e=>e.status===409);
    db.createTransaction(alice.id,{kind:"expense",fromAccountId:cash.id,amountMinor:"2500",requestId:"expense-0001"});
    db.createTransaction(alice.id,{kind:"income",toAccountId:cash.id,amountMinor:"1125",requestId:"income-0001"});
    assert.throws(()=>db.createTransaction(alice.id,{
      kind:"expense",fromAccountId:cash.id,amountMinor:"9999999",requestId:"expense-0002"
    }),e=>e.status===409);
    assert.throws(()=>db.createTransaction(alice.id,{
      kind:"transfer",fromAccountId:cash.id,toAccountId:bobCash.id,
      amountMinor:"100",requestId:"cross-user"
    }),e=>e.status===404);
    assert.deepEqual(Object.fromEntries(db.listAccounts(alice.id).map(a=>[a.id,a.balanceMinor])),{
      [cash.id]:"81125",[savings.id]:"17500"
    });
    assert.equal(db.listTransactions(alice.id).length,3);
    assert.equal(db.listTransactions(bob.id).length,0);

    const session=db.createSession(alice.id);
    assert.equal(db.getSessionUser(session.token)?.id,alice.id);
    db.close();
    db=openStore(filename);
    assert.equal(db.listAccounts(alice.id).find(a=>a.id===cash.id).balanceMinor,"81125");
    assert.equal(db.getSessionUser(session.token)?.id,alice.id);
    db.revokeSession(session.token);
    assert.equal(db.getSessionUser(session.token),null);
  }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});

test("bad amounts and unowned accounts cannot mutate ledger",()=>{
  const db=openStore(":memory:");
  try{
    const user=db.register("unique@example.com","a_really_long_test_password_123");
    const wallet=db.createAccount(user.id,{name:"نقدي",requestId:"wallet-00001"});
    const bad=["-1","0","1.2","1e6","abc","9000000000001",100];
    for(const amountMinor of bad)assert.throws(()=>db.createTransaction(user.id,{
      kind:"income",toAccountId:wallet.id,amountMinor,requestId:"bad-req-0001"
    }),StoreError);
    assert.equal(db.listAccounts(user.id)[0].balanceMinor,"0");
    assert.equal(db.listTransactions(user.id).length,0);
  }finally{db.close();}
});

test("balances remain centime-exact beyond Number.MAX_SAFE_INTEGER",()=>{
  const db=openStore(":memory:");
  try{
    const user=db.register("big-balance@example.com","secure_test_password_big_balance_123");
    const cash=db.createAccount(user.id,{name:"Large balance",requestId:"large-account-01"});
    const deposit="9000000000000"; // Per-request cap; valid integer minor unit string.
    for(let i=0;i<1001;i++)db.createTransaction(user.id,{
      kind:"income",toAccountId:cash.id,amountMinor:deposit,requestId:`deposit-${String(i).padStart(8,"0")}`
    });
    const balance=1001n*BigInt(deposit);
    assert.ok(balance>BigInt(Number.MAX_SAFE_INTEGER));
    assert.equal(db.listAccounts(user.id)[0].balanceMinor,balance.toString());
    db.createTransaction(user.id,{kind:"expense",fromAccountId:cash.id,amountMinor:"1",requestId:"expense-centime-01"});
    assert.equal(db.listAccounts(user.id)[0].balanceMinor,(balance-1n).toString());
    const after=db.createTransaction(user.id,{kind:"expense",fromAccountId:cash.id,amountMinor:"1",requestId:"expense-centime-01"});
    assert.equal(after.alreadyApplied,true);
    assert.equal(db.listAccounts(user.id)[0].balanceMinor,(balance-1n).toString());
    assert.throws(()=>db.createTransaction(user.id,{kind:"expense",fromAccountId:cash.id,amountMinor:"2",requestId:"expense-centime-01"}),e=>e.status===409);
  }finally{db.close();}
});


test("full export contains all journals and postings, including >100 records, without cross-user leakage",()=>{
  const db=openStore(":memory:");
  try{
    const a=db.register("audit-a@example.com","a_secure_audit_user_password_123");
    const b=db.register("audit-b@example.com","a_secure_audit_user_password_456");
    const wallet=db.createAccount(a.id,{name:"Audit wallet",openingMinor:"10000",requestId:"audit-wallet-001"});
    const other=db.createAccount(b.id,{name:"Separate",openingMinor:"500",requestId:"audit-wallet-002"});
    for(let i=0;i<123;i++){
      db.createTransaction(a.id,{kind:"income",toAccountId:wallet.id,amountMinor:"1",requestId:`audit-income-${String(i).padStart(4,"0")}`});
    }
    assert.equal(db.listTransactions(a.id).length,100,"UI feed still deliberately limited to 100");
    const snapshot=db.exportLedger(a.id);
    assert.equal(snapshot.counts.journals,124,"includes opening journal");
    assert.equal(snapshot.counts.postings,248,"every journal includes two postings");
    assert.equal(snapshot.counts.accounts,4,"includes three internal and one asset account");
    assert.ok(snapshot.journals.every(j=>typeof j.amountMinor==="string"));
    assert.ok(snapshot.postings.every(p=>typeof p.signedMinor==="string"));
    const accountIds=new Set(snapshot.accounts.map(x=>x.id));
    assert.ok(snapshot.postings.every(p=>accountIds.has(p.accountId)));
    assert.ok(!accountIds.has(other.id),"another user's asset account must not leak");
    assert.equal(db.exportLedger(b.id).counts.journals,1);
    assert.equal(db.listAccounts(a.id)[0].balanceMinor,"10123");
    for(const j of snapshot.journals){
      const signed=snapshot.postings.filter(p=>p.journalId===j.id).reduce((s,p)=>s+BigInt(p.signedMinor),0n);
      assert.equal(signed,0n,j.id);
    }
  }finally{db.close();}
});


test("cursor pagination visits all transactions exactly once and protects user boundaries",()=>{
  const db=openStore(":memory:");
  try{
    const alice=db.register("page-a@example.com","test_password_for_page_alice_123");
    const bob=db.register("page-b@example.com","test_password_for_page_bob_123");
    const wallet=db.createAccount(alice.id,{name:"Cash",openingMinor:"1000",requestId:"page-alice-wallet"});
    const bobWallet=db.createAccount(bob.id,{name:"Cash",openingMinor:"500",requestId:"page-bob-wallet"});
    const bobTx=db.createTransaction(bob.id,{kind:"income",toAccountId:bobWallet.id,amountMinor:"1",requestId:"page-bob-income"});
    for(let i=0;i<137;i++)db.createTransaction(alice.id,{
      kind:"income",toAccountId:wallet.id,amountMinor:"1",requestId:`page-income-${String(i).padStart(4,"0")}`
    });
    assert.equal(db.listTransactions(alice.id).length,100,"legacy feed must remain compatible");
    let cursor=null;
    const seen=new Set();
    const sizes=[];
    do{
      const page=db.listTransactionsPage(alice.id,{limit:25,cursor});
      sizes.push(page.transactions.length);
      assert.ok(page.transactions.every(tx=>typeof tx.amountMinor==="string"));
      for(const tx of page.transactions){assert.ok(!seen.has(tx.id));seen.add(tx.id);}
      cursor=page.nextCursor;
    }while(cursor!==null);
    assert.deepEqual(sizes,[25,25,25,25,25,12]);
    assert.equal(seen.size,137);
    assert.throws(()=>db.listTransactionsPage(alice.id,{cursor:bobTx.id}),e=>e.status===400);
    assert.throws(()=>db.listTransactionsPage(alice.id,{cursor:"invalid"}),e=>e.status===400);
    for(const limit of [0,-1,101,1.1,NaN,"25"])
      assert.throws(()=>db.listTransactionsPage(alice.id,{limit}),e=>e.status===400);
    assert.equal(db.listTransactionsPage(bob.id,{limit:50}).transactions.length,1);
  }finally{db.close();}
});

test("registered account, goals, budgets and exact balances persist after SQLite restart",()=>{
  const dir=mkdtempSync(join(tmpdir(),"dinaro-goals-persist-"));
  const file=join(dir,"personal.sqlite");
  try{
    let db=openStore(file);
    const user=db.register("persist-finance@example.com","a_real_test_password_12345");
    const other=db.register("second-person@example.com","another_real_test_password_456");
    const cash=db.createAccount(user.id,{name:"Primary cash",openingMinor:"150000",requestId:"opening-wallet-01"});
    const created=db.createGoal(user.id,{name:"Savings",targetMinor:"300000",requestId:"savings-goal-001"});
    const again=db.createGoal(user.id,{name:"Savings",targetMinor:"300000",requestId:"savings-goal-001"});
    assert.equal(again.alreadyApplied,true);
    assert.equal(again.id,created.id);
    assert.throws(()=>db.createGoal(user.id,{name:"Other",targetMinor:"300000",requestId:"savings-goal-001"}),e=>e.status===409);
    db.createTransaction(user.id,{kind:"transfer",fromAccountId:cash.id,toAccountId:created.accountId,amountMinor:"33333",requestId:"savings-fund-001"});
    assert.equal(db.listGoals(user.id)[0].savedMinor,"33333");
    db.upsertBudget(user.id,{category:"Food",limitMinor:"42000"});
    assert.equal(db.listGoals(other.id).length,0);
    assert.equal(db.listBudgets(other.id).length,0);
    assert.throws(()=>db.createTransaction(other.id,{kind:"expense",fromAccountId:created.accountId,amountMinor:"1",requestId:"steal-request-01"}),e=>e.status===404);
    db.close();
    db=openStore(file);
    assert.deepEqual(db.login("persist-finance@example.com","a_real_test_password_12345"),user);
    assert.equal(db.listGoals(user.id)[0].savedMinor,"33333");
    assert.equal(db.listBudgets(user.id)[0].limitMinor,"42000");
    assert.equal(db.listAccounts(user.id).reduce((s,a)=>s+BigInt(a.balanceMinor),0n),150000n);
    db.createTransaction(user.id,{kind:"transfer",fromAccountId:created.accountId,toAccountId:cash.id,amountMinor:"33333",requestId:"savings-return-01"});
    assert.equal(db.listGoals(user.id)[0].savedMinor,"0");
    assert.equal(db.listAccounts(user.id).reduce((s,a)=>s+BigInt(a.balanceMinor),0n),150000n);
    db.close();
  }finally{rmSync(dir,{recursive:true,force:true});}
});
