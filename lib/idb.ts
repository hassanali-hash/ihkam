/**
 * IndexedDB helper for storing and retrieving uploaded file blobs locally.
 * Includes quota and corruption error handling, with in-memory fallback.
 */

const DB_NAME = 'ihkam-demo-blobs';
const DB_VERSION = 1;
const STORE_NAME = 'blobs';

const memoryFallback = new Map<string, Blob>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

export async function storeBlob(key: string, blob: Blob): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('IDB put error, using in-memory fallback', req.error);
        memoryFallback.set(key, blob);
        resolve(true);
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, using memory fallback', err);
    memoryFallback.set(key, blob);
    return true;
  }
}

export async function getBlob(key: string): Promise<Blob | null> {
  if (memoryFallback.has(key)) {
    return memoryFallback.get(key) || null;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as Blob);
        } else {
          resolve(memoryFallback.get(key) || null);
        }
      };

      req.onerror = () => {
        resolve(memoryFallback.get(key) || null);
      };
    });
  } catch {
    return memoryFallback.get(key) || null;
  }
}

export async function deleteBlob(key: string): Promise<boolean> {
  memoryFallback.delete(key);
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return true;
  }
}

export async function clearAllBlobs(): Promise<void> {
  memoryFallback.clear();
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch {
    // ignore
  }
}

export const clearDatabase = clearAllBlobs;

