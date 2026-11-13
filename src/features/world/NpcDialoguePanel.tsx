import {useState} from "react";
import {HelpCircle,MessageCircle,MessageSquareMore,ArrowLeft,RotateCcw} from "lucide-react";
import {
 NPC_CAST,DIALOGUE_SCENES,CHOICE_LABELS,
 chooseDialogue,sceneFromProgress
} from "./npc-dialogues";
import type {NpcId,DialogueScene,PlayerIntent} from "./npc-dialogues";
import "./npc.css";
import {NpcCharacter} from "./NpcCharacter";
import {NpcDialogueBubble} from "./NpcDialogueBubble";
import {NPC_VISUALS,NPC_REGIONS,residentsOf} from "./npc-definitions";
import type {NpcRegion,NpcFacing,NpcMotion} from "./npc-definitions";
import {useNpcState} from "./useNpcState";

const sceneLabels:Record<DialogueScene,string>={
 welcome:"أول لقاء",early:"بداية الهدف",growing:"تقدم في الرحلة",
 milestone:"معْلم جديد",slowdown:"أحتاج راحة",setback:"تغيّرت أولوياتي",
 victory:"تحقيق الهدف",discovery:"اكتشاف جزيرة"
};
interface ChatItem {id:number;from:"npc"|"player";name:string;text:string}
const greeting=chooseDialogue({npc:"ashraf",scene:"welcome",turn:0});

