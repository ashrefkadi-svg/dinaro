import {useEffect,useMemo,useState} from "react";
import type {CSSProperties,FormEvent,ReactNode} from "react";
import {
  ArrowDownLeft,ArrowLeft,ArrowUpRight,Bell,BookOpen,
  ChartNoAxesCombined,Check,ChevronLeft,Compass,Eye,EyeOff,
  GraduationCap,House,Moon,Plus,ShieldCheck,Sparkles,Sun,
  Target,Wallet,X,SlidersHorizontal,CircleHelp,
  CheckCircle2,Lightbulb,TrendingUp,LockKeyhole
} from "lucide-react";
import {INITIAL_TRANSACTIONS,formatDzd,readWholeDzd,summarize,cumulativePoints} from "./data";
import type {DemoTransaction,DemoType} from "./data";

type Tab="home"|"analytics"|"goals"|"academy"|"profile";
const mark=import.meta.env.BASE_URL+"brand/dinaro-mark.svg";
const icon=import.meta.env.BASE_URL+"brand/dinaro-app-icon.svg";
const nav=[
  {id:"home",label:"الرئيسية",Icon:House},
  {id:"analytics",label:"التحليلات",Icon:ChartNoAxesCombined},
  {id:"goals",label:"الأهداف",Icon:Target},
  {id:"academy",label:"الأكاديمية",Icon:GraduationCap}
] as const;
const questions=[
 {title:"الأولويات قبل الشراء",body:"لديك 10,000 دج افتراضية وفاتورة ضرورية بـ 4,000 دج. ما الخطوة الأفضل؟",
  options:["نشتري الكماليات أولًا","نخصّص قيمة الفاتورة","نقترض مبلغًا إضافيًا"],answer:1,
  tip:"تخصيص المصاريف الضرورية أولًا يساعد على تجنب العجز."},
 {title:"حساب التقدم",body:"ادخرت 2,500 دج من هدف افتراضي قدره 10,000 دج. ما نسبة التقدم؟",
  options:["25%","40%","75%"],answer:0,tip:"2,500 ÷ 10,000 = 25%. خطوة صغيرة لكنها تقدم حقيقي."}
];

function Brand(){return <div className="m-brand"><img src={mark} width={34} height={34} alt=""/>
  <span dir="ltr">DINARO<b>+</b></span></div>;}
