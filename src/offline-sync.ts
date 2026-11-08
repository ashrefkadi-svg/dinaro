export type OfflineTransaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  accountId: string;
  toAccountId?: string;
  currency?: string;
};

export type OutboxItem = {
  id: string;
  kind: "transaction";
  payload: OfflineTransaction;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

const DB_NAME = "dinaro-offline";
const STORE_NAME = "outbox";
const DB_VERSION = 1;
const SYNC_TAG = "dinaro-outbox-sync";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported by this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open offline storage."));
  });
}

export async function enqueueOfflineTransaction(transaction: OfflineTransaction): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({
      id: transaction.id,
      kind: "transaction",
      payload: transaction,
      createdAt: new Date().toISOString(),
      attempts: 0
    } satisfies OutboxItem);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Could not save the offline operation."));
    tx.onabort = () => reject(tx.error || new Error("Offline operation was cancelled."));
  });
  db.close();
}

export async function getOfflineQueue(): Promise<OutboxItem[]> {
  const db = await openDatabase();
  const items = await new Promise<OutboxItem[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result as OutboxItem[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    request.onerror = () => reject(request.error || new Error("Could not read offline operations."));
  });
  db.close();
  return items;
}

async function updateQueueItem(item: OutboxItem): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Could not update offline operation."));
  });
  db.close();
}

async function removeQueueItem(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Could not remove synchronized operation."));
  });
  db.close();
}

export async function requestBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const syncRegistration = registration as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> };
  };
  if (syncRegistration.sync) await syncRegistration.sync.register(SYNC_TAG);
}

export async function flushOfflineQueue(): Promise<{ synced: number; pending: number; unavailable: boolean }> {
  if (!navigator.onLine) return { synced: 0, pending: (await getOfflineQueue()).length, unavailable: false };
  const items = await getOfflineQueue();
  let synced = 0;
  let unavailable = false;

  for (const item of items) {
    try {
      const response = await fetch("/api/sync/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": item.id
        },
        body: JSON.stringify({ transaction: item.payload, operationId: item.id })
      });
      if (response.status === 404 || response.status === 501) {
        unavailable = true;
        break;
      }
      if (!response.ok) {
        await updateQueueItem({ ...item, attempts: item.attempts + 1, lastError: "HTTP " + response.status });
        continue;
      }
      const result = await response.json() as { accepted?: boolean; operationId?: string };
      if (result.accepted === true && result.operationId === item.id) {
        await removeQueueItem(item.id);
        synced += 1;
      } else {
        await updateQueueItem({ ...item, attempts: item.attempts + 1, lastError: "Server did not confirm this operation." });
      }
    } catch (error) {
      await updateQueueItem({
        ...item,
        attempts: item.attempts + 1,
        lastError: error instanceof Error ? error.message : "Network error"
      });
      break;
    }
  }

  return { synced, pending: (await getOfflineQueue()).length, unavailable };
}
