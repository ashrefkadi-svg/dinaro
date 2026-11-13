import {useCallback,useEffect,useRef,useState} from "react";
import type {CSSProperties} from "react";
import {BookOpen,CloudRain,Compass,House,Map,MessageCircle,Moon,RotateCcw,Save,Sun,TreePine} from "lucide-react";
import {NpcCharacter} from "./NpcCharacter";
import {chooseDialogue} from "./npc-dialogues";
import {
  MAPS,ROOM_LABELS,QUEST_LABELS,
  newGame,move,interact,changeTime,changeWeather,isValidGameState,
  TILE_SIZE
} from "./village-engine";
import type {Direction,GameState} from "./village-engine";
import "./village-rpg.css";

const SAVE_KEY="dinaro.world.starting-village.v1";
type SaveStatus="saved"|"blocked"|"empty";
function loadGame():GameState{
 try{
  const saved=window.localStorage.getItem(SAVE_KEY);
  if(!saved)return newGame();
  const parsed:unknown=JSON.parse(saved);
  return isValidGameState(parsed)?parsed:newGame();
 }catch{return newGame();}
}
const keyToDirection:Record<string,Direction>={
 ArrowUp:"up",w:"up",W:"up",ArrowDown:"down",s:"down",S:"down",
 ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right"
};
function tileClass(tile:string){
 if(tile==="#")return "wall";
 if(tile==="=")return "path";
 if(tile==="T")return "tree";
 if(tile==="~")return "water";
 if(tile==="H")return "house";
 if(tile==="L")return "library";
 if(tile==="W")return "workshop";
 if(tile==="D")return "door";
 if(tile==="B")return "bookshelf";
 if(tile==="S")return "seed";
 if(tile==="A")return "npc";
 return "grass";
}
function spriteStyle(x:number,y:number):CSSProperties{
 return {left:(x*TILE_SIZE)+"px",top:(y*TILE_SIZE)+"px"};
}
export function VillageRPG(){
 const [game,setGame]=useState<GameState>(loadGame);
 const [saveStatus,setSaveStatus]=useState<SaveStatus>("empty");
 const [dialogueIndex,setDialogueIndex]=useState(0);
 const boardRef=useRef<HTMLDivElement|null>(null);
 const savedOnce=useRef(false);
 const step=useCallback((direction:Direction)=>setGame(old=>move(old,direction)),[]);
 const action=useCallback(()=>setGame(old=>interact(old)),[]);
 useEffect(()=>{
   const handle=(event:KeyboardEvent)=>{
    if(event.altKey||event.metaKey||event.ctrlKey)return;
    const target=event.target;
    if(target instanceof HTMLElement&&(
      target.isContentEditable||["INPUT","TEXTAREA","SELECT","BUTTON"].includes(target.tagName)
    ))return;
    const direction=keyToDirection[event.key];
    if(direction){event.preventDefault();step(direction);}
    else if(event.key==="e"||event.key==="E"||event.key===" "){
     event.preventDefault();action();
    }
   };
   window.addEventListener("keydown",handle);
   return ()=>window.removeEventListener("keydown",handle);
 },[step,action]);
 useEffect(()=>{
  // The only persisted data is this optional game's coordinates and fictional quest state.
  // No financial amounts or credentials are read or written here.
  try{
    window.localStorage.setItem(SAVE_KEY,JSON.stringify(game));
    if(!savedOnce.current)savedOnce.current=true;
    setSaveStatus("saved");
  }catch{setSaveStatus("blocked");}
 },[game]);
 useEffect(()=>{
  const board=boardRef.current;
  if(!board)return;
  const x=game.position.x*TILE_SIZE;
  const y=game.position.y*TILE_SIZE;
  board.scrollTo({left:Math.max(0,x-board.clientWidth/2),top:Math.max(0,y-board.clientHeight/2),behavior:"auto"});
 },[game.position.x,game.position.y,game.room]);
 const rows=MAPS[game.room],width=rows[0].length;
 const npcLine=game.talkingTo?chooseDialogue({
  npc:"ashraf",scene:game.quest==="complete"?"victory":"welcome",turn:dialogueIndex
 }).text:null;
 const message=game.lastMessage||"استكشف القرية: اشرف قريب من الساحة، والمكتبة شمال شرقها.";
 function reset(){
  if(!window.confirm("نبدأ مغامرة جديدة؟ سيتم مسح تقدم اللعبة المحلي فقط، وليس أي بيانات مالية."))return;
  setGame(newGame());setDialogueIndex(0);
 }
 return <section className="rpg-shell" aria-label="قرية البدايات — لعبة RPG قابلة للعب" dir="rtl">
  <div className="rpg-heading">
   <div className="rpg-intro"><span><Map size={16}/> THE WORLD OF DINARO · PLAYABLE RPG</span>
    <h3>قرية البدايات</h3><p>تجول بحرية، ادخل البيوت، تحدث مع أشرف وأنجز مهمة بذرة النور.</p></div>
   <span className="rpg-save-state" title="حفظ محلي داخل هذا المتصفح"><Save size={14}/>{saveStatus==="saved"?"محفوظ تلقائيًا":saveStatus==="blocked"?"الحفظ محجوب":"محلي فقط"}</span>
  </div>
  <div className="rpg-statusbar">
   <span><Compass size={14}/>{ROOM_LABELS[game.room]}</span>
   <span><TreePine size={14}/> {game.discovered.length} اكتشافات</span>
   <span>{game.time==="day"?<Sun size={14}/>:<Moon size={14}/>} {game.time==="day"?"نهار":"ليل"}</span>
  </div>
  <div className="rpg-map-frame">
   <div ref={boardRef} className={"rpg-viewport rpg-"+game.time+" rpg-"+game.weather}
    role="group" aria-label={"خريطة "+ROOM_LABELS[game.room]+", اللاعب في "+game.position.x+"، "+game.position.y}>
    <div className="rpg-map" style={{width:width*TILE_SIZE,height:rows.length*TILE_SIZE}}>
     {rows.map((row,y)=>[...row].map((tile,x)=><span
        key={y+"-"+x} className={"rpg-tile tile-"+tileClass(tile)}
        style={spriteStyle(x,y)} aria-hidden="true"/>))}
     {game.room==="village"&&<div className="rpg-ashraf" style={spriteStyle(10,10)} aria-label="أشرف، مرافق الرحلة">
       <NpcCharacter id="ashraf" size="scene" motion={game.talkingTo?"talk":"idle"} facing="front"/>
       <span>أشرف</span>
      </div>}
     <div className={"rpg-player facing-"+game.direction} style={spriteStyle(game.position.x,game.position.y)}
      role="img" aria-label="شخصية اللاعب">
       <span className="rpg-avatar-head"/><span className="rpg-avatar-body"/><span className="rpg-avatar-legs"/>
     </div>
    </div>
   </div>
   <div className="rpg-overlay-badge">خريطة قابلة للاستكشاف — {width}×{rows.length}</div>
  </div>
  <div className="rpg-quest">
   <div><BookOpen size={17}/><strong>المهمة الأولى: بذرة النور</strong></div>
   <p>{QUEST_LABELS[game.quest]}</p>
   {game.quest==="complete"&&<span className="rpg-earned">✦ شارة بذرة النور — مكافأة قصصية فقط</span>}
  </div>
  <div className="rpg-message" role="status">{message}</div>
  {game.talkingTo&&<div className="rpg-conversation" role="dialog" aria-label="حوار مع أشرف">
    <NpcCharacter id="ashraf" size="portrait" emotion={game.quest==="complete"?"joy":"calm"}/>
    <div><strong>أشرف — مرافق الرحلة</strong><p>{game.lastMessage} {npcLine}</p>
     <button type="button" onClick={()=>setDialogueIndex(i=>i+1)}>كلام آخر</button>
     <button type="button" onClick={action}>إغلاق</button>
    </div>
  </div>}
  <div className="rpg-controls">
   <div className="rpg-dpad" role="group" aria-label="تحريك اللاعب">
    <button type="button" className="up" aria-label="تحرك للأعلى" onClick={()=>step("up")}>↑</button>
    <button type="button" className="left" aria-label="تحرك لليسار" onClick={()=>step("left")}>←</button>
    <button type="button" className="down" aria-label="تحرك للأسفل" onClick={()=>step("down")}>↓</button>
    <button type="button" className="right" aria-label="تحرك لليمين" onClick={()=>step("right")}>→</button>
   </div>
   <div className="rpg-actions">
    <button type="button" className="rpg-interact" onClick={action}><MessageCircle size={17}/> تفاعل (E)</button>
    <button type="button" onClick={()=>setGame(changeTime)}>{game.time==="day"?<Moon size={16}/>:<Sun size={16}/>} {game.time==="day"?"الليل":"النهار"}</button>
    <button type="button" onClick={()=>setGame(changeWeather)}><CloudRain size={16}/> {game.weather==="clear"?"أمطار":"صحو"}</button>
    <button type="button" onClick={reset}><RotateCcw size={16}/> بداية جديدة</button>
   </div>
  </div>
  <p className="rpg-help"><House size={15}/> لوحة المفاتيح: WASD أو الأسهم للحركة، وE للتفاعل. على الهاتف استخدم أزرار الاتجاهات. الحفظ محلي وتلقائي داخل المتصفح، ولا يتصل بالحساب المالي.</p>
 </section>;
}
