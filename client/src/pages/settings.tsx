import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import { Check, Download, ExternalLink, Loader2, RefreshCw, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { FieldError, useSettings, useSheetStatus, type Settings as SettingsData } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { buildBackup, clearLocalData, downloadBackup, localCounts, parseBackup, restoreBackup, type Backup } from "@/lib/backup";
import { clearFiles, formatBytes, listFiles } from "@/lib/file-store";
import { formatDate, toEntry } from "@/lib/finance";
import { squareThumbnail } from "@/lib/image";
import { snappy } from "@/lib/motion";
import { count } from "@/lib/plural";
import { fillReviewTemplate, TEMPLATE_PLACEHOLDERS } from "@/lib/review-template";
import { setPreference, usePreference, useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";
import profileImage from "@assets/user_profile.jpg";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "studio", label: "Studio" },
  { id: "appearance", label: "Appearance" },
  { id: "sheet", label: "Payments sheet" },
  { id: "security", label: "Security" },
  { id: "data", label: "Your data" },
] as const;

/* ---------- Building blocks ---------- */

function Section({ id, title, description, children, footer, after }: { id: string; title: string; description: string; children: ReactNode; footer?: ReactNode; after?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="panel scroll-mt-4 overflow-hidden">
      <div className="p-5 lg:p-6">
        <h2 id={`${id}-title`} className="text-lg">{title}</h2>
        <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-sunken px-5 py-3 lg:px-6">{footer}</div>}
      {after && <div className="border-t border-line p-5 lg:px-6">{after}</div>}
    </section>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: ReactNode; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="text-sm text-vermilion">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SaveButton({ dirty, pending, children }: { dirty: boolean; pending: boolean; children: ReactNode }) {
  return (
    <Button type="submit" disabled={!dirty || pending}>
      {pending && <Loader2 className="animate-spin" />}
      {pending ? "Saving" : children}
    </Button>
  );
}

const fieldError = (err: unknown, field: string) => (err instanceof FieldError && err.field === field ? err.message : undefined);
const formError = (err: unknown) => (err instanceof FieldError && !err.field ? err.message : undefined);

/* ---------- Profile ---------- */

function ProfileSection({ settings }: { settings: SettingsData }) {
  const { saveProfile } = useSettings();
  const { toast } = useToast();
  const [form, setForm] = useState(settings.profile);
  const [photoError, setPhotoError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setForm(settings.profile), [settings.profile]);

  const dirty = JSON.stringify(form) !== JSON.stringify(settings.profile);
  const err = saveProfile.error;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await saveProfile.mutateAsync(form).then(() => toast({ title: "Profile saved" })).catch(() => {});
      }}
    >
      <Section
        id="profile"
        title="Profile"
        description="How you appear in the top bar on every device."
        footer={<SaveButton dirty={dirty} pending={saveProfile.isPending}>Save profile</SaveButton>}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-16 rounded-2xl">
            <AvatarImage src={form.photo || profileImage} alt="" className="img-outline rounded-2xl object-cover" />
            <AvatarFallback className="rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">{form.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload />
              Upload photo
            </Button>
            {form.photo && (
              <Button type="button" variant="ghost" onClick={() => setForm((f) => ({ ...f, photo: null }))}>
                Remove photo
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                setPhotoError(undefined);
                const photo = await squareThumbnail(file);
                setForm((f) => ({ ...f, photo }));
              } catch (error) {
                setPhotoError(error instanceof Error ? error.message : "Couldn’t read that image. Try a JPG or PNG.");
              }
            }}
          />
          <p className="basis-full text-xs text-muted-foreground">
            {photoError ? <span className="text-vermilion">{photoError}</span> : "JPG, PNG or WebP. It’s cropped to a square."}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="displayName" label="Display name" error={fieldError(err, "displayName")}>
            <input
              id="displayName"
              className="field"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              autoComplete="name"
              aria-invalid={Boolean(fieldError(err, "displayName"))}
            />
          </Field>
          <Field id="role" label="Role" hint="Shown under your name." error={fieldError(err, "role")}>
            <input id="role" className="field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Admin" />
          </Field>
        </div>
        {formError(err) && <p className="mt-4 text-sm text-vermilion">{formError(err)}</p>}
      </Section>
    </form>
  );
}

/* ---------- Studio ---------- */

