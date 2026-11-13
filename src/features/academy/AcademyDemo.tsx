import {useState} from "react";
import {ArrowLeft,BookOpen,CheckCircle2,GraduationCap,Lightbulb,RotateCcw,Trophy} from "lucide-react";
import {evaluatePuzzle,PUZZLES} from "./puzzles";

export function AcademyDemo(){
  const [chapter,setChapter]=useState(0);
  const [choice,setChoice]=useState<number|null>(null);
  const [checked,setChecked]=useState(false);
  const [finished,setFinished]=useState(false);
  const current=PUZZLES[chapter];
  const result=checked&&choice!==null?evaluatePuzzle(current,choice):null;
  const reset=()=>{setChapter(0);setChoice(null);setChecked(false);setFinished(false)};
  return <section className="academy-shell">
    <div className="academy-heading">
      <div><div className="academy-eyebrow"><GraduationCap size={17}/> DINARO ACADEMY</div>
        <h2>تعلّم المال خطوة بخطوة</h2>
        <p>ثلاثة دروس تفاعلية مترابطة — أموال افتراضية فقط، دون أي قرار مالي فعلي.</p></div>
      <span className="academy-demo-label">مختبر تعليمي تجريبي</span>
    </div>
    <div className="academy-steps" aria-label="تقدم الفصول">
      {PUZZLES.map((p,i)=><div key={p.id} className={"academy-step "+(i<=chapter?"active":"")}>
        <BookOpen size={17}/><span>{p.chapter}</span>
      </div>)}
    </div>
    {finished?<div className="academy-finish">
      <Trophy size={39}/><h3>أنهيت الفصل التمهيدي!</h3>
      <p>تعلّمت ترتيب الأولويات، والتخطيط المرن، وحساب تقدم الأهداف. المكافأة تعليمية تجريبية وليست رصيدًا ماليًا.</p>
      <button type="button" className="primary-btn" onClick={reset}><RotateCcw size={17}/> إعادة الدروس</button>
    </div>:<div className="academy-lesson">
      <div className="academy-lesson-header">
        <small>{current.chapter}</small><h3>{current.title}</h3><p>{current.narrative}</p>
      </div>
      <div className="academy-choices" role="group" aria-label="اختر إجابة">
        {current.choices.map((value,i)=><button type="button" key={i}
          disabled={Boolean(result?.correct)}
          className={"academy-choice "+(choice===i?"selected":"")}
          aria-pressed={choice===i}
          onClick={()=>{setChoice(i);setChecked(false)}}>{value}</button>)}
      </div>
      {result&&<div className={"academy-feedback "+(result.correct?"correct":"incorrect")} role="status">
        {result.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}
        <span>{result.feedback}</span>
      </div>}
      <div className="academy-actions">
        {!result?.correct?
          <button type="button" className="primary-btn" disabled={choice===null} onClick={()=>setChecked(true)}>تحقق من الإجابة</button>
          :<button type="button" className="primary-btn" onClick={()=>{
            if(chapter===PUZZLES.length-1){setFinished(true);return;}
            setChapter(chapter+1);setChoice(null);setChecked(false);
          }}>{chapter===PUZZLES.length-1?"إنهاء المسار":"الفصل التالي"} <ArrowLeft size={16}/></button>}
        <span>الدرس {chapter+1} من {PUZZLES.length}</span>
      </div>
    </div>}
  </section>;
}
