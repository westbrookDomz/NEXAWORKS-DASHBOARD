import fs from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Studio settings, saved to data/settings.json (gitignored) so every device sees the same values.
 * The password is stored as a salted scrypt hash, never in plain text.
 */
export interface StoredSettings {
  profile: { displayName: string; role: string; photo: string | null };
  studio: { name: string; overdueDays: number; reviewTemplate: string };
  /** Set once the password is changed in Settings; replaces APP_USERNAME / APP_PASSWORD from .env. */
  auth: { username: string; salt: string; hash: string } | null;
  /** Bumped by "Sign out everywhere"; sessions from an older epoch stop working. */
  sessionEpoch: number;
}

export const DEFAULT_REVIEW_TEMPLATE =
  "Hi {client}, thank you for working with {studio} on {project}. If you were happy with the result, would you share a line or two about the experience? It really helps the studio.";

const DEFAULTS: StoredSettings = {
  profile: { displayName: "", role: "Admin", photo: null },
  studio: { name: "Nexaworks", overdueDays: 14, reviewTemplate: DEFAULT_REVIEW_TEMPLATE },
  auth: null,
  sessionEpoch: 0,
};

const FILE = path.resolve(process.cwd(), "data", "settings.json");
let cache: StoredSettings | null = null;

export function readSettings(): StoredSettings {
  if (cache) return cache;
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<StoredSettings>;
    cache = {
      profile: { ...DEFAULTS.profile, ...raw.profile },
      studio: { ...DEFAULTS.studio, ...raw.studio },
      auth: raw.auth ?? null,
      sessionEpoch: raw.sessionEpoch ?? 0,
    };
  } catch {
    cache = structuredClone(DEFAULTS);
  }
  return cache;
}

export function updateSettings(change: (s: StoredSettings) => void): StoredSettings {
  const next = structuredClone(readSettings());
  change(next);
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  // Write to a temp file then rename, so a crash mid-write never leaves half a file.
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, FILE);
  cache = next;
  return next;
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

export function verifyHash(password: string, salt: string, hash: string): boolean {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}
