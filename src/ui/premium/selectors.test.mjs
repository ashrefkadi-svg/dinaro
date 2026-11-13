import {test} from "node:test";
import assert from "node:assert/strict";
import {summarizeEntries,categoryTotals,cumulativeFlow,spentShare} from "./selectors.ts";

const entries=[
  {id:"3",title:"pay",category:"عمل",date:"تجريبي",type:"income",amountMinor:6000n},
  {id:"2",title:"food",category:"طعام",date:"تجريبي",type:"expense",amountMinor:125n},
  {id:"1",title:"bill",category:"طعام",date:"تجريبي",type:"expense",amountMinor:75n}
];
test("summaries preserve exact bigint minor units",()=>{
  const summary=summarizeEntries(entries);
  assert.equal(summary.incomeMinor,6000n);
  assert.equal(summary.expenseMinor,200n);
  assert.equal(summary.netMinor,5800n);
  assert.equal(summary.incomeCount,1);
  assert.equal(summary.expenseCount,2);
});
test("spend percentage and category groups are derived, never hardcoded",()=>{
  const summary=summarizeEntries(entries);
  assert.equal(spentShare(summary),3.33);
  assert.deepEqual(categoryTotals(entries),[{name:"طعام",amountMinor:200n}]);
  assert.equal(spentShare(summarizeEntries([])),null);
});
test("chart shows cumulative sequence of entries",()=>{
  const flow=cumulativeFlow(entries);
  assert.deepEqual(flow.map(d=>d.step),["0","1","2","3"]);
  assert.equal(flow.at(-1).income,60);
  assert.equal(flow.at(-1).expense,2);
});
test("invalid nonpositive entry is rejected",()=>{
  assert.throws(()=>summarizeEntries([{...entries[0],amountMinor:0n}]),RangeError);
});
