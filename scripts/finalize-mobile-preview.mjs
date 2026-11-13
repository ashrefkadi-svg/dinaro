import {readFileSync,writeFileSync,existsSync,rmSync} from "node:fs";
import {join} from "node:path";
const folder="dist-mobile",input=join(folder,"mobile-preview.html");
if(!existsSync(input))throw new Error("No mobile demo HTML");
const html=readFileSync(input,"utf8");
if(html.includes("/api/")||html.includes("server/store"))throw new Error("Unexpected API in demo HTML");
writeFileSync(join(folder,"index.html"),html);rmSync(input);writeFileSync(join(folder,".nojekyll"),"");
console.log("DINARO+ public preview prepared (static only).");
