export const MILESTONES=[0,25,50,75,100] as const;
export const WORLD_REGIONS=[
  {id:"village",name:"قرية البداية",english:"The Starting Village"},
  {id:"forest",name:"غابة الأحلام",english:"The Dream Forest"},
  {id:"valley",name:"وادي الادخار",english:"The Saving Valley"},
  {id:"bridge",name:"جسر التقدم",english:"The Progress Bridge"},
  {id:"castle",name:"قلعة الإنجاز",english:"The Achievement Castle"},
  {id:"horizon",name:"أفق المستقبل",english:"The Future Horizon"}
] as const;
export function clampProgress(value:number):number{
  if(!Number.isFinite(value))return 0;
  return Math.max(0,Math.min(100,value));
}
/** Read savings data; story never mutates financial balances. */
export function goalProgress(savedMinor:bigint,targetMinor:bigint):number{
  if(targetMinor<=0n)throw new RangeError("Target must be positive");
  if(savedMinor<=0n)return 0;
  if(savedMinor>=targetMinor)return 100;
  return Number(savedMinor*10000n/targetMinor)/100;
}
export function getJourneyState(value:number){
  const progress=clampProgress(value);
  const milestone=MILESTONES.filter(m=>m<=progress).at(-1)??0;
  const regionIndex=progress>=100?5:Math.floor(progress/20);
  return {
    progress,milestone,regionIndex,
    region:WORLD_REGIONS[regionIndex],
    finished:progress>=100,
    sunPosition:12+progress*.72
  };
}
