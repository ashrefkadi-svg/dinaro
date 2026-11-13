import {test} from "node:test";
import assert from "node:assert/strict";
import {NPC_IDS} from "./npc-dialogues.ts";
import {NPC_VISUALS,NPC_REGIONS,residentsOf,emotionFor,motionFor} from "./npc-definitions.ts";
import {npcStateFor,setNpcFacing,DEFAULT_NPC_STATE} from "./npc-state.ts";

test("all six NPCs have distinct visual definitions and regional anchors",()=>{
 assert.equal(Object.keys(NPC_VISUALS).length,6);
 const regions=new Set();
 for(const id of NPC_IDS){
  const v=NPC_VISUALS[id];
  assert.equal(v.id,id);
  assert.ok(v.region in NPC_REGIONS);
  assert.match(v.palette.cloth,/^#[0-9a-f]{6}$/i);
  assert.match(v.palette.hair,/^#[0-9a-f]{6}$/i);
  regions.add(v.region);
 }
 assert.equal(regions.size,6);
 assert.equal(NPC_VISUALS.ashraf.region,"village");
 assert.equal(NPC_VISUALS.rimo.region,"valley");
 assert.equal(NPC_VISUALS.mira.extraRegions.includes("secret-islands"),true);
});
test("regions show their resident first, include optional guests",()=>{
 for(const id of Object.keys(NPC_REGIONS)){
  const roster=residentsOf(id);
  if(id==="secret-islands")assert.deepEqual(roster,["mira"]);
  else assert.equal(NPC_VISUALS[roster[0]].region,id);
 }
 assert.ok(residentsOf("forest").includes("ashraf"));
 assert.deepEqual(residentsOf("secret-islands"),["mira"]);
});
test("expressions and animation are selected by scene and player choice",()=>{
 assert.deepEqual(npcStateFor("victory"),{emotion:"joy",motion:"celebrate",facing:"front"});
 assert.deepEqual(npcStateFor("discovery"),{emotion:"surprise",motion:"talk",facing:"front"});
 assert.deepEqual(npcStateFor("setback"),{emotion:"calm",motion:"talk",facing:"front"});
 assert.deepEqual(npcStateFor("early","ask"),{emotion:"thinking",motion:"talk",facing:"front"});
 assert.deepEqual(npcStateFor("growing","explore"),{emotion:"joy",motion:"walk",facing:"front"});
 assert.equal(emotionFor("slowdown"),"calm");
 assert.equal(motionFor("milestone"),"celebrate");
});
test("state transitions are pure and do not mutate input",()=>{
 const prev=Object.freeze({...DEFAULT_NPC_STATE});
 const next=setNpcFacing(prev,"left");
 assert.equal(prev.facing,"front");
 assert.equal(next.facing,"left");
 assert.notEqual(next,prev);
});
