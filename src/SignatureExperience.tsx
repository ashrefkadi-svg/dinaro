import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity, ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronRight,
  CircleDollarSign, CreditCard, Eye, EyeOff, LockKeyhole, Plus, ReceiptText,
  Sparkles, Star, Target, Trophy, Wallet, Zap
} from "lucide-react";

type Lang = "ar" | "en" | "fr";
type Currency = "DZD" | "EUR" | "USD" | "GBP" | "SAR" | "AED" | "CAD" | "TND";
type Tx = { id: string; title: string; category: string; date: string; amount: number; type: "income" | "expense" | "transfer"; accountId: string; toAccountId?: string; currency?: Currency };
type Account = { id: string; name: string; kind: string; opening: number; currency?: Currency };
type Budget = { id: string; category: string; limit: number };
type Goal = { id: string; title: string; target: number; saved: number; due: string };
type Bill = { id: string; title: string; amount: number; due: string; currency: Currency; paid: boolean };
type Recurring = { id: string; title: string; amount: number; type: "income" | "expense"; currency: Currency; nextDate: string };
type Props = {
  lang: Lang; transactions: Tx[]; accounts: Account[]; budgets: Budget[];
  goals: Goal[]; bills: Bill[]; recurring: Recurring[];
  onNavigate: (page: string) => void; onAddTransaction: () => void;
};
const currencies: Currency[] = ["DZD", "EUR", "USD", "GBP", "SAR", "AED", "CAD", "TND"];
const text = {
  ar: {
    eyebrow: "DINARO+ · NEO FINANCE", greeting: "صورتك المالية، في مكان واحد", subtitle: "نظرة هادئة وواضحة على أموالك وخطواتك القادمة.",
    balance: "إجمالي الرصيد", hide: "إخفاء الأرصدة", show: "إظهار الأرصدة", add: "إضافة معاملة",
    income: "الدخل هذا الشهر", expense: "المصروفات هذا الشهر", wallets: "محافظك وحساباتك",
    allWallets: "إدارة الحسابات", activity: "النشاط المالي", allActivity: "كل المعاملات",
    map: "خريطة أموالك", mapDesc: "توزيع المصروفات حسب التصنيف — العملة المختارة فقط.",
    noSpend: "لا توجد مصروفات مسجلة لهذه العملة هذا الشهر.", budget: "ميزانيتك التفاعلية",
    budgetDesc: "تابع استخدام ميزانيتك مع كل معاملة مسجلة.", goals: "أهدافك", allGoals: "كل الأهداف",
    journey: "رحلتك المالية", journeyDesc: "مراحل تتقدم معها خطوة بخطوة، دون ضغط أو منافسة.",
    achievements: "معرض الإنجازات", wrapped: "ملخص الشهر", wrappedDesc: "ملخص مبني على المعاملات المسجلة خلال هذا الشهر.",
    transactions: "معاملة", categories: "تصنيفات نشطة", saved: "مدخر للأهداف", upcoming: "القادم",
    noAccounts: "ابدأ بإضافة حسابك الأول", noAccountsDesc: "سيظهر رصيدك وحساباتك هنا بعد إعدادها.",
    noActivity: "لا يوجد نشاط بعد", noActivityDesc: "أضف أول معاملة ليبدأ سجل نشاطك المالي بالظهور.",
    noGoals: "لا توجد أهداف بعد", noGoalsDesc: "أنشئ هدفاً صغيراً لمتابعة تقدم الادخار.",
    create: "إضافة حساب", createGoal: "إنشاء هدف", due: "الاستحقاق", left: "متبقي",
    stages: ["إعداد الحساب", "أول معاملة", "أول هدف", "10 معاملات", "أول هدف مكتمل"],
    achievementsNames: ["بداية ذكية", "أول خطوة", "صانع الأهداف", "عادة المتابعة", "نصف الطريق", "إنجاز كامل"],
    achievementsDesc: ["أضفت حسابك الأول.", "سجلت أول معاملة.", "أنشأت أول هدف ادخار.", "سجلت 10 معاملات.", "وصلت بأحد أهدافك إلى 50%.", "أكملت هدف ادخار."],
    unlocked: "مفتوح", locked: "لم يُفتح بعد", tier: ["البداية", "برونزي", "فضي", "ذهبي", "بلاتيني"],
    noBudget: "أضف ميزانية لعرض تقدمها هنا.", privacy: "عرض خاص", tip: "الأرقام المعروضة تعتمد على بياناتك المسجلة فقط.",
    positive: "دخل", negative: "مصروف", transfer: "تحويل", noWrapped: "أضف معاملات خلال الشهر لعرض ملخصك.",
    monthlyNet: "صافي الشهر", busiest: "أعلى تصنيف إنفاق", focus: "خطوتك التالية"
  },
  en: {
    eyebrow: "DINARO+ · NEO FINANCE", greeting: "Your financial picture, in one place", subtitle: "A calm, clear view of your money and what comes next.",
    balance: "Total balance", hide: "Hide balances", show: "Show balances", add: "Add transaction",
    income: "Income this month", expense: "Expenses this month", wallets: "Your wallets & accounts",
    allWallets: "Manage accounts", activity: "Financial activity", allActivity: "All transactions",
    map: "Your money map", mapDesc: "Spending by category — selected currency only.",
    noSpend: "No expenses recorded in this currency this month.", budget: "Interactive budget",
    budgetDesc: "Track budget usage as transactions are recorded.", goals: "Your goals", allGoals: "All goals",
    journey: "Your financial journey", journeyDesc: "Progress through meaningful steps, without pressure or competition.",
    achievements: "Achievement gallery", wrapped: "Monthly wrapped", wrappedDesc: "A summary based on transactions recorded this month.",
    transactions: "transactions", categories: "active categories", saved: "saved toward goals", upcoming: "upcoming",
    noAccounts: "Add your first account", noAccountsDesc: "Your balances and wallets will appear here once set up.",
    noActivity: "No activity yet", noActivityDesc: "Add your first transaction to start your financial activity stream.",
    noGoals: "No goals yet", noGoalsDesc: "Create a small goal to track your savings progress.",
    create: "Add account", createGoal: "Create goal", due: "Due", left: "left",
    stages: ["Set up an account", "First transaction", "First goal", "10 transactions", "First goal completed"],
    achievementsNames: ["Smart start", "First step", "Goal setter", "Consistent tracker", "Halfway there", "Goal complete"],
    achievementsDesc: ["You added your first account.", "You recorded your first transaction.", "You created your first savings goal.", "You recorded 10 transactions.", "One goal reached 50%.", "You completed a savings goal."],
    unlocked: "Unlocked", locked: "Locked", tier: ["Starter", "Bronze", "Silver", "Gold", "Platinum"],
    noBudget: "Add a budget to see progress here.", privacy: "Private view", tip: "Figures are based only on the data you have recorded.",
    positive: "Income", negative: "Expense", transfer: "Transfer", noWrapped: "Record transactions this month to see your summary.",
    monthlyNet: "Monthly net", busiest: "Top spending category", focus: "Your next step"
  },
  fr: {
    eyebrow: "DINARO+ · NEO FINANCE", greeting: "Votre situation financière, en un seul endroit", subtitle: "Une vue claire de votre argent et des prochaines étapes.",
    balance: "Solde total", hide: "Masquer les soldes", show: "Afficher les soldes", add: "Ajouter une opération",
    income: "Revenus du mois", expense: "Dépenses du mois", wallets: "Vos portefeuilles et comptes",
    allWallets: "Gérer les comptes", activity: "Activité financière", allActivity: "Toutes les opérations",
    map: "Carte de vos dépenses", mapDesc: "Répartition par catégorie — devise sélectionnée uniquement.",
    noSpend: "Aucune dépense enregistrée dans cette devise ce mois-ci.", budget: "Budget interactif",
    budgetDesc: "Suivez l'utilisation de votre budget à chaque opération.", goals: "Vos objectifs", allGoals: "Tous les objectifs",
    journey: "Votre parcours financier", journeyDesc: "Avancez à votre rythme, sans pression ni compétition.",
    achievements: "Galerie des réussites", wrapped: "Bilan mensuel", wrappedDesc: "Résumé des opérations enregistrées ce mois-ci.",
    transactions: "opérations", categories: "catégories actives", saved: "épargné pour les objectifs", upcoming: "à venir",
    noAccounts: "Ajoutez votre premier compte", noAccountsDesc: "Vos soldes et portefeuilles apparaîtront ici.",
    noActivity: "Aucune activité", noActivityDesc: "Ajoutez votre première opération pour démarrer votre historique.",
    noGoals: "Aucun objectif", noGoalsDesc: "Créez un objectif simple pour suivre votre épargne.",
    create: "Ajouter un compte", createGoal: "Créer un objectif", due: "Échéance", left: "restant",
    stages: ["Créer un compte", "Première opération", "Premier objectif", "10 opérations", "Premier objectif atteint"],
    achievementsNames: ["Bon départ", "Premier pas", "Créateur d'objectifs", "Régularité", "À mi-chemin", "Objectif atteint"],
    achievementsDesc: ["Vous avez ajouté votre premier compte.", "Vous avez enregistré votre première opération.", "Vous avez créé votre premier objectif.", "Vous avez enregistré 10 opérations.", "Un objectif a atteint 50 %.", "Vous avez terminé un objectif."],
    unlocked: "Débloqué", locked: "Verrouillé", tier: ["Départ", "Bronze", "Argent", "Or", "Platine"],
    noBudget: "Ajoutez un budget pour voir sa progression.", privacy: "Vue privée", tip: "Les chiffres utilisent uniquement vos données enregistrées.",
    positive: "Revenu", negative: "Dépense", transfer: "Virement", noWrapped: "Enregistrez des opérations pour afficher votre bilan.",
    monthlyNet: "Solde mensuel", busiest: "Catégorie principale", focus: "Prochaine étape"
  }
};
const money = (value: number, currency: Currency, lang: Lang) =>
  new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-DZ" : "en-US", {
    style: "currency", currency, maximumFractionDigits: currency === "DZD" ? 0 : 2
  }).format(value);
