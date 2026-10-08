import type { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes, timingSafeEqual, createHash } from "crypto";

declare module "express-session" {
  interface SessionData {
    user?: string;
  }
}

/**
 * Single-account sign-in for the studio.
 * Set APP_USERNAME and APP_PASSWORD to require it. Without them the API stays open (as before)
 * and the sign-in screen accepts any name, which the screen tells the user.
 */
export function authRequired(): boolean {
  return Boolean(process.env.APP_USERNAME && process.env.APP_PASSWORD);
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function setupAuth(app: Express) {
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
    res.json({ authRequired: authRequired(), user: req.session.user ?? null });
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    const name = (username ?? "").trim();
    if (!name || !password) {
      return res.status(400).json({ message: "Enter your username and password." });
    }

    if (authRequired()) {
      const ok = safeEqual(name, process.env.APP_USERNAME!) && safeEqual(password, process.env.APP_PASSWORD!);
      if (!ok) return res.status(401).json({ message: "That username and password don't match." });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ message: "Couldn't start a session. Try again." });
      req.session.user = name;
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

/** Guards data routes when sign-in is required. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!authRequired() || req.session.user) return next();
  res.status(401).json({ message: "Sign in to continue." });
}
