import {useCallback,useState} from "react";
import type {DialogueScene,PlayerIntent} from "./npc-dialogues";
import {DEFAULT_NPC_STATE,npcStateFor} from "./npc-state";
import type {NpcFacing,NpcMotion} from "./npc-definitions";
export function useNpcState(){
 const [state,setState]=useState(DEFAULT_NPC_STATE);
 const reactToDialogue=useCallback((scene:DialogueScene,choice?:PlayerIntent)=>
  setState(npcStateFor(scene,choice)),[]);
 const face=useCallback((facing:NpcFacing)=>setState(old=>({...old,facing})),[]);
 const move=useCallback((motion:NpcMotion)=>setState(old=>({...old,motion})),[]);
 return {state,reactToDialogue,face,move};
}
