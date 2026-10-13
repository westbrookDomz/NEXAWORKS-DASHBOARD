/** Browser-only studio data (tasks, reviews, list prices) as one portable backup file. */

export const LOCAL_KEYS = { tasks: "studio-tasks", reviews: "studio-reviews", listPrices: "studio-list-prices" } as const;

export interface Backup {
  app: "designboard-pro";
  version: 1;
  exportedAt: string;
  tasks: unknown[];
  reviews: unknown[];
  listPrices: Record<string, number>;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function localCounts() {
  return {
    tasks: read<unknown[]>(LOCAL_KEYS.tasks, []).length,
    reviews: read<unknown[]>(LOCAL_KEYS.reviews, []).length,
    listPrices: Object.keys(read<Record<string, number>>(LOCAL_KEYS.listPrices, {})).length,
  };
}

export function buildBackup(): Backup {
  return {
    app: "designboard-pro",
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: read(LOCAL_KEYS.tasks, []),
    reviews: read(LOCAL_KEYS.reviews, []),
    listPrices: read(LOCAL_KEYS.listPrices, {}),
  };
}

export function downloadBackup() {
  const backup = buildBackup();
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `designboard-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Reads and checks a backup file. Throws a message the person can act on. */
export async function parseBackup(file: File): Promise<Backup> {
  let data: Partial<Backup>;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error("That file isn’t a DesignBoard backup. Choose the .json file you exported from Settings.");
  }
  if (data.app !== "designboard-pro" || !Array.isArray(data.tasks) || !Array.isArray(data.reviews) || typeof data.listPrices !== "object") {
    throw new Error("That file isn’t a DesignBoard backup. Choose the .json file you exported from Settings.");
  }
  return data as Backup;
}

export function restoreBackup(b: Backup) {
  localStorage.setItem(LOCAL_KEYS.tasks, JSON.stringify(b.tasks));
  localStorage.setItem(LOCAL_KEYS.reviews, JSON.stringify(b.reviews));
  localStorage.setItem(LOCAL_KEYS.listPrices, JSON.stringify(b.listPrices ?? {}));
}

export function clearLocalData() {
  Object.values(LOCAL_KEYS).forEach((k) => localStorage.removeItem(k));
}
