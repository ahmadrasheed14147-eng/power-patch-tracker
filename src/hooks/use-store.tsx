import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Complaint, Notification, Role, Status, User, Priority } from "@/types";
import { SEED_NOTIFICATIONS, SEED_USERS, buildSeedComplaints } from "@/data/mock";

const KEY = "powertrack-state-v1";

interface State {
  users: User[];
  complaints: Complaint[];
  notifications: Notification[];
  currentUserId: string | null;
}

const seed = (): State => ({
  users: SEED_USERS,
  complaints: buildSeedComplaints(),
  notifications: SEED_NOTIFICATIONS,
  currentUserId: null,
});

const PROG: Record<Status, number> = { Submitted: 0, "Under Review": 10, Assigned: 25, "In Progress": 60, Resolved: 100 };

function useStoreImpl() {
  const [state, setState] = useState<State>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
  const now = () => new Date().toISOString();
  const roleLabel = (r?: Role) => (r === "admin" ? "Admin" : r === "worker" ? "Field Worker" : "Consumer");

  const notify = (s: State, userId: string | undefined, title: string, message: string, complaintId?: string): Notification[] =>
    userId
      ? [{ id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, title, message, at: now(), read: false, complaintId }, ...s.notifications]
      : s.notifications;

  const loginAs = useCallback((role: Role) => {
    const u = SEED_USERS.find((x) => x.role === role)!;
    setState((s) => ({ ...s, currentUserId: u.id }));
    return u;
  }, []);

  const loginEmail = (email: string) => {
    const u = state.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (u) setState((s) => ({ ...s, currentUserId: u.id }));
    return u ?? null;
  };

  const register = (data: Pick<User, "name" | "email" | "phone">) => {
    const u: User = { ...data, id: `u-${Date.now()}`, role: "consumer", active: true };
    setState((s) => ({ ...s, users: [...s.users, u], currentUserId: u.id }));
    return u;
  };

  const logout = () => setState((s) => ({ ...s, currentUserId: null }));
  const updateUser = (id: string, patch: Partial<User>) =>
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  const addUser = (u: Omit<User, "id">) => setState((s) => ({ ...s, users: [...s.users, { ...u, id: `u-${Date.now()}` }] }));

  const addComplaint = (c: Complaint) =>
    setState((s) => {
      const admin = s.users.find((u) => u.role === "admin");
      let n = notify(s, admin?.id, "New complaint", `${c.id}: ${c.title}`, c.id);
      n = notify({ ...s, notifications: n }, c.consumerId, "Complaint submitted", `Your complaint ${c.id} was received.`, c.id);
      return { ...s, complaints: [c, ...s.complaints], notifications: n };
    });

  const patchComplaint = (id: string, fn: (c: Complaint, s: State) => { c: Partial<Complaint>; notes?: [string | undefined, string, string][] }) =>
    setState((s) => {
      let notifications = s.notifications;
      const complaints = s.complaints.map((c) => {
        if (c.id !== id) return c;
        const r = fn(c, s);
        r.notes?.forEach(([uid, t, m]) => (notifications = notify({ ...s, notifications }, uid, t, m, id)));
        return { ...c, ...r.c, updatedAt: now() };
      });
      return { ...s, complaints, notifications };
    });

  const setStatus = (id: string, status: Status, note?: string) =>
    patchComplaint(id, (c) => ({
      c: {
        status,
        progress: Math.max(PROG[status], status === "Resolved" ? 100 : c.progress),
        history: [...c.history, { status, at: now(), by: roleLabel(currentUser?.role), note }],
      },
      notes: [
        [c.consumerId, `Status: ${status}`, `${c.id} is now ${status}.`],
        ...(currentUser?.role === "worker" ? [[state.users.find((u) => u.role === "admin")?.id, `Worker update`, `${c.id} → ${status}`] as [string | undefined, string, string]] : []),
      ],
    }));

  const assign = (id: string, workerId: string) =>
    patchComplaint(id, (c, s) => {
      const w = s.users.find((u) => u.id === workerId);
      return {
        c: {
          workerId,
          status: c.status === "Submitted" || c.status === "Under Review" ? "Assigned" : c.status,
          progress: Math.max(c.progress, 25),
          history: [...c.history, { status: "Assigned", at: now(), by: "Admin", note: `Assigned to ${w?.name}` }],
        },
        notes: [
          [workerId, "New assignment", `You were assigned ${c.id} (${c.priority}).`],
          [c.consumerId, "Worker assigned", `${w?.name} has been assigned to ${c.id}.`],
        ],
      };
    });

  const setPriority = (id: string, priority: Priority) =>
    patchComplaint(id, (c) => ({ c: { priority }, notes: [[c.workerId, "Priority changed", `${c.id} priority set to ${priority}.`]] }));
  const setProgress = (id: string, progress: number) => patchComplaint(id, () => ({ c: { progress } }));
  const addNote = (id: string, text: string) =>
    patchComplaint(id, (c) => ({ c: { notes: [...c.notes, { at: now(), by: currentUser?.name ?? "Worker", text }] } }));
  const addEvidence = (id: string, kind: "before" | "after", url: string) =>
    patchComplaint(id, (c) => ({ c: { evidence: { ...c.evidence, [kind]: [...c.evidence[kind], url] } } }));
  const resolveDuplicate = (id: string, action: "merge" | "dismiss") =>
    patchComplaint(id, (c) =>
      action === "dismiss"
        ? { c: { duplicateDismissed: true } }
        : {
            c: { status: "Resolved", progress: 100, duplicateDismissed: true, history: [...c.history, { status: "Resolved", at: now(), by: "Admin", note: `Merged into ${c.duplicateOf}` }] },
            notes: [[c.consumerId, "Merged as duplicate", `${c.id} was merged into ${c.duplicateOf}; follow that complaint for updates.`]],
          },
    );

  const markRead = (id: string) =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  const markAllRead = () =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.userId === s.currentUserId ? { ...n, read: true } : n)) }));
  const resetDemo = () => setState({ ...seed(), currentUserId: state.currentUserId });

  const myNotifications = useMemo(
    () => state.notifications.filter((n) => n.userId === state.currentUserId),
    [state.notifications, state.currentUserId],
  );

  return {
    ...state,
    hydrated,
    currentUser,
    myNotifications,
    loginAs,
    loginEmail,
    register,
    logout,
    updateUser,
    addUser,
    addComplaint,
    setStatus,
    assign,
    setPriority,
    setProgress,
    addNote,
    addEvidence,
    resolveDuplicate,
    markRead,
    markAllRead,
    resetDemo,
    userById: (id?: string) => state.users.find((u) => u.id === id),
  };
}

type Store = ReturnType<typeof useStoreImpl>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStoreImpl();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export const homeFor = (r: Role) => (r === "admin" ? "/admin" : r === "worker" ? "/worker" : "/consumer");
