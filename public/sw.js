const CACHE="dinaro-shell-v2";
const DB_NAME="dinaro-offline";
const STORE_NAME="outbox";
const DB_VERSION=1;
const SYNC_TAG="dinaro-outbox-sync";
const CORE=["/","/index.html"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("dinaro-shell-")&&key!==CACHE).map(key=>caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok&&request.destination!=="document"){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy));
      }
      return response;
    }).catch(()=>caches.match("/index.html")))
  );
});

function openOutbox(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function syncOutbox(){
  const db=await openOutbox();
  const items=await new Promise((resolve,reject)=>{
    const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess=()=>resolve(request.result||[]);
    request.onerror=()=>reject(request.error);
  });

  for(const item of items){
    try{
      const response=await fetch("/api/sync/transactions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Idempotency-Key":item.id},
        body:JSON.stringify({transaction:item.payload,operationId:item.id})
      });
      if(response.status===404||response.status===501)break;
      if(!response.ok){
        await updateItem(db,{...item,attempts:(item.attempts||0)+1,lastError:"HTTP "+response.status});
        continue;
      }
      const result=await response.json();
      if(result.accepted===true&&result.operationId===item.id){
        await deleteItem(db,item.id);
      }else{
        await updateItem(db,{...item,attempts:(item.attempts||0)+1,lastError:"Server confirmation missing"});
      }
    }catch(error){
      await updateItem(db,{...item,attempts:(item.attempts||0)+1,lastError:String(error)});
      break;
    }
  }
  db.close();
}

function updateItem(db,item){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,"readwrite");
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

function deleteItem(db,id){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,"readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

self.addEventListener("sync",event=>{
  if(event.tag===SYNC_TAG)event.waitUntil(syncOutbox());
});

self.addEventListener("message",event=>{
  if(event.data&&event.data.type==="DINARO_SYNC_OUTBOX"){
    event.waitUntil(syncOutbox());
  }
});
