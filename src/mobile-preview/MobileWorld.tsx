import {useState} from "react";
import {Compass,MessageCircle,Map,ShieldCheck,Sparkles,RefreshCw,VolumeX} from "lucide-react";
import {NpcCharacter} from "../features/world/NpcCharacter";
import {VillageRPG} from "../features/world/VillageRPG";
import {NPC_CAST,CHOICE_LABELS,chooseDialogue,sceneFromProgress} from "../features/world/npc-dialogues";
import type {NpcId,DialogueScene,PlayerIntent,DialogueReply} from "../features/world/npc-dialogues";
import {NPC_REGIONS,residentsOf,emotionFor,motionFor} from "../features/world/npc-definitions";
import type {NpcRegion} from "../features/world/npc-definitions";
import {getJourneyState} from "../features/goals/journey";
import "./world-mobile.css";

const REGIONS:readonly NpcRegion[]=[
  "village","forest","valley","bridge","castle","horizon","secret-islands"
];

const SCENE_COLORS:Record<NpcRegion,string>={
  village:"m-village",forest:"m-forest",valley:"m-valley",bridge:"m-bridge",
  castle:"m-castle",horizon:"m-horizon","secret-islands":"m-islands"
};

function textForScene(scene:DialogueScene){
 const labels:Record<DialogueScene,string>={
  welcome:"لقاء",early:"البداية",growing:"رحلة التقدم",milestone:"إنجاز جديد",
  slowdown:"استراحة",setback:"تغيّرت الخطة",victory:"الاحتفال",discovery:"اكتشاف"
 };
 return labels[scene];
}

/**
 * A fully local, opt-in interactive walkthrough of NPCs and game locations.
 * Progress is intentionally fictional and never connected to wallets, goals or network.
 */
