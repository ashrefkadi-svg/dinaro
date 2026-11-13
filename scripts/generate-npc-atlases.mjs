/**
 * THE WORLD OF DINARO — original, editable pixel-atlas factory.
 * For each NPC, emits PNG+SVG sprites (4x16 = 64 frames), and
 * PNG+SVG face portraits (4 expressions). All transparent, offline,
 * deterministic and independent of any licensed game sprites.
 */
import {mkdirSync,writeFileSync} from "node:fs";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {Resvg} from "@resvg/resvg-js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const directory=join(root,"public","world","npc");
mkdirSync(directory,{recursive:true});
const palettes={
 ashraf:["#f0b98d","#66412f","#176852","#edc979","#50d3ae","#49382f","traveler"],
 layla:["#f3c7ae","#a1b8e7","#49709c","#e8ce83","#c8e8ff","#3f5676","keeper"],
 rimo:["#e7a77a","#7b4b30","#227052","#d9b86f","#8de3ae","#715137","engineer"],
 salim:["#d6a27d","#302c3c","#385e89","#d6ac65","#8fd8ec","#3a3544","guardian"],
 professor:["#e3b993","#e5e3dc","#343149","#dfbd6c","#2fbfa0","#493b41","sage"],
 mira:["#ecc2a0","#59557a","#d3c8b5","#d7a96b","#8fd5e8","#46435c","explorer"]
};
const directions=["front","back","left","right"];
const motions=["idle","walk","talk","celebrate"];
const emotions=["calm","joy","thinking","surprise"];
const R=(x,y,w,h,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>';
const P=(points,c)=>'<polygon points="'+points+'" fill="'+c+'"/>';
const L=(pts,c,width=2)=>'<polyline points="'+pts+'" fill="none" stroke="'+c+'" stroke-linecap="square" stroke-width="'+width+'"/>';
function shade(hex,d){
 return "#"+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,parseInt(v,16)+d)).toString(16).padStart(2,"0")).join("");
}
function head(p,emotion,dir){
 const [skin,hair,coat,trim,accent,,kind]=p;
 let s=R(29,29,26,26,shade(skin,-12))+R(31,28,22,26,skin);
 s+=R(27,25,29,12,shade(hair,-23))+R(29,21,24,10,hair)+R(33,19,13,5,shade(hair,18));
 s+=R(27,33,5,kind==="keeper"?45:18,hair)+R(52,32,5,kind==="keeper"?46:19,hair);
 s+=R(30,25,12,5,shade(hair,15))+R(44,25,10,4,shade(hair,4));
 if(kind==="keeper"||kind==="explorer")s+=R(22,38,6,42,shade(hair,14))+R(56,38,6,40,hair);
 if(dir==="back"){s+=R(31,30,23,24,hair);return s;}
 if(dir==="left"||dir==="right"){
   s+=R(46,40,4,4,"#272b39")+R(49,52,6,2,"#9a5656");
 }else if(emotion==="joy"){
   s+=L("32,40 36,37 40,40","#302d3b")+L("44,40 48,37 51,40","#302d3b")+L("36,51 42,55 49,51","#9b4c53");
 }else if(emotion==="thinking"){
   s+=R(33,39,7,2,"#30303c")+R(45,40,6,3,"#30303c")+R(39,52,8,1,"#9b4c53");
 }else if(emotion==="surprise"){
   s+=R(34,38,4,6,"#30303c")+R(46,38,4,6,"#30303c")+R(41,49,5,6,"#a4555c");
 }else{
   s+=R(34,40,5,3,"#30303c")+R(46,40,5,3,"#30303c")+L("38,52 43,53 48,52","#9b5557",1);
 }
 if(kind==="engineer")s+=R(27,25,28,5,accent)+R(34,26,10,3,trim);
 if(kind==="guardian")s+=R(28,23,28,7,shade(hair,-19))+R(30,26,11,4,accent)+R(44,26,11,4,accent)+R(40,26,4,3,trim);
 if(kind==="keeper")s+=R(29,27,8,5,trim)+R(31,24,4,3,accent);
 if(kind==="sage")s+=P("33,50 40,55 49,53 55,55 47,70 35,66",hair)+R(34,43,17,2,trim);
 if(kind==="explorer")s+=P("19,31 29,24 46,19 58,25 63,33 18,34",coat)+R(24,31,35,3,trim);
 return s;
}
function accessory(p,frame,motion){
 const [,,coat,trim,accent,boots,kind]=p;
 const shift=motion==="celebrate"&&frame%2?-5:0;
 if(kind==="traveler")return R(58,67+shift,12,20,boots)+R(60,71+shift,8,3,trim)+R(62,77+shift,4,5,accent)+R(18,78,10,11,trim)+R(21,80,4,7,coat);
 if(kind==="keeper")return R(17,69+shift,11,18,trim)+R(19,73+shift,7,12,"#ffedb0")+R(20,67+shift,5,3,trim)+R(18,86+shift,9,3,accent);
 if(kind==="engineer")return R(58,69,10,18,boots)+R(60,73,6,4,accent)+R(18,73,5,14,trim)+R(17,69,7,5,accent);
 if(kind==="guardian")return R(57,70+shift,15,15,"#e8d5a8")+R(59,73+shift,11,3,accent)+L("60,"+(78+shift)+" 68,"+(81+shift),"#7a9dbc",1);
 if(kind==="sage")return R(57,72+shift,17,19,boots)+R(59,74+shift,13,15,trim)+R(62,77+shift,7,10,"#efdfb3");
 return P("58,68 62,64 75,68 71,73",trim)+R(70,68,6,4,accent);
}
function sprite(p,dir,motion,frame){
 const [skin,,coat,trim,accent,boots]=p;
 const walk=motion==="walk",celebrate=motion==="celebrate";
 const y=walk?[0,-2,0,-1][frame]:celebrate?[0,-7,-2,-8][frame]:motion==="talk"?[0,1,0,1][frame]:[0,-1,0,-1][frame];
 const step=walk?[0,3,-3,2][frame]:0;
 const hand=celebrate?[-5,-9,-5,-10][frame]:motion==="talk"?[0,-4,0,-5][frame]:walk?[0,1,0,-1][frame]:0;
 const side=dir==="left"||dir==="right";
 let s=R(25,106,32,3,"#18313c")+'<g transform="translate(0 '+y+')">';
 if(side)s+='<g transform="'+(dir==="right"?"translate(80 0) scale(-1 1)":"translate(4 0) scale(.92 1)")+'">';
 s+=P("29,54 23,63 17,96 27,100 60,99 66,92 58,59",shade(coat,-31));
 s+=P("25,64 19,91 28,97 34,66",accent)+R(24,89,5,6,trim);
 s+=R(29+step,88,12,17,boots)+R(27+step,102,16,5,shade(boots,-27))+R(32+step,94,7,3,trim);
 s+=R(45-step,88,12,17,boots)+R(44-step,102,16,5,shade(boots,-27))+R(47-step,94,7,3,trim);
 s+=R(29,55,31,35,shade(coat,-20))+P("31,58 56,58 58,87 31,88",coat);
 s+=R(34,59,3,28,shade(coat,22))+R(48,59,3,26,shade(coat,17));
 s+=P("39,55 49,59 43,69 35,62",trim)+R(34,79,26,5,boots)+R(43,78,8,8,trim)+R(45,80,4,4,accent);
 s+=R(35,70,2,6,trim)+R(49,70,2,6,trim);
 s+=R(23,60+hand,10,22,shade(coat,-10))+R(24,78+hand,9,10,skin)+R(24,75+hand,8,3,trim);
 s+=R(54,59-hand/2,10,23,shade(coat,-10))+R(55,78-hand/2,9,10,skin)+R(55,75-hand/2,8,3,trim);
 s+=R(36,48,11,11,shade(skin,-13));
 s+=head(p,celebrate?"joy":motion==="talk"&&frame%2?"joy":"calm",dir);
 s+=accessory(p,frame,motion);
 return s+(side?"</g>":"")+"</g>";
}
function portrait(p,emotion){
 const [skin,hair,coat,trim,accent,boots,kind]=p;
 let s=P("5,159 15,111 37,99 91,100 113,115 124,159",shade(coat,-25));
 s+=P("12,159 24,114 45,106 84,106 104,116 116,159",coat);
 s+=R(43,126,42,28,shade(coat,13))+P("54,109 69,120 79,109 78,145 58,145",trim)+R(64,126,8,21,accent);
 s+=R(15,132,17,23,shade(coat,19))+R(97,132,17,23,shade(coat,17))+R(24,135,3,16,trim);
 s+=R(33,26,64,80,shade(hair,-26));
 if(kind==="keeper"||kind==="explorer")s+=R(21,57,17,98,hair)+R(92,57,17,98,shade(hair,10));
 s+=R(41,34,51,64,skin)+R(37,51,60,36,skin)+R(44,87,40,18,shade(skin,-13));
 s+=R(37,24,60,16,hair)+R(33,35,10,39,hair)+R(89,34,10,39,hair);
 s+=R(40,17,40,13,shade(hair,14))+R(44,14,23,5,hair)+R(39,27,18,9,shade(hair,19));
 if(kind==="engineer")s+=R(34,24,58,9,accent)+R(42,25,7,4,trim);
 if(kind==="guardian")s+=R(44,29,42,9,"#38495f")+R(46,30,17,8,accent)+R(68,30,17,8,accent);
 if(kind==="keeper")s+=R(29,41,10,14,trim)+R(31,36,9,7,accent);
 if(kind==="explorer")s+=P("17,38 32,24 76,17 103,38 115,44 17,44",coat)+R(25,40,82,6,trim);
 if(kind==="sage")s+=P("42,87 52,102 74,97 88,85 81,114 67,130 52,118",hair)+R(49,66,19,3,trim)+R(73,66,19,3,trim);
 if(emotion==="joy")s+=L("48,68 54,64 61,68","#2e3139",3)+L("73,68 79,64 85,68","#2e3139",3)+P("55,91 65,96 77,89 74,99 63,103 55,98","#ae5759");
 else if(emotion==="thinking")s+=R(48,66,11,3,"#31313d")+R(73,68,12,4,"#31313d")+R(62,94,13,2,"#9e585b");
 else if(emotion==="surprise")s+=R(50,66,7,10,"#31323d")+R(75,66,7,10,"#31323d")+R(65,90,8,13,"#9e535a");
 else s+=R(49,68,8,6,"#31323d")+R(75,68,8,6,"#31323d")+L("61,94 69,96 76,93","#9e5e5f",2);
 s+=R(57,79,4,3,shade(skin,-22))+R(83,79,4,3,shade(skin,-22));
 if(kind==="traveler")s+=R(8,117,24,27,boots)+R(11,120,18,20,trim)+R(17,123,5,13,accent);
 if(kind==="keeper")s+=R(95,113,24,29,trim)+R(101,118,12,19,"#fff1b0");
 if(kind==="engineer")s+=R(8,112,24,28,boots)+R(15,104,9,8,accent);
 if(kind==="guardian")s+=R(4,123,33,27,"#ead7a4")+L("11,132 30,132 28,144","#709ab5",3);
 if(kind==="sage")s+=R(8,113,29,36,trim)+R(12,117,21,26,"#eddbb2");
 if(kind==="explorer")s+=P("88,129 113,114 122,124 98,138",trim);
 return s;
}
function spriteSheet(p,id){
 let body="";
 for(let d=0;d<directions.length;d++)for(let m=0;m<motions.length;m++)
  for(let f=0;f<4;f++)body+='<g transform="translate('+(f*80)+' '+((d*4+m)*112)+')">'+sprite(p,directions[d],motions[m],f)+"</g>";
 return '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="1792" viewBox="0 0 320 1792" shape-rendering="crispEdges"><title>'+id+' four-direction pixel RPG sprites</title>'+body+"</svg>";
}
function portraitSheet(p,id){
 let body="";
 for(let i=0;i<emotions.length;i++)body+='<g transform="translate('+(i*128)+' 0)">'+portrait(p,emotions[i])+"</g>";
 return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="160" viewBox="0 0 512 160" shape-rendering="crispEdges"><title>'+id+' four expressive portraits</title>'+body+"</svg>";
}
const manifest={version:2,kind:"original editable pixel art",characters:Object.keys(palettes),
 sprite:{frameWidth:80,frameHeight:112,columns:4,rows:16,directions,motions},
 portrait:{frameWidth:128,frameHeight:160,columns:4,emotions},
 source:"scripts/generate-npc-atlases.mjs"};
for(const [id,p] of Object.entries(palettes)){
 for(const [suffix,svg] of [["sprites",spriteSheet(p,id)],["portraits",portraitSheet(p,id)]]){
  const path=join(directory,id+"-"+suffix);
  writeFileSync(path+".svg",svg);
  const png=new Resvg(svg).render().asPng();
  writeFileSync(path+".png",png);
  console.log(id+" "+suffix+": "+png.byteLength+" bytes");
 }
}
writeFileSync(join(directory,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
