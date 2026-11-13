import type {NpcId,DialogueScene,PlayerIntent} from "./npc-dialogues";
export type NpcEmotion="joy"|"thinking"|"surprise"|"calm";
export type NpcMotion="idle"|"walk"|"talk"|"celebrate";
export type NpcFacing="front"|"back"|"left"|"right";
export type NpcRegion="village"|"forest"|"valley"|"bridge"|"castle"|"horizon"|"secret-islands";
export interface NpcVisual {
 id:NpcId;
 region:NpcRegion;
 extraRegions:readonly NpcRegion[];
 palette:Readonly<{hair:string;cloth:string;trim:string;skin:string;accent:string;boots:string}>;
 accessory:"compass"|"lantern"|"garden"|"blueprint"|"book"|"telescope";
 silhouette:"traveler"|"keeper"|"engineer"|"guardian"|"sage"|"explorer";
}
/** Visual runtime definitions; concept-art spritesheets will replace these SVG study assets. */
export const NPC_VISUALS:Record<NpcId,NpcVisual>={
 ashraf:{id:"ashraf",region:"village",extraRegions:["forest","valley","bridge","castle","horizon"],
  palette:{hair:"#66412f",cloth:"#176852",trim:"#edc979",skin:"#f0b98d",accent:"#50d3ae",boots:"#49382f"},
  accessory:"compass",silhouette:"traveler"},
 layla:{id:"layla",region:"forest",extraRegions:["horizon"],
  palette:{hair:"#a1b8e7",cloth:"#49709c",trim:"#e8ce83",skin:"#f3c7ae",accent:"#c8e8ff",boots:"#3f5676"},
  accessory:"lantern",silhouette:"keeper"},
 rimo:{id:"rimo",region:"valley",extraRegions:["village"],
  palette:{hair:"#7b4b30",cloth:"#227052",trim:"#d9b86f",skin:"#e7a77a",accent:"#8de3ae",boots:"#715137"},
  accessory:"garden",silhouette:"engineer"},
 salim:{id:"salim",region:"bridge",extraRegions:[],
  palette:{hair:"#302c3c",cloth:"#385e89",trim:"#d6ac65",skin:"#d6a27d",accent:"#8fd8ec",boots:"#3a3544"},
  accessory:"blueprint",silhouette:"guardian"},
 professor:{id:"professor",region:"castle",extraRegions:[],
  palette:{hair:"#e5e3dc",cloth:"#343149",trim:"#dfbd6c",skin:"#e3b993",accent:"#2fbfa0",boots:"#493b41"},
  accessory:"book",silhouette:"sage"},
 mira:{id:"mira",region:"horizon",extraRegions:["secret-islands"],
  palette:{hair:"#59557a",cloth:"#d3c8b5",trim:"#d7a96b",skin:"#ecc2a0",accent:"#8fd5e8",boots:"#46435c"},
  accessory:"telescope",silhouette:"explorer"}
};
export const NPC_REGIONS:Record<NpcRegion,{name:string;english:string}>={
 village:{name:"قرية البدايات",english:"The Starting Village"},
 forest:{name:"غابة الأحلام",english:"The Dream Forest"},
 valley:{name:"وادي الازدهار",english:"The Saving Valley"},
 bridge:{name:"جسر التحديات",english:"The Progress Bridge"},
 castle:{name:"قلعة الإنجازات",english:"The Achievement Castle"},
 horizon:{name:"أفق المستقبل",english:"The Future Horizon"},
 "secret-islands":{name:"الجزر السرية",english:"The Secret Islands"}
};
export function residentsOf(region:NpcRegion):NpcId[]{
 return (Object.keys(NPC_VISUALS) as NpcId[]).filter(id=>{
  const npc=NPC_VISUALS[id];return npc.region===region||npc.extraRegions.includes(region);
 }).sort((a,b)=>Number(NPC_VISUALS[b].region===region)-Number(NPC_VISUALS[a].region===region));
}
export function emotionFor(scene:DialogueScene,choice?:PlayerIntent):NpcEmotion{
 if(choice==="reflect"||choice==="ask")return "thinking";
 if(choice==="explore")return "joy";
 switch(scene){
  case "victory":case "milestone":return "joy";
  case "discovery":return "surprise";
  case "setback":case "slowdown":return "calm";
  case "welcome":case "early":case "growing":return "calm";
 }
}
export function motionFor(scene:DialogueScene,choice?:PlayerIntent):NpcMotion{
 if(scene==="victory"||scene==="milestone")return "celebrate";
 if(choice==="explore")return "walk";
 return "talk";
}
