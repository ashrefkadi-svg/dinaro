import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, ArrowDownLeft, ArrowLeftRight, ArrowUpLeft, Bell, ChevronDown,
  ChevronLeft, CircleHelp, CreditCard, Ellipsis, Eye, EyeOff, FileText,
  Home, LayoutGrid, LogOut, Menu, Plus, Search, Settings, ShieldCheck,
  Sparkles, Target, TrendingDown, TrendingUp, Wallet, X, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

type Section = "الرئيسية" | "المعاملات" | "الحسابات" | "الميزانية" | "الأهداف";
const nav: { label: Section; icon: typeof Home }[] = [
  { label: "الرئيسية", icon: Home }, { label: "المعاملات", icon: ArrowLeftRight },
  { label: "الحسابات", icon: Wallet }, { label: "الميزانية", icon: LayoutGrid },
  { label: "الأهداف", icon: Target }
];
const chartData = [
  { day: "01", income: 180000, expense: 90000 }, { day: "05", income: 205000, expense: 112000 },
  { day: "09", income: 195000, expense: 104000 }, { day: "13", income: 248000, expense: 132000 },
  { day: "17", income: 230000, expense: 119000 }, { day: "21", income: 282000, expense: 146000 },
  { day: "25", income: 260000, expense: 138000 }, { day: "30", income: 318000, expense: 154000 }
];
const initialTransactions = [
  { id: 1, title: "راتب شهري", category: "العمل", date: "اليوم، 09:30", amount: 85000, type: "income", icon: ArrowDownLeft, color: "green" },
  { id: 2, title: "مشتريات البقالة", category: "التسوق", date: "اليوم، 08:15", amount: 4250, type: "expense", icon: Wallet, color: "orange" },
  { id: 3, title: "فاتورة الكهرباء", category: "الفواتير", date: "أمس، 18:42", amount: 6200, type: "expense", icon: Zap, color: "blue" },
  { id: 4, title: "تحويل وارد", category: "تحويلات", date: "أمس، 12:20", amount: 12000, type: "income", icon: ArrowDownLeft, color: "purple" }
];
const money = (n: number) => new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(n);

