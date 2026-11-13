import type {ReactNode} from "react";
import type {LucideIcon} from "lucide-react";
import {
  ArrowDownLeft,ArrowLeft,ArrowLeftRight,ArrowUpRight,BookOpen,CheckCircle2,
  ChevronLeft,Compass,Eye,EyeOff,GraduationCap,House,Landmark,
  Plus,ShieldCheck,Sparkles,Target,TrendingUp,Wallet
} from "lucide-react";
import {Area,AreaChart,CartesianGrid,Cell,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {formatDzdMinor} from "../../domain/ledger";
import {categoryTotals,cumulativeFlow,spentShare,summarizeEntries} from "./selectors";
import type {DemoEntry} from "./selectors";

export interface DashboardEntry extends DemoEntry {
  icon?: LucideIcon;
}
export type MainSection =
  "الرئيسية"|"المعاملات"|"الحسابات"|"الميزانية"|"الأهداف"|"الأكاديمية"|"عالم دينارو"|"المحاكاة"|"دفتر محلي";

export interface PremiumDashboardProps {
  transactions: readonly DashboardEntry[];
  balanceMinor: bigint;
  balanceVisible: boolean;
  onToggleBalance: () => void;
  onAdd: () => void;
  onNavigate: (section: MainSection) => void;
}

export function GlassCard({children,className="",label}:{
  children:ReactNode;className?:string;label?:string;
}){
  return <section className={"p-card "+className} aria-label={label}>{children}</section>;
}
function Amount({value,visible=true,className=""}:{
  value:bigint;visible?:boolean;className?:string;
}){
  return <span className={"p-amount "+className} dir="ltr">
    {visible?formatDzdMinor(value):"••••••"}
  </span>;
}
function PanelTitle({title,subtitle,icon:Icon}:{
  title:string;subtitle:string;icon?:LucideIcon;
}){
  return <div className="p-panel-heading">
    <div><h2>{title}</h2><p>{subtitle}</p></div>
    {Icon&&<Icon size={19} strokeWidth={1.8} aria-hidden="true"/>}
  </div>;
}
function MetricCard({label,value,count,type,visible}:{
  label:string;value:bigint;count:number;type:"income"|"expense";visible:boolean;
}){
  const Icon=type==="income"?ArrowDownLeft:ArrowUpRight;
  return <GlassCard className={"p-metric p-metric--"+type} label={label}>
    <div className="p-metric-top">
      <span className="p-metric-icon"><Icon size={20} strokeWidth={1.7}/></span>
      <span>{label}</span>
    </div>
    <Amount value={value} visible={visible} className="p-metric-value"/>
    <div className="p-metric-bottom">
      <span>{count} {count===1?"عملية":"عمليات"} في سجل العرض</span>
      <span className="p-metric-dot"/>
    </div>
  </GlassCard>;
}
function Action({icon:Icon,title,subtitle,onClick,tone="default"}:{
  icon:LucideIcon;title:string;subtitle:string;onClick:()=>void;tone?:"default"|"emerald";
}){
  return <button type="button" className={"p-action p-action--"+tone} onClick={onClick}>
    <span className="p-action-icon"><Icon size={21} strokeWidth={1.9} aria-hidden="true"/></span>
    <strong>{title}</strong>
    <small>{subtitle}</small>
  </button>;
}

const demoGoal={title:"اقتناء حاسوب",savedMinor:12500000n,targetMinor:20000000n};
const doughnutColors=["var(--ds-emerald)","var(--ds-ice)","var(--ds-gold)","var(--ds-muted)"];

export function PremiumDashboard({
  transactions,balanceMinor,balanceVisible,onToggleBalance,onAdd,onNavigate
}:PremiumDashboardProps){
  const summary=summarizeEntries(transactions);
  const series=cumulativeFlow(transactions);
  const categories=categoryTotals(transactions);
  const proportion=spentShare(summary);
  const totalExpenses=categories.reduce((sum,item)=>sum+item.amountMinor,0n);
  const displayCategoryData=categories.map((item)=>({
    name:item.name,amount:Number(item.amountMinor/100n),minor:item.amountMinor
  }));
  const insight=proportion===null
    ? "أضف عملية دخل تجريبية حتى تتمكن من مقارنة المصاريف بالدخل."
    : proportion>100
      ? "المصاريف المسجلة في هذه الجلسة أكبر من الدخل التجريبي المسجل."
      : "المصاريف المسجلة تمثل "+proportion.toFixed(1)+"% من الدخل التجريبي المسجل.";

  return <div className="p-dashboard">
    <div className="p-heading">
      <div>
        <div className="p-overline"><span className="p-live-point"/> DINARO+ / PERSONAL STUDIO</div>
        <h1>أموالك، برؤية أوضح.</h1>
        <p>مساحة هادئة لتنظيم أموالك وأهدافك. جميع أرقام هذه اللوحة تجريبية.</p>
      </div>
      <div className="p-heading-actions">
        <span className="p-badge-demo"><ShieldCheck size={14}/> عرض تجريبي</span>
        <button type="button" className="p-button p-button--primary" onClick={onAdd}>
          <Plus size={18}/> إضافة معاملة
        </button>
      </div>
    </div>

    <section className="p-overview" aria-label="الملخص المالي التجريبي">
      <GlassCard className="p-balance" label="إجمالي الرصيد التجريبي">
        <div className="p-balance-decoration p-balance-decoration--one"/>
        <div className="p-balance-decoration p-balance-decoration--two"/>
        <div className="p-balance-top">
          <span><Landmark size={17} aria-hidden="true"/> إجمالي الرصيد التجريبي</span>
          <button type="button" className="p-icon-button p-icon-button--light"
            onClick={onToggleBalance}
            aria-label={balanceVisible?"إخفاء الأرقام التجريبية":"إظهار الأرقام التجريبية"}
            aria-pressed={!balanceVisible}>
            {balanceVisible?<EyeOff size={18}/>:<Eye size={18}/>}
          </button>
        </div>
        <Amount value={balanceMinor} visible={balanceVisible} className="p-balance-value"/>
        <div className="p-balance-details">
          <span><CheckCircle2 size={15}/> حساب من قيود هذه الجلسة</span>
          <small>غير مرتبط بأي مؤسسة بنكية</small>
        </div>
        <div className="p-balance-bottom">
          <span>DINARO+ <b>FINANCE STUDIO</b></span>
          <div aria-hidden="true"><span/><span/><span/></div>
        </div>
      </GlassCard>
      <MetricCard label="الدخل المسجل" value={summary.incomeMinor}
        count={summary.incomeCount} type="income" visible={balanceVisible}/>
      <MetricCard label="المصاريف المسجلة" value={summary.expenseMinor}
        count={summary.expenseCount} type="expense" visible={balanceVisible}/>
    </section>

    <div className="p-analysis-grid">
      <GlassCard className="p-flow">
        <PanelTitle title="حركة الدخل والمصاريف" subtitle="تراكم عمليات العرض بحسب ترتيب إضافتها، وليس توقعًا زمنيًا" icon={TrendingUp}/>
        <div className="p-chart-key">
          <span><i className="p-key-income"/> الدخل</span>
          <span><i className="p-key-expense"/> المصروفات</span>
        </div>
        <div className="p-flow-chart" role="img" aria-label="رسم بياني للتراكم التجريبي للدخل والمصاريف، والقيم موضحة أيضًا في البطاقات">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{top:12,bottom:0,left:0,right:4}}>
              <defs>
                <linearGradient id="pIncomeGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--ds-emerald)" stopOpacity={.27}/>
                  <stop offset="100%" stopColor="var(--ds-emerald)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="pExpenseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--ds-ice)" stopOpacity={.18}/>
                  <stop offset="100%" stopColor="var(--ds-ice)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--ds-border)" strokeOpacity={.48} vertical={false}/>
              <XAxis dataKey="step" tick={{fontSize:11,fill:"var(--ds-muted)"}} axisLine={false} tickLine={false}
                label={{value:"ترتيب المعاملة",position:"insideBottom",offset:-2,fill:"var(--ds-muted)",fontSize:10}} height={38}/>
              <YAxis orientation="right" tick={{fontSize:10,fill:"var(--ds-muted)"}} axisLine={false} tickLine={false}
                tickFormatter={n=>new Intl.NumberFormat("fr-DZ",{notation:"compact"}).format(Number(n))}
                width={52}/>
              <Tooltip cursor={{stroke:"var(--ds-border)"}}
                contentStyle={{background:"var(--ds-elevated)",border:"1px solid var(--ds-border)",borderRadius:12,color:"var(--ds-text)"}}
                formatter={(value,name)=>[new Intl.NumberFormat("fr-DZ",{maximumFractionDigits:0}).format(Number(value))+" دج",
                  name==="income"?"الدخل":"المصاريف"]}/>
              <Area type="monotone" dataKey="income" stroke="var(--ds-emerald)" strokeWidth={2.7}
                fill="url(#pIncomeGradient)" dot={false} activeDot={{r:5}} isAnimationActive={false}/>
              <Area type="monotone" dataKey="expense" stroke="var(--ds-ice)" strokeWidth={2.2}
                fill="url(#pExpenseGradient)" dot={false} activeDot={{r:4}} isAnimationActive={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard className="p-breakdown">
        <PanelTitle title="توزيع المصروفات" subtitle="حسب التصنيفات المسجلة في جلسة العرض"/>
        {categories.length===0
          ? <div className="p-no-data">لا توجد مصروفات مسجلة لعرض توزيعها.</div>
          : <>
            <div className="p-donut" aria-label="توزيع المصروفات حسب الفئة">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={displayCategoryData} dataKey="amount" nameKey="name" innerRadius="67%" outerRadius="89%"
                    startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                    {displayCategoryData.map((item,index)=>
                      <Cell key={item.name} fill={doughnutColors[index%doughnutColors.length]}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="p-donut-label"><small>إجمالي المصاريف</small>
                <Amount visible={balanceVisible} value={totalExpenses}/></div>
            </div>
            <div className="p-categories">
              {categories.slice(0,4).map((entry,index)=><div className="p-category" key={entry.name}>
                <span><i style={{background:doughnutColors[index%doughnutColors.length]}}/>{entry.name}</span>
                <Amount visible={balanceVisible} value={entry.amountMinor}/>
              </div>)}
            </div>
          </>}
      </GlassCard>
    </div>

    <div className="p-details-grid">
      <GlassCard className="p-goal">
        <PanelTitle title="رحلة الهدف" subtitle="مثال تصوّري داخل عالم دينارو" icon={Target}/>
        <div className="p-goal-title">
          <span className="p-goal-icon"><Compass size={26}/></span>
          <div><strong>{demoGoal.title}</strong><small>هدف توضيحي — ليس مرتبطًا برصيد فعلي</small></div>
          <b>62.5%</b>
        </div>
        <div className="p-progress" role="progressbar" aria-label="تقدم هدف توضيحي" aria-valuemin={0} aria-valuemax={100} aria-valuenow={62.5}>
          <span style={{width:"62.5%"}}/>
        </div>
        <div className="p-goal-foot"><span>125,000 من 200,000 دج (مثال)</span>
          <button type="button" onClick={()=>onNavigate("عالم دينارو")}>مشاهدة الرحلة <ChevronLeft size={16}/></button>
        </div>
      </GlassCard>
      <GlassCard className="p-insight">
        <div className="p-insight-icon"><Sparkles size={22}/></div>
        <div className="p-insight-body">
          <span>تحليل حسابي، وليس DINARO AI</span>
          <h2>إشارة من سجل العرض</h2>
          <p>{insight}</p>
          <button type="button" onClick={()=>onNavigate("المحاكاة")}>جرّب محاكي «ماذا لو؟» <ArrowLeft size={16}/></button>
        </div>
      </GlassCard>
    </div>

    <div className="p-final-grid">
      <GlassCard className="p-recent">
        <div className="p-recent-heading"><PanelTitle title="آخر المعاملات" subtitle="سجل افتراضي يمكن تعديله أثناء الجلسة"/>
          <button type="button" onClick={()=>onNavigate("المعاملات")}>عرض الكل <ChevronLeft size={16}/></button>
        </div>
        {transactions.length===0?<div className="p-no-data">لا توجد معاملات مسجلة بعد.</div>:
          <div className="p-transactions">
            {transactions.slice(0,4).map(entry=>{
              const Icon=entry.icon??(entry.type==="income"?ArrowDownLeft:ArrowUpRight);
              return <div className="p-transaction" key={entry.id}>
                <span className={"p-tx-icon "+(entry.type==="income"?"p-tx-icon--income":"p-tx-icon--expense")}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true"/>
                </span>
                <div><strong>{entry.title}</strong><small>{entry.category} · {entry.date}</small></div>
                <Amount visible={balanceVisible} value={entry.type==="income"?entry.amountMinor:-entry.amountMinor}
                  className={entry.type==="income"?"p-tx-positive":"p-tx-negative"}/>
              </div>;
            })}
          </div>}
      </GlassCard>
      <GlassCard className="p-shortcuts">
        <PanelTitle title="وصول سريع" subtitle="عمليات واضحة بدون ازدحام"/>
        <div className="p-shortcuts-grid">
          <Action icon={Plus} title="إضافة معاملة" subtitle="داخل نسخة العرض" tone="emerald" onClick={onAdd}/>
          <Action icon={Wallet} title="محفظة يدوية" subtitle="سجل محلي منفصل" onClick={()=>onNavigate("دفتر محلي")}/>
          <Action icon={BookOpen} title="الأكاديمية" subtitle="دروس مالية" onClick={()=>onNavigate("الأكاديمية")}/>
          <Action icon={Target} title="الأهداف" subtitle="تقدم وتخطيط" onClick={()=>onNavigate("الأهداف")}/>
        </div>
      </GlassCard>
    </div>
    <div className="p-endline"><GraduationCap size={16}/><span>التعلم والإنجازات اختيارية، ولا تترتب عليها معاملات مالية.</span></div>
  </div>;
}

export function PremiumMobileNav({active,onNavigate,onAdd}:{
  active:MainSection;onNavigate:(s:MainSection)=>void;onAdd:()=>void;
}){
  const items:{name:MainSection;icon:LucideIcon;label:string}[]=[
    {name:"الرئيسية",icon:House,label:"الرئيسية"},
    {name:"المعاملات",icon:ArrowLeftRight,label:"المعاملات"},
    {name:"الأهداف",icon:Target,label:"الأهداف"},
    {name:"الأكاديمية",icon:GraduationCap,label:"الأكاديمية"}
  ];
  return <nav className="p-mobile-nav" aria-label="التنقل الرئيسي للهاتف">
    {items.slice(0,2).map(({name,icon:Icon,label})=><button key={name} type="button"
      className={active===name?"active":""} aria-current={active===name?"page":undefined}
      onClick={()=>onNavigate(name)}><Icon size={20}/><span>{label}</span></button>)}
    <button type="button" className="p-mobile-add" aria-label="إضافة معاملة تجريبية" onClick={onAdd}>
      <Plus size={26} strokeWidth={2.2}/>
    </button>
    {items.slice(2).map(({name,icon:Icon,label})=><button key={name} type="button"
      className={active===name?"active":""} aria-current={active===name?"page":undefined}
      onClick={()=>onNavigate(name)}><Icon size={20}/><span>{label}</span></button>)}
  </nav>;
}
