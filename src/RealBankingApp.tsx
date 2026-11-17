import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {
  ArrowDownLeft,ArrowLeftRight,ArrowUpRight,BarChart3,CheckCircle2,ChevronLeft,
  Download,Eye,EyeOff,Home,LockKeyhole,LogOut,Plus,RefreshCw,
  ShieldCheck,Target,Wallet,AlertCircle
} from 'lucide-react';
import {formatDzdMinor,parseDzdMinor} from './domain/ledger';
import {localApi,LocalApiError} from './features/wallet/api';
import type {ManualAccount,ManualEntry,ManualUser} from './features/wallet/api';
import './real-banking.css';

type Page='home'|'accounts'|'transactions'|'goals'|'budgets';
type Status='loading'|'guest'|'ready'|'offline';
type Goal={id:string;name:string;accountId:string;targetMinor:string;savedMinor:string;createdAt:string};
type Budget={category:string;limitMinor:string};
type Kind='income'|'expense'|'transfer';
type TxResponse={transactions:ManualEntry[];nextCursor:string|null};
type AuthForm={email:string;password:string;confirm:string};
type TransactionForm={kind:Kind;fromAccountId:string;toAccountId:string;amount:string};
const NAV=[{id:'home',title:'الرئيسية',Icon:Home},{id:'accounts',title:'الحسابات',Icon:Wallet},
  {id:'transactions',title:'المعاملات',Icon:ArrowLeftRight},{id:'goals',title:'الأهداف',Icon:Target},
  {id:'budgets',title:'الميزانية',Icon:BarChart3}] as const;
const CATEGORIES=['الطعام','التسوق','الفواتير','النقل','الصحة','التعليم','الترفيه','أخرى'];
const fmt=(value:string|bigint)=>formatDzdMinor(BigInt(value));
const amount=(raw:string,allowZero=false)=>allowZero&&raw.trim()==='0'?'0':parseDzdMinor(raw).toString();
const errorText=(err:unknown)=>err instanceof LocalApiError
  ?err.status===401?'انتهت الجلسة. سجّل الدخول مجددًا.':err.message
  :err instanceof Error?err.message:'حدث خطأ. حاول مجددًا.';
