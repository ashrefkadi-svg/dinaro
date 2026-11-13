/**
 * Presentation-only selectors for the DINARO demo dashboard.
 * Never combine these fixtures with the authenticated manual local ledger.
 */
export type EntryKind = "income" | "expense";
export type DemoEntry = Readonly<{
  id: string;
  title: string;
  category: string;
  date: string;
  amountMinor: bigint;
  type: EntryKind;
}>;

export interface MoneySummary {
  incomeMinor: bigint;
  expenseMinor: bigint;
  netMinor: bigint;
  incomeCount: number;
  expenseCount: number;
}

export function summarizeEntries(entries: readonly DemoEntry[]): MoneySummary {
  let incomeMinor = 0n;
  let expenseMinor = 0n;
  let incomeCount = 0;
  let expenseCount = 0;
  for (const entry of entries) {
    if (entry.amountMinor <= 0n) throw new RangeError("Demo entry amount must be positive");
    if (entry.type === "income") {
      incomeMinor += entry.amountMinor;
      incomeCount++;
    } else if (entry.type === "expense") {
      expenseMinor += entry.amountMinor;
      expenseCount++;
    } else {
      throw new RangeError("Unsupported entry kind");
    }
  }
  return {incomeMinor, expenseMinor, netMinor: incomeMinor - expenseMinor, incomeCount, expenseCount};
}

export function categoryTotals(entries: readonly DemoEntry[]): {name:string;amountMinor:bigint}[] {
  const categories = new Map<string,bigint>();
  for (const entry of entries) {
    if (entry.type !== "expense") continue;
    if (entry.amountMinor <= 0n) throw new RangeError("Demo expense must be positive");
    const label = entry.category.trim() || "أخرى";
    categories.set(label, (categories.get(label) ?? 0n) + entry.amountMinor);
  }
  return [...categories].map(([name,amountMinor])=>({name,amountMinor}))
    .sort((a,b)=>a.amountMinor===b.amountMinor? a.name.localeCompare(b.name,"ar") : a.amountMinor>b.amountMinor?-1:1);
}

/**
 * Cumulative sequence by entry order, not a time-series prediction.
 * Reversing the newest-first list yields chronological order.
 */
export function cumulativeFlow(entries: readonly DemoEntry[]): {step:string;income:number;expense:number}[] {
  let income=0n,expense=0n;
  const result:[string,bigint,bigint][]=[["0",0n,0n]];
  for (const [index,entry] of [...entries].reverse().entries()) {
    if (entry.amountMinor <= 0n) throw new RangeError("Demo amount must be positive");
    if(entry.type==="income")income+=entry.amountMinor;
    else if(entry.type==="expense")expense+=entry.amountMinor;
    else throw new RangeError("Unsupported entry kind");
    result.push([String(index+1),income,expense]);
  }
  // Chart pixels may round large numbers; source balances remain exact bigint minor units.
  return result.map(([step,inc,exp])=>({step,income:Number(inc/100n),expense:Number(exp/100n)}));
}

export function spentShare(summary:MoneySummary):number|null {
  if (summary.incomeMinor<=0n) return null;
  const scaled=summary.expenseMinor*10000n/summary.incomeMinor;
  return Math.min(9999,Number(scaled)/100);
}
