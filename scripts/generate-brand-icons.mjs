/**
 * Generate installable-platform PNG icons from the single source SVG.
 * @resvg/resvg-js renders deterministically; no network calls or extra build tools.
 * Generated binaries are ignored in Git and included by Vite on dev/build.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join,resolve} from "node:path";
import {Resvg} from "@resvg/resvg-js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const iconPath=join(root,"public","brand","dinaro-app-icon.svg");
const svg=readFileSync(iconPath,"utf8");
const files=[[180,"apple-touch-icon.png"],[192,"icon-192.png"],[512,"icon-512.png"]];
for(const [size,name] of files){
  const png=new Resvg(svg,{fitTo:{mode:"width",value:size}}).render().asPng();
  writeFileSync(join(root,"public",name),png);
  console.log("Generated DINARO+ icon: "+name);
}
