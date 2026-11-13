/** Public fictional records. NO credentials, accounts, cookies, storage or API. */
export type DemoType="income"|"expense";
export type DemoCategory="work"|"shopping"|"bills"|"food"|"other";
export interface DemoTransaction {id:string;title:string;detail:string;type:DemoType;category:DemoCategory;amountMinor:bigint}
export const openingMinor=15_800_000n;
export const INITIAL_TRANSACTIONS:readonly DemoTransaction[]=[
{id:"salary",title:"راتب تجريبي",detail:"دخل · مثال فقط",type:"income",category:"work",amountMinor:12_500_000n},
{id:"groceries",title:"مشتريات تجريبية",detail:"التسوق · مثال فقط",type:"expense",category:"shopping",amountMinor:1_850_000n},
{id:"bills",title:"فواتير تجريبية",detail:"الفواتير · مثال فقط",type:"expense",category:"bills",amountMinor:650_000n},
{id:"freelance",title:"دخل إضافي تجريبي",detail:"عمل · مثال فقط",type:"income",category:"work",amountMinor:3_500_000n},
{id:"coffee",title:"مقهى تجريبي",detail:"طعام · مثال فقط",type:"expense",category:"food",amountMinor:125_000n}
];
export function summarize(items:readonly DemoTransaction[]){
 let incomeMinor=0n,expenseMinor=0n;
 for(const item of items){
   if(item.amountMinor<=0n)throw new RangeError("Demo amount must be positive");
   if(item.type==="income")incomeMinor+=item.amountMinor;
   else if(item.type==="expense")expenseMinor+=item.amountMinor;
   else throw new RangeError("Unsupported transaction type");
 }
 return {incomeMinor,expenseMinor,balanceMinor:openingMinor+incomeMinor-expenseMinor};
}
export function formatDzd(value:bigint):string{
 const sign=value<0n?"−":"";const n=value<0n?-value:value;
 const whole=new Intl.NumberFormat("fr-DZ",{maximumFractionDigits:0}).format(n/100n);
 const sub=n%100n;
 return sign+whole+(sub?","+String(sub).padStart(2,"0"):"")+" دج";
}
export function readWholeDzd(value:string):bigint{
 if(!/^[1-9]\d{0,7}$/.test(value.trim()))throw new RangeError("Positive whole-DZD demo amount required");
 return BigInt(value.trim())*100n;
}
export function cumulativePoints(items:readonly DemoTransaction[]){
 let income=0n,expense=0n;
 return [{label:"0",income:0,expense:0},...[...items].reverse().map((item,index)=>{
   if(item.type==="income")income+=item.amountMinor;
   else if(item.type==="expense")expense+=item.amountMinor;
   return {label:String(index+1),income:Number(income/100n),expense:Number(expense/100n)};
 })];
}
