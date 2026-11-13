import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {join} from "node:path";

const path=fileURLToPath(new URL("../../../public/world/npc/",import.meta.url));
const manifest=JSON.parse(readFileSync(join(path,"manifest.json"),"utf8"));
const pngInfo=(filename)=>{
 const bytes=readFileSync(join(path,filename));
 assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 return {
  width:bytes.readUInt32BE(16),
  height:bytes.readUInt32BE(20),
  bytes:bytes.length,
  sha:createHash("sha256").update(bytes).digest("hex")
 };
};

test("six original pixel art characters have deterministic frame atlases",()=>{
 assert.equal(manifest.characters.length,6);
 assert.deepEqual(manifest.characters,["ashraf","layla","rimo","salim","professor","mira"]);
 assert.deepEqual(manifest.sprite.directions,["front","back","left","right"]);
 assert.deepEqual(manifest.sprite.motions,["idle","walk","talk","celebrate"]);
 assert.deepEqual(manifest.portrait.emotions,["calm","joy","thinking","surprise"]);
 assert.equal(manifest.sprite.columns*manifest.sprite.rows,64);
 assert.equal(manifest.portrait.columns,4);
 assert.equal(manifest.portrait.rows,2);
 assert.deepEqual(manifest.portrait.eyelids,["open","closed"]);
});

test("all 12 transparent PNG atlases render at exact sprite-sheet dimensions",()=>{
 const sprites=[],portraits=[];
 for(const id of manifest.characters){
  const sheet=pngInfo(id+"-sprites.png");
  const face=pngInfo(id+"-portraits.png");
  assert.equal(sheet.width,320);
  assert.equal(sheet.height,1792);
  assert.equal(face.width,512);
  assert.equal(face.height,320);
  assert.ok(sheet.bytes>1000);
  assert.ok(face.bytes>1000);
  sprites.push(sheet.sha);
  portraits.push(face.sha);
  const svg=readFileSync(join(path,id+"-sprites.svg"),"utf8");
  assert.match(svg,/viewBox="0 0 320 1792"/);
  const psvg=readFileSync(join(path,id+"-portraits.svg"),"utf8");
  assert.match(psvg,/viewBox="0 0 512 320"/);
 }
 assert.equal(new Set(sprites).size,6,"sprites should not be reused between characters");
 assert.equal(new Set(portraits).size,6,"portraits should not be reused between characters");
});

test("assets and code are built without financial server access",()=>{
 const script=readFileSync(new URL("../../../scripts/generate-npc-atlases.mjs",import.meta.url),"utf8");
 assert.doesNotMatch(script,/(fetch\s*\(|XMLHttpRequest|server\/|api\/|sqlite|process\.env\.)/i);
});
