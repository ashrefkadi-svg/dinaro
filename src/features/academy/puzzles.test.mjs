import {test} from "node:test";
import assert from "node:assert/strict";
import {PUZZLES,evaluatePuzzle} from "./puzzles.ts";
test("puzzles have valid distinct IDs and complete explanations",()=>{
  assert.equal(new Set(PUZZLES.map(p=>p.id)).size,PUZZLES.length);
  for(const p of PUZZLES){
    assert.ok(p.choices.length>=2);
    assert.ok(p.explanation.length>5);
    assert.equal(evaluatePuzzle(p,p.correctIndex).correct,true);
    assert.throws(()=>evaluatePuzzle(p,99),RangeError);
  }
});
