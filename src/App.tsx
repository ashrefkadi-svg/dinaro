import {useMemo,useState} from "react";
import type {FormEvent} from "react";
import {AnimatePresence,motion} from "motion/react";
import {
  ArrowDownLeft,ArrowLeftRight,ArrowUpRight,Bell,BookOpen,Calculator,
  ChevronLeft,CircleHelp,Database,Ellipsis,Gamepad2,GraduationCap,Home,
  LayoutGrid,Menu,Plus,Search,ShieldCheck,Target,Wallet,X
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {buildOpeningEntry,buildTransactionEntry,formatDzdMinor,ledgerBalance,parseDzdMinor} from "./domain/ledger";
import {AcademyDemo} from "./features/academy/AcademyDemo";
import {JourneyDemo} from "./features/goals/JourneyDemo";
import {ScenarioDemo} from "./features/planning/ScenarioDemo";
import {LocalWallet} from "./features/wallet/LocalWallet";
import {BrandMark} from "./ui/brand/BrandMark";
import {GlassCard,PremiumDashboard,PremiumMobileNav} from "./ui/premium/PremiumDashboard";
import type {MainSection} from "./ui/premium/PremiumDashboard";
import {categoryTotals,summarizeEntries} from "./ui/premium/selectors";
import type {DemoEntry} from "./ui/premium/selectors";

const nav:readonly {name:MainSection;icon:LucideIcon;group:"core"|"experience"}[]=[
  {name:"الرئيسية",icon:Home,group:"core"},
  {name:"المعاملات",icon:ArrowLeftRight,group:"core"},
  {name:"الحسابات",icon:Wallet,group:"core"},
  {name:"الميزانية",icon:LayoutGrid,group:"core"},
  {name:"الأهداف",icon:Target,group:"core"},
  {name:"دفتر محلي",icon:Database,group:"core"},
  {name:"الأكاديمية",icon:GraduationCap,group:"experience"},
  {name:"عالم دينارو",icon:Gamepad2,group:"experience"},
  {name:"المحاكاة",icon:Calculator,group:"experience"}
] as const;

/** Fictional demonstration entries. Never mixed with the authenticated local backend. */
const initialTransactions:DemoEntry[]=[
  {id:"demo-income-1",title:"دخل تجريبي",category:"العمل",date:"معاملة عرض",amountMinor:8_500_000n,type:"income"},
  {id:"demo-expense-1",title:"مشتريات تجريبية",category:"التسوق",date:"معاملة عرض",amountMinor:425_000n,type:"expense"},
  {id:"demo-expense-2",title:"فاتورة تجريبية",category:"الفواتير",date:"معاملة عرض",amountMinor:620_000n,type:"expense"},
  {id:"demo-income-2",title:"دخل إضافي تجريبي",category:"العمل",date:"معاملة عرض",amountMinor:1_200_000n,type:"income"}
];

type EntryForm={title:string;amount:string;type:"income"|"expense"};
const emptyEntry:EntryForm={title:"",amount:"",type:"expense"};

export default function App(){
  const [section,setSection]=useState<MainSection>("الرئيسية");
  const [compact,setCompact]=useState(false);
  const [mobileMenu,setMobileMenu]=useState(false);
  const [balanceVisible,setBalanceVisible]=useState(true);
  const [transactions,setTransactions]=useState<DemoEntry[]>(initialTransactions);
  const [search,setSearch]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState<EntryForm>(emptyEntry);
  const [toast,setToast]=useState("");
  const balanceMinor=useMemo(()=>ledgerBalance([
    buildOpeningEntry("demo-opening","demo:wallet",18_750_000n),
    ...transactions.map(entry=>buildTransactionEntry({
      id:entry.id,accountId:"demo:wallet",type:entry.type,amountMinor:entry.amountMinor
    }))
  ],"demo:wallet"),[transactions]);
  const filtered=useMemo(()=>{
    const query=search.trim().toLocaleLowerCase("ar");
    return transactions.filter(entry=>(entry.title+" "+entry.category).toLocaleLowerCase("ar").includes(query));
  },[transactions,search]);

  function notify(message:string){
    setToast(message);
    window.setTimeout(()=>setToast(""),3200);
  }
  function navigate(target:MainSection){
    setSection(target);setMobileMenu(false);
  }
  function openMenu(){
    if(window.matchMedia("(max-width: 900px)").matches)setMobileMenu(true);
    else setCompact(current=>!current);
  }
  function addEntry(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const title=form.title.trim();
    if(!title||title.length>80){notify("اسم المعاملة يجب أن يكون بين 1 و80 حرفًا.");return;}
    let amountMinor:bigint;
    try{
      amountMinor=parseDzdMinor(form.amount);
      if(amountMinor>9_000_000_000_000n)throw new RangeError("Value exceeds demo limit");
    }catch{
      notify("أدخل مبلغًا موجبًا وصحيحًا (حتى منزلتين عشريتين).");
      return;
    }
    const record:DemoEntry={
      id:crypto.randomUUID(),title,amountMinor,type:form.type,
      category:form.type==="income"?"دخل تجريبي":"مصروف تجريبي",
      date:new Date().toLocaleDateString("ar-DZ")
    };
    setTransactions(previous=>[record,...previous]);
    setForm(emptyEntry);
    setShowAdd(false);
    notify("تمت إضافة المعاملة إلى جلسة العرض فقط. لن تُحفظ بعد تحديث الصفحة.");
  }

  const navButton=(item:{name:MainSection;icon:LucideIcon})=>{
    const Icon=item.icon;
    const active=section===item.name;
    return <button type="button" key={item.name}
      className={"nav-item"+(active?" active":"")}
      title={compact?item.name:undefined}
      aria-current={active?"page":undefined}
      aria-label={compact?item.name:undefined}
      onClick={()=>navigate(item.name)}>
      <Icon size={20} strokeWidth={1.8} aria-hidden="true"/>
      <span>{item.name}</span>
      {item.name==="المعاملات"&&<small className="nav-count">{transactions.length}</small>}
    </button>;
  };

  return <div className={"app-shell"+(compact?" p-compact":"")}>
    <aside className={"sidebar"+(mobileMenu?" sidebar-open":"")} aria-label="القائمة الجانبية">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true"><BrandMark/></div>
        <div><b>DINARO<span>+</span></b><small>YOUR MONEY. YOUR FUTURE.</small></div>
        <button className="icon-btn mobile-close" type="button" aria-label="إغلاق القائمة"
          onClick={()=>setMobileMenu(false)}><X size={20}/></button>
      </div>
      <div className="workspace">
        <div className="workspace-avatar" aria-hidden="true">D</div>
        <div><b>مساحة DINARO</b><small>إدارة تجريبية وشخصية</small></div>
        <ShieldCheck size={16}/>
      </div>
      <div className="nav-caption">إدارة الأموال</div>
      <nav className="side-nav" aria-label="صفحات إدارة الأموال">
        {nav.filter(item=>item.group==="core").map(navButton)}
      </nav>
      <div className="nav-caption tools-caption">التعلم والاستكشاف</div>
      <nav className="side-nav" aria-label="الأكاديمية والمحاكاة">
        {nav.filter(item=>item.group==="experience").map(navButton)}
      </nav>
      <div className="sidebar-spacer"/>
      <div className="upgrade-card">
        <div className="upgrade-icon"><BookOpen size={19}/></div>
        <b>ابدأ رحلتك المالية</b>
        <p>دروس وأهداف ومحاكاة للتعلم دون استخدام أموال حقيقية.</p>
        <button type="button" onClick={()=>navigate("الأكاديمية")}>استكشف الأكاديمية <ChevronLeft size={15}/></button>
      </div>
      <div className="sidebar-profile">
        <div className="profile-avatar">D+</div>
        <div><b>DINARO+ Studio</b><small>نسخة تطويرية</small></div>
        <Ellipsis size={18} aria-hidden="true"/>
      </div>
    </aside>

    {mobileMenu&&<button type="button" className="mobile-scrim" aria-label="إغلاق القائمة الجانبية" onClick={()=>setMobileMenu(false)}/>}

    <main className="main-area">
      <header className="topbar">
        <div className="topbar-start">
          <button type="button" className="icon-btn menu-toggle" onClick={openMenu}
            aria-label={mobileMenu?"القائمة":compact?"توسيع القائمة الجانبية":"طي القائمة الجانبية"}
            aria-expanded={mobileMenu||!compact}><Menu size={21}/></button>
          <div className="p-header-brand" aria-label="DINARO+"><BrandMark/><span>DINARO<b>+</b></span></div>
          <div className="breadcrumb">DINARO+ <ChevronLeft size={14}/> <b>{section}</b></div>
        </div>
        <div className="topbar-actions">
          <label className="search-box">
            <Search size={18} aria-hidden="true"/>
            <input type="search" value={search}
              onChange={event=>{setSearch(event.target.value);if(event.target.value)navigate("المعاملات");}}
              aria-label="بحث في معاملات جلسة العرض" placeholder="ابحث في معاملات العرض..."/>
          </label>
          <button type="button" className="icon-btn p-mobile-search-trigger" aria-label="البحث عن المعاملات"
            onClick={()=>navigate("المعاملات")}><Search size={19}/></button>
          <button type="button" className="icon-btn notification-btn" aria-label="الإشعارات"
            onClick={()=>notify("لا توجد إشعارات فعليّة في هذه النسخة التجريبية.")}><Bell size={19}/></button>
          <div className="top-avatar" aria-label="مساحة تطوير DINARO">D+</div>
        </div>
      </header>

      <div className="page-content">
        {section!=="دفتر محلي"&&<div className="ds-demo-notice" role="note">
          <CircleHelp size={17} aria-hidden="true"/>
          <span><strong>بيانات توضيحية</strong> — لوحة التحكم والميزانية والأهداف الحالية تستخدم أمثلة فقط. أي معاملة هنا مؤقتة ولا تُحفظ. صفحة «دفتر محلي» منفصلة عنها تمامًا.</span>
        </div>}
        {section==="الرئيسية"?
          <PremiumDashboard transactions={transactions} balanceMinor={balanceMinor}
            balanceVisible={balanceVisible} onToggleBalance={()=>setBalanceVisible(v=>!v)}
            onAdd={()=>setShowAdd(true)} onNavigate={navigate}/>
        :section==="الأكاديمية"?<AcademyDemo/>
        :section==="عالم دينارو"?<JourneyDemo/>
        :section==="المحاكاة"?<ScenarioDemo/>
        :section==="دفتر محلي"?<LocalWallet/>
        :<SectionView section={section} transactions={filtered} balanceMinor={balanceMinor}
          search={search} onSearch={setSearch} onAdd={()=>setShowAdd(true)} onNavigate={navigate}/>}
        <footer className="footer p-footer">
          <span>© 2026 DINARO+ — أموالك. مستقبلك.</span>
          <span><ShieldCheck size={14}/> الخصوصية بالتصميم</span>
          <span>نسخة تجريبية غير بنكية</span>
        </footer>
      </div>
    </main>

    <PremiumMobileNav active={section} onNavigate={navigate} onAdd={()=>setShowAdd(true)}/>

    <AnimatePresence>
      {showAdd&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}}
        exit={{opacity:0}} onClick={()=>setShowAdd(false)}>
        <motion.form className="add-modal p-add-modal" aria-label="إضافة معاملة عرض"
          initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}}
          onSubmit={addEntry} onClick={event=>event.stopPropagation()}>
          <div className="modal-heading">
            <div><span className="eyebrow">معاملة توضيحية</span><h2>إضافة معاملة</h2></div>
            <button type="button" className="icon-btn" aria-label="إغلاق النافذة" onClick={()=>setShowAdd(false)}><X size={19}/></button>
          </div>
          <label htmlFor="entry-kind">نوع المعاملة</label>
          <div className="type-switch" id="entry-kind" role="group" aria-label="نوع المعاملة">
            <button type="button" className={form.type==="expense"?"chosen expense-choice":""}
              aria-pressed={form.type==="expense"}
              onClick={()=>setForm(previous=>({...previous,type:"expense"}))}>مصروف</button>
            <button type="button" className={form.type==="income"?"chosen income-choice":""}
              aria-pressed={form.type==="income"}
              onClick={()=>setForm(previous=>({...previous,type:"income"}))}>دخل</button>
          </div>
          <label htmlFor="entry-title">اسم المعاملة</label>
          <input id="entry-title" required maxLength={80} value={form.title}
            onChange={event=>setForm(previous=>({...previous,title:event.target.value}))}
            placeholder="مثال: مشتريات تجريبية"/>
          <label htmlFor="entry-amount">المبلغ بالدينار الجزائري</label>
          <input id="entry-amount" inputMode="decimal" required value={form.amount}
            onChange={event=>setForm(previous=>({...previous,amount:event.target.value}))}
            placeholder="مثال: 1250,50"/>
          <button type="submit" className="primary-btn submit-btn"><Plus size={17}/> إضافة إلى جلسة العرض</button>
          <p className="modal-note"><CircleHelp size={15}/> لن تُحفظ العملية في قاعدة بيانات، ولن تُحرّك أي أموال.</p>
        </motion.form>
      </motion.div>}
    </AnimatePresence>
    <AnimatePresence>
      {toast&&<motion.div className="toast" role="status"
        initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}>
        <ShieldCheck size={17}/>{toast}
      </motion.div>}
    </AnimatePresence>
  </div>;
}

