import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpLeft, BookOpen, Command, Compass, Lightbulb, Palette, Plus, Sparkles, CheckCircle2 } from "lucide-react";

type Lang = "ar" | "en" | "fr";
type Tx = { id:string; title:string; category:string; date:string; amount:number; type:"income"|"expense"|"transfer"; accountId:string; currency?:string };
type Goal = { id:string; title:string; target:number; saved:number; due:string };
type Account = { id:string; name:string };
type Bill = { id:string; title:string; due:string; paid:boolean };
type Props = { lang:Lang; transactions:Tx[]; goals:Goal[]; accounts:Account[]; bills:Bill[]; onAdd:(type:"expense"|"income"|"transfer")=>void; onNavigate:(page:string)=>void };
const copy = {
 ar:{eyebrow:"DINARO+ · تجربة أسهل",title:"ابدأ بخطوة واحدة",expense:"مصروف",income:"دخل",transfer:"تحويل",suggestions:"اقتراحات مناسبة الآن",command:"مركز الأوامر السريع",commandHint:"اكتب: مصروف، دخل، حسابات، ميزانية، أهداف، تقارير، فواتير أو Scan",run:"تنفيذ",journey:"رحلتك المالية",journeyDesc:"تقدم تدريجي مبني على خطواتك الفعلية، دون نقاط أو ضغط.",progress:"تقدم الرحلة",guide:"مساعدة في الوقت المناسب",term:"التدفق النقدي",definition:"هو حركة الأموال الداخلة والخارجة خلال فترة محددة.",example:"مثال: الراتب تدفق داخل، وفاتورة الكهرباء تدفق خارج.",themes:"تخصيص المظهر",celebrate:"إنجاز جديد!",celebrateDesc:"أكملت خطوة مهمة في رحلتك المالية. استمر بالوتيرة المناسبة لك.",createAccount:"ابدأ بإضافة حساب حتى تتمكن من تسجيل أموالك.",firstTransaction:"سجّل أول دخل أو مصروف لتكوين صورة أوضح.",reviewBill:"لديك التزام قريب؛ راجع موعده قبل تسجيل مصروف جديد.",startGoal:"أنشئ هدف ادخار بسيطاً لمتابعة تقدمك.",allSet:"أنت على المسار الصحيح. راجع معاملاتك أو حدّث هدفاً عند الحاجة.",adaptive:"الأقسام التي تستخدمها كثيراً",milestones:"مراحل الرحلة",stepAccount:"إضافة حساب",stepTransaction:"أول معاملة",stepGoal:"إنشاء هدف",stepHabit:"10 معاملات مسجلة",noSuggestion:"لا توجد اقتراحات إضافية الآن."},
 en:{eyebrow:"DINARO+ · EASIER BY DESIGN",title:"Take one simple step",expense:"Expense",income:"Income",transfer:"Transfer",suggestions:"Useful suggestions",command:"Quick command center",commandHint:"Type: expense, income, accounts, budget, goals, reports, bills or scan",run:"Go",journey:"Your financial journey",journeyDesc:"Progress is based on real steps, without points or pressure.",progress:"Journey progress",guide:"Helpful guidance",term:"Cash flow",definition:"The money moving into and out of your finances over a period of time.",example:"Example: salary is money in; an electricity bill is money out.",themes:"Personalize appearance",celebrate:"New milestone!",celebrateDesc:"You completed an important step in your financial journey.",createAccount:"Add an account to start recording where your money is kept.",firstTransaction:"Record your first income or expense to build a clearer picture.",reviewBill:"You have an upcoming commitment. Review its due date before adding a new expense.",startGoal:"Create a simple savings goal to track your progress.",allSet:"You are on track. Review a transaction or update a goal whenever useful.",adaptive:"Your frequently used sections",milestones:"Journey milestones",stepAccount:"Add an account",stepTransaction:"First transaction",stepGoal:"Create a goal",stepHabit:"Record 10 transactions",noSuggestion:"No additional suggestions right now."},
 fr:{eyebrow:"DINARO+ · PLUS SIMPLE",title:"Une étape à la fois",expense:"Dépense",income:"Revenu",transfer:"Virement",suggestions:"Suggestions utiles",command:"Centre de commandes",commandHint:"Saisissez : dépense, revenu, comptes, budget, objectifs, rapports, factures ou scan",run:"Ouvrir",journey:"Votre parcours financier",journeyDesc:"Une progression fondée sur vos actions réelles, sans pression.",progress:"Progression",guide:"Aide contextuelle",term:"Flux de trésorerie",definition:"Les entrées et sorties d'argent pendant une période donnée.",example:"Exemple : le salaire est une entrée, la facture d'électricité une sortie.",themes:"Personnaliser l'apparence",celebrate:"Nouvelle étape !",celebrateDesc:"Vous avez franchi une étape importante de votre parcours financier.",createAccount:"Ajoutez un compte pour commencer à suivre votre argent.",firstTransaction:"Enregistrez votre première opération pour mieux comprendre vos finances.",reviewBill:"Une échéance approche. Vérifiez sa date avant d'ajouter une dépense.",startGoal:"Créez un objectif d'épargne simple pour suivre vos progrès.",allSet:"Vous êtes sur la bonne voie. Consultez vos opérations ou actualisez un objectif.",adaptive:"Vos sections les plus utilisées",milestones:"Étapes du parcours",stepAccount:"Ajouter un compte",stepTransaction:"Première opération",stepGoal:"Créer un objectif",stepHabit:"Enregistrer 10 opérations",noSuggestion:"Aucune suggestion supplémentaire."}
};
const glossary:Record<string,Record<Lang,{label:string;definition:string;example:string}>>={
 cashflow:{ar:{label:"التدفق النقدي",definition:"حركة الأموال الداخلة والخارجة خلال فترة محددة.",example:"الراتب تدفق داخل، وفاتورة الكهرباء تدفق خارج."},en:{label:"Cash flow",definition:"Money moving into and out of your finances over a period.",example:"Salary is money in; an electricity bill is money out."},fr:{label:"Flux de trésorerie",definition:"Les entrées et sorties d'argent pendant une période.",example:"Le salaire est une entrée ; une facture est une sortie."}},
 budget:{ar:{label:"الميزانية",definition:"خطة توزع دخلك على الاحتياجات والادخار والمصاريف الأخرى.",example:"تحدد مبلغاً للطعام وآخر للفواتير والادخار."},en:{label:"Budget",definition:"A plan for allocating income to needs, savings and other spending.",example:"You set separate amounts for food, bills and savings."},fr:{label:"Budget",definition:"Un plan qui répartit vos revenus entre besoins et épargne.",example:"Vous prévoyez des montants pour l'alimentation, les factures et l'épargne."}},
 emergency:{ar:{label:"صندوق الطوارئ",definition:"مدخرات مخصصة للمصاريف الضرورية غير المتوقعة.",example:"إصلاح ضروري أو ظرف طارئ، بعيداً عن ميزانية الترفيه."},en:{label:"Emergency fund",definition:"Savings reserved for necessary unexpected costs.",example:"A necessary repair or urgent expense, separate from entertainment spending."},fr:{label:"Fonds d'urgence",definition:"Une épargne réservée aux dépenses nécessaires et imprévues.",example:"Une réparation urgente, distincte du budget loisirs."}},
 debt:{ar:{label:"الدين",definition:"مبلغ يجب سداده لشخص أو جهة وفق اتفاق.",example:"إذا اقترضت 10,000 دج، فهذا مبلغ عليك إرجاعه."},en:{label:"Debt",definition:"Money you owe and are expected to repay under an agreement.",example:"If you borrow 10,000 DZD, you are expected to repay it."},fr:{label:"Dette",definition:"Une somme que vous devez rembourser selon un accord.",example:"Si vous empruntez 10 000 DZD, vous devez les rembourser."}},
 networth:{ar:{label:"صافي الثروة",definition:"قيمة ما تملكه ناقص ما عليك من ديون.",example:"الأرصدة المسجلة ناقص الديون المسجلة، مع فصل العملات."},en:{label:"Net worth",definition:"The value of what you own minus what you owe.",example:"Recorded account balances minus recorded debts, keeping currencies separate."},fr:{label:"Patrimoine net",definition:"La valeur de vos avoirs moins vos dettes.",example:"Soldes enregistrés moins dettes enregistrées, par devise."}}
};
const routeWords:[string,string[]][]=[
 ["expense",["مصروف","مصاريف","expense","dépense"]],
 ["income",["دخل","راتب","income","revenu"]],
 ["accounts",["حساب","accounts","comptes"]],
 ["budget",["ميزانية","ميزانيتي","budget"]],
 ["goals",["هدف","أهداف","ادخار","goal","objectif"]],
 ["reports",["تقرير","تقارير","report","rapport"]],
 ["bills",["فاتورة","فواتير","التزامات","bill","facture"]],
 ["scan",["مسح","scan"]],
 ["transactions",["معاملات","سجل","transactions"]],
 ["academy",["تعلم","أكاديمية","academy","apprendre"]],
 ["evolution",["تخصيص","مظهر","theme","thème","personalization"]]
];
export default function EffortlessExperience({lang,transactions,goals,accounts,bills,onAdd,onNavigate}:Props){
 const t=copy[lang];
 const today=new Date().toISOString().slice(0,10);
 const upcomingBills=bills.filter(b=>!b.paid&&b.due>=today).sort((a,b)=>a.due.localeCompare(b.due));
 const [command,setCommand]=useState("");
 const [termKey,setTermKey]=useState("cashflow");
 const [newMilestone,setNewMilestone]=useState(false);
 const termInfo=glossary[termKey][lang];
 const completedIds=goals.filter(g=>g.target>0&&g.saved>=g.target).map(g=>g.id);
 const [seenCompleted,setSeenCompleted]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem("dinaro-celebrated-goals")||"[]") as string[]}catch{return []}});
 useEffect(()=>{
   const fresh=completedIds.filter(id=>!seenCompleted.includes(id));
   if(fresh.length){setNewMilestone(true);setSeenCompleted(old=>[...old,...fresh]);localStorage.setItem("dinaro-celebrated-goals",JSON.stringify([...seenCompleted,...fresh]));}
 },[completedIds.join("|")]);
 const suggestion=accounts.length===0?t.createAccount:transactions.length===0?t.firstTransaction:upcomingBills.length>0?t.reviewBill:goals.length===0?t.startGoal:t.allSet;
 const usage=useMemo(()=>{try{return JSON.parse(localStorage.getItem("dinaro-page-usage")||"{}") as Record<string,number>}catch{return {}}},[transactions.length,goals.length,accounts.length]);
 const routeLabels:Record<string,string>={accounts:lang==="ar"?"الحسابات":lang==="fr"?"Comptes":"Accounts",budget:lang==="ar"?"الميزانية":lang==="fr"?"Budget":"Budget",goals:lang==="ar"?"الأهداف":lang==="fr"?"Objectifs":"Goals",reports:lang==="ar"?"التقارير":lang==="fr"?"Rapports":"Reports",transactions:lang==="ar"?"المعاملات":lang==="fr"?"Transactions":"Transactions",spending:lang==="ar"?"تحليل المصروفات":lang==="fr"?"Dépenses":"Spending",academy:lang==="ar"?"الأكاديمية":lang==="fr"?"Académie":"Academy"};
 const frequent=Object.entries(usage).filter(([key])=>routeLabels[key]).sort((a,b)=>b[1]-a[1]).slice(0,3);
 const milestones=[{id:"account",done:accounts.length>0,label:t.stepAccount},{id:"transaction",done:transactions.length>0,label:t.stepTransaction},{id:"goal",done:goals.length>0,label:t.stepGoal},{id:"habit",done:transactions.length>=10,label:t.stepHabit}];
 const journeyProgress=Math.round(milestones.filter(x=>x.done).length/milestones.length*100);
 const runCommand=()=>{const q=command.trim().toLocaleLowerCase();if(!q)return;for(const [target,words] of routeWords){if(words.some(w=>q.includes(w))){if(target==="expense"||target==="income")onAdd(target);else onNavigate(target);setCommand("");return}}onNavigate("search");setCommand("");};
 return <section className="effortless-shell">
  <div className="effortless-head"><div><span>{t.eyebrow}</span><h2>{t.title}</h2></div><button onClick={()=>onNavigate("evolution")}><Palette size={15}/>{t.themes}</button></div>
  <div className="effortless-actions">
   <button onClick={()=>onAdd("expense")}><ArrowUpLeft/><b>{t.expense}</b></button><button onClick={()=>onAdd("income")}><ArrowDownLeft/><b>{t.income}</b></button><button onClick={()=>onAdd("transfer")}><Plus/><b>{t.transfer}</b></button>
  </div>
  <div className="effortless-grid">
   <article className="effortless-card"><header><Lightbulb size={17}/><b>{t.suggestions}</b></header><p>{suggestion}</p><small className="effortless-data-hint">{transactions.length} {lang==="ar"?"معاملة":lang==="fr"?"opérations":"transactions"} · {accounts.length} {lang==="ar"?"حسابات":lang==="fr"?"comptes":"accounts"}</small>{frequent.length>0&&<div className="effortless-recent"><small>{t.adaptive}</small>{frequent.map(([key])=><button key={key} onClick={()=>onNavigate(key)}>{routeLabels[key]}</button>)}</div>}</article>
   <article className="effortless-card"><header><Command size={17}/><b>{t.command}</b></header><div className="effortless-command"><input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")runCommand()}} placeholder={t.commandHint}/><button onClick={runCommand}>{t.run}</button></div></article>
   <article className="effortless-card"><header><Compass size={17}/><b>{t.journey}</b></header><p>{t.journeyDesc}</p><div className="effortless-progress"><i style={{width:journeyProgress+"%"}}/></div><small>{t.progress}: {journeyProgress}%</small><div className="effortless-milestones">{milestones.map(m=><span className={m.done?"done":""} key={m.id}>{m.done?<CheckCircle2 size={12}/>:<span className="milestone-dot"/>}{m.label}</span>)}</div>{newMilestone&&<div className="effortless-celebration"><Sparkles size={15}/><div><b>{t.celebrate}</b><small>{t.celebrateDesc}</small></div><button onClick={()=>setNewMilestone(false)} aria-label="Close">×</button></div>}</article>
   <article className="effortless-card"><header><BookOpen size={17}/><b>{t.guide}</b></header><select className="effortless-glossary-select" value={termKey} onChange={e=>setTermKey(e.target.value)}>{Object.entries(glossary).map(([key,translations])=><option key={key} value={key}>{translations[lang].label}</option>)}</select><p>{termInfo.definition}</p><small className="effortless-data-hint">{termInfo.example}</small></article>
  </div>
 </section>;
}
