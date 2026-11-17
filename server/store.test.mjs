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
