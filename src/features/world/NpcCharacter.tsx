import type {CSSProperties} from "react";
import type {NpcId} from "./npc-dialogues";
import {NPC_VISUALS} from "./npc-definitions";
import type {NpcEmotion,NpcMotion,NpcFacing} from "./npc-definitions";

/**
 * Hand-authored SVG pixel-prototype runtime sprite.
 * Not a finished production spritesheet. Deliberately keeps visual identity
 * separate from scripted dialogue, so approved PNG sheets can replace it later.
 */
export function NpcCharacter({
 id,emotion="calm",motion="idle",facing="front",size="scene",name
}:{
 id:NpcId;emotion?:NpcEmotion;motion?:NpcMotion;facing?:NpcFacing;
 size?:"scene"|"portrait"|"thumb";name?:string;
}){
 const npc=NPC_VISUALS[id];
 const p=npc.palette;
 const style={
  "--npc-cloth":p.cloth,"--npc-accent":p.accent,"--npc-trim":p.trim,
  "--npc-hair":p.hair,"--npc-skin":p.skin,"--npc-boots":p.boots
 } as CSSProperties;
 const back=facing==="back";
 const eyes=emotion==="joy"?
  <g stroke="#292b37" strokeWidth="2" fill="none"><path d="M40 39l4 -2 4 2M54 39l4 -2 4 2"/></g>:
 emotion==="surprise"?
  <g fill="#292b37"><rect x="42" y="37" width="3" height="5"/><rect x="56" y="37" width="3" height="5"/></g>:
 emotion==="thinking"?
  <g fill="#292b37"><rect x="41" y="38" width="5" height="2"/><rect x="55" y="39" width="4" height="3"/></g>:
  <g fill="#292b37"><rect x="42" y="38" width="4" height="3"/><rect x="55" y="38" width="4" height="3"/></g>;
 const mouth=emotion==="joy"?<path d="M48 45q5 6 10 0" fill="none" stroke="#9a4545" strokeWidth="2"/>:
 emotion==="surprise"?<rect x="51" y="44" width="4" height="5" fill="#a45d58"/>:
 emotion==="thinking"?<rect x="51" y="46" width="4" height="1" fill="#a45d58"/>:
 <path d="M50 46h6" stroke="#985957" strokeWidth="1"/>;
 return <span className={"npc-art npc-art--"+size+" npc-art--"+motion+" npc-art--"+facing}
  style={style} role="img" aria-label={(name??id)+"، "+emotion+"، "+motion}>
   <svg viewBox="0 0 96 120" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" aria-hidden="true">
    <ellipse cx="49" cy="112" rx="24" ry="4" fill="#071421" opacity=".35"/>
    <g className="npc-sprite-body">
     {/* boots / independent walking gait */}
     <g className="npc-sprite-leg-left"><rect x="34" y="88" width="13" height="17" fill={p.boots}/><rect x="31" y="102" width="17" height="6" fill="#202735"/><rect x="33" y="93" width="11" height="3" fill={p.trim}/></g>
     <g className="npc-sprite-leg-right"><rect x="52" y="88" width="13" height="17" fill={p.boots}/><rect x="51" y="102" width="18" height="6" fill="#202735"/><rect x="54" y="93" width="10" height="3" fill={p.trim}/></g>
     {/* cape / body */}
     <path d="M29 58L17 92 35 99 64 98 79 90 67 57Z" fill={p.accent} opacity=".82"/>
     <path d="M32 57H66L70 90 31 91Z" fill={p.cloth}/>
     <path d="M38 58L40 90 55 90 57 57Z" fill={p.cloth} stroke={p.trim} strokeWidth="2"/>
     <rect x="38" y="80" width="21" height="4" fill={p.boots}/>
     <rect x="47" y="78" width="7" height="8" fill={p.trim}/>
     <rect x="49" y="80" width="3" height="4" fill="#27393c"/>
     <g className="npc-sprite-arm-left">
      <path d="M30 60L23 83 29 86 39 65Z" fill={p.cloth}/>
      <rect x="23" y="82" width="9" height="8" fill={p.skin}/>
      <rect x="26" y="78" width="7" height="4" fill={p.trim}/>
     </g>
     <g className="npc-sprite-arm-right">
      <path d="M64 61L77 80 70 85 58 66Z" fill={p.cloth}/>
      <rect x="70" y="81" width="9" height="8" fill={p.skin}/>
      <rect x="69" y="78" width="8" height="4" fill={p.trim}/>
     </g>
     {/* character silhouettes */}
     {npc.silhouette==="engineer"&&<g><rect x="19" y="74" width="11" height="16" fill="#775239"/><rect x="20" y="76" width="9" height="3" fill={p.trim}/><rect x="22" y="83" width="4" height="5" fill={p.accent}/></g>}
     {npc.silhouette==="traveler"&&<g><rect x="65" y="68" width="13" height="22" fill="#694c3b"/><rect x="67" y="72" width="9" height="3" fill={p.trim}/><rect x="71" y="76" width="3" height="3" fill={p.accent}/></g>}
     {npc.silhouette==="sage"&&<path d="M29 66H69L75 99 25 99Z" fill={p.cloth} stroke={p.trim} strokeWidth="2"/>}
     {/* face and hair */}
     <path d="M35 26H65L69 45 62 56H38L30 45Z" fill={p.hair}/>
     <rect x="35" y="29" width="29" height="24" fill={p.skin}/>
     <rect x="30" y="36" width="6" height="10" fill={p.skin}/><rect x="64" y="36" width="6" height="10" fill={p.skin}/>
     {!back&&<>{eyes}{mouth}</>}
     {back&&<rect x="37" y="28" width="25" height="26" fill={p.hair}/>}
     {/* hair top: intentionally asymmetric, pixel-step shading */}
     <path d="M30 35L29 27 36 22 40 18 55 19 60 15 67 21 70 30 64 36 62 30 58 27 50 30 44 26 38 33Z" fill={p.hair}/>
     <path d="M35 25L48 21 54 23 42 28Z" fill={p.trim} opacity=".6"/>
     {npc.silhouette==="keeper"&&<g><path d="M32 29L20 65 27 66 35 43" fill={p.hair}/><path d="M67 29L75 68 70 72 62 43" fill={p.hair}/><rect x="30" y="26" width="9" height="4" fill="#e3de8d"/></g>}
     {npc.silhouette==="sage"&&<g><path d="M37 49L41 65 58 66 65 49 59 53 51 57 42 52Z" fill="#e9e6db"/><rect x="41" y="30" width="19" height="3" fill={p.hair}/></g>}
     {npc.silhouette==="guardian"&&<g><rect x="34" y="25" width="31" height="6" fill="#364357"/><rect x="40" y="26" width="9" height="4" fill="#b8dced"/><rect x="52" y="26" width="9" height="4" fill="#b8dced"/></g>}
     {npc.silhouette==="explorer"&&<g><path d="M24 28L48 16 72 28 81 32 15 32Z" fill="#d2c2a8"/><rect x="42" y="19" width="12" height="3" fill={p.trim}/><path d="M67 27L80 24" stroke="#9fdcec" strokeWidth="3"/></g>}
     {npc.silhouette==="engineer"&&<g><path d="M34 24L43 19 59 20 65 25 63 30 34 30Z" fill="#4d7a57"/><rect x="38" y="24" width="22" height="3" fill={p.trim}/></g>}
     {/* emblem deliberately unique to each character */}
     <rect x="47" y="61" width="8" height="8" fill={p.trim}/>
     <rect x="49" y="63" width="4" height="4" fill={p.accent}/>
     {npc.accessory==="lantern"&&<g><rect x="74" y="75" width="9" height="12" fill="#f4da76"/><rect x="76" y="72" width="5" height="3" fill="#ac8652"/></g>}
     {npc.accessory==="blueprint"&&<g><rect x="17" y="82" width="13" height="8" fill="#e8d8ad"/><path d="M19 85h8" stroke="#5c97ad" strokeWidth="1"/></g>}
     {npc.accessory==="book"&&<g><rect x="69" y="79" width="13" height="11" fill="#dfc47b"/><rect x="72" y="80" width="3" height="10" fill="#456873"/></g>}
     {npc.accessory==="telescope"&&<g><path d="M68 78L81 71 83 75 70 82" fill="#d6ac65"/></g>}
     {npc.accessory==="garden"&&<g><path d="M19 80v-13M16 73l3-6 4 6" fill="none" stroke="#a3df87" strokeWidth="2"/></g>}
     {npc.accessory==="compass"&&<g><circle cx="71" cy="85" r="5" fill={p.trim}/><path d="M71 81v8M67 85h8" stroke="#375d68" strokeWidth="1"/></g>}
    </g>
   </svg>
  </span>;
}