type StaticSection=Exclude<MainSection,"الرئيسية"|"الأكاديمية"|"عالم دينارو"|"المحاكاة"|"دفتر محلي">;
function SectionView({section,transactions,balanceMinor,search,onSearch,onAdd,onNavigate}:{
  section:StaticSection;
  transactions:readonly DemoEntry[];
  balanceMinor:bigint;
  search:string;onSearch:(value:string)=>void;
  onAdd:()=>void;onNavigate:(value:MainSection)=>void;
}){
  if(section==="المعاملات"){
    return <div className="p-section-page">
      <div className="p-section-header"><div><span className="p-section-eyebrow">TRANSACTIONS</span><h1>المعاملات التجريبية</h1>
        <p>هذا السجل موجود في الذاكرة فقط ويُمسح عند تحديث الصفحة.</p></div>
        <button type="button" className="p-button p-button--primary" onClick={onAdd}><Plus size={18}/> إضافة معاملة</button>
      </div>
      <GlassCard className="p-section-panel">
        <label htmlFor="p-entry-search" className="p-search-field"><Search size={18}/><input id="p-entry-search"
          value={search} onChange={e=>onSearch(e.target.value)} placeholder="بحث بالاسم أو التصنيف..."/></label>
        {transactions.length===0?<p className="p-no-data">لا توجد معاملات تطابق بحثك.</p>:
        <div className="p-transactions">{transactions.map(entry=><div className="p-transaction" key={entry.id}>
          <span className={"p-tx-icon "+(entry.type==="income"?"p-tx-icon--income":"p-tx-icon--expense")}>
            {entry.type==="income"?<ArrowDownLeft size={20}/>:<ArrowUpRight size={20}/>}
          </span>
          <div><strong>{entry.title}</strong><small>{entry.category} · {entry.date}</small></div>
          <span className="p-amount" dir="ltr">{formatDzdMinor(entry.type==="income"?entry.amountMinor:-entry.amountMinor)}</span>
        </div>)}</div>}
      </GlassCard>
    </div>;
  }
  if(section==="الحسابات"){
    return <div className="p-section-page">
      <div className="p-section-header"><div><span className="p-section-eyebrow">WALLETS</span><h1>المحافظ</h1>
        <p>افصل دائمًا بين مثال العرض والدفتر اليدوي المحفوظ على جهازك.</p></div></div>
      <div className="p-section-grid">
        <GlassCard><div className="p-section-icon"><Wallet size={22}/></div><h2>محفظة العرض</h2>
          <strong className="p-section-big" dir="ltr">{formatDzdMinor(balanceMinor)}</strong>
          <p>قيمة مشتقة من قيود العرض المؤقتة، وليست رصيدًا بنكيًا.</p></GlassCard>
        <GlassCard><div className="p-section-icon"><Database size={22}/></div><h2>دفتر مالي محلي</h2>
          <p>أنشئ محافظ يدوية واحفظها في قاعدة بيانات SQLite على حاسوب التطوير.</p>
          <button type="button" className="p-button p-button--primary" onClick={()=>onNavigate("دفتر محلي")}>افتح الدفتر المحلي <ChevronLeft size={17}/></button>
        </GlassCard>
      </div>
    </div>;
  }
  if(section==="الميزانية"){
    const categories=categoryTotals(transactions);
    const summary=summarizeEntries(transactions);
    return <div className="p-section-page">
      <div className="p-section-header"><div><span className="p-section-eyebrow">BUDGET</span><h1>فهم المصروفات</h1>
        <p>عرض وصفي لمعاملاتك التجريبية. لم تُنشأ ميزانيات شهرية حقيقية بعد.</p></div></div>
      <GlassCard className="p-section-panel">
        <div className="p-simple-summary"><span>المصروفات المسجلة</span><strong dir="ltr">{formatDzdMinor(summary.expenseMinor)}</strong></div>
        {categories.length===0?<p className="p-no-data">أضف مصروفًا لعرض تصنيفاته.</p>:
          categories.map(entry=><div className="p-budget-row" key={entry.name}><span>{entry.name}</span>
            <strong dir="ltr">{formatDzdMinor(entry.amountMinor)}</strong></div>)}
      </GlassCard>
    </div>;
  }
  return <div className="p-section-page">
    <div className="p-section-header"><div><span className="p-section-eyebrow">GOALS</span><h1>الأهداف المالية</h1>
      <p>طوّر هدفك خطوة بخطوة. بيانات الهدف أدناه تصورية فقط.</p></div></div>
    <div className="p-section-grid">
      <GlassCard>
        <div className="p-section-icon"><Target size={23}/></div><h2>اقتناء حاسوب</h2>
        <strong className="p-section-big">62.5%</strong>
        <div className="p-progress" role="progressbar" aria-label="تقدم هدف توضيحي" aria-valuemin={0} aria-valuemax={100} aria-valuenow={62.5}><span style={{width:"62.5%"}}/></div>
        <p>125,000 من أصل 200,000 دج — مثال غير مرتبط بالحسابات.</p>
        <button type="button" className="p-button p-button--primary" onClick={()=>onNavigate("عالم دينارو")}>رحلة عالم دينارو <ChevronLeft size={16}/></button>
      </GlassCard>
      <GlassCard><div className="p-section-icon"><Calculator size={22}/></div><h2>خطة ماذا لو؟</h2>
        <p>اكتشف أثر تغيّر مصاريفك ومساهمتك الشهرية على أهداف افتراضية.</p>
        <button type="button" className="p-button p-button--primary" onClick={()=>onNavigate("المحاكاة")}>افتح المحاكاة <ChevronLeft size={16}/></button>
      </GlassCard>
    </div>
  </div>;
}