function StudioSection({ settings }: { settings: SettingsData }) {
  const { saveStudio } = useSettings();
  const { data: payments, entries } = useEntries();
  const { toast } = useToast();
  const [form, setForm] = useState(settings.studio);
  const templateRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setForm(settings.studio), [settings.studio]);

  const dirty = JSON.stringify(form) !== JSON.stringify(settings.studio);
  const err = saveStudio.error;
  const days = Number(form.overdueDays);
  const validDays = Number.isInteger(days) && days >= 1 && days <= 120;

  // Live consequence of the rule, so the number means something before saving.
  const overdueWithRule = useMemo(
    () => (validDays ? (payments ?? []).map((p) => toEntry(p, days)).filter((e) => e.state === "Overdue").length : null),
    [payments, days, validDays],
  );
  const sample = entries.find((e) => e.state === "Paid") ?? entries[0];
  const preview = fillReviewTemplate(form.reviewTemplate, { client: sample?.client ?? "Your client", project: sample?.project, studio: form.name || "your studio" });

  const insert = (token: string) => {
    const el = templateRef.current;
    const start = el?.selectionStart ?? form.reviewTemplate.length;
    const end = el?.selectionEnd ?? start;
    const next = form.reviewTemplate.slice(0, start) + token + form.reviewTemplate.slice(end);
    setForm((f) => ({ ...f, reviewTemplate: next }));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await saveStudio
          .mutateAsync({ ...form, overdueDays: days })
          .then(() => toast({ title: "Studio settings saved" }))
          .catch(() => {});
      }}
    >
      <Section
        id="studio"
        title="Studio"
        description="The studio’s name and the rules the board uses for payments and review requests."
        footer={<SaveButton dirty={dirty} pending={saveStudio.isPending}>Save studio settings</SaveButton>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="studioName" label="Studio name" hint="Shown in the sidebar and on the sign-in screen." error={fieldError(err, "name")}>
            <input id="studioName" className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field
            id="overdueDays"
            label="Overdue after"
            error={fieldError(err, "overdueDays") ?? (validDays ? undefined : "Enter a whole number of days from 1 to 120.")}
            hint={overdueWithRule == null ? undefined : `With this rule, ${count(overdueWithRule, { one: "# job is", other: "# jobs are" })} overdue today.`}
          >
            <div className="relative">
              <input
                id="overdueDays"
                type="number"
                min={1}
                max={120}
                inputMode="numeric"
                className="field tnum pr-28"
                value={form.overdueDays}
                onChange={(e) => setForm((f) => ({ ...f, overdueDays: e.target.value === "" ? ("" as unknown as number) : Number(e.target.value) }))}
                aria-invalid={!validDays}
                aria-describedby="overdueDays-msg"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">days unpaid</span>
            </div>
          </Field>
        </div>

        <div className="mt-6 space-y-1.5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <label htmlFor="reviewTemplate" className="text-sm font-medium">Review request message</label>
            <div className="flex flex-wrap gap-1.5" aria-label="Insert a placeholder">
              {TEMPLATE_PLACEHOLDERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => insert(t)}
                  className="pressable rounded-md border border-line bg-raised px-2 py-1 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Insert {t}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="reviewTemplate"
            ref={templateRef}
            rows={4}
            className="field h-auto resize-y py-3 leading-relaxed"
            value={form.reviewTemplate}
            onChange={(e) => setForm((f) => ({ ...f, reviewTemplate: e.target.value }))}
            aria-invalid={Boolean(fieldError(err, "reviewTemplate"))}
            aria-describedby="reviewTemplate-msg"
          />
          <div id="reviewTemplate-msg" className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            {fieldError(err, "reviewTemplate") ? (
              <span className="text-sm text-vermilion">{fieldError(err, "reviewTemplate")}</span>
            ) : (
              <span className="tnum">{form.reviewTemplate.length} of 600 characters</span>
            )}
            {form.reviewTemplate !== settings.defaults.reviewTemplate && (
              <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => setForm((f) => ({ ...f, reviewTemplate: settings.defaults.reviewTemplate }))}>
                Reset to the default message
              </button>
            )}
          </div>
          <div className="mt-3 rounded-xl border border-line bg-sunken p-4">
            <p className="text-xs text-muted-foreground">Preview{sample ? ` for ${sample.client}` : ""}</p>
            <p className="mt-1.5 text-sm leading-relaxed">{preview}</p>
          </div>
        </div>
        {formError(err) && <p className="mt-4 text-sm text-vermilion">{formError(err)}</p>}
      </Section>
    </form>
  );
}

/* ---------- Appearance ---------- */

