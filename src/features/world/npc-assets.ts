import {NPC_IDS} from "./npc-dialogues";
import type {NpcId} from "./npc-dialogues";
import type {NpcEmotion,NpcFacing,NpcMotion} from "./npc-definitions";

/** Stable asset contract shared between sprite viewer, dialogue and future world scenes. */
export const NPC_ATLAS={
 frameWidth:80,
 frameHeight:112,
 columns:4,
 directions:["front","back","left","right"] as readonly NpcFacing[],
 motions:["idle","walk","talk","celebrate"] as readonly NpcMotion[],
 portraitWidth:128,
 portraitHeight:160,
 emotions:["calm","joy","thinking","surprise"] as readonly NpcEmotion[]
} as const;

export function npcAssetPaths(id:NpcId,base="/"){
 if(!NPC_IDS.includes(id))throw new RangeError("Unknown character");
 const prefix=base.endsWith("/")?base:base+"/";
 return {
  sprites:prefix+"world/npc/"+id+"-sprites.png",
  spritesSource:prefix+"world/npc/"+id+"-sprites.svg",
  portraits:prefix+"world/npc/"+id+"-portraits.png",
  portraitsSource:prefix+"world/npc/"+id+"-portraits.svg"
 } as const;
}
