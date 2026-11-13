import {test} from "node:test";
import assert from "node:assert/strict";
import {INITIAL_TRANSACTIONS,openingMinor,summarize,formatDzd,readWholeDzd,cumulativePoints} from "./data.ts";
test("display totals derive only from fake fixtures",()=>{
 const s=summarize(INITIAL_TRANSACTIONS);
 assert.equal(s.balanceMinor,openingMinor+s.incomeMinor-s.expenseMinor);
 assert.equal(s.incomeMinor,16_000_000n);
 assert.equal(s.expenseMinor,2_625_000n);
 assert.equal(s.balanceMinor,29_175_000n);
});
test("exact money format and integer input",()=>{
 assert.match(formatDzd(12345n),/123,45/);
 assert.equal(readWholeDzd("1250"),125_000n);
 for(const n of ["0","-1","1.5","2e4","abc","999999999"])assert.throws(()=>readWholeDzd(n),RangeError);
});
test("demo graph is computed from fake entries",()=>{
 const p=cumulativePoints(INITIAL_TRANSACTIONS);
 assert.equal(p.length,INITIAL_TRANSACTIONS.length+1);
 assert.equal(p.at(-1).income,160_000);
 assert.equal(p.at(-1).expense,26_250);
});
test("reject invalid transaction",()=>{
 assert.throws(()=>summarize([{...INITIAL_TRANSACTIONS[0],amountMinor:0n}]),RangeError);
});
