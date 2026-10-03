// Browser-only persistence. No server, external database, or network requests.
// Records and photo Blobs share a transaction; sequence allocation is atomic across tabs.
import { getDemoDeals, getTextOnlyDemoDeal } from "./demoDeals";

const STORE = "records";
let connection;
const open = () => {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open("metro-motors-ui-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Browser storage is unavailable. Enable site storage to save deals."));
  }).catch(error => { connection = null; throw error; });
  return connection;
};

async function transaction(mode, operation) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let result;
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(new Error(tx.error?.name === "QuotaExceededError" ? "Browser storage is full. Remove some photos and try again. Your form is still open." : "Could not save to browser storage. Your form has not been cleared."));
    operation(tx.objectStore(STORE), value => { result = value; });
  });
}

const prefix = () => `MM-${String(new Date().getFullYear()).slice(-2)}-`;
const billNumber = count => `${prefix()}${String(count).padStart(4, "0")}`;

export const browserDealAdapter = {
  list: () => transaction("readwrite", (store, done) => {
    const request = store.getAll();
    request.onsuccess = () => {
      let deals = request.result.filter(row => row.kind === "deal");
      // Ensure the complete text-only demo deal with no photos is always seeded
      const hasTextDemo = deals.some(d => d.id === "deal-demo-hunter-350-no-photos");
      if (!hasTextDemo && !localStorage.getItem("mm_demo_cleared")) {
        const textDemo = getTextOnlyDemoDeal();
        store.put(textDemo);
        deals.push(textDemo);
      }
      done(deals.sort((a, b) => b.created_at.localeCompare(a.created_at)));
    };
  }),

  get: id => transaction("readonly", (store, done) => {
    const request = store.get(id);
    request.onsuccess = () => done(request.result?.kind === "deal" ? request.result : null);
  }),

  nextBillNumber: () => transaction("readonly", (store, done) => {
    const request = store.get(`sequence:${prefix()}`);
    request.onsuccess = () => done(billNumber((request.result?.count || 0) + 1));
  }),

  save: deal => transaction("readwrite", (store, done) => {
    const persist = existing => {
      const now = new Date().toISOString();
      if (existing) {
        const record = { ...deal, id: existing.id, bill_number: existing.bill_number, created_at: existing.created_at, updated_at: now, kind: "deal" };
        store.put(record);
        done(record);
        return;
      }
      const sequenceId = `sequence:${prefix()}`;
      const request = store.get(sequenceId);
      request.onsuccess = () => {
        const count = (request.result?.count || 0) + 1;
        const record = { ...deal, id: crypto.randomUUID(), bill_number: billNumber(count), created_at: now, updated_at: now, kind: "deal" };
        store.put({ id: sequenceId, count });
        store.put(record);
        done(record);
      };
    };
    if (!deal.id) persist(null);
    else {
      const request = store.get(deal.id);
      request.onsuccess = () => {
        if (!request.result) {
          store.transaction.abort();
          return;
        }
        persist(request.result);
      };
    }
  }),

  remove: id => transaction("readwrite", (store, done) => {
    store.delete(id);
    done(true);
  }),

  resetDemoData: () => {
    localStorage.removeItem("mm_demo_cleared");
    return transaction("readwrite", (store, done) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        const demoDeals = getDemoDeals();
        const sequenceId = `sequence:${prefix()}`;
        store.put({ id: sequenceId, count: demoDeals.length });
        for (const item of demoDeals) {
          store.put(item);
        }
        done(demoDeals);
      };
    });
  },

  clearAllData: () => {
    localStorage.setItem("mm_demo_cleared", "true");
    return transaction("readwrite", (store, done) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        const sequenceId = `sequence:${prefix()}`;
        store.put({ id: sequenceId, count: 0 });
        done(true);
      };
    });
  },
};