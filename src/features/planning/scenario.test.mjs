import {test} from "node:test";
import assert from "node:assert/strict";
import {projectScenario} from "./scenario.ts";
test("goal transfers do not destroy total assets",()=>{
  const s={openingCashMinor:100000n,monthlyIncomeMinor:50000n,monthlyExpenseMinor:20000n,monthlyGoalTransferMinor:10000n};
  const result=projectScenario(s,3);
  assert.equal(result.cashMinor,160000n);
  assert.equal(result.goalMinor,30000n);
  assert.equal(result.totalMinor,190000n);
  assert.equal(result.hasCashShortfall,false);
});
test("shortfall is flagged and bad inputs are rejected",()=>{
  const s={openingCashMinor:0n,monthlyIncomeMinor:100n,monthlyExpenseMinor:500n,monthlyGoalTransferMinor:0n};
  assert.equal(projectScenario(s,6).hasCashShortfall,true);
  assert.throws(()=>projectScenario(s,5),RangeError);
  assert.throws(()=>projectScenario({...s,monthlyIncomeMinor:-1n},3),RangeError);
});