export default function MobileWorld(){
 const [progress,setProgress]=useState(62.5);
 const [regionOverride,setRegionOverride]=useState<NpcRegion|null>(null);
 const region=regionOverride??getJourneyState(progress).region.id as NpcRegion;
 const roster=residentsOf(region);
 const [selectedNpc,setSelectedNpc]=useState<NpcId>("salim");
 const npc=roster.includes(selectedNpc)?selectedNpc:roster[0]??"ashraf";
 const [context,setContext]=useState<DialogueScene>("growing");
 const [lastReply,setLastReply]=useState<DialogueReply|null>(null);
 const [lastIntent,setLastIntent]=useState<PlayerIntent|null>(null);
 const [turn,setTurn]=useState(0);
 const [variantHistory,setVariantHistory]=useState<Record<string,number>>({});
 const [walking,setWalking]=useState(false);
 const active=NPC_CAST[npc];
 const emotion=lastReply?emotionFor(context,lastIntent??undefined):"calm";
 const animation=walking?"walk":lastReply?motionFor(context,lastIntent??undefined):context==="victory"?"celebrate":"idle";

 function chooseRegion(next:NpcRegion|null){
  const selected=next??(getJourneyState(progress).region.id as NpcRegion);
  setRegionOverride(next);
  setSelectedNpc(residentsOf(selected)[0]??"ashraf");
  setContext(next==="secret-islands"?"discovery":"welcome");
  setLastReply(null);
  setLastIntent(null);
 }
 function updateProgress(next:number){
  const valid=Math.min(100,Math.max(0,next));
  setContext(sceneFromProgress(valid,progress));
  setLastIntent(null);
  setProgress(valid);
  setRegionOverride(null);
  setSelectedNpc(residentsOf(getJourneyState(valid).region.id as NpcRegion)[0]??"ashraf");
  setLastReply(null);
 }
 function changeNpc(next:NpcId){
  setSelectedNpc(next);
  setContext("welcome");
  setLastReply(null);
  setLastIntent(null);
 }
 function talk(choice?:PlayerIntent,scene=context){
  const key=npc+":"+scene+":"+(choice??"line");
  const result=chooseDialogue({
   npc,scene,turn,lastVariant:variantHistory[key],choice
  });
  setVariantHistory(old=>({...old,[key]:result.variant}));
  setLastReply(result);
  setLastIntent(choice??null);
  setTurn(turn+1);
  setContext(scene);
 }
 const sentence=lastReply?.npc===npc?lastReply.text:active.lines[context][0];
 const labelScene=textForScene(context);
 return <section className="mw-world" aria-label="عالم دينارو التفاعلي — عرض خيالي">
   <VillageRPG/>
   <div className="mw-map-label"><span>استكشاف بقية المملكة — معاينة المناطق القادمة</span></div>
   <div className="mw-eyebrow"><Map size={17}/> THE WORLD OF DINARO <span>DEMO</span></div>
   <h2>مملكة دينارو والجزر السرية</h2>
   <p className="mw-description">استكشف المملكة، قابل شخصياتها واختار طريقة الحوار. كل شيء تجريبي ولا يرتبط بأموالك.</p>

   <div className="mw-map-label"><span><Compass size={16}/> خريطة المناطق</span>
      <button type="button" className={regionOverride===null?"selected":""} onClick={()=>chooseRegion(null)}>حسب التقدم</button>
   </div>
   <div className="mw-region-scroll" role="group" aria-label="اختيار منطقة المملكة">
     {REGIONS.map((r,i)=><button type="button" key={r}
       aria-pressed={region===r}
       className={"mw-region-chip"+(region===r?" active":"")}
       onClick={()=>chooseRegion(r)}>
       <span aria-hidden="true">{i===6?"✦":String(i+1).padStart(2,"0")}</span>
       {NPC_REGIONS[r].name}
     </button>)}
   </div>

   <div className={"mw-landscape "+SCENE_COLORS[region]} role="group" aria-label={"مشهد منطقة "+NPC_REGIONS[region].name}>
     <div className="mw-sun" aria-hidden="true"/>
     <div className="mw-mountains" aria-hidden="true"/>
     <div className="mw-path" aria-hidden="true"/>
     <div className="mw-tree mw-tree-a" aria-hidden="true"/>
     <div className="mw-tree mw-tree-b" aria-hidden="true"/>
     <div className="mw-structure" aria-hidden="true"/>
     <span className="mw-area-tag">{NPC_REGIONS[region].name}</span>
     <div className="mw-traveler" style={{left:Math.min(76,7+progress*.65)+"%"}}>
       <NpcCharacter id={npc} size="scene"
         emotion={emotion} motion={animation}
         facing="front" name={active.name}/>
     </div>
   </div>

   <div className="mw-progress-title"><span>نسبة تقدم الهدف الافتراضي</span><strong dir="ltr">{progress.toFixed(1)}%</strong></div>
   <div className="mw-progress-bar"><i style={{width:progress+"%"}}/></div>
   <input className="mw-slider" type="range" aria-label="محاكاة نسبة تقدم الهدف" min="0" max="100" step="5"
     value={progress} onChange={e=>updateProgress(Number(e.target.value))}
     onPointerDown={()=>setWalking(true)}
     onPointerUp={()=>setWalking(false)}
     onPointerCancel={()=>setWalking(false)}
     onBlur={()=>setWalking(false)}
     onKeyDown={()=>setWalking(true)} onKeyUp={()=>setWalking(false)}/>
   <div className="mw-milestones" role="group" aria-label="محطات التقدم">
     {[0,25,50,75,100].map(n=><button key={n} type="button" onClick={()=>updateProgress(n)}
       aria-pressed={progress===n}>{n}%</button>)}
   </div>

   <div className="mw-npc-title"><MessageCircle size={18}/> سكان المنطقة <span>{roster.length}</span></div>
   <div className="mw-npc-roster" role="group" aria-label="اختيار شخصية للحوار">
     {roster.map(id=><button type="button" key={id} aria-pressed={npc===id}
       className={"mw-npc-pick"+(npc===id?" active":"")}
       onClick={()=>changeNpc(id)}>
       <NpcCharacter id={id} size="thumb" name={NPC_CAST[id].name} emotion="calm"/>
       <span>{NPC_CAST[id].name}</span>
     </button>)}
   </div>

   <div className="mw-dialogue" aria-label={"حوار "+active.name}>
     <div className="mw-portrait"><NpcCharacter id={npc} size="portrait" name={active.name} emotion={emotion}/></div>
     <div className="mw-dialogue-content">
       <div className="mw-speaker"><strong>{active.name}</strong><span>{labelScene}</span></div>
       <p key={npc+":"+turn+":"+context}>{sentence}</p>
     </div>
   </div>
   <div className="mw-dialogue-choices" aria-label="ردود اللاعب">
     {(["ask","explore","reflect"] as PlayerIntent[]).map(intent=>
       <button type="button" key={intent} onClick={()=>talk(intent)}>{CHOICE_LABELS[intent]}</button>)}
   </div>
   <button type="button" className="mw-another-line" onClick={()=>talk()}>
     <RefreshCw size={15}/> جملة مختلفة من {active.name}
   </button>
   <div className="mw-moral">
     <ShieldCheck size={18}/>
     <span>لا حفظ للمحادثات، ولا اتصال بنكي، ولا عقوبة إذا تغيّر تقدم الادخار.</span>
     <VolumeX size={16} aria-label="بدون صوت"/>
   </div>
   <div className="mw-island-hint"><Sparkles size={16}/>
     <span>الجزر السرية مفتوحة للاستكشاف الاختياري حتى بدون بلوغ 100%.</span>
   </div>
 </section>;
}
