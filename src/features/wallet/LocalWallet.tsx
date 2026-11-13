import {useEffect,useRef,useState} from "react";
import type {FormEvent} from "react";
import {ArrowDownLeft,ArrowLeftRight,ArrowUpRight,Database,Download,Eye,EyeOff,LockKeyhole,LogOut,Plus,RefreshCcw,ShieldAlert,Wallet} from "lucide-react";
import {formatDzdMinor,parseDzdMinor} from "../../domain/ledger";
import {localApi,LocalApiError} from "./api";
import type {ManualAccount,ManualEntry,ManualUser} from "./api";

type Mode="login"|"register";
type EntryKind="income"|"expense"|"transfer";
const amountText=(value:string)=>formatDzdMinor(BigInt(value));
function minorString(raw:string,allowZero=false):string {
  const trimmed=raw.trim();
  if(allowZero&&(trimmed==="0"||trimmed==="0,00"||trimmed==="0.00"))return "0";
  return parseDzdMinor(trimmed).toString();
}
function messageFor(error:unknown):string {
  if(error instanceof LocalApiError){
    if(error.status===409)return "تعارض في البيانات أو رصيد غير كافٍ. راجع المدخلات قبل الإعادة.";
    if(error.status===401)return "بيانات الدخول غير صحيحة أو انتهت الجلسة.";
    if(error.status===404)return "لم يتم العثور على المحفظة أو الخدمة المطلوبة.";
    return error.message;
  }
  return "تعذّر الاتصال بالخادم المحلي. شغّل npm run dev:api على حاسوب التطوير.";
}

