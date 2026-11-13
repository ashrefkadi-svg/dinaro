/** Same-origin client for the loopback development-only manual financial ledger. */
export interface ManualUser { id:string; email:string }
export interface ManualAccount {
  id:string; name:string; openingMinor:string; balanceMinor:string;
}
export interface ManualEntry {
  id:string; requestId:string; kind:"income"|"expense"|"transfer";
  fromAccountId:string|null; toAccountId:string|null;
  amountMinor:string; createdAt:string;
}
export class LocalApiError extends Error {
  constructor(public status:number,message:string) {super(message);this.name="LocalApiError";}
}

export async function localApi<T>(path:string,body?:Record<string,unknown>):Promise<T> {
  const response=await fetch(path,{
    method:body===undefined?"GET":"POST",
    credentials:"same-origin",
    headers:body===undefined?undefined:{"Content-Type":"application/json","x-dinaro-request":"1"},
    body:body===undefined?undefined:JSON.stringify(body),
    cache:"no-store"
  });
  let result: Record<string,unknown>={};
  try {result=await response.json() as Record<string,unknown>;} catch {/* server unavailable */}
  if(!response.ok){
    throw new LocalApiError(response.status,typeof result.error==="string"?result.error:"Local ledger request failed");
  }
  return result as T;
}
