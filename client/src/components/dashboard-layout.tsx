import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import {
  LayoutGrid,
  BarChart3,
  Settings,
  Search,
  Bell,
  Briefcase,
  LogOut,
  MessageSquare,
  Users,
  Percent,
  FileText,
  CreditCard,
  CheckSquare,
  Folder,
  RefreshCw,
  Menu,
  ImageUp,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Wordmark } from "@/components/brand/nexa-mark";
import { useEntries } from "@/hooks/use-entries";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatMoney, formatDate } from "@/lib/finance";
import { easeOut, snappy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import profileImage from "@assets/user_profile.jpg";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Menu",
    items: [
      { icon: LayoutGrid, label: "Overview", href: "/" },
      { icon: Briefcase, label: "Projects", href: "/projects" },
      { icon: Users, label: "Customers", href: "/customers" },
      { icon: FileText, label: "Invoices", href: "/invoices" },
      { icon: CreditCard, label: "Payments", href: "/payments" },
      { icon: BarChart3, label: "Reports", href: "/reports" },
      { icon: CheckSquare, label: "Tasks", href: "/tasks" },
      { icon: Folder, label: "Files", href: "/files" },
    ],
  },
  {
    label: "Studio",
    items: [
      { icon: Percent, label: "Pricing", href: "/pricing" },
      { icon: MessageSquare, label: "Reviews", href: "/reviews" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

const ALL_PAGES = NAV.flatMap((g) => g.items);

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();

  return (
    <nav className="space-y-6" aria-label="Main">
      {NAV.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground/70">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = location === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150",
                      active ? "text-primary-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                    )}
                  >
                    {/* One pill that travels between items, so the eye follows where you went */}
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-primary"
                        transition={snappy}
                      />
                    )}
                    <item.icon className="relative size-[18px] shrink-0" strokeWidth={1.75} />
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SyncCard() {
  const { dataUpdatedAt, refetch, isFetching, isError } = useEntries();
  const { toast } = useToast();
  const [, tick] = useState(0);

  const sync = async () => {
    const result = await refetch();
    toast(
      result.isError
        ? { variant: "destructive", title: "Sync failed", description: "The sheet couldn't be reached. Check the connection and try again." }
        : { title: "Payments synced", description: `${result.data?.length ?? 0} rows read from the studio sheet.` },
    );
  };

  // Keep "synced x ago" honest without a re-render storm.
  useEffect(() => {
    const id = window.setInterval(() => tick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const status = isFetching
    ? "Syncing with the sheet"
    : isError
      ? "Last sync failed"
      : dataUpdatedAt
        ? Date.now() - dataUpdatedAt < 60_000
          ? "Synced just now"
          : `Synced ${formatDistanceToNowStrict(dataUpdatedAt, { addSuffix: true })}`
        : "Not synced yet";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground">
      <div className="hatch pointer-events-none absolute inset-0 [--hatch-color:rgb(255_255_255/0.12)]" />
      <div className="relative">
        <p className="font-display text-[15px] font-semibold leading-tight">Studio payments sheet</p>
        <p className="mt-1 text-xs text-white/75" aria-live="polite">
          {status}
        </p>
        <button
          onClick={sync}
          disabled={isFetching}
          className="pressable mt-4 flex h-8 w-full items-center justify-between rounded-lg border-t border-white/25 pt-3 text-left text-sm font-medium disabled:opacity-80"
        >
          {isFetching ? "Syncing" : "Sync now"}
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}

function OverdueBell() {
  const { entries } = useEntries();
  const overdue = useMemo(
    () => entries.filter((e) => e.state === "Overdue").sort((a, b) => b.balance - a.balance),
    [entries],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="pressable relative grid size-10 place-items-center rounded-xl border border-line bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label={overdue.length ? `${overdue.length} overdue invoices` : "No overdue invoices"}
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          {overdue.length > 0 && (
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-vermilion ring-2 ring-card" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 rounded-2xl border-line bg-popover p-0">
        <div className="border-b border-line px-4 py-3">
          <p className="text-sm font-medium">Overdue</p>
          <p className="text-xs text-muted-foreground">
            {overdue.length ? "Unpaid more than 14 days after issue." : "Nothing is overdue."}
          </p>
        </div>
        <ul className="max-h-72 overflow-auto p-1.5">
          {overdue.map((e) => (
            <li key={e.id}>
              <Link
                href={`/payments?q=${encodeURIComponent(e.client)}`}
                className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{e.client}</p>
                  <p className="text-xs text-muted-foreground">Due {formatDate(e.due, "d MMM")}</p>
                </div>
                <span className="tnum shrink-0 text-sm font-medium text-vermilion">{formatMoney(e.balance)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { entries } = useEntries();
  const clients = useMemo(() => Array.from(new Set(entries.map((e) => e.client))).sort(), [entries]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-sm items-center gap-2.5 rounded-xl border border-line bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-white/15"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-left">
          <span className="sm:hidden">Search</span>
          <span className="hidden sm:inline">Search pages and clients</span>
        </span>
        <kbd className="hidden rounded-md border border-line bg-raised px-1.5 py-0.5 font-sans text-[11px] sm:inline">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Go to a page or find a client" />
        <CommandList>
          <CommandEmpty>No pages or clients match.</CommandEmpty>
          <CommandGroup heading="Pages">
            {ALL_PAGES.map((p) => (
              <CommandItem key={p.href} onSelect={() => go(p.href)}>
                <p.icon className="mr-2 text-muted-foreground" />
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {clients.length > 0 && (
            <CommandGroup heading="Clients">
              {clients.map((c) => (
                <CommandItem key={c} value={`client ${c}`} onSelect={() => go(`/payments?q=${encodeURIComponent(c)}`)}>
                  <Users className="mr-2 text-muted-foreground" />
                  {c}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState(() => localStorage.getItem("profile_image") || profileImage);
  const name = user || "Dominion";

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhoto(base64);
      localStorage.setItem("profile_image", base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="pressable flex items-center gap-3 rounded-xl border border-line bg-card py-1 pl-1 pr-3 transition-colors hover:border-white/15">
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src={photo} alt="" className="object-cover" />
            <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-tight text-foreground">{name}</span>
            <span className="block text-xs leading-tight text-muted-foreground">Admin</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-48 rounded-xl border-line bg-popover">
        <DropdownMenuItem onSelect={() => fileInputRef.current?.click()} className="gap-2 rounded-lg">
          <ImageUp className="size-4" /> Change photo
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-line" />
        <DropdownMenuItem onSelect={() => logout.mutate()} className="gap-2 rounded-lg text-vermilion focus:text-vermilion">
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onPhoto} />
    </DropdownMenu>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh gap-3 overflow-hidden bg-background p-3 text-foreground">
      {/* Sidebar */}
      <aside className="panel hidden w-[248px] shrink-0 flex-col md:flex">
        <div className="flex h-16 items-center px-5">
          <Link href="/" aria-label="Overview">
            <Wordmark />
          </Link>
        </div>
        <div className="scrollbar-none flex-1 overflow-y-auto px-3 pb-4 pt-2">
          <NavList />
        </div>
        <div className="space-y-2 p-3">
          <SyncCard />
          <button
            onClick={() => logout.mutate()}
            className="pressable flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-vermilion/90 transition-colors hover:bg-vermilion/10 hover:text-vermilion"
          >
            <LogOut className="size-[18px]" strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 md:px-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="grid size-10 place-items-center rounded-xl border border-line bg-card md:hidden" aria-label="Open menu">
                <Menu className="size-[18px]" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-line bg-card p-3">
              <SheetTitle className="flex h-14 items-center px-2">
                <Wordmark />
              </SheetTitle>
              <NavList onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <SearchPalette />
          </div>
          <OverdueBell />
          <ProfileMenu />
        </header>

        <div className="scrollbar-none flex-1 overflow-auto md:px-2">
          {/* Route change: a quick fade so pages don't snap, short enough to stay out of the way */}
          <motion.div
            key={location}
            initial={{ opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(4px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.18, ease: easeOut }}
            className="mx-auto w-full max-w-[1440px] pb-6 pt-4"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
