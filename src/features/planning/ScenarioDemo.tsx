import {useMemo,useState} from "react";
import {Activity,ArrowDownLeft,ArrowUpRight,Calculator,ShieldAlert,Target} from "lucide-react";
import {formatDzdMinor} from "../../domain/ledger";
import {projectScenario} from "./scenario";

export function ScenarioDemo(){
  const [income,setIncome]=useState(120000);
  const [expense,setExpense]=useState(80000);
  const [goal,setGoal]=useState(15000);
  const results=useMemo(()=>{
    const s={
      openingCashMinor:18750000n,
      monthlyIncomeMinor:BigInt(income)*100n,
      monthlyExpenseMinor:BigInt(expense)*100n,
      monthlyGoalTransferMinor:BigInt(goal)*100n
    };
    return [projectScenario(s,3),projectScenario(s,6),projectScenario(s,12)];
  },[income,expense,goal]);
  return <section className="scenario-shell">
    <div className="scenario-heading">
      <div><div className="scenario-eyebrow"><Calculator size={17}/> DINARO WHAT IF</div>
        <h2>ماذا لو تغيّرت مصاريفك؟</h2>
        <p>حرّك الأرقام لترى أثرها الافتراضي بعد 3 و6 و12 شهرًا. لا تتم أي عملية مالية.</p>
      </div>
      <span className="journey-demo-label">افتراضات ثابتة — بلا ضمانات</span>
    </div>
    <div className="scenario-controls">
      {[
        {id:"income",label:"دخل شهري افتراضي",icon:ArrowDownLeft,value:income,onChange:setIncome,max:300000},
        {id:"expense",label:"مصاريف شهرية افتراضية",icon:ArrowUpRight,value:expense,onChange:setExpense,max:300000},
        {id:"goal",label:"تحويل شهري لهدف الادخار",icon:Target,value:goal,onChange:setGoal,max:150000}
      ].map(control=>{
        const Icon=control.icon;
        return <label key={control.id} className="scenario-control">
          <span><Icon size={17}/>{control.label}</span>
          <strong>{formatDzdMinor(BigInt(control.value)*100n)}</strong>
          <input type="range" min="0" max={control.max} step="1000" value={control.value}
            onChange={e=>control.onChange(Number(e.target.value))}/>
        </label>;
      })}
    </div>
    <div className="scenario-cards">
      {results.map(result=><div className="scenario-card" key={result.months}>
        <div className="scenario-card-title"><Activity size={19}/> بعد {result.months} أشهر</div>
        <small>النقد المتاح افتراضيًا</small>
        <strong>{formatDzdMinor(result.cashMinor)}</strong>
        <div className="scenario-card-row"><span>المبلغ المُحوّل للهدف</span><b>{formatDzdMinor(result.goalMinor)}</b></div>
        <div className="scenario-card-row"><span>المجموع (نقد + هدف)</span><b>{formatDzdMinor(result.totalMinor)}</b></div>
        {result.hasCashShortfall&&<div className="scenario-warning"><ShieldAlert size={16}/> عجز نقدي محتمل في هذا السيناريو</div>}
      </div>)}
    </div>
    <p className="journey-disclaimer">الافتراضات: رصيد افتتاحي افتراضي 187,500 دج، دخل ومصاريف وتحويل ثابتة كل شهر، دون فوائد أو تضخم أو تقلبات أو اقتطاعات أخرى. التحويل للهدف ليس مصروفًا، بل نقل بين النقد والمدخرات. النتائج تعليمية فقط.</p>
  </section>;
}
