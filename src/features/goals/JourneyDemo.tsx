import {useState} from "react";
import {Castle, Check, Compass, Flag, Leaf, Mountain, Sunrise, Trees} from "lucide-react";
import {clampProgress,getJourneyState,goalProgress,WORLD_REGIONS} from "./journey";
const demoProgress=goalProgress(12500000n,20000000n);
const icons=[Sunrise,Trees,Leaf,Flag,Castle,Compass];

export function JourneyDemo(){
  const [progress,setProgress]=useState(demoProgress);
  const current=getJourneyState(progress);
  return <section className="journey-shell">
    <div className="journey-header">
      <div>
        <div className="journey-eyebrow"><Mountain size={16}/> THE WORLD OF DINARO</div>
        <h2>رحلتك في عالم دينارو</h2>
        <p>تجربة قصصية اختيارية مرتبطة بتقدم الهدف. هذا المشهد يستخدم بيانات افتراضية فقط.</p>
      </div>
      <span className="journey-demo-label">محاكاة — لا تحرّك أموالًا</span>
    </div>
    <div className="journey-stage" role="img" aria-label={"مشهد افتراضي: "+current.region.name}>
      <div className="journey-sun" style={{top:(100-current.sunPosition)+"%"}}/>
      <div className="journey-cloud journey-cloud-one"/>
      <div className="journey-cloud journey-cloud-two"/>
      <div className="journey-hills"/>
      <div className="journey-ground"/>
      <div className="journey-tree one"><i/><b/></div>
      <div className="journey-tree two"><i/><b/></div>
      <div className="journey-pixel-person" style={{left:String(Math.min(88,8+progress*.8))+"%"}}>
        <i className="journey-pixel-head"/>
        <i className="journey-pixel-body"/>
        <i className="journey-pixel-feet"/>
      </div>
      <div className="journey-caption"><strong>{current.region.name}</strong><small>{current.region.english}</small></div>
    </div>
    <div className="journey-progress-head">
      <span>نسبة التقدم الافتراضية</span>
      <strong>{progress.toFixed(1)}%</strong>
    </div>
    <input aria-label="محاكاة نسبة تقدم الهدف" type="range" min="0" max="100" step="5"
      value={progress} onChange={e=>setProgress(clampProgress(Number(e.target.value)))}/>
    <div className="journey-region-grid">
      {WORLD_REGIONS.map((region,index)=>{
        const Icon=icons[index];
        return <button key={region.id} type="button"
          className={"journey-region "+(index===current.regionIndex?"active":"")}
          onClick={()=>setProgress(index===5?100:index*20)}>
          <Icon size={19} aria-hidden="true"/>
          <span>{region.name}</span>
          {index<current.regionIndex&&<Check size={14} aria-label="منطقة تمت زيارتها"/>}
        </button>;
      })}
    </div>
    <p className="journey-disclaimer">
      عند ربط العالم لاحقًا بهدف حقيقي، ستُحسب النسبة من المبلغ المدخر والهدف فقط. القصة لا تغير المعاملات ولا تعاقب المستخدم إذا توقف عن الادخار أو سحب أمواله.
    </p>
  </section>;
}
