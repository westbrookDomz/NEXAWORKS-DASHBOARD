/** Minimal IndexedDB store for the Files page. Files live in this browser only. */

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  added: number;
  project?: string;
  blob: Blob;
}

const DB_NAME = "designboard-files";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export const listFiles = () => run<StoredFile[]>("readonly", (s) => s.getAll() as IDBRequest<StoredFile[]>);
export const saveFile = (file: StoredFile) => run("readwrite", (s) => s.put(file));
export const removeFile = (id: string) => run("readwrite", (s) => s.delete(id));

export type FileKind = "Images" | "Documents" | "Other";

export function kindOf(f: { type: string; name: string }): FileKind {
  if (f.type.startsWith("image/")) return "Images";
  if (/pdf|word|document|sheet|excel|presentation|powerpoint|text|csv/.test(f.type) || /\.(pdf|docx?|xlsx?|pptx?|txt|csv|key|pages)$/i.test(f.name))
    return "Documents";
  return "Other";
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}