/** A tiny drawing of the board, rendered with the real theme tokens by scoping a theme class to it. */
function ThemePreview({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className={cn(theme, "flex size-full gap-1.5 bg-background p-2")} aria-hidden="true">
      <div className="flex w-[26%] flex-col gap-1 rounded-md border border-line bg-card p-1.5">
        <span className="h-1.5 w-3/4 rounded-full bg-primary" />
        <span className="h-1 w-2/3 rounded-full bg-ink/15" />
        <span className="h-1 w-1/2 rounded-full bg-ink/15" />
        <span className="h-1 w-3/5 rounded-full bg-ink/15" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex gap-1.5">
          <span className="h-4 flex-1 rounded-md border border-line bg-card" />
          <span className="h-4 flex-1 rounded-md border border-line bg-card" />
        </div>
        <div className="flex flex-1 items-end gap-1 rounded-md border border-line bg-card p-1.5">
          {[0.45, 0.7, 0.4, 0.85].map((h, i) => (
            <span key={i} className={cn("flex-1 rounded-[3px]", i === 3 ? "bg-primary" : "hatch hatch-soft bg-ink/[0.05]")} style={{ height: `${h * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "Match my device" },
];

function AppearanceSection() {
  const preference = usePreference();
  const current = useTheme();
  return (
    <Section id="appearance" title="Appearance" description="Changes apply straight away and are saved on this device only, so your phone and computer can differ.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
        {THEME_OPTIONS.map((o) => {
          const selected = preference === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={(e) => setPreference(o.value, { x: e.clientX || 0, y: e.clientY || 0 })}
              className={cn(
                "pressable group rounded-2xl border p-1.5 text-left transition-colors",
                selected ? "border-primary bg-primary/[0.06]" : "border-line hover:border-ink/20",
              )}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] border border-line">
                {o.value === "system" ? (
                  <>
                    <ThemePreview theme="light" />
                    {/* Split at the slant of the Nexaworks mark */}
                    <div className="absolute inset-0 [clip-path:polygon(62%_0,100%_0,100%_100%,38%_100%)]">
                      <ThemePreview theme="dark" />
                    </div>
                  </>
                ) : (
                  <ThemePreview theme={o.value} />
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-2.5">
                <span>
                  <span className="block text-sm font-medium">{o.label}</span>
                  {o.value === "system" && <span className="block text-xs text-muted-foreground">Now {current}</span>}
                </span>
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-ink/25",
                  )}
                >
                  {selected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------- Payments sheet ---------- */

function SheetSection() {
  const { data: status, isLoading } = useSheetStatus();
  const { entries, dataUpdatedAt, refetch, isFetching, isError } = useEntries();
  const { toast } = useToast();

  const sync = async () => {
    const r = await refetch();
    toast(
      r.isError
        ? { variant: "destructive", title: "Sync failed", description: "The sheet couldn’t be reached. Check the connection and try again." }
        : { title: "Payments synced", description: count(r.data?.length ?? 0, { one: "# row read from the sheet.", other: "# rows read from the sheet." }) },
    );
  };

  return (
    <Section
      id="sheet"
      title="Payments sheet"
      description="The Google Sheet every payment, invoice and project comes from."
      footer={
        status?.connected ? (
          <>
            {status.url && (
              <Button asChild variant="ghost">
                <a href={status.url} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Open in Google Sheets
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={sync} disabled={isFetching}>
              <RefreshCw className={cn(isFetching && "animate-spin")} />
              {isFetching ? "Syncing" : "Sync sheet"}
            </Button>
          </>
        ) : undefined
      }
    >
      {isLoading ? (
        <Skeleton className="h-16 bg-raised" />
      ) : status?.connected ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-raised p-3.5 sm:col-span-1">
            <dt className="text-xs text-muted-foreground">Sheet</dt>
            <dd className="mt-1 flex items-center gap-2 text-sm font-medium">
              <span className={cn("size-2 shrink-0 rounded-full", isError || status.error ? "bg-vermilion" : "bg-mint")} aria-hidden="true" />
              <span className="break-words">{status.title ?? "Connected"}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-raised p-3.5">
            <dt className="text-xs text-muted-foreground">Rows read</dt>
            <dd className="figure mt-1 text-lg font-semibold">{entries.length}</dd>
          </div>
          <div className="rounded-xl bg-raised p-3.5">
            <dt className="text-xs text-muted-foreground">Last synced</dt>
            <dd className="mt-1 text-sm font-medium">
              {isError ? (
                <span className="text-vermilion">Last sync failed</span>
              ) : !dataUpdatedAt ? (
                "Not yet"
              ) : Date.now() - dataUpdatedAt < 60_000 ? (
                "Just now"
              ) : (
                formatDistanceToNowStrict(dataUpdatedAt, { addSuffix: true })
              )}
            </dd>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-3">
            To read a different sheet, change GOOGLE_SHEET_ID in .env and restart the server. The access key stays in .env so it never passes through the browser.
          </p>
        </dl>
      ) : (
        <div className="rounded-xl border border-dashed border-vermilion/30 bg-vermilion/[0.04] p-4 text-sm">
          <p className="font-medium">No sheet connected</p>
          <p className="mt-1 text-muted-foreground">Add GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON to .env, then restart the server.</p>
        </div>
      )}
    </Section>
  );
}

/* ---------- Security ---------- */

function SecuritySection({ settings }: { settings: SettingsData }) {
  const { saveCredentials, signOutEverywhere } = useSettings();
  const { toast } = useToast();
  const empty = { username: settings.security.username ?? "", currentPassword: "", newPassword: "", confirm: "" };
  const [form, setForm] = useState(empty);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => setForm((f) => ({ ...f, username: settings.security.username ?? "" })), [settings.security.username]);

  const err = saveCredentials.error;
  const mismatch = form.confirm.length > 0 && form.newPassword !== form.confirm;
  const changed = form.username.trim() !== (settings.security.username ?? "") || form.newPassword.length > 0;
  const ready = changed && form.currentPassword.length > 0 && !mismatch && (form.newPassword.length === 0 || form.confirm.length > 0);

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!ready) return;
          await saveCredentials
            .mutateAsync({ username: form.username.trim(), currentPassword: form.currentPassword, newPassword: form.newPassword || undefined })
            .then(() => {
              setForm({ ...empty, username: form.username.trim() });
              toast({ title: "Sign-in details updated", description: "Other devices have been signed out." });
            })
            .catch(() => {});
        }}
      >
        <Section
          id="security"
          title="Security"
          description="Change how you sign in. Saving signs out every other device, so only you can get back in."
          footer={<SaveButton dirty={ready} pending={saveCredentials.isPending}>Update sign-in details</SaveButton>}
          after={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Sign out everywhere</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Ends every session, including this one. Use it if a device is lost.</p>
            </div>
            <Button type="button" variant="outline" className="shrink-0 text-vermilion hover:bg-vermilion/10" onClick={() => setConfirmOpen(true)}>
              Sign out everywhere
            </Button>
          </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="username" label="Username" error={fieldError(err, "username")}>
              <input id="username" className="field" autoComplete="username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </Field>
            <Field id="currentPassword" label="Current password" hint="Needed to change anything here." error={fieldError(err, "currentPassword")}>
              <input
                id="currentPassword"
                type="password"
                className="field"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                aria-invalid={Boolean(fieldError(err, "currentPassword"))}
                aria-describedby="currentPassword-msg"
              />
            </Field>
            <Field id="newPassword" label="New password" hint="At least 10 characters. Leave blank to keep your current password." error={fieldError(err, "newPassword")}>
              <input
                id="newPassword"
                type="password"
                className="field"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                aria-describedby="newPassword-msg"
              />
            </Field>
            <Field id="confirm" label="Confirm new password" error={mismatch ? "The two new passwords don’t match. Type it again." : undefined}>
              <input
                id="confirm"
                type="password"
                className="field"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                aria-invalid={mismatch}
                disabled={!form.newPassword}
              />
            </Field>
          </div>
          {formError(err) && <p className="mt-4 text-sm text-vermilion">{formError(err)}</p>}

        </Section>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out on every device?</AlertDialogTitle>
            <AlertDialogDescription>You’ll need to sign in again here, on your phone and anywhere else you use the board.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-vermilion text-white hover:bg-vermilion/90" onClick={() => signOutEverywhere.mutate()}>
              Sign out everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ---------- Your data ---------- */

function DataSection() {
  const { toast } = useToast();
  const [counts, setCounts] = useState(localCounts);
  const [files, setFiles] = useState<{ count: number; bytes: number } | null>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    setCounts(localCounts());
    listFiles()
      .then((list) => setFiles({ count: list.length, bytes: list.reduce((a, f) => a + f.size, 0) }))
      .catch(() => setFiles({ count: 0, bytes: 0 }));
  };
  useEffect(refresh, []);

  const summary = (c: { tasks: number; reviews: number; listPrices: number }) =>
    [count(c.tasks, { one: "# task", other: "# tasks" }), count(c.reviews, { one: "# review", other: "# reviews" }), count(c.listPrices, { one: "# list price", other: "# list prices" })];

  return (
    <>
      <Section id="data" title="Your data" description="Tasks, reviews, list prices and files are saved in this browser, not on the server. Back them up to move them to another device.">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Tasks", counts.tasks],
            ["Reviews", counts.reviews],
            ["List prices", counts.listPrices],
            ["Files", files ? `${files.count}` : "…"],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl bg-raised p-3.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="figure mt-1 text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {files && files.count > 0 && <p className="mt-2 text-xs text-muted-foreground">Files use {formatBytes(files.bytes)} and aren’t included in backups.</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              downloadBackup();
              toast({ title: "Backup downloaded", description: summary(counts).join(", ") + "." });
            }}
          >
            <Download />
            Export backup
          </Button>
          <Button type="button" variant="outline" onClick={() => importRef.current?.click()}>
            <Upload />
            Import backup
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                setPending(await parseBackup(file));
              } catch (err) {
                toast({ variant: "destructive", title: "Couldn’t import that file", description: err instanceof Error ? err.message : undefined });
              }
            }}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-vermilion/25 bg-vermilion/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Clear this browser’s data</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Deletes tasks, reviews, list prices and files from this browser. Payments stay on the sheet.</p>
          </div>
          <Button type="button" variant="outline" className="shrink-0 text-vermilion hover:bg-vermilion/10" onClick={() => setClearOpen(true)}>
            Clear browser data
          </Button>
        </div>
      </Section>

      <AlertDialog open={Boolean(pending)} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace this browser’s data with the backup?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending &&
                `The backup from ${formatDate(new Date(pending.exportedAt))} has ${summary({ tasks: pending.tasks.length, reviews: pending.reviews.length, listPrices: Object.keys(pending.listPrices).length }).join(", ")}. They replace what’s here now (${summary(counts).join(", ")}). Files aren’t affected.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pending) return;
                restoreBackup(pending);
                setPending(null);
                refresh();
                toast({ title: "Backup imported" });
              }}
            >
              Replace with backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={clearOpen}
        onOpenChange={(o) => {
          setClearOpen(o);
          if (!o) setTyped("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this browser’s data?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes {summary(counts).join(", ")} and {count(files?.count ?? 0, { one: "# file", other: "# files" })} from this browser. It can’t be undone, so export a backup
              first if you might need them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <label htmlFor="confirm-clear" className="text-sm font-medium">
              Type “delete” to confirm
            </label>
            <input id="confirm-clear" className="field" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={typed.trim().toLowerCase() !== "delete"}
              className="bg-vermilion text-white hover:bg-vermilion/90"
              onClick={async () => {
                clearLocalData();
                await clearFiles();
                setTyped("");
                refresh();
                toast({ title: "Browser data cleared" });
              }}
            >
              Clear browser data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ---------- Page ---------- */

function SectionNav({ ready }: { ready: boolean }) {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);

  // Highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (items) => {
        const visible = items.filter((i) => i.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-10% 0px -60% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    // The last section can't scroll to the top, so reaching the bottom selects it.
    const scroller = navRef.current?.closest(".overflow-auto");
    const onScroll = () => {
      if (scroller && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8) setActive(SECTIONS[SECTIONS.length - 1].id);
    };
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      scroller?.removeEventListener("scroll", onScroll);
    };
  }, [ready]);

  return (
    <nav ref={navRef} aria-label="Settings sections" className="min-w-0 lg:sticky lg:top-0 lg:self-start">
      <ul className="scrollbar-none flex gap-1 overflow-x-auto overscroll-x-contain lg:flex-col">
        {SECTIONS.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                setActive(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
              }}
              aria-current={active === s.id ? "true" : undefined}
              className={cn(
                "relative flex h-9 items-center whitespace-nowrap rounded-lg px-3 text-sm transition-colors",
                active === s.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active === s.id && <motion.span layoutId="settings-nav" className="absolute inset-0 rounded-lg bg-ink/[0.06]" transition={snappy} />}
              <span className="relative">{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Settings() {
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const { studioName } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description={`Your profile, ${studioName}’s rules and how you sign in. Saved for every device unless a section says otherwise.`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <SectionNav ready={Boolean(settings)} />
        <div className="space-y-3">
          {isError ? (
            <div className="panel p-6">
              <p className="font-medium">Couldn’t load your settings</p>
              <p className="mt-1 text-sm text-muted-foreground">Check that the server is running, then try again.</p>
              <Button className="mt-4" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : isLoading || !settings ? (
            Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-56 rounded-[var(--radius-panel)] bg-card" />)
          ) : (
            <>
              <ProfileSection settings={settings} />
              <StudioSection settings={settings} />
              <AppearanceSection />
              <SheetSection />
              <SecuritySection settings={settings} />
              <DataSection />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