function exportJson(value:unknown,name:string){
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export default function RealBankingApp(){
  const [status,setStatus]=useState<Status>('loading');
  const [user,setUser]=useState<ManualUser|null>(null);
  const [page,setPage]=useState<Page>('home');
  const [accounts,setAccounts]=useState<ManualAccount[]>([]);
  const [transactions,setTransactions]=useState<ManualEntry[]>([]);
  const [cursor,setCursor]=useState<string|null>(null);
  const [goals,setGoals]=useState<Goal[]>([]);
  const [budgets,setBudgets]=useState<Budget[]>([]);
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [credentials,setCredentials]=useState<AuthForm>({email:'',password:'',confirm:''});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [hide,setHide]=useState(false);
  const [formType,setFormType]=useState<'account'|'transaction'|'goal'|'budget'|'contribution'|'withdrawal'|null>(null);
  const [accountName,setAccountName]=useState('');const [opening,setOpening]=useState('0');
  const [goalTitle,setGoalTitle]=useState('');const [goalTarget,setGoalTarget]=useState('');
  const [goalId,setGoalId]=useState('');const [category,setCategory]=useState(CATEGORIES[0]);
  const [limit,setLimit]=useState('0');
  const [tx,setTx]=useState<TransactionForm>({kind:'expense',fromAccountId:'',toAccountId:'',amount:''});
  const requestId=useRef<string|null>(null);
  const refresh=useCallback(async()=>{
    const [a,t,g,b]=await Promise.all([
      localApi<{accounts:ManualAccount[]}>('/api/accounts'),
      localApi<TxResponse>('/api/transactions?limit=50'),
      localApi<{goals:Goal[]}>('/api/goals'),
      localApi<{budgets:Budget[]}>('/api/budgets')
    ]);
    setAccounts(a.accounts);setTransactions(t.transactions);setCursor(t.nextCursor);
    setGoals(g.goals);setBudgets(b.budgets);
  },[]);
  useEffect(()=>{
    let live=true;
    (async()=>{
      try{
        const session=await localApi<{user:ManualUser}>('/api/me');
        if(!live)return;
        await refresh();
        if(live){setUser(session.user);setStatus('ready');}
      }catch(e){if(live)setStatus(e instanceof LocalApiError&&e.status===401?'guest':'offline');}
    })();
    return()=>{live=false;};
  },[refresh]);
  const goalAccounts=useMemo(()=>new Set(goals.map(g=>g.accountId)),[goals]);
  const wallets=useMemo(()=>accounts.filter(a=>!goalAccounts.has(a.id)),[accounts,goalAccounts]);
  const balance=useMemo(()=>wallets.reduce((s,a)=>s+BigInt(a.balanceMinor),0n),[wallets]);
  const saved=useMemo(()=>goals.reduce((s,g)=>s+BigInt(g.savedMinor),0n),[goals]);
  const sumBalance=balance+saved;
  const shown=(v:string|bigint)=>hide?'••••••':fmt(v);
  async function authenticate(ev:FormEvent){
    ev.preventDefault();if(busy)return;
    if(mode==='register'&&credentials.password!==credentials.confirm){setMessage('كلمتا المرور غير متطابقتين.');return;}
    setBusy(true);setMessage('');
    try{
      const data=await localApi<{user:ManualUser}>(mode==='register'?'/api/auth/register':'/api/auth/login',{
        email:credentials.email,password:credentials.password
      });
      await refresh();setUser(data.user);setStatus('ready');setCredentials(c=>({...c,password:'',confirm:''}));
    }catch(e){setCredentials(c=>({...c,password:'',confirm:''}));setMessage(errorText(e));}
    finally{setBusy(false);}
  }
  async function logout(){
    setBusy(true);setMessage('');
    try{await localApi('/api/auth/logout',{});
      setUser(null);setAccounts([]);setGoals([]);setTransactions([]);setBudgets([]);setCursor(null);
      setStatus('guest');setPage('home');setFormType(null);
    }catch(e){setMessage(errorText(e));}finally{setBusy(false);}
  }
  function openForm(type:NonNullable<typeof formType>,forGoal=''){
    requestId.current=null;setMessage('');setFormType(type);setGoalId(forGoal);
    setTx({kind:'expense',fromAccountId:wallets[0]?.id??'',toAccountId:wallets[1]?.id??'',amount:''});
    setGoalTitle('');setGoalTarget('');setAccountName('');setOpening('0');setLimit('0');
  }
  const key=()=>requestId.current??(requestId.current=crypto.randomUUID());
  async function submit(ev:FormEvent){
    ev.preventDefault();if(busy||!formType)return;
    setBusy(true);setMessage('');
    try{
      switch(formType){
        case 'account':{
          await localApi('/api/accounts',{name:accountName.trim(),openingMinor:amount(opening,true),requestId:key()});break;
        }
        case 'goal':{
          await localApi('/api/goals',{name:goalTitle.trim(),targetMinor:amount(goalTarget),requestId:key()});break;
        }
        case 'budget':{
          await localApi('/api/budgets',{category,limitMinor:amount(limit,true)});break;
        }
        case 'transaction':{
          const from=tx.kind==='income'?null:tx.fromAccountId;
          const to=tx.kind==='expense'?null:tx.kind==='income'?tx.fromAccountId:tx.toAccountId;
          if(!tx.fromAccountId||(tx.kind==='transfer'&&(!to||from===to)))throw new Error('اختر حسابين مختلفين للتحويل.');
          await localApi('/api/transactions',{
            kind:tx.kind,fromAccountId:from,toAccountId:to,amountMinor:amount(tx.amount),requestId:key()
          });break;
        }
        case 'contribution':case 'withdrawal':{
          const goal=goals.find(g=>g.id===goalId);
          if(!goal||!tx.fromAccountId||goal.accountId===tx.fromAccountId)throw new Error('اختر محفظة مصدر صالحة.');
          await localApi('/api/transactions',{
            kind:'transfer',fromAccountId:formType==='contribution'?tx.fromAccountId:goal.accountId,
            toAccountId:formType==='contribution'?goal.accountId:tx.fromAccountId,
            amountMinor:amount(tx.amount),requestId:key()
          });break;
        }
      }
      await refresh();requestId.current=null;setFormType(null);setMessage('تم حفظ العملية في قاعدة البيانات بنجاح.');
    }catch(e){setMessage(errorText(e));}
    finally{setBusy(false);}
  }
  async function loadMore(){if(!cursor||busy)return;
    setBusy(true);setMessage('');
    try{const result=await localApi<TxResponse>('/api/transactions?limit=50&cursor='+encodeURIComponent(cursor));
      setTransactions(prev=>[...prev,...result.transactions.filter(t=>!prev.some(p=>p.id===t.id))]);setCursor(result.nextCursor);
    }catch(e){setMessage(errorText(e));}finally{setBusy(false);}
  }
  async function exportLedger(){setBusy(true);setMessage('');
    try{const result=await localApi<unknown>('/api/export');exportJson(result,'DINARO-ledger-'+new Date().toISOString().slice(0,10)+'.json');}
    catch(e){setMessage(errorText(e));}finally{setBusy(false);}
  }
  if(status==='loading')return <div className="real-splash" dir="rtl" role="status"><span className="real-mark">D+</span>جارٍ التحقق من جلستك...</div>;
  if(status==='offline')return <div className="real-splash" dir="rtl"><span className="real-mark">D+</span><h1>الخادم غير متصل</h1>
    <p>لتشغيل حسابات DINARO+ المحلية، افتح نافذتين PowerShell وشغّل <code>npm run dev:api</code> ثم <code>npm run dev</code>.</p>
    <button onClick={()=>window.location.reload()}>إعادة المحاولة</button><p className="real-small">هذه المرحلة تعمل محليًا فقط وليست منشورة على الإنترنت.</p></div>;
  if(status==='guest')return <div className="real-auth" dir="rtl"><div className="real-auth-card">
    <div className="real-auth-brand"><span className="real-mark">D+</span><strong>DINARO+</strong></div>
    <span className="real-overline"><LockKeyhole size={15}/> مساحة مالية شخصية محفوظة</span>
    <h1>{mode==='register'?'أنشئ حساب DINARO+':'مرحبًا بعودتك'}</h1>
    <p>{mode==='register'?'ابدأ بإدارة محافظك وأهدافك وسجلاتك المحفوظة في قاعدة بيانات جهازك.':'ادخل إلى حسابك لمتابعة أموالك المسجلة وعملياتك المحفوظة.'}</p>
    <form className="real-form" onSubmit={authenticate}>
      <label htmlFor="auth-email">البريد الإلكتروني</label><input id="auth-email" required type="email" autoComplete="email" maxLength={254} value={credentials.email} onChange={e=>setCredentials(c=>({...c,email:e.target.value}))}/>
      <label htmlFor="auth-password">كلمة المرور — 12 حرفًا على الأقل</label><input id="auth-password" required type="password" minLength={12} maxLength={256} autoComplete={mode==='register'?'new-password':'current-password'} value={credentials.password} onChange={e=>setCredentials(c=>({...c,password:e.target.value}))}/>
      {mode==='register'&&<><label htmlFor="auth-confirm">تأكيد كلمة المرور</label><input id="auth-confirm" required type="password" minLength={12} autoComplete="new-password" value={credentials.confirm} onChange={e=>setCredentials(c=>({...c,confirm:e.target.value}))}/></>}
      <button type="submit" disabled={busy}>{busy?'جارٍ التحقق...':mode==='register'?'إنشاء حساب':'تسجيل الدخول'}<ChevronLeft size={18}/></button>
    </form>
    {message&&<p className="real-alert" role="alert"><AlertCircle size={17}/>{message}</p>}
    <button className="real-switch" type="button" onClick={()=>{setMode(mode==='register'?'login':'register');setMessage('');setCredentials(c=>({...c,password:'',confirm:''}));}}>
      {mode==='register'?'لديك حساب؟ سجّل الدخول':'ليس لديك حساب؟ أنشئ واحدًا'}
    </button>
    <p className="real-caution"><ShieldCheck size={17}/> حسابات فعلية محفوظة في SQLite على جهازك فقط. ليست خدمة سحابية ولا حسابات بنكية، ولا تدخل بيانات بنكية حساسة.</p>
  </div></div>;
  const accountNames=new Map(accounts.map(a=>[a.id,a.name]));
  return <div className="real-app" dir="rtl">
    <aside className="real-side"><div className="real-brand"><span className="real-mark">D+</span><div><strong>DINARO+</strong><small>YOUR MONEY. YOUR FUTURE.</small></div></div>
      <p className="real-side-title">إدارة الأموال</p><nav aria-label="أقسام التطبيق">{NAV.map(({id,title,Icon})=><button type="button" key={id} aria-current={page===id?'page':undefined} className={page===id?'selected':''} onClick={()=>{setPage(id);setMessage('');}}><Icon size={21} strokeWidth={1.65}/>{title}</button>)}</nav>
      <div className="real-side-bottom"><ShieldCheck size={18}/><span>المبالغ محفوظة على جهازك. لا اتصال بالبنوك.</span></div></aside>
    <div className="real-main"><header className="real-top"><div><span className="real-overline">DINARO+ PERSONAL FINANCE</span><strong>{NAV.find(x=>x.id===page)?.title}</strong></div>
      <div className="real-user"><button type="button" aria-label={hide?'إظهار الأرصدة':'إخفاء الأرصدة'} onClick={()=>setHide(x=>!x)}>{hide?<EyeOff size={19}/>:<Eye size={19}/>}</button><span className="real-user-email">{user?.email}</span><button type="button" onClick={logout} disabled={busy} aria-label="تسجيل الخروج"><LogOut size={19}/></button></div></header>
      <main className="real-content"><div className="real-notice"><ShieldCheck size={17}/> بيانات الحسابات والمعاملات من SQLite فعلًا. الأرصدة مدخلة يدويًا ولا تمثل أرصدة حسابات بنكية.</div>
        {message&&<p className="real-alert" role="status">{message}</p>}
        {page==='home'&&<>
          <div className="real-welcome"><div><span className="real-overline">مساحتك الشخصية</span><h1>أموالك، مستقبلك.</h1><p>نظرة موحّدة على أرصدتك المحفوظة وأهدافك المالية.</p></div><button className="real-primary" type="button" onClick={()=>openForm('transaction')} disabled={!wallets.length}><Plus size={18}/> عملية جديدة</button></div>
          <section className="real-hero"><div className="real-hero-label"><Wallet size={18}/> إجمالي أموالك المسجلة</div><strong>{shown(sumBalance)}</strong><div className="real-hero-bottom"><span>متاح بالمحافظ: {shown(balance)}</span><span>مخصص للأهداف: {shown(saved)}</span></div></section>
          <div className="real-kpis"><div><span>المحافظ</span><strong>{wallets.length}</strong></div><div><span>الأهداف</span><strong>{goals.length}</strong></div><div><span>المعاملات الظاهرة</span><strong>{transactions.length}{cursor?'+':''}</strong></div></div>
          <section className="real-panel"><div className="real-section-head"><h2>أهدافي المالية</h2><button onClick={()=>setPage('goals')}>عرض الكل <ChevronLeft size={17}/></button></div>{goals.length?<div className="real-goals-grid">{goals.slice(0,3).map(g=><GoalCard key={g.id} g={g} shown={shown} onFund={()=>openForm('contribution',g.id)}/>)}</div>:<div className="real-empty">لم تضف أهدافًا بعد. <button onClick={()=>openForm('goal')}>أنشئ هدفك الأول</button></div>}</section>
          <section className="real-panel"><div className="real-section-head"><h2>آخر المعاملات</h2><button onClick={()=>setPage('transactions')}>عرض السجل <ChevronLeft size={17}/></button></div><EntryList entries={transactions.slice(0,5)} shown={shown} names={accountNames}/></section>
        </>}
        {page==='accounts'&&<section className="real-panel"><div className="real-section-head"><div><h1>حساباتي ومحافظي</h1><p>محافظ شخصية مستقلة، أرصدتها مشتقة من القيود المحاسبية.</p></div><button className="real-primary" onClick={()=>openForm('account')}><Plus size={17}/> محفظة</button></div><div className="real-goals-grid">{wallets.map(a=><div className="real-wallet" key={a.id}><Wallet size={23}/><span>{a.name}</span><strong>{shown(a.balanceMinor)}</strong></div>)}</div>{!wallets.length&&<div className="real-empty">أنشئ محفظتك الأولى لبدء التسجيل.</div>}</section>}
        {page==='transactions'&&<section className="real-panel"><div className="real-section-head"><div><h1>سجل المعاملات</h1><p>كل عملية من حسابك المحفوظ، مع تصفح السجل الأقدم.</p></div><button className="real-primary" onClick={()=>openForm('transaction')} disabled={!wallets.length}><Plus size={17}/> معاملة</button></div><EntryList entries={transactions} shown={shown} names={accountNames}/>{cursor&&<button className="real-more" disabled={busy} onClick={loadMore}><RefreshCw size={16}/> تحميل معاملات أقدم</button>}</section>}
        {page==='goals'&&<section className="real-panel"><div className="real-section-head"><div><h1>أهدافي المالية</h1><p>كل هدف مربوط بمحفظة ادخار منفصلة داخل دفتر الحسابات.</p></div><button className="real-primary" onClick={()=>openForm('goal')}><Plus size={17}/> هدف جديد</button></div><div className="real-goals-grid">{goals.map(g=><GoalCard key={g.id} g={g} shown={shown} onFund={()=>openForm('contribution',g.id)} onWithdraw={()=>openForm('withdrawal',g.id)}/>)}</div>{!goals.length&&<div className="real-empty">لا توجد أهداف محفوظة بعد.</div>}</section>}
        {page==='budgets'&&<section className="real-panel"><div className="real-section-head"><div><h1>الميزانية</h1><p>سقوف الإنفاق تحفظها قاعدة البيانات لكل مستخدم على حدة.</p></div><button className="real-primary" onClick={()=>openForm('budget')}><Plus size={17}/> حد جديد</button></div>{budgets.length?budgets.map(b=><div className="real-budget" key={b.category}><strong>{b.category}</strong><span>{shown(b.limitMinor)}</span><button onClick={()=>{openForm('budget');setCategory(b.category);setLimit((BigInt(b.limitMinor)/100n).toString());}}>تعديل</button></div>):<div className="real-empty">لم تحدد ميزانية بعد.</div>}<p className="real-small">الحدود محفوظة. ربطها بتصنيفات مصاريف فعلية يستلزم إضافة التصنيف لكل قيد مالي في الخادم.</p></section>}
        <footer className="real-footer"><span>© 2026 DINARO+ · إدارة مالية شخصية</span><button type="button" onClick={exportLedger} disabled={busy}><Download size={16}/> تصدير السجل المحاسبي</button><span>بيئة تطوير محلية · غير بنكية</span></footer>
      </main>
      <nav className="real-mobile-nav" aria-label="أقسام التطبيق على الهاتف">{NAV.map(({id,title,Icon})=><button key={id} className={page===id?'selected':''} onClick={()=>{setPage(id);setMessage('');}}><Icon size={21} strokeWidth={1.55}/><span>{title}</span></button>)}</nav>
    </div>
    {formType&&<div className="real-overlay" onClick={()=>setFormType(null)}><form className="real-dialog real-form" onSubmit={submit} onClick={e=>e.stopPropagation()}>
      <div className="real-section-head"><h2>{{account:'محفظة جديدة',goal:'هدف مالي جديد',budget:'حد الميزانية',transaction:'قيد مالي جديد',contribution:'إضافة مدخرات',withdrawal:'سحب من هدف'}[formType]}</h2><button type="button" onClick={()=>setFormType(null)} aria-label="إغلاق">✕</button></div>
      {formType==='account'&&<><label>اسم المحفظة<input maxLength={70} value={accountName} onChange={e=>{setAccountName(e.target.value);requestId.current=null;}} required/></label><label>رصيد افتتاحي مسجل يدويًا (دج)<input inputMode="decimal" value={opening} onChange={e=>{setOpening(e.target.value);requestId.current=null;}} required/></label></>}
      {formType==='goal'&&<><label>اسم الهدف<input maxLength={80} value={goalTitle} onChange={e=>{setGoalTitle(e.target.value);requestId.current=null;}} required/></label><label>المبلغ المستهدف (دج)<input inputMode="decimal" value={goalTarget} onChange={e=>{setGoalTarget(e.target.value);requestId.current=null;}} required/></label></>}
      {formType==='budget'&&<><label>الفئة<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(x=><option key={x}>{x}</option>)}</select></label><label>الحد المسجل (دج)<input inputMode="decimal" value={limit} onChange={e=>setLimit(e.target.value)} required/></label></>}
      {formType==='transaction'&&<><label>نوع القيد<select value={tx.kind} onChange={e=>{setTx(t=>({...t,kind:e.target.value as Kind}));requestId.current=null;}}><option value="expense">مصروف</option><option value="income">دخل</option><option value="transfer">تحويل بين الحسابات</option></select></label><label>{tx.kind==='income'?'إلى المحفظة':'من المحفظة'}<select required value={tx.fromAccountId} onChange={e=>{setTx(t=>({...t,fromAccountId:e.target.value}));requestId.current=null;}}>{wallets.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></label>{tx.kind==='transfer'&&<label>إلى الحساب<select required value={tx.toAccountId} onChange={e=>{setTx(t=>({...t,toAccountId:e.target.value}));requestId.current=null;}}>{accounts.filter(a=>a.id!==tx.fromAccountId).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}</>}
      {(formType==='contribution'||formType==='withdrawal')&&<><p>الهدف: {goals.find(g=>g.id===goalId)?.name}</p><label>{formType==='contribution'?'من المحفظة':'إلى المحفظة'}<select required value={tx.fromAccountId} onChange={e=>{setTx(t=>({...t,fromAccountId:e.target.value}));requestId.current=null;}}>{wallets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label></>}
      {(formType==='transaction'||formType==='contribution'||formType==='withdrawal')&&<label>المبلغ بالدينار الجزائري<input inputMode="decimal" required value={tx.amount} onChange={e=>{setTx(t=>({...t,amount:e.target.value}));requestId.current=null;}} placeholder="1250,50"/></label>}
      <button type="submit" disabled={busy}>{busy?'جارٍ الحفظ...':'حفظ في قاعدة البيانات'}<CheckCircle2 size={17}/></button>
      {message&&<p className="real-alert" role="alert">{message}</p>}
      <p className="real-small">يتم التحقق من ملكية الحساب والرصيد على الخادم. هذه سجلات مالية يدوية وليست تحويلات بنكية.</p>
    </form></div>}
  </div>;
}
function GoalCard({g,shown,onFund,onWithdraw}:{g:Goal;shown:(amount:string|bigint)=>string;onFund:()=>void;onWithdraw?:()=>void}){
  const target=BigInt(g.targetMinor),saved=BigInt(g.savedMinor),pct=target===0n?0:Number((saved*100n)/target);
  return <article className="real-goal"><div className="real-goal-head"><span className="real-goal-icon"><Target size={22}/></span><span className="real-percent">{Math.min(100,pct)}%</span></div><h3>{g.name}</h3><div className="real-progress" role="progressbar" aria-label={'تقدم '+g.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,pct)}><span style={{width:Math.min(100,pct)+'%'}}/></div><div className="real-goal-money"><strong>{shown(saved)}</strong><span>من {shown(target)}</span></div><div className="real-goal-actions"><button onClick={onFund}><Plus size={16}/> ادخار</button>{onWithdraw&&<button onClick={onWithdraw}><ArrowDownLeft size={16}/> سحب</button>}</div></article>;
}
function EntryList({entries,shown,names}:{entries:ManualEntry[];shown:(amount:string|bigint)=>string;names:Map<string,string>}){
  if(!entries.length)return <p className="real-empty">لا توجد معاملات حتى الآن.</p>;
  return <div className="real-transactions">{entries.map(e=><div className="real-entry" key={e.id}><span className={'real-entry-icon '+e.kind}>{e.kind==='income'?<ArrowDownLeft size={18}/>:e.kind==='expense'?<ArrowUpRight size={18}/>:<ArrowLeftRight size={18}/>}</span><div><strong>{e.kind==='income'?'دخل مسجل':e.kind==='expense'?'مصروف مسجل':'تحويل داخلي'}</strong><small>{e.kind==='transfer'?((names.get(e.fromAccountId??'')??'حساب')+' → '+(names.get(e.toAccountId??'')??'حساب')):(names.get((e.fromAccountId??e.toAccountId)??'')??'محفظة')} · {new Date(e.createdAt).toLocaleDateString('ar-DZ')}</small></div><b>{shown(e.amountMinor)}</b></div>)}</div>;
}
