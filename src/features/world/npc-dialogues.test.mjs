import {test} from "node:test";
import assert from "node:assert/strict";
import {
  NPC_IDS,NPC_CAST,DIALOGUE_SCENES,PLAYER_INTENTS,CHOICE_LABELS,
  sceneFromProgress,chooseDialogue
} from "./npc-dialogues.ts";

test("all six named NPCs have 8 unique contextual dialogue sets and 3 human choices",()=>{
  assert.equal(NPC_IDS.length,6);
  assert.deepEqual(new Set(NPC_IDS).size,6);
  assert.equal(NPC_CAST.ashraf.name,"أشرف");
  assert.equal(NPC_CAST.rimo.name,"ريمو");
  assert.equal(NPC_CAST.layla.name,"ليلى");
  assert.equal(NPC_CAST.salim.name,"سليم");
  assert.equal(NPC_CAST.professor.name,"الأستاذ دينارو");
  assert.equal(NPC_CAST.mira.name,"ميرا");
  for(const id of NPC_IDS){
    const character=NPC_CAST[id];
    assert.equal(Object.keys(character.lines).length,DIALOGUE_SCENES.length);
    for(const scene of DIALOGUE_SCENES){
      const lines=character.lines[scene];
      assert.equal(lines.length,3,id+" "+scene);
      assert.equal(new Set(lines).size,3,"repeated variants: "+id+" "+scene);
      for(const line of lines)assert.ok(line.length>30,id+" "+scene);
    }
    assert.equal(Object.keys(character.choices).length,PLAYER_INTENTS.length);
    for(const choice of PLAYER_INTENTS){
      assert.equal(character.choices[choice].length,3);
      assert.equal(new Set(character.choices[choice]).size,3);
      assert.ok(CHOICE_LABELS[choice].length>3);
    }
  }
});
test("3 consecutive renders rotate the text without immediate repetition",()=>{
  const phrases=[];
  let previous;
  for(let turn=0;turn<3;turn++){
    const dialogue=chooseDialogue({npc:"ashraf",scene:"welcome",turn,lastVariant:previous});
    phrases.push(dialogue.text);previous=dialogue.variant;
  }
  assert.equal(new Set(phrases).size,3);
  const next=chooseDialogue({npc:"ashraf",scene:"welcome",turn:3,lastVariant:previous});
  assert.notEqual(next.variant,previous);
});
test("choice response is specific to current NPC and choice",()=>{
  const ashraf=chooseDialogue({npc:"ashraf",scene:"growing",choice:"explore",turn:0});
  const layla=chooseDialogue({npc:"layla",scene:"growing",choice:"explore",turn:0});
  assert.notEqual(ashraf.text,layla.text);
  assert.equal(ashraf.name,"أشرف");
  assert.equal(layla.name,"ليلى");
});
test("derive safe contexts from progress without modifying balance",()=>{
  assert.equal(sceneFromProgress(0),"early");
  assert.equal(sceneFromProgress(25),"milestone");
  assert.equal(sceneFromProgress(50),"milestone");
  assert.equal(sceneFromProgress(75),"milestone");
  assert.equal(sceneFromProgress(100),"victory");
  assert.equal(sceneFromProgress(34),"growing");
  assert.equal(sceneFromProgress(34,41),"setback");
  assert.equal(sceneFromProgress(34,34),"slowdown");
  assert.equal(sceneFromProgress(10,0),"early");
  assert.throws(()=>sceneFromProgress(Number.NaN),RangeError);
});
test("invalid inputs rejected and all narratives are non-coercive",()=>{
  assert.throws(()=>chooseDialogue({npc:"bad",scene:"welcome",turn:0}),RangeError);
  assert.throws(()=>chooseDialogue({npc:"ashraf",scene:"invalid",turn:0}),RangeError);
  assert.throws(()=>chooseDialogue({npc:"ashraf",scene:"welcome",turn:-1}),RangeError);
  for(const id of NPC_IDS){
    for(const scene of ["slowdown","setback"]){
      const lines=NPC_CAST[id].lines[scene];
      for(const line of lines){
        assert.doesNotMatch(line,/(فاشل|لازم تدخر|عقوبة|كسول)/);
      }
    }
  }
});
