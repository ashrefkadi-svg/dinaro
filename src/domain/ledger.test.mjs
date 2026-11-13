import {test} from "node:test";
import assert from "node:assert/strict";
import {parseDzdMinor,formatDzdMinor,buildOpeningEntry,buildTransactionEntry,buildTransferEntry,ledgerBalance,validateEntry} from "./ledger.ts";
test("exact decimal minor units",()=>{
  assert.equal(parseDzdMinor("1250,05"),125005n);
  assert.equal(parseDzdMinor("0.01"),1n);
  assert.ok(formatDzdMinor(-12345n).includes("123,45"));
  for(const bad of ["0","-20","1.123","1e5","NaN",""]) assert.throws(()=>parseDzdMinor(bad),RangeError);
});
test("double-entry income expense and transfers conserve value",()=>{
  const open=buildOpeningEntry("open","cash",100000n);
  const income=buildTransactionEntry({id:"income",accountId:"cash",type:"income",amountMinor:20505n});
  const expense=buildTransactionEntry({id:"expense",accountId:"cash",type:"expense",amountMinor:10006n});
  assert.equal(ledgerBalance([open,income,expense],"cash"),110499n);
  const transfer=buildTransferEntry("transfer","cash","wallet",200n);
  assert.equal(ledgerBalance([transfer],"cash"),-200n);
  assert.equal(ledgerBalance([transfer],"wallet"),200n);
  assert.throws(()=>buildTransferEntry("same","cash","cash",100n),RangeError);
});
test("unbalanced postings and duplicated event IDs are rejected",()=>{
  assert.throws(()=>validateEntry({id:"x",currency:"DZD",postings:[
    {accountId:"a",amountMinor:100n},{accountId:"b",amountMinor:-99n}
  ]}),RangeError);
  assert.throws(()=>ledgerBalance([
    buildOpeningEntry("same","a",100n),buildOpeningEntry("same","b",100n)
  ],"a"),RangeError);
  assert.throws(()=>buildTransactionEntry({id:"bad",accountId:"cash",type:"expense",amountMinor:0n}),RangeError);
});