export function LocalWallet(){
  const [status,setStatus]=useState<"loading"|"guest"|"ready"|"offline">("loading");
  const [user,setUser]=useState<ManualUser|null>(null);
  const [accounts,setAccounts]=useState<ManualAccount[]>([]);
  const [entries,setEntries]=useState<ManualEntry[]>([]);
  const [mode,setMode]=useState<Mode>("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [accountName,setAccountName]=useState("");
  const [opening,setOpening]=useState("0");
  const [kind,setKind]=useState<EntryKind>("expense");
  const [selected,setSelected]=useState("");
  const [destination,setDestination]=useState("");
  const [amount,setAmount]=useState("");
  const [visible,setVisible]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const accountRequest=useRef<string|null>(null);
  const entryRequest=useRef<string|null>(null);

  async function refresh(){
    const [accountResponse,entryResponse]=await Promise.all([
      localApi<{accounts:ManualAccount[]}>("/api/accounts"),
      localApi<{transactions:ManualEntry[]}>("/api/transactions")
    ]);
    setAccounts(accountResponse.accounts);
    setEntries(entryResponse.transactions);
    setSelected(old=>accountResponse.accounts.some(a=>a.id===old)?old:(accountResponse.accounts[0]?.id??""));
    setDestination(old=>accountResponse.accounts.some(a=>a.id===old)?old:(accountResponse.accounts[1]?.id??""));
  }
  useEffect(()=>{
    let alive=true;
    async function load(){
      try{
        const result=await localApi<{user:ManualUser}>("/api/me");
        if(!alive)return;
        setUser(result.user);
        const [a,t]=await Promise.all([
          localApi<{accounts:ManualAccount[]}>("/api/accounts"),
          localApi<{transactions:ManualEntry[]}>("/api/transactions")
        ]);
        if(!alive)return;
        setAccounts(a.accounts);setEntries(t.transactions);
        setSelected(a.accounts[0]?.id??"");setDestination(a.accounts[1]?.id??"");
        setStatus("ready");
      }catch(e){
        if(!alive)return;
        setStatus(e instanceof LocalApiError&&e.status===401?"guest":"offline");
      }
    }
    void load();
    return ()=>{alive=false;};
  },[]);

  async function submitAuth(event:FormEvent){
    event.preventDefault();setError("");setSuccess("");setBusy(true);
    try{
      const data=await localApi<{user:ManualUser}>(mode==="register"?"/api/auth/register":"/api/auth/login",{email,password});
      setUser(data.user);setPassword("");
      await refresh();
      setStatus("ready");
      setSuccess("تم فتح مساحة السجل المحلي.");
    }catch(e){setPassword("");setError(messageFor(e));}
    finally{setBusy(false);}
  }
  async function logout(){
    setBusy(true);setError("");setSuccess("");
    try{
      await localApi("/api/auth/logout",{});
      setUser(null);setAccounts([]);setEntries([]);setStatus("guest");
    }catch(e){setError(messageFor(e));}
    finally{setBusy(false);}
  }
  async function addAccount(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");setSuccess("");
    try{
      const amountMinor=minorString(opening,true);
      accountRequest.current??=crypto.randomUUID();
      await localApi("/api/accounts",{name:accountName.trim(),openingMinor:amountMinor,requestId:accountRequest.current});
      accountRequest.current=null;setAccountName("");setOpening("0");
      await refresh();
      setSuccess("تم حفظ المحفظة اليدوية على الخادم المحلي.");
    }catch(e){setError(messageFor(e));}
    finally{setBusy(false);}
  }
  async function addEntry(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");setSuccess("");
    try{
      if(!selected || (kind==="transfer"&&(!destination||destination===selected)))
        throw new Error("اختر محفظتين مختلفتين للتحويل.");
      const amountMinor=minorString(amount);
      entryRequest.current??=crypto.randomUUID();
      await localApi("/api/transactions",{
        kind,amountMinor,requestId:entryRequest.current,
        fromAccountId:kind==="income"?null:selected,
        toAccountId:kind==="income"?selected:kind==="transfer"?destination:null
      });
      entryRequest.current=null;setAmount("");
      await refresh();
      setSuccess("تم تسجيل القيد اليدوي وحفظه.");
    }catch(e){setError(e instanceof Error && !(e instanceof LocalApiError) ? e.message : messageFor(e));}
    finally{setBusy(false);}
  }
  async function exportRecent(){
    setBusy(true);setError("");setSuccess("");
    try{
      const data=await localApi<Record<string,unknown>>("/api/export");
      const objectUrl=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
      const anchor=document.createElement("a");
      anchor.href=objectUrl;anchor.download="dinaro-local-recent-export.json";
      document.body.append(anchor);anchor.click();anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setSuccess("تم إنشاء تصدير محلي للملخص وآخر 100 عملية كحد أقصى.");
    }catch(e){setError(messageFor(e));}
    finally{setBusy(false);}
  }

  return <section className="lw-shell">
    <div className="lw-header">
      <div><div className="lw-eyebrow"><LockKeyhole size={17}/> DINARO LOCAL LEDGER</div>
        <h2>مساحتك المالية اليدوية</h2>
        <p>تسجيل شخصي على جهاز التطوير فقط — لا يتصل بالبنك، ولا يستخدم أرصدة لوحة العرض التجريبي.</p>
      </div>
      {status==="ready"&&<button className="secondary-btn" type="button" onClick={logout} disabled={busy}><LogOut size={16}/> خروج</button>}
    </div>
    <div className="lw-warning" role="note"><ShieldAlert size={21}/>
      <span>هذه نسخة محلية قيد التطوير. البيانات محفوظة في ملف SQLite بدون تشفير على القرص، لذلك لا تدخل معلومات بنكية حساسة أو كلمات مرور تستعملها في خدمات أخرى.</span>
    </div>
    {status==="loading"&&<div className="lw-panel" role="status">جارٍ فحص جلسة السجل المحلي...</div>}
    {status==="offline"&&<div className="lw-panel lw-message" role="alert">
      <Database size={26}/><h3>الخادم المحلي غير متصل</h3>
      <p>شغّل <code>npm run dev:api</code> ثم <code>npm run dev</code> من مجلد المشروع.</p>
      <button className="secondary-btn" onClick={()=>window.location.reload()}><RefreshCcw size={16}/> إعادة الاتصال</button>
    </div>}
    {status==="guest"&&<div className="lw-panel lw-auth">
      <div className="lw-auth-tabs">
        <button className={mode==="login"?"active":""} type="button" onClick={()=>{setMode("login");setError("");}}>تسجيل الدخول</button>
        <button className={mode==="register"?"active":""} type="button" onClick={()=>{setMode("register");setError("");}}>إنشاء حساب محلي</button>
      </div>
      <form onSubmit={submitAuth} className="lw-form">
        <label htmlFor="lw-email">البريد الإلكتروني</label>
        <input id="lw-email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <label htmlFor="lw-password">كلمة مرور خاصة بهذه النسخة (12 حرفًا أو أكثر)</label>
        <input id="lw-password" type="password" autoComplete={mode==="register"?"new-password":"current-password"} minLength={12} value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button className="primary-btn" type="submit" disabled={busy}>{mode==="register"?"إنشاء الحساب":"دخول"}</button>
      </form>
    </div>}
    {status==="ready"&&user&&<>
      <div className="lw-toolbar">
        <span><Database size={16}/> الحساب المحلي: <strong>{user.email}</strong></span>
        <div><button className="secondary-btn" onClick={()=>setVisible(v=>!v)} aria-label={visible?"إخفاء الأرصدة اليدوية":"إظهار الأرصدة اليدوية"}>{visible?<EyeOff size={16}/>:<Eye size={16}/>} {visible?"إخفاء الأرصدة":"إظهار الأرصدة"}</button>
        <button className="secondary-btn" onClick={exportRecent} disabled={busy}><Download size={16}/> تصدير محدود</button></div>
      </div>
      <div className="lw-account-grid">
        {accounts.map(account=><div key={account.id} className="lw-balance-card">
          <span><Wallet size={18}/>{account.name}</span>
          <strong>{visible?amountText(account.balanceMinor):"••••••"}</strong>
          <small>رصيد محسوب من القيود اليدوية المحفوظة</small>
        </div>)}
        {accounts.length===0&&<div className="lw-panel lw-no-accounts">لم تنشئ محفظة بعد. أضف أول محفظة لتبدأ.</div>}
      </div>
      <div className="lw-tools">
        <form className="lw-panel lw-form" onSubmit={addAccount}>
          <h3><Plus size={18}/> محفظة جديدة</h3>
          <label htmlFor="lw-account-name">اسم المحفظة</label>
          <input id="lw-account-name" maxLength={70} value={accountName} onChange={e=>{setAccountName(e.target.value);accountRequest.current=null;}} required placeholder="مثال: محفظتي النقدية"/>
          <label htmlFor="lw-opening">رصيد افتتاحي يدوي (دج)</label>
          <input id="lw-opening" inputMode="decimal" value={opening} onChange={e=>{setOpening(e.target.value);accountRequest.current=null;}} required/>
          <button className="primary-btn" disabled={busy} type="submit"><Plus size={16}/> حفظ المحفظة</button>
        </form>
        <form className="lw-panel lw-form" onSubmit={addEntry}>
          <h3><ArrowLeftRight size={18}/> قيد يدوي جديد</h3>
          <label htmlFor="lw-kind">نوع القيد</label>
          <select id="lw-kind" value={kind} onChange={e=>{setKind(e.target.value as EntryKind);entryRequest.current=null;}}>
            <option value="expense">مصروف</option><option value="income">دخل</option><option value="transfer">تحويل داخلي</option>
          </select>
          <label htmlFor="lw-source">{kind==="income"?"إلى المحفظة":"من المحفظة"}</label>
          <select id="lw-source" value={selected} onChange={e=>{setSelected(e.target.value);entryRequest.current=null;}} required>
            <option value="">اختر محفظة</option>
            {accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}
          </select>
          {kind==="transfer"&&<>
            <label htmlFor="lw-destination">إلى المحفظة</label>
            <select id="lw-destination" value={destination} onChange={e=>{setDestination(e.target.value);entryRequest.current=null;}} required>
              <option value="">اختر محفظة</option>
              {accounts.filter(a=>a.id!==selected).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </>}
          <label htmlFor="lw-amount">المبلغ (دج)</label>
          <input id="lw-amount" inputMode="decimal" value={amount} onChange={e=>{setAmount(e.target.value);entryRequest.current=null;}} required placeholder="مثال: 1250,50"/>
          <button className="primary-btn" type="submit" disabled={busy||accounts.length===0}><ArrowUpRight size={16}/> تسجيل القيد</button>
        </form>
      </div>
      <div className="lw-panel">
        <h3><RefreshCcw size={17}/> آخر القيود المسجلة</h3>
        <div className="lw-entry-list">
          {entries.length===0&&<p className="lw-empty">لا توجد قيود بعد.</p>}
          {entries.map(entry=><div className="lw-entry" key={entry.id}>
            {entry.kind==="income"?<ArrowDownLeft size={18}/>:entry.kind==="expense"?<ArrowUpRight size={18}/>:<ArrowLeftRight size={18}/>}
            <span>{entry.kind==="income"?"دخل يدوي":entry.kind==="expense"?"مصروف يدوي":"تحويل بين المحافظ"}<small>{new Date(entry.createdAt).toLocaleDateString("ar-DZ")}</small></span>
            <strong>{visible?amountText(entry.amountMinor):"••••••"}</strong>
          </div>)}
        </div>
      </div>
    </>}
    {error&&<p className="lw-error" role="alert">{error}</p>}
    {success&&<p className="lw-success" role="status">{success}</p>}
  </section>;
}
