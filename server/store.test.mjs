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
