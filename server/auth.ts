import type { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes, timingSafeEqual, createHash } from "crypto";
import { readSettings, verifyHash } from "./settings-store";

declare module "express-session" {
  interface SessionData {
    user?: string;
    /** The settings' session epoch at sign-in; a later "Sign out everywhere" invalidates it. */
    epoch?: number;
  }
}

/**
 * Single-account sign-in for the studio. A password set in Settings (stored hashed in
 * data/settings.json) takes over from APP_USERNAME / APP_PASSWORD in .env.
 * Fails closed: with neither, nobody can sign in and the data API stays locked.
 */
export function authConfigured(): boolean {
  return Boolean(readSettings().auth) || Boolean(process.env.APP_USERNAME && process.env.APP_PASSWORD);
}

export function currentUsername(): string | null {
  return readSettings().auth?.username ?? process.env.APP_USERNAME ?? null;
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Checks a username and password against whichever credentials are active. */
export function checkCredentials(username: string, password: string): boolean {
  const stored = readSettings().auth;
  if (stored) return safeEqual(username, stored.username) && verifyHash(password, stored.salt, stored.hash);
  const envUser = process.env.APP_USERNAME;
  const envPass = process.env.APP_PASSWORD;
  if (!envUser || !envPass) return false;
  return safeEqual(username, envUser) && safeEqual(password, envPass);
}

function sessionIsCurrent(req: Request): boolean {
  return Boolean(req.session.user) && (req.session.epoch ?? 0) === readSettings().sessionEpoch;
}

export function setupAuth(app: Express) {
  if (!authConfigured()) {
    console.warn("[auth] No credentials set (Settings or APP_USERNAME / APP_PASSWORD). Sign-in is disabled and data routes are locked.");
  }
  const MemoryStore = createMemoryStore(session);
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({ checkPeriod: 86_400_000 }),
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.get("/api/auth/session", (req, res) => {
    const settings = readSettings();
    res.json({
      configured: authConfigured(),
      user: sessionIsCurrent(req) ? req.session.user : null,
      studioName: settings.studio.name,
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    const name = (username ?? "").trim();
    if (!name || !password) {
      return res.status(400).json({ message: "Enter your username and password to sign in." });
    }

    if (!authConfigured()) {
      return res.status(503).json({
        message: "Sign-in isn’t set up on this server. Add APP_USERNAME and APP_PASSWORD to .env, then restart it.",
      });
    }
    if (!checkCredentials(name, password)) {
      return res.status(401).json({ message: "That username and password don’t match. Check both and try again." });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ message: "Couldn’t start a session. Try again." });
      req.session.user = name;
      req.session.epoch = readSettings().sessionEpoch;
      res.json({ user: name });
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
}

/** Guards data routes: only a current signed-in session gets through. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (authConfigured() && sessionIsCurrent(req)) return next();
  res.status(401).json({ message: "Sign in to continue." });
}
