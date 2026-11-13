/**
 * Loopback-only development HTTP API.
 * Cookies are HttpOnly/SameSite Strict, writes require a non-simple request header.
 * NOT certified for Internet/production exposure.
 */
import {createServer} from "node:http";
import {openStore,StoreError} from "./store.mjs";

const MAX_BODY=16_384;
const SESSION_COOKIE="dinaro_local_session";
const allowedOrigins=new Set([
  "http://localhost:5173","http://127.0.0.1:5173",
  "http://localhost:8787","http://127.0.0.1:8787"
]);

function cookieFrom(req) {
  const cookie=req.headers.cookie??"";
  for(const field of cookie.split(";")){
    const [key,...value]=field.trim().split("=");
    if(key===SESSION_COOKIE)return value.join("=");
  }
  return null;
}
function send(res,status,data,headers={}){
  res.writeHead(status,{
    "Content-Type":"application/json; charset=utf-8",
    "Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff",
    "X-Frame-Options":"DENY",
    "Referrer-Policy":"no-referrer",
    "Content-Security-Policy":"default-src 'none'",
    ...headers
  });
  res.end(JSON.stringify(data));
}
async function parseBody(req){
  if(!String(req.headers["content-type"]??"").toLowerCase().startsWith("application/json"))
    throw new StoreError(415,"application/json required");
  let size=0;
  const buffers=[];
  for await(const chunk of req){
    size+=chunk.length;
    if(size>MAX_BODY)throw new StoreError(413,"Request is too large");
    buffers.push(chunk);
  }
  let value;
  try{value=JSON.parse(Buffer.concat(buffers).toString("utf8"));}
  catch{throw new StoreError(400,"Invalid JSON body");}
  if(value===null||Array.isArray(value)||typeof value!=="object")
    throw new StoreError(400,"JSON object required");
  return value;
}
function csrfCheck(req){
  if(req.headers["x-dinaro-request"]!=="1")
    throw new StoreError(403,"Request verification header required");
  const origin=req.headers.origin;
  if(origin&&!allowedOrigins.has(origin))
    throw new StoreError(403,"Untrusted origin");
}
function ensureLocalOnly(){
  if(process.env.NODE_ENV==="production")
    throw new Error("DINARO local API must not start in production mode");
}
export async function startLocalApi({dbPath,port=8787,host="127.0.0.1"}={}){
  ensureLocalOnly();
  if(host!=="127.0.0.1")throw new Error("API must bind to IPv4 loopback");
  const store=openStore(dbPath);
  const failures=new Map();

  function throttle(req,key){
    const now=Date.now(),tag=(req.socket.remoteAddress??"unknown")+":"+key;
    if(failures.size>512)failures.clear();
    const value=failures.get(tag);
    if(value && value.until>now && value.count>=12)throw new StoreError(429,"Too many authentication attempts");
    if(!value||value.until<=now)failures.set(tag,{count:1,until:now+5*60*1000});
    else value.count++;
    return tag;
  }

  const server=createServer(async(req,res)=>{
    try{
      const path=new URL(req.url??"/","http://localhost").pathname;
      const method=req.method??"GET";
      if(method==="OPTIONS"){send(res,403,{error:"CORS is disabled"});return;}
      if(!["GET","POST"].includes(method))throw new StoreError(405,"Method not allowed");
      if(method==="POST")csrfCheck(req);
      if(method==="GET"&&path==="/api/health"){
        send(res,200,{status:"ok",mode:"LOCAL_DEV_ONLY"});return;
      }
      if(method==="POST"&&path==="/api/auth/register"){
        const body=await parseBody(req);
        throttle(req,"register");
        const user=store.register(body.email,body.password);
        const session=store.createSession(user.id);
        send(res,201,{user,mode:"MANUAL_LOCAL_ONLY"},{
          "Set-Cookie":SESSION_COOKIE+"="+session.token+"; HttpOnly; SameSite=Strict; Path=/api; Max-Age="+session.maxAgeSeconds
        });
        return;
      }
      if(method==="POST"&&path==="/api/auth/login"){
        const body=await parseBody(req);
        const tag=throttle(req,"login");
        const user=store.login(body.email,body.password);
        failures.delete(tag);
        const session=store.createSession(user.id);
        send(res,200,{user,mode:"MANUAL_LOCAL_ONLY"},{
          "Set-Cookie":SESSION_COOKIE+"="+session.token+"; HttpOnly; SameSite=Strict; Path=/api; Max-Age="+session.maxAgeSeconds
        });
        return;
      }
      const token=cookieFrom(req);
      const user=store.getSessionUser(token);
      if(!user)throw new StoreError(401,"Authentication required");
      if(method==="POST"&&path==="/api/auth/logout"){
        store.revokeSession(token);
        send(res,200,{ok:true},{"Set-Cookie":SESSION_COOKIE+"=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0"});
        return;
      }
      if(method==="GET"&&path==="/api/me"){
        send(res,200,{user,mode:"MANUAL_LOCAL_ONLY"});return;
      }
      if(method==="GET"&&path==="/api/accounts"){
        send(res,200,{accounts:store.listAccounts(user.id)});return;
      }
      if(method==="POST"&&path==="/api/accounts"){
        const body=await parseBody(req);
        const account=store.createAccount(user.id,body);
        send(res,account.alreadyApplied?200:201,{account});return;
      }
      if(method==="GET"&&path==="/api/transactions"){
        send(res,200,{transactions:store.listTransactions(user.id)});return;
      }
      if(method==="POST"&&path==="/api/transactions"){
        const body=await parseBody(req);
        const transaction=store.createTransaction(user.id,body);
        send(res,transaction.alreadyApplied?200:201,{transaction});return;
      }
      if(method==="GET"&&path==="/api/export"){
        send(res,200,{format:"dinaro-local-v1",user,accounts:store.listAccounts(user.id),
          transactions:store.listTransactions(user.id),
          warning:"Manual local data; transaction export currently contains the latest 100 transactions."});
        return;
      }
      throw new StoreError(404,"Endpoint not found");
    }catch(err){
      const status=err instanceof StoreError?err.status:500;
      if(status===500)console.error("DINARO local API internal error:",err);
      if(!res.headersSent)send(res,status,{error:status===500?"Internal server error":err.message});
    }
  });

  try{
    await new Promise((resolve,reject)=>{
      server.once("error",reject);
      server.listen(port,host,()=>{
        server.off("error",reject);
        resolve();
      });
    });
  }catch(err){store.close();throw err;}
  return {
    port:server.address().port,
    close:async()=>{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));store.close();}
  };
}
