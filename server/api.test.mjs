import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {startLocalApi} from "./api.mjs";

test("local API authentication, authorization, CSRF and idempotency",async()=>{
  const dir=mkdtempSync(join(tmpdir(),"dinaro-api-"));
  const app=await startLocalApi({dbPath:join(dir,"data.sqlite"),port:0});
  const url="http://127.0.0.1:"+app.port;
  async function request(path,{method="GET",body,cookie,csrf=true,origin}={}){
    const headers={};
    if(cookie)headers.Cookie=cookie;
    if(origin)headers.Origin=origin;
    if(method==="POST"){
      headers["content-type"]="application/json";
      if(csrf)headers["x-dinaro-request"]="1";
    }
    const response=await fetch(url+path,{method,headers,body:method==="POST"?JSON.stringify(body??{}):undefined});
    return {status:response.status,data:await response.json(),cookie:response.headers.get("set-cookie")?.split(";")[0]};
  }
  try{
    assert.equal((await request("/api/health")).status,200);
    assert.equal((await request("/api/accounts")).status,401);
    assert.equal((await request("/api/auth/register",{method:"POST",csrf:false,body:{}})).status,403);
    assert.equal((await request("/api/auth/register",{method:"POST",origin:"https://attacker.example",body:{}})).status,403);

    const a=await request("/api/auth/register",{method:"POST",body:{
      email:"a@example.com",password:"password_is_long_enough_123"
    }});
    assert.equal(a.status,201);
    assert.ok(a.cookie?.startsWith("dinaro_local_session="));
    assert.equal((await request("/api/me",{cookie:a.cookie})).data.user.email,"a@example.com");
    const b=await request("/api/auth/register",{method:"POST",body:{
      email:"b@example.com",password:"password_is_long_enough_456"
    }});
    assert.equal(b.status,201);

    const account=await request("/api/accounts",{method:"POST",cookie:a.cookie,body:{
      name:"Manual wallet",openingMinor:"12500",requestId:"wallet-request-01"
    }});
    assert.equal(account.status,201);
    const accountId=account.data.account.id;
    assert.equal((await request("/api/accounts",{cookie:a.cookie})).data.accounts[0].balanceMinor,"12500");
    assert.equal((await request("/api/accounts",{cookie:b.cookie})).data.accounts.length,0);
    const attempt=await request("/api/transactions",{method:"POST",cookie:b.cookie,body:{
      kind:"expense",fromAccountId:accountId,amountMinor:"10",requestId:"attempt-000001"
    }});
    assert.equal(attempt.status,404);

    const expense={
      kind:"expense",fromAccountId:accountId,amountMinor:"2500",requestId:"expense-req-01"
    };
    assert.equal((await request("/api/transactions",{method:"POST",cookie:a.cookie,body:expense})).status,201);
    assert.equal((await request("/api/transactions",{method:"POST",cookie:a.cookie,body:expense})).status,200);
    assert.equal((await request("/api/accounts",{cookie:a.cookie})).data.accounts[0].balanceMinor,"10000");
    assert.equal((await request("/api/transactions",{cookie:a.cookie})).data.transactions.length,1);
    const exportData=await request("/api/export",{cookie:a.cookie});
    assert.equal(exportData.status,200);
    assert.equal(exportData.data.accounts.length,1);
    assert.equal((await request("/api/auth/logout",{method:"POST",cookie:a.cookie})).status,200);
    assert.equal((await request("/api/me",{cookie:a.cookie})).status,401);
    assert.equal((await request("/api/auth/login",{method:"POST",body:{
      email:"a@example.com",password:"wrong_password"
    }})).status,401);
    const login=await request("/api/auth/login",{method:"POST",body:{
      email:"a@example.com",password:"password_is_long_enough_123"
    }});
    assert.equal(login.status,200);
    assert.equal((await request("/api/accounts",{cookie:login.cookie})).data.accounts[0].balanceMinor,"10000");
  }finally{await app.close();rmSync(dir,{recursive:true,force:true});}
});