const dayKey = () => new Date().toISOString().slice(0, 10);
const monthKey = dayKey().slice(0, 7);
const accountKind = (kind: string, lang: Lang) => { const labels: Record<string, Record<Lang, string>> = { cash: { ar: "نقدي", en: "Cash", fr: "Espèces" }, bank: { ar: "بنكي", en: "Bank", fr: "Bancaire" }, savings: { ar: "ادخار", en: "Savings", fr: "Épargne" }, wallet: { ar: "محفظة", en: "Wallet", fr: "Portefeuille" } }; return labels[kind]?.[lang] || kind; };
const balanceFor = (account: Account, transactions: Tx[]) =>
  account.opening + transactions.reduce((sum, tx) =>
    sum + (tx.accountId === account.id ? (tx.type === "income" ? tx.amount : -tx.amount) : 0)
      + (tx.type === "transfer" && tx.toAccountId === account.id ? tx.amount : 0), 0);

export default function SignatureExperience({
  lang, transactions, accounts, budgets, goals, bills, recurring, onNavigate, onAddTransaction
}: Props) {
  const t = text[lang];
  const reduceMotion = useReducedMotion();
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem("dinaro-signature-currency") as Currency | null;
    return saved && currencies.includes(saved) ? saved : "DZD";
  });
  const [privateMode, setPrivateMode] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  useEffect(() => {
    const completed = goals.filter(g => g.target > 0 && g.saved >= g.target).map(g => g.id);
    const key = "dinaro-signature-completed-goals";
    const stored = localStorage.getItem(key);
    if (stored === null) { localStorage.setItem(key, JSON.stringify(completed)); return; }
    let known: string[] = [];
    try { known = JSON.parse(stored) as string[]; } catch { known = []; }
    const fresh = goals.find(g => completed.includes(g.id) && !known.includes(g.id));
    if (fresh) {
      setCelebration(fresh.title);
      localStorage.setItem(key, JSON.stringify([...new Set([...known, ...completed])]));
      const timer = window.setTimeout(() => setCelebration(null), 4600);
      return () => window.clearTimeout(timer);
    }
    localStorage.setItem(key, JSON.stringify([...new Set([...known, ...completed])]));
  }, [goals]);
  const availableCurrencies = currencies.filter(c => accounts.some(a => (a.currency || "DZD") === c));
  const activeCurrency = availableCurrencies.includes(currency) ? currency : (availableCurrencies[0] || "DZD");
  const accountRows = accounts.filter(a => (a.currency || "DZD") === activeCurrency);
  const totalBalance = accountRows.reduce((sum, account) => sum + balanceFor(account, transactions), 0);
  const monthTransactions = useMemo(() => transactions.filter(tx => tx.date.slice(0, 7) === monthKey && (tx.currency || "DZD") === activeCurrency), [transactions, activeCurrency]);
  const income = monthTransactions.filter(tx => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = monthTransactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const monthNet = income - expenses;
  const categoryRows = Object.entries(monthTransactions.filter(tx => tx.type === "expense").reduce<Record<string, number>>((acc, tx) => {
    const category = tx.category || (lang === "ar" ? "أخرى" : "Other");
    acc[category] = (acc[category] || 0) + tx.amount;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const categoryTotal = categoryRows.reduce((sum, row) => sum + row[1], 0);
  const palette = ["#45e0b4", "#78a9f8", "#d6a46a", "#a78bfa", "#62c8d8"];
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const activeBudgets = budgets.slice(0, 4).map(b => ({
    ...b, used: transactions.filter(tx => tx.type === "expense" && (tx.currency || "DZD") === "DZD" && tx.category === b.category && tx.date.slice(0, 7) === monthKey).reduce((sum, tx) => sum + tx.amount, 0)
  }));
  const upcomingCount = bills.filter(b => !b.paid && b.due >= dayKey()).length + recurring.filter(r => r.type === "expense" && r.nextDate >= dayKey()).length;
  const topCategory = categoryRows[0];
  const goalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const journey = [accounts.length > 0, transactions.length > 0, goals.length > 0, transactions.length >= 10, goals.some(g => g.target > 0 && g.saved >= g.target)];
  const journeyProgress = Math.round(journey.filter(Boolean).length / journey.length * 100);
  const nextStep = accounts.length === 0 ? t.stages[0] : transactions.length === 0 ? t.stages[1] : goals.length === 0 ? t.stages[2] : transactions.length < 10 ? t.stages[3] : t.stages[4];
  const wrappedHasData = monthTransactions.length > 0;
  const motionProps = reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .12 }, transition: { duration: .48, ease: "easeOut" as const } };
  const blur = privateMode ? "signature-private" : "";
  return <div className="signature-shell">
    {celebration && <motion.div className="signature-celebration" initial={reduceMotion?false:{opacity:0,y:-10,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}} role="status"><span><Trophy size={18}/></span><div><b>{lang==="ar"?"إنجاز جديد!":lang==="fr"?"Nouvelle réussite !":"Milestone unlocked!"}</b><small>{celebration}</small></div><Sparkles size={17}/></motion.div>}
    <section className="signature-hero" aria-labelledby="signature-title">
      <div className="signature-orb signature-orb-one"/><div className="signature-orb signature-orb-two"/>
      <div className="signature-hero-top"><div><span className="signature-eyebrow"><i/>{t.eyebrow}</span><h2 id="signature-title">{t.greeting}</h2><p>{t.subtitle}</p></div>
        <button className="signature-privacy" onClick={() => setPrivateMode(v => !v)} aria-pressed={privateMode} title={privateMode ? t.show : t.hide}>{privateMode ? <Eye size={16}/> : <EyeOff size={16}/>}<span>{privateMode ? t.show : t.hide}</span></button>
      </div>
      <div className="signature-balance-row"><div className="signature-balance-block"><small>{t.balance}</small><strong className={blur}>{accountRows.length ? money(totalBalance, activeCurrency, lang) : "—"}</strong><div className="signature-currency-switch" role="group" aria-label={lang === "ar" ? "اختيار العملة" : lang === "fr" ? "Choisir la devise" : "Choose currency"}>
        {(availableCurrencies.length ? availableCurrencies : ["DZD" as Currency]).map(c => <button key={c} className={activeCurrency === c ? "active" : ""} onClick={() => { setCurrency(c); localStorage.setItem("dinaro-signature-currency", c); }} aria-pressed={activeCurrency === c}>{c}</button>)}
      </div></div><div className="signature-hero-stats"><div><span className="signature-stat-icon income"><ArrowDownLeft size={16}/></span><small>{t.income}</small><b className={blur}>{money(income, activeCurrency, lang)}</b></div><div><span className="signature-stat-icon expense"><ArrowUpRight size={16}/></span><small>{t.expense}</small><b className={blur}>{money(expenses, activeCurrency, lang)}</b></div></div></div>
      <div className="signature-hero-footer"><span><CalendarDays size={14}/>{new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-DZ" : "en-US", { month: "long", year: "numeric" }).format(new Date())}</span><span><Activity size={14}/>{transactions.length} {t.transactions}</span><button onClick={onAddTransaction}><Plus size={15}/>{t.add}</button></div>
    </section>

    <section className="signature-section" aria-labelledby="wallet-title">
      <div className="signature-section-head"><div><span className="signature-kicker">{lang==="ar"?"01 / المحافظ":lang==="fr"?"01 / COMPTES":"01 / WALLETS"}</span><h3 id="wallet-title">{t.wallets}</h3></div><button className="signature-text-link" onClick={() => onNavigate("accounts")}>{t.allWallets}<ChevronRight size={15}/></button></div>
      {accountRows.length ? <div className="signature-wallet-grid">{accountRows.map((account, index) => <motion.article key={account.id} className={"signature-wallet-card wallet-tone-" + (index % 3)} layout {...motionProps}><div className="signature-wallet-top"><span><Wallet size={17}/></span><small>{accountKind(account.kind,lang)}</small></div><b>{account.name}</b><strong className={blur}>{money(balanceFor(account, transactions), activeCurrency, lang)}</strong><div className="signature-wallet-footer"><span>{activeCurrency}</span><CreditCard size={17}/></div></motion.article>)}</div> : <EmptyState icon={<Wallet/>} title={t.noAccounts} desc={t.noAccountsDesc} action={t.create} onClick={() => onNavigate("accounts")}/>}
    </section>

    <div className="signature-two-column">
      <section className="signature-panel" aria-labelledby="money-map-title">
        <div className="signature-section-head"><div><span className="signature-kicker">{lang==="ar"?"02 / التحليل":lang==="fr"?"02 / ANALYSE":"02 / ANALYTICS"}</span><h3 id="money-map-title">{t.map}</h3><p>{t.mapDesc}</p></div><span className="signature-panel-icon"><CircleDollarSign size={18}/></span></div>
        {categoryTotal > 0 ? <div className="signature-map-content"><div className="signature-donut-wrap"><div className="signature-donut" style={{background:"conic-gradient("+categoryRows.map((_,i)=>palette[i]+" "+(categoryRows.slice(0,i).reduce((s,x)=>s+x[1],0)/categoryTotal*100)+"% "+(categoryRows.slice(0,i+1).reduce((s,x)=>s+x[1],0)/categoryTotal*100)+"%").join(",")+")"}}><div><small>{lang === "ar" ? "المجموع" : lang === "fr" ? "Total" : "Total"}</small><b className={blur}>{money(categoryTotal, activeCurrency, lang)}</b></div></div></div><div className="signature-category-list">{categoryRows.map(([name, amount], i) => <div key={name}><i style={{background:palette[i]}}/><span>{name}</span><b className={blur}>{money(amount, activeCurrency, lang)}</b><small>{Math.round(amount/categoryTotal*100)}%</small></div>)}</div></div> : <EmptyState icon={<Activity/>} title={t.noSpend} desc="" />}
      </section>
      <section className="signature-panel" aria-labelledby="wrapped-title">
        <div className="signature-section-head"><div><span className="signature-kicker">{lang==="ar"?"03 / ملخص الشهر":lang==="fr"?"03 / BILAN DU MOIS":"03 / MONTHLY RECAP"}</span><h3 id="wrapped-title">{t.wrapped}</h3><p>{t.wrappedDesc}</p></div><span className="signature-panel-icon"><Sparkles size={18}/></span></div>
        {wrappedHasData ? <div className="signature-wrapped"><div className="signature-net"><small>{t.monthlyNet}</small><strong className={blur}>{money(monthNet, activeCurrency, lang)}</strong><span>{monthTransactions.length} {t.transactions}</span></div><div className="signature-wrapped-stats"><div><small>{t.categories}</small><b>{categoryRows.length}</b></div><div><small>{t.saved}</small><b className={blur}>{money(goalSaved, "DZD", lang)}</b></div><div><small>{t.upcoming}</small><b>{upcomingCount}</b></div></div>{topCategory&&<div className="signature-top-category"><Star size={15}/><span>{t.busiest}</span><b>{topCategory[0]}</b></div>}</div> : <EmptyState icon={<Sparkles/>} title={t.noWrapped} desc=""/>}
      </section>
    </div>

    <section className="signature-panel" aria-labelledby="budget-title">
      <div className="signature-section-head"><div><span className="signature-kicker">{lang==="ar"?"04 / ضبط الإنفاق":lang==="fr"?"04 / CONTRÔLE DES DÉPENSES":"04 / SPENDING CONTROL"}</span><h3 id="budget-title">{t.budget}</h3><p>{t.budgetDesc}</p></div><button className="signature-text-link" onClick={() => onNavigate("budget")}>{t.budget}<ChevronRight size={15}/></button></div>
      {activeBudgets.length ? <div className="signature-budget-grid">{activeBudgets.map((budget, index) => {const percent = budget.limit > 0 ? Math.round(budget.used / budget.limit * 100) : 0;return <button key={budget.id} className="signature-budget-item" onClick={() => onNavigate("budget")}><span><i className={"budget-dot dot-"+(index%4)}/><b>{budget.category}</b></span><strong className={blur}>{money(budget.used,"DZD",lang)} <small>/ {money(budget.limit,"DZD",lang)}</small></strong><div className="signature-budget-track"><i className={percent>=100?"over":""} style={{width:Math.min(100,percent)+"%"}}/></div><small className={percent>=100?"signature-over":"signature-budget-foot"}>{percent}%</small></button>})}</div> : <EmptyState icon={<Target/>} title={t.noBudget} desc="" action={t.budget} onClick={() => onNavigate("budget")}/>}
    </section>

    <section className="signature-section" aria-labelledby="goals-title">
      <div className="signature-section-head"><div><span className="signature-kicker">{lang==="ar"?"05 / الأهداف":lang==="fr"?"05 / OBJECTIFS":"05 / GOAL STUDIO"}</span><h3 id="goals-title">{t.goals}</h3></div><button className="signature-text-link" onClick={() => onNavigate("goals")}>{t.allGoals}<ChevronRight size={15}/></button></div>
      {goals.length ? <div className="signature-goal-grid">{goals.slice(0,3).map(goal => {const progress = goal.target > 0 ? Math.min(100,Math.round(goal.saved/goal.target*100)) : 0;const tier = progress>=100?4:progress>=75?3:progress>=50?2:progress>=25?1:0;return <motion.article key={goal.id} className={"signature-goal-card goal-tier-"+tier} layout {...motionProps}><div className="signature-goal-top"><span><Target size={17}/></span><small>{t.tier[tier]}</small></div><b>{goal.title}</b><strong className={blur}>{money(goal.saved,"DZD",lang)} <small>/ {money(goal.target,"DZD",lang)}</small></strong><div className="signature-goal-track"><i style={{width:progress+"%"}}/></div><div className="signature-goal-bottom"><span>{progress}%</span><small>{t.due}: {goal.due || "—"}</small></div>{tier>0&&<div className="signature-goal-unlock"><Sparkles size={13}/>{t.unlocked}</div>}</motion.article>})}</div> : <EmptyState icon={<Target/>} title={t.noGoals} desc={t.noGoalsDesc} action={t.createGoal} onClick={() => onNavigate("goals")}/>}
    </section>

    <div className="signature-two-column">
      <section className="signature-panel" aria-labelledby="activity-title">
        <div className="signature-section-head"><div><span className="signature-kicker">{lang==="ar"?"06 / النشاط":lang==="fr"?"06 / ACTIVITÉ":"06 / ACTIVITY"}</span><h3 id="activity-title">{t.activity}</h3></div><button className="signature-text-link" onClick={() => onNavigate("transactions")}>{t.allActivity}<ChevronRight size={15}/></button></div>
        {recent.length ? <div className="signature-activity-list">{recent.map(tx => <div className="signature-activity-row" key={tx.id}><span className={"signature-activity-icon "+tx.type}>{tx.type==="income"?<ArrowDownLeft size={16}/>:tx.type==="expense"?<ArrowUpRight size={16}/>:<Activity size={16}/>}</span><div><b>{tx.title || tx.category}</b><small>{tx.category} · {tx.date}</small></div><strong className={blur+" "+(tx.type==="income"?"positive":"")}>{tx.type==="income"?"+":tx.type==="expense"?"−":"↔"} {money(tx.amount,tx.currency||"DZD",lang)}</strong></div>)}</div> : <EmptyState icon={<ReceiptText/>} title={t.noActivity} desc={t.noActivityDesc} action={t.add} onClick={onAddTransaction}/>}
      </section>
      <section className="signature-panel" aria-labelledby="journey-title">
        <div className="signature-section-head"><div><span className="signature-kicker">{lang==="ar"?"07 / رحلتك":lang==="fr"?"07 / VOTRE PARCOURS":"07 / YOUR JOURNEY"}</span><h3 id="journey-title">{t.journey}</h3><p>{t.journeyDesc}</p></div><span className="signature-panel-icon"><Zap size={18}/></span></div>
        <div className="signature-journey-progress"><strong>{journeyProgress}%</strong><div><i style={{width:journeyProgress+"%"}}/></div></div>
        <div className="signature-stage-list">{t.stages.map((stage,i)=><div key={stage} className={journey[i]?"complete":""}><span>{journey[i]?<Check size={13}/>:i+1}</span><b>{stage}</b></div>)}</div>
        <div className="signature-next-step"><small>{t.focus}</small><b>{nextStep}</b></div>
      </section>
    </div>

    <p className="signature-footnote"><Sparkles size={13}/>{t.tip}</p>
  </div>;
}


export function AchievementGallery({lang,accounts,transactions,goals}:{lang:Lang;accounts:Account[];transactions:Tx[];goals:Goal[]}) {
  const t=text[lang];
  const achievements=[
    accounts.length>0,transactions.length>0,goals.length>0,transactions.length>=10,
    goals.some(g=>g.target>0&&g.saved/g.target>=.5),goals.some(g=>g.target>0&&g.saved>=g.target)
  ];
  return <section className="signature-panel signature-profile-achievements" aria-labelledby="profile-achievements-title">
    <div className="signature-section-head"><div><span className="signature-kicker">DINARO+ / {lang === "ar" ? "الإنجازات" : lang === "fr" ? "RÉUSSITES" : "MILESTONES"}</span><h3 id="profile-achievements-title">{t.achievements}</h3></div><span className="signature-panel-icon"><Trophy size={18}/></span></div>
    <div className="signature-achievement-grid">{achievements.map((unlocked,i)=><article key={i} className={"signature-achievement "+(unlocked?"unlocked":"locked")}><span>{unlocked?<Trophy size={19}/>:<LockKeyhole size={18}/>}</span><div><b>{t.achievementsNames[i]}</b><small>{t.achievementsDesc[i]}</small><em>{unlocked?t.unlocked:t.locked}</em></div></article>)}</div>
  </section>;
}

function EmptyState({icon,title,desc,action,onClick}:{icon:React.ReactNode;title:string;desc:string;action?:string;onClick?:()=>void}) {
  return <div className="signature-empty"><span>{icon}</span><b>{title}</b>{desc&&<p>{desc}</p>}{action&&onClick&&<button onClick={onClick}><Plus size={14}/>{action}</button>}</div>;
}
