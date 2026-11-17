import {test} from "node:test";
import assert from "node:assert/strict";
import {
  VILLAGE_MAP,MAPS,SPAWN,newGame,move,interact,tileAt,isWalkable,near,
  QUEST_LABELS,ROOM_LABELS,isValidGameState,changeTime,changeWeather
} from "./village-engine.ts";

const DIRS=["up","down","left","right"];
function route(state,predicate){
 const queue=[{state,trace:[]}],visited=new Set();
 for(let i=0;i<queue.length;i++){
  const node=queue[i],s=node.state;
  const key=s.room+":"+s.position.x+":"+s.position.y;
  if(visited.has(key))continue;
  visited.add(key);
  if(predicate(s))return node;
  for(const d of DIRS){
   const next=move(s,d);
   if(next.room===s.room&&next.position.x===s.position.x&&next.position.y===s.position.y)continue;
   queue.push({state:next,trace:[...node.trace,d]});
  }
 }
 throw new Error("Destination unreachable from "+state.room+" at "+JSON.stringify(state.position));
}

test("village maps are regular and paths have solid walls, trees, water and NPC",()=>{
 for(const [name,map] of Object.entries(MAPS)){
  assert.ok(map.length>=9,name);
  assert.ok(map.every(row=>row.length===map[0].length),name);
 }
 assert.equal(VILLAGE_MAP.length,18);
 assert.equal(VILLAGE_MAP[0].length,24);
 assert.equal(tileAt("village",{x:10,y:10}),"A");
 assert.equal(isWalkable("village",{x:10,y:10}),false);
 assert.equal(isWalkable("village",{x:0,y:0}),false);
 assert.equal(isWalkable("village",{x:-1,y:3}),false);
 assert.equal(isWalkable("village",{x:16,y:13}),true);
 assert.equal(isWalkable("village",SPAWN.village),true);
});

test("starting quest is fully completable by walking between rooms and returning",()=>{
 let s=newGame();
 assert.equal(s.quest,"meet-ashraf");
 s=route(s,p=>p.room==="village"&&near(p.position,{x:10,y:10})).state;
 s=interact(s);
 assert.equal(s.quest,"visit-library");
 assert.equal(s.talkingTo,"ashraf");
 s=interact(s);
 assert.equal(s.talkingTo,null);
 s=route(s,p=>p.room==="library").state;
 assert.equal(s.quest,"find-seed");
 assert.ok(s.discovered.includes("library"));
 s=route(s,p=>p.room==="village").state;
 s=route(s,p=>p.room==="village"&&p.position.x===16&&p.position.y===13).state;
 assert.equal(s.quest,"return-ashraf");
 assert.ok(s.discovered.includes("light-seed"));
 s=route(s,p=>p.room==="village"&&near(p.position,{x:10,y:10})).state;
 s=interact(s);
 assert.equal(s.quest,"complete");
 assert.ok(s.discovered.includes("seed-medal"));
 assert.equal(s.talkingTo,"ashraf");
 assert.ok(isValidGameState(s));
});
test("all three interiors are enterable and exit correctly",()=>{
 for(const room of ["home","library","workshop"]){
  const {state}=route(newGame(),s=>s.room===room);
  assert.equal(state.room,room);
  assert.ok(state.discovered.includes(room));
  const exit=route(state,s=>s.room==="village");
  assert.equal(exit.state.room,"village");
  assert.ok(isWalkable(exit.state.room,exit.state.position));
 }
});
test("player cannot cross blockers and world state is deterministic",()=>{
 const initial=newGame();
 const x=move(initial,"left");
 assert.notEqual(initial,x);
 assert.deepEqual(initial.position,SPAWN.village);
 let state=initial;
 for(let n=0;n<60;n++)state=move(state,"up");
 assert.ok(state.position.y>=1);
 assert.equal(state.steps>=1,true);
 assert.deepEqual(newGame().discovered,["village"]);
});
test("day/night and weather are fictional, reversible and do not affect quest",()=>{
 const s=newGame(),night=changeTime(s),rain=changeWeather(s);
 assert.equal(night.time,"night");
 assert.equal(changeTime(night).time,"day");
 assert.equal(rain.weather,"rain");
 assert.equal(changeWeather(rain).weather,"clear");
 assert.equal(night.quest,s.quest);
 assert.equal(rain.steps,s.steps);
});
test("save schema accepts game-state only and rejects invalid or injected data",()=>{
 const s=newGame();
 assert.ok(isValidGameState(s));
 assert.equal(isValidGameState({...s,room:"bank"}),false);
 assert.equal(isValidGameState({...s,position:{x:0,y:0}}),false);
 assert.equal(isValidGameState({...s,quest:"transfer-money"}),false);
 assert.equal(isValidGameState({...s,steps:-1}),false);
 assert.equal(isValidGameState({...s,discovered:Array(30).fill("foo")}),false);
 assert.equal(isValidGameState({...s,lastMessage:"x".repeat(1000)}),false);
 assert.equal(Object.keys(QUEST_LABELS).length,5);
 assert.equal(Object.keys(ROOM_LABELS).length,4);
});