function Money({value,hidden=false}:{value:bigint;hidden?:boolean}){
  return <span className="m-money" dir="ltr">{hidden?"••••••":formatDzd(value)}</span>;
}
function Panel({children,className=""}:{children:ReactNode;className?:string}){
  return <section className={"m-panel "+className}>{children}</section>;
}
function Heading({title,description,action,onClick}:{
  title:string;description?:string;action?:string;onClick?:()=>void;
}){return <div className="m-heading"><div><h2>{title}</h2>{description&&<p>{description}</p>}</div>
  {action&&onClick&&<button type="button" onClick={onClick}>{action}<ChevronLeft size={15}/></button>}
</div>;}
function Transactions({items,hidden}:{items:readonly DemoTransaction[];hidden:boolean}){
  return <div className="m-tx-list">{items.length===0?<p className="m-muted">ما كاين حتى معاملة.</p>:
    items.map(t=><div className="m-tx" key={t.id}>
      <span className={"m-tx-icon "+t.type}>{t.type==="income"?<ArrowDownLeft size={20}/>:<ArrowUpRight size={20}/>}</span>
      <span className="m-tx-name"><strong>{t.title}</strong><small>{t.detail}</small></span>
      <b className={t.type}><Money value={t.type==="expense"?-t.amountMinor:t.amountMinor} hidden={hidden}/></b>
    </div>)}</div>;
}
function Home({items,hidden,onToggle,go,add}:{
  items:readonly DemoTransaction[];hidden:boolean;onToggle:()=>void;
  go:(tab:Tab)=>void;add:()=>void;
}){
  const total=summarize(items);
  return <div className="m-page m-enter">
    <div className="m-intro"><span>مرحبًا بك في دينارو ✦</span><h1>أموالك، برؤية أوضح.</h1>
      <p>مستقبلك يبدأ بخطوة، وبهدوء.</p></div>
    <section className="m-balance">
      <div className="m-balance-rings"/>
      <div className="m-balance-head"><span><Wallet size={17}/> الرصيد التجريبي</span>
        <button type="button" aria-label={hidden?"إظهار المبالغ":"إخفاء المبالغ"} aria-pressed={hidden} onClick={onToggle}>
          {hidden?<Eye size={19}/>:<EyeOff size={19}/>}</button></div>
      <strong><Money value={total.balanceMinor} hidden={hidden}/></strong>
      <div className="m-balance-label"><ShieldCheck size={15}/> أرقام خيالية غير مرتبطة ببنك</div>
      <div className="m-balance-bottom"><span dir="ltr">DINARO+ <small>FINANCE STUDIO</small></span><Sparkles size={21}/></div>
    </section>
    <Heading title="عمليات سريعة"/>
    <div className="m-actions">
      {([
        {id:"analytics",label:"تحليلات",Icon:ChartNoAxesCombined},
        {id:"goals",label:"أهدافي",Icon:Target},
        {id:"academy",label:"تعلّم",Icon:BookOpen},
        {id:"profile",label:"التفضيلات",Icon:SlidersHorizontal}
      ] as const).map(a=><button type="button" key={a.id} onClick={()=>go(a.id)}>
        <span><a.Icon size={22}/></span><small>{a.label}</small></button>)}
    </div>
    <Heading title="ملخص الأموال" description="محسوب من عمليات العرض"/>
    <div className="m-stat-grid">
      <Panel className="m-stat"><span><ArrowDownLeft size={19}/> الدخل التجريبي</span>
        <strong><Money value={total.incomeMinor} hidden={hidden}/></strong><small><TrendingUp size={14}/> دخل من سجل العرض</small></Panel>
      <Panel className="m-stat"><span><ArrowUpRight size={19}/> المصاريف التجريبية</span>
        <strong><Money value={total.expenseMinor} hidden={hidden}/></strong><small>مصروفات نموذجية</small></Panel>
    </div>
    <Heading title="رحلة الهدف" action="استكشف" onClick={()=>go("goals")}/>
    <button type="button" className="m-goal-banner" onClick={()=>go("goals")}>
      <span className="m-goal-picture" aria-hidden="true">✦</span>
      <span className="m-goal-detail"><strong>حلم جديد ينتظرك</strong><small>هدف افتراضي</small>
        <span className="m-track"><i style={{width:"62.5%"}}/></span><em>62.5% تقدّم</em></span>
      <ChevronLeft size={20}/>
    </button>
    <section className="m-recent">
      <Heading title="آخر المعاملات" action="عرض التحليلات" onClick={()=>go("analytics")}/>
      <Transactions items={items.slice(0,4)} hidden={hidden}/>
      <button type="button" onClick={add} className="m-recent-add"><Plus size={16}/> أضف معاملة للعرض</button>
    </section>
    <div className="m-foot-tip"><Sparkles size={18}/> التعلم والادخار بدون ضغوط ولا عقوبات.</div>
  </div>;
}
function line(values:number[]){
 if(values.length<2)return "";
 const max=Math.max(1,...values)*1.18;
 return values.map((n,i)=>(i?"L":"M")+(10+(i/(values.length-1))*300).toFixed(1)+" "+(160-(n/max)*135).toFixed(1)).join(" ");
}
function Analytics({items,hidden}:{items:readonly DemoTransaction[];hidden:boolean}){
  const [mode,setMode]=useState<"all"|"income"|"expense">("all");
  const totals=summarize(items),series=cumulativePoints(items);
  const categories=new Map<string,bigint>();
  for(const t of items)if(t.type==="expense"){const cat=t.detail.split(" · ")[0];
    categories.set(cat,(categories.get(cat)??0n)+t.amountMinor);}
  return <div className="m-page m-enter">
    <div className="m-intro"><span>DINARO ANALYTICS</span><h1>التحليلات المالية</h1>
      <p>أرقام تجريبية محسوبة من سجلك الحالي، وليست توقعات.</p></div>
    <div className="m-filter-tabs" role="group" aria-label="نوع التحليل">
      {([["all","الكل"],["income","الدخل"],["expense","المصاريف"]] as const).map(([id,label])=>
        <button type="button" key={id} className={mode===id?"active":""} aria-pressed={mode===id} onClick={()=>setMode(id)}>{label}</button>)}
    </div>
    <Panel className="m-highlight"><span>إجمالي {mode==="all"?"الرصيد":mode==="income"?"الدخل":"المصاريف"} التجريبي</span>
      <strong><Money hidden={hidden} value={mode==="all"?totals.balanceMinor:mode==="income"?totals.incomeMinor:totals.expenseMinor}/></strong>
      <small>بيانات عرض فقط، لا اتصال مالي حقيقي</small></Panel>
    <Panel className="m-chart-panel"><Heading title="تراكم المعاملات" description="حسب ترتيب السجل وليس حسب الشهر"/>
      <div className="m-chart-legend"><span><i className="emerald"/> دخل</span><span><i className="ice"/> مصاريف</span></div>
      <svg className="m-chart" viewBox="0 0 320 170" role="img" aria-label="رسم تجريبي لتراكم الدخل والمصاريف">
        {[35,75,115,155].map(y=><line key={y} x1="10" x2="310" y1={y} y2={y} stroke="currentColor" opacity=".12" strokeDasharray="3 5"/>)}
        {mode!=="expense"&&<path d={line(series.map(p=>p.income))} fill="none" stroke="#30d4a2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>}
        {mode!=="income"&&<path d={line(series.map(p=>p.expense))} fill="none" stroke="#9ed8f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
      </svg>
      <p>يمكنك إظهار الدخل أو المصاريف من الأزرار الموجودة فوق.</p></Panel>
    <Heading title="أين ذهبت المصاريف؟"/>
    <Panel className="m-categories">{[...categories].map(([name,value])=><div className="m-category" key={name}>
      <div><span>{name}</span><strong>{hidden?"••••":formatDzd(value)}</strong></div>
      <div className="m-track"><i style={{width:Number(value*100n/(totals.expenseMinor||1n))+"%"}}/></div>
    </div>)}{categories.size===0&&<p>لا يوجد مصاريف بعد.</p>}</Panel>
    <Heading title="معاملات هذه الجلسة"/>
    <Panel><Transactions items={items} hidden={hidden}/></Panel>
  </div>;
}
function Goals(){
  const [progress,setProgress]=useState(62.5);
  const phase=progress>=100?"أفق المستقبل":progress>=75?"قلعة الإنجاز":progress>=50?"جسر التقدم":progress>=25?"وادي الادخار":"قرية البداية";
  return <div className="m-page m-enter"><div className="m-intro"><span>THE WORLD OF DINARO</span>
    <h1>رحلة أهدافك</h1><p>عالم Pixel Art اختياري مرتبط بالتقدم التخيلي هنا.</p></div>
    <Panel className="m-goal-page"><div className="m-goal-page-title"><span><Target size={19}/> حلم جديد</span><b>{progress.toFixed(1)}%</b></div>
      <div className="m-pixel" role="img" aria-label={"مشهد القصة: "+phase}>
        <span className="m-pixel-sun"/><i className="m-pixel-hills"/><i className="m-pixel-ground"/>
        <span className="m-pixel-tree"/><span className="m-pixel-house"/>
        <span className="m-pixel-hero" style={{insetInlineStart:String(Math.min(83,9+progress*.7))+"%"}}/>
        <b>{phase}</b></div>
      <div className="m-goal-progress"><span>تقدم هدف افتراضي</span><strong>{progress.toFixed(1)}%</strong></div>
      <span className="m-track"><i style={{width:progress+"%"}}/></span>
      <label htmlFor="m-goal-slider">جرّب تحريك الشخصية</label>
      <input id="m-goal-slider" type="range" min="0" max="100" step="5" value={progress} onChange={e=>setProgress(Number(e.target.value))}/>
      <div className="m-steps">{[0,25,50,75,100].map(v=><button type="button" className={progress>=v?"active":""} key={v} onClick={()=>setProgress(v)}>{v}%</button>)}</div>
    </Panel>
    <div className="m-stat-grid"><Panel className="m-goal-small"><Compass size={21}/><strong>6 مناطق</strong><span>عالم متطور</span></Panel>
      <Panel className="m-goal-small"><ShieldCheck size={21}/><strong>بدون عقوبات</strong><span>تقدم بالوتيرة التي تناسبك</span></Panel></div>
    <div className="m-foot-tip"><CircleHelp size={19}/> محاكاة مستقلة لا تغيّر الرصيد ولا تنفذ معاملات مالية.</div>
  </div>;
}
function Academy(){
  const [index,setIndex]=useState(0),[answer,setAnswer]=useState<number|null>(null),[checked,setChecked]=useState(false);
  const q=questions[index],correct=answer===q.answer;
  return <div className="m-page m-enter"><div className="m-intro"><span>DINARO ACADEMY</span>
    <h1>تعلّم المال ببساطة</h1><p>دروس قصيرة ومتصلة، دون أي أموال حقيقية.</p></div>
    <div className="m-lesson-bar"><span>الفصل {index+1} من {questions.length}</span><span>تجربة تعليمية</span></div>
    <div className="m-track"><i style={{width:((index+1)/questions.length)*100+"%"}}/></div>
    <Panel className="m-lesson"><span className="m-lesson-icon"><BookOpen size={24}/></span><small>الدرس {index+1}</small>
      <h2>{q.title}</h2><p>{q.body}</p>
      <div className="m-answers">{q.options.map((option,i)=><button type="button" key={i}
        disabled={checked&&correct} aria-pressed={answer===i}
        className={(answer===i?"selected ":"")+(checked&&i===q.answer?"correct":"")}
        onClick={()=>{setAnswer(i);setChecked(false);}}>{option}</button>)}</div>
      {checked&&<div className={"m-feedback "+(correct?"good":"retry")} role="status">
        {correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>} {q.tip}</div>}
      {checked&&correct?<button type="button" className="m-primary" onClick={()=>{
        setIndex((index+1)%questions.length);setAnswer(null);setChecked(false);
      }}>{index===questions.length-1?"إعادة الدروس":"الدرس التالي"} <ArrowLeft size={17}/></button>:
      <button type="button" className="m-primary" disabled={answer===null} onClick={()=>setChecked(true)}>تحقق من الإجابة <Check size={17}/></button>}
    </Panel><div className="m-foot-tip"><GraduationCap size={18}/> الخطأ فرصة للتعلم، بلا عقوبات أو ضغط.</div>
  </div>;
}
function Profile({light,setLight,glass,setGlass,privacy,onPrivacy}:{
 light:boolean;setLight:(v:boolean)=>void;glass:number;setGlass:(n:number)=>void;privacy:boolean;onPrivacy:()=>void;
}){
  return <div className="m-page m-enter"><div className="m-intro"><span>PERSONAL STUDIO</span>
    <h1>تفضيلاتك</h1><p>غيّر مظهر معاينة DINARO+ بالطريقة اللي تحبها.</p></div>
    <div className="m-profile"><img src={icon} alt="شعار DINARO+" width={76} height={76}/><div><h2>DINARO+ Member</h2>
      <p>وضع العرض العام</p><span><ShieldCheck size={14}/> لا بيانات شخصية متصلة</span></div></div>
    <Heading title="إعدادات التصميم"/>
    <Panel className="m-settings">
      <div className="m-setting"><span><Moon size={20}/> ألوان الواجهة</span>
        <div className="m-color-options"><button type="button" className={!light?"active":""} aria-pressed={!light} onClick={()=>setLight(false)}><Moon size={15}/> داكن</button>
          <button type="button" className={light?"active":""} aria-pressed={light} onClick={()=>setLight(true)}><Sun size={15}/> فاتح</button></div></div>
      <div className="m-setting"><span><EyeOff size={19}/> إخفاء الأرقام</span>
        <button type="button" className="m-toggle" aria-label="تبديل إخفاء الأرصدة" aria-pressed={privacy} onClick={onPrivacy}><i/></button></div>
      <label className="m-setting-slider" htmlFor="m-glass"><SlidersHorizontal size={20}/> قوة الزجاجية <b>{glass}%</b></label>
      <input id="m-glass" type="range" min="0" max="100" step="10" value={glass} onChange={e=>setGlass(Number(e.target.value))}/>
    </Panel>
    <Heading title="خصوصية المعاينة"/><Panel className="m-privacy-note"><LockKeyhole size={21}/>
      <span>لا تحتاج حسابًا، ولا توجد بيانات بنكية أو خادم معاملات في هذه النسخة.</span></Panel>
    <p className="m-copyright">DINARO+ Mobile 2.0 · Design Preview</p>
  </div>;
}
function DemoForm({close,add}:{close:()=>void;add:(type:DemoType,minor:bigint,title:string)=>void}){
  const [type,setType]=useState<DemoType>("expense"),[title,setTitle]=useState(""),[amount,setAmount]=useState(""),[error,setError]=useState("");
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")close();};
    window.addEventListener("keydown",onKey);return ()=>window.removeEventListener("keydown",onKey);},[close]);
  function submit(e:FormEvent){e.preventDefault();
    try{if(title.trim().length<2)throw new RangeError("Title too short");add(type,readWholeDzd(amount),title.trim());}
    catch{setError("أدخل وصفًا ومبلغًا موجبًا بالدينار الجزائري.");}}
  return <div className="m-sheet-scrim" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
    <section className="m-sheet" role="dialog" aria-modal="true" aria-label="إضافة معاملة عرض">
      <div className="m-sheet-grip"/><div className="m-sheet-title"><h2>إضافة معاملة تجريبية</h2>
      <button type="button" aria-label="إغلاق" onClick={close}><X size={21}/></button></div>
      <p><ShieldCheck size={16}/> لا تُحفظ أي أموال أو بيانات بعد إغلاق الصفحة.</p>
      <form onSubmit={submit}><div className="m-type-options">
        <button type="button" className={type==="expense"?"active":""} onClick={()=>setType("expense")}>مصروف</button>
        <button type="button" className={type==="income"?"active":""} onClick={()=>setType("income")}>دخل</button>
      </div>
      <label htmlFor="m-entry-title">الوصف</label><input id="m-entry-title" value={title} maxLength={70}
        onChange={e=>setTitle(e.target.value)} placeholder="مثال: مشتريات للتجربة" required/>
      <label htmlFor="m-entry-amount">المبلغ (دج)</label><input id="m-entry-amount" inputMode="numeric"
        value={amount} onChange={e=>setAmount(e.target.value)} placeholder="مثال: 2500" required/>
      {error&&<div role="alert" className="m-error">{error}</div>}
      <button type="submit" className="m-primary"><Plus size={18}/> إضافة للعرض فقط</button>
      </form>
    </section></div>;
}
function Splash({skip}:{skip:()=>void}){
  return <div className="m-splash" role="dialog" aria-modal="true" aria-label="ترحيب DINARO+">
    <button type="button" className="m-skip" onClick={skip}>تخطي <ArrowLeft size={15}/></button>
    <div className="m-splash-middle"><img src={icon} alt="شعار DINARO+" width={122} height={122}/>
      <strong dir="ltr">DINARO<span>+</span></strong><p>أموالك. مستقبلك.</p>
      <div className="m-loader"><i/></div><small>MOBILE 2.0 · DESIGN PREVIEW</small>
    </div><div className="m-splash-note">بيانات خيالية · بدون حساب أو اتصال بنكي</div>
  </div>;
}
export default function MobilePreview(){
  const [splash,setSplash]=useState(true),[tab,setTab]=useState<Tab>("home");
  const [items,setItems]=useState<DemoTransaction[]>([...INITIAL_TRANSACTIONS]);
  const [hidden,setHidden]=useState(false),[light,setLight]=useState(false),[glass,setGlass]=useState(40);
  const [sheet,setSheet]=useState(false),[notice,setNotice]=useState("");
  useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setSplash(false);return;}
    const id=window.setTimeout(()=>setSplash(false),1800);return ()=>window.clearTimeout(id);},[]);
  const totals=useMemo(()=>summarize(items),[items]);
  function go(next:Tab){setTab(next);window.scrollTo(0,0);}
  function add(type:DemoType,minor:bigint,title:string){
    setItems(old=>[{id:"demo-"+Date.now()+"-"+old.length,title,detail:"عملية مضافة للعرض فقط",type,category:"other",amountMinor:minor},...old]);
    setSheet(false);setNotice("تغيّرت أرقام المعاينة فقط. لم تتم أي عملية مالية.");
  }
  const style={"--m-glass-blur":Math.round(glass*.17)+"px","--m-glass-alpha":String((1-glass*.002).toFixed(2))} as CSSProperties;
  return <div className={"m-shell"+(light?" m-light":"")} style={style}><div className="m-frame">
    <header className="m-header"><Brand/><div><span className="m-demo-dot">DEMO</span>
      <button className="m-notification" type="button" aria-label="الإشعارات التجريبية"
        onClick={()=>setNotice("لا توجد إشعارات بنكية؛ هذه معاينة تصميم فقط.")}><Bell size={19}/></button></div></header>
    <div className="m-disclaimer"><CircleHelp size={16}/> بيانات خيالية فقط — لا حساب ولا أموال حقيقية.</div>
    <main>
      {tab==="home"&&<Home items={items} hidden={hidden} onToggle={()=>setHidden(x=>!x)} go={go} add={()=>setSheet(true)}/>}
      {tab==="analytics"&&<Analytics items={items} hidden={hidden}/>}
      {tab==="goals"&&<Goals/>}{tab==="academy"&&<Academy/>}
      {tab==="profile"&&<Profile light={light} setLight={setLight} glass={glass} setGlass={setGlass}
        privacy={hidden} onPrivacy={()=>setHidden(x=>!x)}/>}
    </main>
    <nav className="m-nav" aria-label="التنقل في تطبيق DINARO">
      {nav.slice(0,2).map(n=><button key={n.id} type="button" className={tab===n.id?"active":""}
        aria-current={tab===n.id?"page":undefined} onClick={()=>go(n.id)}><n.Icon size={21}/><span>{n.label}</span></button>)}
      <button type="button" className="m-nav-add" aria-label="إضافة معاملة خيالية" onClick={()=>setSheet(true)}><Plus size={27}/></button>
      {nav.slice(2).map(n=><button key={n.id} type="button" className={tab===n.id?"active":""}
        aria-current={tab===n.id?"page":undefined} onClick={()=>go(n.id)}><n.Icon size={21}/><span>{n.label}</span></button>)}
    </nav>
    {notice&&<div className="m-toast" role="status">{notice}
      <button type="button" aria-label="إغلاق الإشعار" onClick={()=>setNotice("")}><X size={16}/></button></div>}
    {sheet&&<DemoForm close={()=>setSheet(false)} add={add}/>}
    {splash&&<Splash skip={()=>setSplash(false)}/>}
  </div></div>;
}