export function NpcDialoguePanel({progress}:{progress:number}){
 const [npc,setNpc]=useState<NpcId>("ashraf");
 const [scene,setScene]=useState<DialogueScene>("welcome");
 const [turn,setTurn]=useState(1);
 const [lastUsed,setLastUsed]=useState<Record<string,number>>({"ashraf:welcome":greeting.variant});
 const [history,setHistory]=useState<ChatItem[]>([{
   id:0,from:"npc",name:greeting.name,text:greeting.text
 }]);
 const profile=NPC_CAST[npc];
 const {state,reactToDialogue,face,move}=useNpcState();
 const [region,setRegion]=useState<NpcRegion>("village");

 function speak(target:NpcId,nextScene:DialogueScene,intent?:PlayerIntent,targetRegion?:NpcRegion){
   const key=target+":"+nextScene+":"+(intent??"line");
   const old=lastUsed[key];
   const reply=chooseDialogue({npc:target,scene:nextScene,turn,lastVariant:old,choice:intent});
   setLastUsed(previous=>({...previous,[key]:reply.variant}));
   const userLine=intent?[{id:turn*2-1,from:"player" as const,name:"أنت",text:CHOICE_LABELS[intent]}]:[];
   setHistory(oldHistory=>[...oldHistory,...userLine,{
     id:turn*2,from:"npc" as const,name:reply.name,text:reply.text
   }].slice(-8));
   setNpc(target);
   setRegion(targetRegion??NPC_VISUALS[target].region);
   reactToDialogue(nextScene,intent);
   setScene(nextScene);
   setTurn(current=>current+1);
 }
 function restart(){
   const next=chooseDialogue({npc,scene:"welcome",turn,lastVariant:lastUsed[npc+":welcome:line"]});
   setScene("welcome");
   move("idle");
   setLastUsed(prev=>({...prev,[npc+":welcome:line"]:next.variant}));
   setHistory([{id:turn*2,from:"npc",name:next.name,text:next.text}]);
   setTurn(current=>current+1);
 }
 const recent=history.slice(-5);
 return <section className="npc-panel" aria-label="حوار شخصيات عالم دينارو">
   <div className="npc-topline">
     <div><div className="npc-eyebrow"><MessageCircle size={17}/> THE WORLD OF DINARO · NPC DIALOGUE</div>
       <h3>تحدث مع سكان المملكة</h3>
       <p>كل شخصية تتكلم بطريقتها، وتتغير صياغة الرد حسب الموقف واختيارك.</p></div>
     <span className="npc-demo-tag">حوار قصصي تجريبي</span>
   </div>
   <div className="npc-region-picker"><span>مناطق المملكة والجزر السرية</span>
    <select value={region} aria-label="اختر المنطقة" onChange={e=>{
      const next=e.target.value as NpcRegion;
      setRegion(next);
      const first=residentsOf(next)[0];
      if(first)speak(first,"welcome",undefined,next);
    }}>
     {(Object.keys(NPC_REGIONS) as NpcRegion[]).map(id=><option key={id} value={id}>{NPC_REGIONS[id].name}</option>)}
    </select>
   </div>
   <div className="npc-cast" role="group" aria-label="اختيار شخصية الحوار">
    {residentsOf(region).map(id=>{
      const character=NPC_CAST[id];
      return <button key={id} type="button" className={"npc-person "+(npc===id?"active":"")}
        aria-pressed={npc===id}
        onClick={()=>speak(id,"welcome")} title={character.voice}>
        <span className="npc-symbol"><NpcCharacter id={id} size="thumb" motion="idle" name={character.name}/></span>
        <strong>{character.name}</strong><small>{character.role}</small>
      </button>;
    })}
   </div>
   <div className="npc-stage" aria-label="معاينة حركة الشخصية">
     <div className="npc-stage-art"><NpcCharacter id={npc} size="scene" emotion={state.emotion} motion={state.motion} facing={state.facing} name={profile.name}/></div>
     <div className="npc-stage-meta"><strong>{profile.name}</strong><small>{NPC_REGIONS[region].name} · نموذج Pixel RPG قابل للتحريك</small>
       <div className="npc-anim-controls">
         {(["idle","walk","talk","celebrate"] as NpcMotion[]).map(value=><button type="button" key={value} aria-pressed={state.motion===value} onClick={()=>move(value)}>{({idle:"وقوف",walk:"مشي",talk:"حديث",celebrate:"احتفال"} as const)[value]}</button>)}
       </div>
       <div className="npc-anim-controls">
         {(["front","back","left","right"] as NpcFacing[]).map(value=><button type="button" key={value} aria-pressed={state.facing===value} onClick={()=>face(value)}>{({front:"أمام",back:"خلف",left:"يسار",right:"يمين"} as const)[value]}</button>)}
       </div>
     </div>
   </div>
   <NpcDialogueBubble id={npc} name={profile.name} emotion={state.emotion} motion={state.motion}>{recent[recent.length-1]?.text}</NpcDialogueBubble>
   <div className="npc-dialogue-head">
     <div><strong>{profile.name}</strong><span>{profile.role} · {profile.voice}</span></div>
     <button type="button" onClick={restart}><RotateCcw size={16}/> بداية جديدة</button>
   </div>
   <div className="npc-chat" role="log" aria-live="polite" aria-label="سجل الحوار القصصي">
     {recent.map(message=><div key={message.id} className={"npc-bubble npc-bubble--"+message.from}>
       <small>{message.name}</small>
       <p>{message.text}</p>
     </div>)}
   </div>
   <div className="npc-dialogue-controls">
     <span className="npc-control-caption"><MessageSquareMore size={16}/> جرّب موقفًا مختلفًا</span>
     <div className="npc-contexts">
       {DIALOGUE_SCENES.map(id=><button type="button" key={id}
         className={scene===id?"active":""} aria-pressed={scene===id}
         onClick={()=>speak(npc,id)}>{sceneLabels[id]}</button>)}
       <button type="button" onClick={()=>speak(npc,sceneFromProgress(progress))}>
          حسب تقدم الهدف ({progress.toFixed(0)}%)
       </button>
     </div>
     <span className="npc-control-caption"><HelpCircle size={16}/> كيف تحب ترد؟</span>
     <div className="npc-choices">
       {(["ask","explore","reflect"] as const).map(id=><button type="button" key={id}
          onClick={()=>speak(npc,scene,id)}>{CHOICE_LABELS[id]} <ArrowLeft size={15}/></button>)}
     </div>
   </div>
   <p className="npc-notice">
     الحوار مكتوب ومتفرع حسب الاختيار والموقف؛ لا يستخدم ذكاء اصطناعي متصلًا أو بيانات حسابك.
     يتذكر فقط سياق هذه الجلسة ولا يحرّك أموالًا أو يعاقب عند تغير خطة الادخار.
   </p>
 </section>;
}