function App() {
  const [section, setSection] = useState<Section>("الرئيسية");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showAdd, setShowAdd] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ title: "", amount: "", type: "expense" });
  const totals = useMemo(() => ({
    income: transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expense: transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  }), [transactions]);
  const balance = 284500 + totals.income - 97000 - totals.expense;
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !amount || amount < 1) return;
    setTransactions([{ id: Date.now(), title: form.title, category: "عام", date: "الآن", amount, type: form.type, icon: form.type === "income" ? ArrowDownLeft : ArrowUpLeft, color: form.type === "income" ? "green" : "orange" }, ...transactions]);
    setForm({ title: "", amount: "", type: "expense" }); setShowAdd(false); notify("تمت إضافة المعاملة إلى العرض التجريبي");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><span>D</span><i /></div><div><b>DINARO<span>+</span></b><small>YOUR MONEY. YOUR FUTURE.</small></div><button className="icon-btn mobile-close" onClick={() => setMobileMenu(false)}><X size={18}/></button></div>
        <div className="workspace"><div className="workspace-avatar">A</div><div><b>مساحتي الشخصية</b><small>الحساب الشخصي</small></div><ChevronDown size={15}/></div>
        <div className="nav-caption">القائمة الرئيسية</div>
        <nav className="side-nav">{nav.map(item => <button key={item.label} className={section === item.label ? "nav-item active" : "nav-item"} onClick={() => {setSection(item.label);setMobileMenu(false);}}><item.icon size={19}/><span>{item.label}</span>{item.label === "المعاملات" && <small className="nav-count">4</small>}</button>)}</nav>
        <div className="nav-caption tools-caption">أدواتك المالية</div>
        <button className="nav-item" onClick={() => notify("ميزة DINARO Scan ستضاف في مرحلة لاحقة")}><FileText size={19}/><span>DINARO Scan</span><span className="new-tag">جديد</span></button>
        <div className="sidebar-spacer"/>
        <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><b>تحكم أذكى بأموالك</b><p>اكتشف طرقاً جديدة لتنظيم مصاريفك وتحقيق أهدافك.</p><button onClick={() => notify("ستتوفر المزايا الذكية لاحقاً")}>اكتشف المزيد <ChevronLeft size={14}/></button></div>
        <button className="nav-item bottom-link" onClick={() => notify("الإعدادات قيد التطوير")}><Settings size={18}/><span>الإعدادات</span></button>
        <div className="sidebar-profile"><div className="profile-avatar">AK</div><div><b>مستخدم DINARO</b><small>الحساب الأساسي</small></div><Ellipsis size={19}/></div>
      </aside>
      {mobileMenu && <button className="mobile-scrim" aria-label="إغلاق القائمة" onClick={() => setMobileMenu(false)}/>}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-start"><button className="icon-btn menu-toggle" onClick={() => setMobileMenu(true)}><Menu size={20}/></button><div className="breadcrumb">مساحتي <ChevronLeft size={14}/> <b>{section}</b></div></div>
          <div className="topbar-actions"><div className="search-box"><Search size={17}/><input placeholder="ابحث عن معاملة أو حساب..." /></div><button className="icon-btn notification-btn" onClick={() => notify("لا توجد إشعارات جديدة")}><Bell size={19}/><i/></button><div className="top-avatar">AK</div></div>
        </header>
        <div className="page-content">
          <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> مساحتك المالية في مكان واحد</div><h1>{section === "الرئيسية" ? "صباح الخير، أشرف" : section}</h1><p>إليك نظرة واضحة على وضعك المالي. خطوة صغيرة اليوم تصنع فرقاً غداً.</p></div><div className="welcome-actions"><button className="secondary-btn" onClick={() => notify("تم تحديث بيانات العرض") }><Activity size={16}/> تحديث البيانات</button><button className="primary-btn" onClick={() => setShowAdd(true)}><Plus size={17}/> إضافة معاملة</button></div></div>
          {section === "الرئيسية" ? <>
            <section className="overview-grid">
              <motion.div className="balance-card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
                <div className="balance-glow"/><div className="balance-top"><span>إجمالي رصيدك</span><button onClick={() => setBalanceVisible(!balanceVisible)}>{balanceVisible ? <Eye size={17}/> : <EyeOff size={17}/>}</button><span className="balance-period">كل الحسابات <ChevronDown size={13}/></span></div>
                <div className="balance-value">{balanceVisible ? money(balance) : "••••••••"} <small>دج</small></div>
                <div className="balance-change"><span><TrendingUp size={14}/> +8.4%</span><small>مقارنة بالشهر الماضي</small></div>
                <div className="balance-footer"><div><small>آخر تحديث</small><b>اليوم، الآن</b></div><div className="balance-chip"><ShieldCheck size={14}/> بياناتك تحت سيطرتك</div></div>
              </motion.div>
              <div className="stat-card"><div className="stat-heading"><span className="stat-icon income-icon"><ArrowDownLeft size={18}/></span><span>إجمالي الدخل</span><Ellipsis size={18}/></div><strong>{money(totals.income + 97000)} <small>دج</small></strong><div className="stat-foot positive"><TrendingUp size={14}/> <b>12.8%</b><span>عن الشهر الماضي</span></div><div className="mini-bars income-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
              <div className="stat-card"><div className="stat-heading"><span className="stat-icon expense-icon"><ArrowUpLeft size={18}/></span><span>إجمالي المصروفات</span><Ellipsis size={18}/></div><strong>{money(totals.expense + 97000)} <small>دج</small></strong><div className="stat-foot negative"><TrendingDown size={14}/> <b>4.2%</b><span>عن الشهر الماضي</span></div><div className="mini-bars expense-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
            </section>
            <section className="content-grid">
              <div className="panel chart-panel"><div className="panel-heading"><div><h3>نظرة على التدفق المالي</h3><p>تابع حركة دخلك ومصروفاتك بوضوح</p></div><button className="select-chip">هذا الشهر <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-income"/> الدخل</span><span><i className="legend-expense"/> المصروفات</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:4,left:0,bottom:0}}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20c997" stopOpacity={0.22}/><stop offset="95%" stopColor="#20c997" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e6a35c" stopOpacity={0.16}/><stop offset="95%" stopColor="#e6a35c" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#ffffff0b" vertical={false}/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fill:"#778a83",fontSize:11}}/><YAxis orientation="right" tickLine={false} axisLine={false} tick={{fill:"#778a83",fontSize:10}} tickFormatter={v => `${v/1000}k`} width={37}/><Tooltip contentStyle={{background:"#10231e",border:"1px solid #29463b",borderRadius:12,color:"#fff",fontFamily:"inherit"}} formatter={(v) => [money(Number(v))+" دج"]}/><Area type="monotone" dataKey="income" stroke="#24c99a" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="expense" stroke="#d99b5c" strokeWidth={2.2} fill="url(#expenseFill)"/></AreaChart></ResponsiveContainer></div></div>
              <div className="panel budget-panel"><div className="panel-heading"><div><h3>الميزانية الشهرية</h3><p>راقب حدود إنفاقك</p></div><button className="more-btn" onClick={() => setSection("الميزانية")}><Ellipsis/></button></div><div className="budget-total"><strong>42,350 <small>دج</small></strong><span>من 70,000 دج</span></div><div className="budget-track"><i style={{width:"60.5%"}}/></div><div className="budget-meta"><span>60.5% مستخدم</span><b>متبقي 27,650 دج</b></div><div className="budget-divider"/><div className="budget-categories"><div><span className="category-dot food"/> <span>الطعام والتسوق</span><b>18,500 دج</b></div><div><span className="category-dot bills"/> <span>الفواتير</span><b>12,250 دج</b></div><div><span className="category-dot transport"/> <span>النقل</span><b>6,600 دج</b></div><div><span className="category-dot other"/> <span>أخرى</span><b>5,000 دج</b></div></div></div>
            </section>
            <section className="panel transactions-panel"><div className="panel-heading"><div><h3>أحدث المعاملات</h3><p>كل حركة مالية مسجلة في مكان واحد</p></div><button className="text-link" onClick={() => setSection("المعاملات")}>عرض الكل <ChevronLeft size={15}/></button></div><div className="transaction-list">{transactions.slice(0,4).map(t => <div className="transaction-row" key={t.id}><div className={`transaction-icon ${t.color}`}><t.icon size={18}/></div><div className="transaction-info"><b>{t.title}</b><small>{t.category} · {t.date}</small></div><div className={t.type === "income" ? "amount positive-amount" : "amount"}>{t.type === "income" ? "+" : "−"}{money(t.amount)} <small>دج</small></div><span className={t.type === "income" ? "status-pill received" : "status-pill paid"}>{t.type === "income" ? "وارد" : "صادر"}</span></div>)}</div></section>
            <section className="bottom-grid"><div className="panel goal-card"><div className="panel-heading"><div><h3>هدفك القادم</h3><p>كل خطوة تقربك من هدفك</p></div><Target size={19} className="muted-icon"/></div><div className="goal-main"><div className="goal-symbol"><Target size={23}/></div><div><b>شراء حاسوب جديد</b><small>هدف شخصي · 30 سبتمبر 2026</small></div></div><div className="goal-progress"><div><span>تم توفير 125,000 دج</span><b>62.5%</b></div><div className="goal-track"><i/></div><small>المتبقي 75,000 دج للوصول إلى هدفك</small></div></div><div className="insight-card"><div className="insight-icon"><Sparkles size={19}/></div><div><span>معلومة مالية</span><b>الاستمرارية أهم من المبلغ</b><p>تتبع مصروفاتك بانتظام يساعدك على فهم عاداتك المالية واتخاذ قرارات أفضل.</p></div><CircleHelp size={17} className="insight-help"/></div></section>
          </> : <SectionView section={section} transactions={transactions} onAdd={() => setShowAdd(true)} />}
          <footer className="footer"><span>© 2026 DINARO+ · أموالك. مستقبلك.</span><span><ShieldCheck size={13}/> الخصوصية أولاً</span><span>الإصدار التجريبي 0.1</span></footer>
        </div>
      </main>
      <AnimatePresence>{showAdd && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowAdd(false)}><motion.form className="add-modal" initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} onSubmit={addTransaction} onClick={e => e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">إدارة أموالك</span><h2>إضافة معاملة</h2></div><button type="button" className="icon-btn" onClick={() => setShowAdd(false)}><X size={19}/></button></div><label>نوع المعاملة</label><div className="type-switch"><button type="button" className={form.type === "expense" ? "chosen expense-choice" : ""} onClick={() => setForm({...form,type:"expense"})}>مصروف</button><button type="button" className={form.type === "income" ? "chosen income-choice" : ""} onClick={() => setForm({...form,type:"income"})}>دخل</button></div><label htmlFor="title">اسم المعاملة</label><input id="title" required value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="مثال: مشتريات، راتب..." /><label htmlFor="amount">المبلغ بالدينار الجزائري</label><input id="amount" type="number" min="1" required value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} placeholder="0" /><button className="primary-btn submit-btn" type="submit">حفظ المعاملة <Plus size={16}/></button><p className="modal-note"><ShieldCheck size={14}/> هذه نسخة تجريبية؛ لن تُحفظ البيانات في قاعدة بيانات.</p></motion.form></motion.div>}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}><ShieldCheck size={17}/>{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function SectionView({section,transactions,onAdd}:{section:Section;transactions:typeof initialTransactions;onAdd:()=>void}) {
  if(section==="المعاملات") return <div className="panel section-panel"><div className="panel-heading"><div><h3>سجل المعاملات</h3><p>راجع حركاتك المالية الأخيرة</p></div><button className="primary-btn" onClick={onAdd}><Plus size={16}/> إضافة معاملة</button></div>{transactions.map(t=><div className="transaction-row" key={t.id}><div className={`transaction-icon ${t.color}`}><t.icon size={18}/></div><div className="transaction-info"><b>{t.title}</b><small>{t.category} · {t.date}</small></div><div className={t.type==="income"?"amount positive-amount":"amount"}>{t.type==="income"?"+":"−"}{money(t.amount)} <small>دج</small></div></div>)}</div>;
  const content = {
    "الحسابات":{icon:Wallet,title:"حساباتك المالية",desc:"نظرة موحدة على أموالك في مختلف الحسابات",items:[["الحساب النقدي","نقداً","125,000 دج"],["الحساب البنكي","بنك الجزائر","159,500 دج"]]},
    "الميزانية":{icon:LayoutGrid,title:"خطتك الشهرية",desc:"وزّع دخلك وراقب المصروفات ضمن حدود واضحة",items:[["الطعام والتسوق","26% من الميزانية","18,500 دج"],["الفواتير","17.5% من الميزانية","12,250 دج"],["النقل","9.4% من الميزانية","6,600 دج"]]},
    "الأهداف":{icon:Target,title:"أهدافك المالية",desc:"حوّل خططك إلى أهداف قابلة للمتابعة",items:[["شراء حاسوب جديد","62.5% مكتمل","125,000 دج"],["صندوق الطوارئ","قيد التخطيط","0 دج"]]}
  }[section as "الحسابات"|"الميزانية"|"الأهداف"];
  return <div className="section-view"><div className="panel section-panel"><div className="panel-heading"><div><h3>{content.title}</h3><p>{content.desc}</p></div><content.icon size={22} className="muted-icon"/></div>{content.items.map(([title,desc,amount])=><div className="simple-item" key={title}><div className="simple-item-icon"><content.icon size={19}/></div><div><b>{title}</b><small>{desc}</small></div><strong>{amount}</strong></div>)}</div><div className="empty-hint"><Sparkles size={20}/><b>هذه المساحة جاهزة للتطوير</b><p>سنربط هذه الواجهة بالبيانات الحقيقية ونضيف عمليات الإنشاء والتعديل والحذف في المراحل القادمة.</p></div></div>;
}

export default App;