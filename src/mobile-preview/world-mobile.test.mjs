import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root=fileURLToPath(new URL("../../..",import.meta.url));
const read=p=>readFileSync(join(root,p),"utf8");
const mobileWorld=read("src/mobile-preview/MobileWorld.tsx");
const home=read("src/mobile-preview/MobilePreview.tsx");
const packageJson=JSON.parse(read("package.json"));

test("mobile goals use game atlas characters instead of rectangle placeholder",()=>{
 assert.match(home,/import MobileWorld from "\.\/MobileWorld"/);
 assert.match(home,/function Goals\(\)\{return <MobileWorld\/>;\}/);
 assert.doesNotMatch(home,/m-pixel-hero/);
 assert.match(mobileWorld,/import \{NpcCharacter\}/);
 assert.match(mobileWorld,/className="mw-traveler"/);
});

test("world recognizes six regions plus secret islands without gating on money",()=>{
 for(const region of ["village","forest","valley","bridge","castle","horizon","secret-islands"])
  assert.ok(mobileWorld.includes('"'+region+'"'),"missing "+region);
 assert.match(mobileWorld,/next==="secret-islands"\?"discovery"/);
 assert.match(mobileWorld,/الجزر السرية مفتوحة/);
 assert.match(mobileWorld,/NPC_CAST/);
 assert.match(mobileWorld,/chooseDialogue/);
 assert.match(mobileWorld,/residentsOf/);
});

test("mobile build generates images first and keeps demo apart from real finance",()=>{
 assert.match(packageJson.scripts["build:mobile"],/generate-npc-atlases\.mjs && vite build/);
 assert.match(packageJson.scripts["predev:mobile"],/generate-npc-atlases\.mjs/);
 assert.match(mobileWorld,/لا حفظ للمحادثات/);
 assert.doesNotMatch(mobileWorld,/localStorage|sessionStorage|fetch\s*\(|\/api\//);
 const path=join(root,"public/world/npc");
 for(const id of ["ashraf","layla","rimo","salim","professor","mira"]){
  for(const suffix of ["sprites","portraits"]){
   const bytes=readFileSync(join(path,id+"-"+suffix+".png"));
   assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  }
 }
});

test("demo slider and three dialogue choices are independently interactive",()=>{
 assert.match(mobileWorld,/setProgress\(valid\)/);
 assert.match(mobileWorld,/sceneFromProgress\(valid,progress\)/);
 assert.match(mobileWorld,/setWalking\(true\)/);
 assert.match(mobileWorld,/setLastReply\(result\)/);
 for(const choice of ["ask","explore","reflect"])assert.match(mobileWorld,new RegExp('"'+choice+'"'));
});
