import type {ReactNode} from "react";
import type {NpcId} from "./npc-dialogues";
import type {NpcEmotion,NpcMotion} from "./npc-definitions";
import {NpcCharacter} from "./NpcCharacter";
/** Portrait and conversation bubble share the same runtime expression and motion state. */
export function NpcDialogueBubble({
 id,name,emotion,motion,children
}:{id:NpcId;name:string;emotion:NpcEmotion;motion:NpcMotion;children:ReactNode}){
 return <div className="npc-feature-bubble">
   <NpcCharacter id={id} emotion={emotion} motion={motion} size="portrait" name={name}/>
   <div className="npc-feature-text"><strong>{name}</strong><p>{children}</p></div>
 </div>;
}
