/**
 * THE WORLD OF DINARO — Starting Village 1.0.
 * Pure deterministic collision, map and quest rules; no bank access.
 * All positions are integer tile coordinates. Houses have real interiors.
 */
export type Direction="up"|"down"|"left"|"right";
export type Room="village"|"home"|"library"|"workshop";
export type QuestStep="meet-ashraf"|"visit-library"|"find-seed"|"return-ashraf"|"complete";
export interface Point {x:number;y:number}
export interface GameState{
 room:Room; position:Point; direction:Direction;
 quest:QuestStep; discovered:string[]; talkingTo:"ashraf"|null;
 time:"day"|"night"; weather:"clear"|"rain";
 steps:number; lastMessage:string;
}
export const TILE_SIZE=32;
export const VILLAGE_WIDTH=24;
export const VILLAGE_HEIGHT=18;
/** Readable source map: # wall/cliff, ~ water, T tree, H house,
 * L library, W workshop, S magical seed, A Ashraf, . grass, = path. */
export const VILLAGE_MAP=[
"########################",
"#...T......T.....T.....#",
"#....TT...........TT...#",
"#..HHHH.......LLLLL....#",
"#..HHHH.......LLLLL....#",
"#..HHHH.......LLLLL....#",
"#...DD.........DD......#",
"#.........T............#",
"#......=======.........#",
"#..T...=======....TT...#",
"#......===A===.........#",
"#..=====.....=======...#",
"#..=.....T.........=...#",
"#..=..WDWW......S..=...#",
"#..=..WWWW.........=...#",
"#..=..WWWW....~~~..=...#",
"#..==========.~~~..=...#",
"########################"
] as const;
const HOME_MAP=[
"############",
"#..........#",
"#..BBB.....#",
"#..BBB.....#",
"#..........#",
"#......TT..#",
"#..........#",
"#....DD....#",
"############"
] as const;
const LIBRARY_MAP=[
"############",
"#.BBB..BBB.#",
"#.BBB..BBB.#",
"#..........#",
"#..T.......#",
"#..........#",
"#..........#",
"#....DD....#",
"############"
] as const;
const WORKSHOP_MAP=[
"############",
"#..BBB.....#",
"#..BBB..T..#",
"#..........#",
"#......BBB.#",
"#..........#",
"#..........#",
"#....DD....#",
"############"
] as const;
export const MAPS:Record<Room,readonly string[]>={
 village:VILLAGE_MAP,home:HOME_MAP,library:LIBRARY_MAP,workshop:WORKSHOP_MAP
};
export const SPAWN:Record<Room,Point>={
 village:{x:11,y:11},home:{x:5,y:6},library:{x:5,y:6},workshop:{x:5,y:6}
};
export const INITIAL_GAME_STATE:GameState={
 room:"village",position:{x:11,y:11},direction:"down",
 quest:"meet-ashraf",discovered:["village"],talkingTo:null,
 time:"day",weather:"clear",steps:0,lastMessage:"تحرك بالأسهم أو WASD وقابل أشرف قرب ساحة القرية."
};
export const QUEST_LABELS:Record<QuestStep,string>={
 "meet-ashraf":"تحدث مع أشرف في ساحة القرية",
 "visit-library":"ادخل مكتبة القرية وتعرّف عليها",
 "find-seed":"اعثر على بذرة النور في شرق القرية",
 "return-ashraf":"ارجع لأشرف وأخبره بما وجدت",
 complete:"اكتملت مهمة بذرة النور — تذكار افتراضي!"
};
export const ROOM_LABELS:Record<Room,string>={
 village:"قرية البدايات",home:"بيت المغامر",library:"مكتبة القرية",workshop:"ورشة ريمو"
};
const SOLIDS=new Set(["#","T","H","L","W","B","~","A"]);
export function tileAt(room:Room,{x,y}:Point):string{
 const map=MAPS[room];
 if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||y<0||y>=map.length||x<0||x>=map[0].length)return "#";
 return map[y][x]??"#";
}
export function isWalkable(room:Room,pos:Point):boolean{
 return !SOLIDS.has(tileAt(room,pos));
}
export function near(a:Point,b:Point,distance=1):boolean{
 return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=distance;
}
export function uniqueDiscovered(items:readonly string[],item:string):string[]{
 return items.includes(item)?[...items]:[...items,item];
}
export function isValidGameState(value:unknown):value is GameState{
 if(!value||typeof value!=="object")return false;
 const s=value as Partial<GameState>;
 if(!s.room||!Object.hasOwn(MAPS,s.room)||!s.position||!s.direction||!s.quest)return false;
 if(!["up","down","left","right"].includes(s.direction))return false;
 if(!Object.hasOwn(QUEST_LABELS,s.quest))return false;
 if(!isWalkable(s.room,s.position))return false;
 return Array.isArray(s.discovered)&&s.discovered.length<=20&&
  s.discovered.every(x=>typeof x==="string"&&x.length<64)&&
  (s.talkingTo===null||s.talkingTo==="ashraf")&&
  (s.time==="day"||s.time==="night")&&
  (s.weather==="clear"||s.weather==="rain")&&
  Number.isSafeInteger(s.steps)&&s.steps>=0&&s.steps<=1_000_000&&
  typeof s.lastMessage==="string"&&s.lastMessage.length<=400;
}
export function newGame():GameState{return {
 ...INITIAL_GAME_STATE,position:{...INITIAL_GAME_STATE.position},
 discovered:[...INITIAL_GAME_STATE.discovered]
};}
export function move(state:GameState,direction:Direction):GameState{
 if(state.talkingTo)return {...state,direction};
 const delta:Record<Direction,Point>={
 up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}
 };
 const d=delta[direction],next={x:state.position.x+d.x,y:state.position.y+d.y};
 if(!isWalkable(state.room,next))return {...state,direction};
 let nextState:GameState={
 ...state,position:next,direction,steps:state.steps+1,lastMessage:""
 };
 const tile=tileAt(state.room,next);
 if(state.room!=="village"&&tile==="D"){
  nextState={...nextState,room:"village",position:
    state.room==="home"?{x:4,y:7}:state.room==="library"?{x:15,y:7}:{x:7,y:12},
    lastMessage:"رجعت إلى قرية البدايات."};
 }
 if(state.room==="village"&&tile==="D"){
  const to:Room=next.x<9?"home":"library";
  nextState={...nextState,room:to,position:{...SPAWN[to]},
   discovered:uniqueDiscovered(nextState.discovered,to),
   lastMessage:to==="home"?"دخلت بيت المغامر.":"دخلت مكتبة القرية."};
 }
 if(state.room==="village"&&next.x===7&&next.y===13){
  nextState={...nextState,room:"workshop",position:{...SPAWN.workshop},
   discovered:uniqueDiscovered(nextState.discovered,"workshop"),lastMessage:"دخلت ورشة ريمو."};
 }
 if(nextState.room==="library"&&nextState.quest==="visit-library"){
  nextState={...nextState,quest:"find-seed",lastMessage:"قرأت عن بذرة النور! ابحث عنها قرب الشرق."};
 }
 if(nextState.room==="village"&&tileAt("village",nextState.position)==="S"&&nextState.quest==="find-seed"){
  nextState={...nextState,quest:"return-ashraf",
   discovered:uniqueDiscovered(nextState.discovered,"light-seed"),
   lastMessage:"وجدت بذرة النور! ارجع لأشرف."};
 }
 return nextState;
}
export function interact(state:GameState):GameState{
 if(state.talkingTo)return {...state,talkingTo:null,lastMessage:"أغلقت الحوار."};
 if(state.room==="village"&&near(state.position,{x:10,y:10},1)){
  const quest=state.quest==="meet-ashraf"?"visit-library":
   state.quest==="return-ashraf"?"complete":state.quest;
  return {...state,quest,talkingTo:"ashraf",
   discovered:quest==="complete"?uniqueDiscovered(state.discovered,"seed-medal"):state.discovered,
   lastMessage:quest==="visit-library"?"أشرف: أهلا بيك! جرّب زيارة المكتبة قرب شمال شرق القرية.":
    quest==="complete"?"أشرف: برافو! هذه شارة بذرة النور، تذكار داخل اللعبة.":
    "أشرف: كل خطوة محسوبة، لكن خذ وقتك في الاستكشاف."};
 }
 return {...state,lastMessage:"اقترب من أشرف ثم اضغط تفاعل، أو استكشف أحد المداخل."};
}
export function changeWeather(state:GameState):GameState{
 return {...state,weather:state.weather==="clear"?"rain":"clear"};
}
export function changeTime(state:GameState):GameState{
 return {...state,time:state.time==="day"?"night":"day"};
}
