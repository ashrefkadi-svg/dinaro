import type {NpcEmotion,NpcMotion,NpcFacing} from "./npc-definitions.ts";
import {emotionFor,motionFor} from "./npc-definitions";
import type {DialogueScene,PlayerIntent} from "./npc-dialogues";

export interface NpcState{
 emotion:NpcEmotion;
 motion:NpcMotion;
 facing:NpcFacing;
}
/** Pure state transitions, decoupled from player balances and background timers. */
export function npcStateFor(scene:DialogueScene,choice?:PlayerIntent):NpcState {
 return {emotion:emotionFor(scene,choice),motion:motionFor(scene,choice),facing:"front"};
}
export function setNpcFacing(state:NpcState,facing:NpcFacing):NpcState{
 return {...state,facing};
}
export const DEFAULT_NPC_STATE:NpcState=Object.freeze({emotion:"calm",motion:"idle",facing:"front"});
