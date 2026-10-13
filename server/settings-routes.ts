import type { Express } from "express";
import { checkCredentials, currentUsername, requireAuth } from "./auth";
import { DEFAULT_REVIEW_TEMPLATE, hashPassword, readSettings, updateSettings } from "./settings-store";

const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_PHOTO_CHARS = 400_000; // ~300 KB; the client resizes to 256px first
let titleCache: { id: string; title: string | null; at: number } | null = null;

function publicSettings(sessionUser: string | undefined) {
  const s = readSettings();
  return {
    profile: { ...s.profile, displayName: s.profile.displayName || sessionUser || "" },
    studio: s.studio,
    defaults: { reviewTemplate: DEFAULT_REVIEW_TEMPLATE },
    security: { username: currentUsername(), passwordSetIn: s.auth ? "settings" : "env" },
  };
}

export function registerSettingsRoutes(app: Express) {
  app.get("/api/settings", requireAuth, (req, res) => {
    res.json(publicSettings(req.session.user));
  });

  app.put("/api/settings/profile", requireAuth, (req, res) => {
    const { displayName, role, photo } = (req.body ?? {}) as { displayName?: string; role?: string; photo?: string | null };
    const name = (displayName ?? "").trim();
    const label = (role ?? "").trim();
    if (!name || name.length > 60) return res.status(400).json({ field: "displayName", message: "Enter a display name of up to 60 characters." });
    if (label.length > 40) return res.status(400).json({ field: "role", message: "Keep the role to 40 characters or fewer." });
    if (photo != null && (!PHOTO_PATTERN.test(photo) || photo.length > MAX_PHOTO_CHARS)) {
      return res.status(400).json({ field: "photo", message: "Use a JPG, PNG or WebP image under 300 KB." });
    }
    updateSettings((s) => {
      s.profile = { displayName: name, role: label || "Admin", photo: photo === undefined ? s.profile.photo : photo };
    });
    res.json(publicSettings(req.session.user));
  });

  app.put("/api/settings/studio", requireAuth, (req, res) => {
    const { name, overdueDays, reviewTemplate } = (req.body ?? {}) as { name?: string; overdueDays?: number; reviewTemplate?: string };
    const studioName = (name ?? "").trim();
    const days = Number(overdueDays);
    const template = (reviewTemplate ?? "").trim();
    if (!studioName || studioName.length > 60) return res.status(400).json({ field: "name", message: "Enter a studio name of up to 60 characters." });
    if (!Number.isInteger(days) || days < 1 || days > 120) return res.status(400).json({ field: "overdueDays", message: "Enter a whole number of days from 1 to 120." });
    if (!template || template.length > 600) return res.status(400).json({ field: "reviewTemplate", message: "Write a message of up to 600 characters, or reset it to the default." });
    updateSettings((s) => {
      s.studio = { name: studioName, overdueDays: days, reviewTemplate: template };
    });
    res.json(publicSettings(req.session.user));
  });

  /** Change username and/or password. Signs out every other device. */
  app.post("/api/settings/credentials", requireAuth, (req, res) => {
    const { username, currentPassword, newPassword } = (req.body ?? {}) as { username?: string; currentPassword?: string; newPassword?: string };
    const nextUser = (username ?? "").trim();
    const existingUser = currentUsername();
    if (!nextUser || nextUser.length > 40) return res.status(400).json({ field: "username", message: "Enter a username of up to 40 characters." });
    if (!currentPassword || !existingUser || !checkCredentials(existingUser, currentPassword)) {
      return res.status(400).json({ field: "currentPassword", message: "That isn’t your current password. Check it and try again." });
    }
    if (newPassword && newPassword.length < 10) {
      return res.status(400).json({ field: "newPassword", message: "Use at least 10 characters for the new password." });
    }
    const updated = updateSettings((s) => {
      s.auth = { username: nextUser, ...hashPassword(newPassword || currentPassword) };
      s.sessionEpoch += 1;
    });
    // Keep this device signed in under the new details.
    req.session.user = nextUser;
    req.session.epoch = updated.sessionEpoch;
    req.session.save(() => res.json(publicSettings(nextUser)));
  });

  app.post("/api/settings/sign-out-everywhere", requireAuth, (req, res) => {
    updateSettings((s) => {
      s.sessionEpoch += 1;
    });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });

  app.get("/api/settings/sheet", requireAuth, async (_req, res) => {
    const id = process.env.GOOGLE_SHEET_ID;
    const connected = Boolean(id && process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    if (!connected || !id) return res.json({ connected: false, title: null, url: null });
    const url = `https://docs.google.com/spreadsheets/d/${id}`;
    if (titleCache && titleCache.id === id && Date.now() - titleCache.at < 5 * 60_000) {
      return res.json({ connected, title: titleCache.title, url });
    }
    try {
      const { googleSheetsService } = await import("./services/google-sheets");
      const title = await googleSheetsService.getTitle(id);
      titleCache = { id, title, at: Date.now() };
      res.json({ connected, title, url });
    } catch {
      res.json({ connected, title: null, url, error: "The sheet couldn’t be reached just now." });
    }
  });

}
