import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(new URL(path,import.meta.url),"utf8");
test("symbol-only DINARO+ mark includes three growth bars, orbit and plus",()=>{
  const svg=read("../../../public/brand/dinaro-mark.svg");
  assert.match(svg,/viewBox="0 0 256 256"/);
  assert.equal((svg.match(/data-part="growth-bar-/g)||[]).length,3);
  assert.match(svg,/data-part="orbit"/);
  assert.match(svg,/data-part="plus"/);
  assert.doesNotMatch(svg,/<text\b/);
  assert.match(svg,/#[a-fA-F0-9]{6}/);
});
test("app icon, manifest, browser and iPhone references agree",()=>{
  const icon=read("../../../public/brand/dinaro-app-icon.svg");
  assert.match(icon,/viewBox="0 0 512 512"/);
  const manifest=JSON.parse(read("../../../public/manifest.webmanifest"));
  assert.equal(manifest.short_name,"DINARO+");
  assert.deepEqual(manifest.icons.map(i=>i.sizes),["192x192","512x512"]);
  const html=read("../../../index.html");
  assert.match(html,/href="\/brand\/dinaro-app-icon.svg"/);
  assert.match(html,/href="\/apple-touch-icon.png"/);
  assert.match(html,/href="\/manifest.webmanifest"/);
});
test("application renders shared mark on sidebar and mobile header",()=>{
  const app=read("../../App.tsx");
  assert.match(app,/import \{BrandMark\}/);
  assert.equal((app.match(/<BrandMark\/>/g)||[]).length,2);
});
