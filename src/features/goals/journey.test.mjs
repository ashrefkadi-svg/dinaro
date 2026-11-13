import {test} from "node:test";
import assert from "node:assert/strict";
import {goalProgress,getJourneyState,WORLD_REGIONS} from "./journey.ts";
test("progress is derived only from amount and target",()=>{
  assert.equal(goalProgress(12500000n,20000000n),62.5);
  assert.equal(goalProgress(-100n,100n),0);
  assert.equal(goalProgress(200n,100n),100);
  assert.throws(()=>goalProgress(100n,0n),RangeError);
});
test("all six regions and canonical milestones are reachable",()=>{
  assert.equal(WORLD_REGIONS.length,6);
  assert.equal(getJourneyState(0).region.id,"village");
  assert.equal(getJourneyState(25).milestone,25);
  assert.equal(getJourneyState(50).milestone,50);
  assert.equal(getJourneyState(75).milestone,75);
  assert.equal(getJourneyState(100).region.id,"horizon");
  assert.equal(getJourneyState(100).finished,true);
  assert.equal(getJourneyState(999).progress,100);
  assert.equal(getJourneyState(Number.NaN).progress,0);
});
