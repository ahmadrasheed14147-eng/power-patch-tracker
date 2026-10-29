import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell, BarChart3, ClipboardList, Copy, FilePlus2, Home, LayoutDashboard, LogOut, Menu, Settings, Users, Wrench, Zap, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { homeFor, useStore } from "@/hooks/use-store";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/helpers";
import { DemoToolbar } from "./DemoToolbar";

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean };
const NAV: Record<Role, NavItem[]> = {
  consumer: [
    { to: "/consumer", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/consumer/submit", label: "Submit Complaint", icon: FilePlus2 },
    { to: "/consumer/complaints", label: "My Complaints", icon: ClipboardList },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/complaints", label: "All Complaints", icon: ClipboardList },
    { to: "/admin/duplicates", label: "Duplicate Review", icon: Copy },
    { to: "/admin/users", label: "Users & Workers", icon: Users },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
  worker: [
    { to: "/worker", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/worker/tasks", label: "My Tasks", icon: Wrench },
  ],
};
const COMMON: NavItem[] = [
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile & Settings", icon: Settings },
];
const ROLE_LABEL: Record<Role, string> = { consumer: "Consumer", admin: "Administrator", worker: "Field Worker" };

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Zap className="h-4 w-4" />
      </span>
      <span className="tracking-tight">Power-Track</span>
    </Link>
  );
}

function NotificationBell() {
  const { myNotifications, markRead, markAllRead } = useStore();
  const navigate = useNavigate();
  const unread = myNotifications.filter((n) => !n.read).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">{unread}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unread > 0 && <button className="text-xs text-primary hover:underline" onClick={markAllRead}>Mark all read</button>}
        </div>
        <DropdownMenuSeparator />
        {myNotifications.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>}
        {myNotifications.slice(0, 5).map((n) => (
          <DropdownMenuItem
            key={n.id}
            className="flex items-start gap-2 py-2"
            onClick={() => {
              markRead(n.id);
              if (n.complaintId) navigate({ to: "/complaints/$id", params: { id: n.complaintId } });
            }}
          >
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
            <div className="min-w-0">
              <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
              <p className="truncate text-xs text-muted-foreground">{n.message}</p>
              <p className="text-[11px] text-muted-foreground">{formatDateTime(n.at)}</p>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/notifications" className="justify-center text-primary">View all</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children, role }: { children: ReactNode; role?: Role }) {
  const { currentUser, hydrated, logout } = useStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) navigate({ to: "/login" });
    else if (role && currentUser.role !== role) navigate({ to: homeFor(currentUser.role) });
  }, [hydrated, currentUser, role, navigate]);

  if (!hydrated || !currentUser || (role && currentUser.role !== role)) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  const items = [...NAV[currentUser.role], ...COMMON];
  const isActive = (i: NavItem) => (i.exact ? path === i.to : path.startsWith(i.to));

  const sidebar = (
    <nav className="flex flex-col gap-1 p-3">
      <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{ROLE_LABEL[currentUser.role]}</p>
      {items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(i) ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <i.icon className="h-4 w-4" /> {i.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <DemoToolbar />
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Logo />
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {currentUser.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight">{currentUser.name}</span>
                  <span className="block text-xs text-muted-foreground">{ROLE_LABEL[currentUser.role]}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild><Link to="/profile"><Settings className="mr-2 h-4 w-4" />Profile & Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => (logout(), navigate({ to: "/login" }))}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r bg-background lg:block lg:min-h-[calc(100vh-6.25rem)]">{sidebar}</aside>
        {open && <aside className="fixed inset-x-0 top-[6.25rem] z-20 border-b bg-background shadow-md lg:hidden">{sidebar}</aside>}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
