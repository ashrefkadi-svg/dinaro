/** No interest, inflation, returns or implied guarantees. Pure scenario arithmetic. */
export type Horizon=3|6|12;
export type Scenario=Readonly<{
  openingCashMinor:bigint;
  monthlyIncomeMinor:bigint;
  monthlyExpenseMinor:bigint;
  monthlyGoalTransferMinor:bigint;
}>;
export type Projection=Readonly<{
  months:Horizon;
  cashMinor:bigint;
  goalMinor:bigint;
  totalMinor:bigint;
  monthlyFreeCashMinor:bigint;
  hasCashShortfall:boolean;
}>;
export function projectScenario(scenario:Scenario,months:Horizon):Projection{
  if(months!==3&&months!==6&&months!==12)throw new RangeError("Supported horizons: 3, 6, 12 months");
  for(const value of Object.values(scenario)){
    if(typeof value!=="bigint"||value<0n)throw new RangeError("Scenario inputs must be nonnegative integer minor units");
  }
  const monthlyFreeCashMinor=scenario.monthlyIncomeMinor-scenario.monthlyExpenseMinor-scenario.monthlyGoalTransferMinor;
  const cashMinor=scenario.openingCashMinor+BigInt(months)*monthlyFreeCashMinor;
  const goalMinor=BigInt(months)*scenario.monthlyGoalTransferMinor;
  return {months,cashMinor,goalMinor,totalMinor:cashMinor+goalMinor,monthlyFreeCashMinor,hasCashShortfall:cashMinor<0n};
}
