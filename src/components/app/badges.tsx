import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/types";
import { STATUSES } from "@/utils/helpers";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

const statusCls: Record<Status, string> = {
  Submitted: "bg-muted text-foreground border-border",
  "Under Review": "bg-warning-soft text-warning border-warning/30",
  Assigned: "bg-accent text-primary border-primary/30",
  "In Progress": "bg-primary text-primary-foreground border-primary",
  Resolved: "bg-success-soft text-success border-success/30",
};
const prioCls: Record<Priority, string> = {
  Emergency: "bg-destructive text-destructive-foreground border-destructive",
  High: "bg-warning-soft text-warning border-warning/30",
  Normal: "bg-muted text-muted-foreground border-border",
};

const base = "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium";
export const StatusBadge = ({ status }: { status: Status }) => <span className={cn(base, statusCls[status])}>{status}</span>;
export const PriorityBadge = ({ priority }: { priority: Priority }) => <span className={cn(base, prioCls[priority])}>{priority}</span>;

export function StatusProgress({ status }: { status: Status }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol className="flex w-full items-start">
      {STATUSES.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col items-center text-center">
          <div className="flex w-full items-center">
            <div className={cn("h-0.5 flex-1", i === 0 ? "invisible" : i <= idx ? "bg-primary" : "bg-border")} />
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                i < idx && "border-primary bg-primary text-primary-foreground",
                i === idx && "border-primary bg-background text-primary",
                i > idx && "border-border bg-background text-muted-foreground",
              )}
            >
              {i < idx ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <div className={cn("h-0.5 flex-1", i === STATUSES.length - 1 ? "invisible" : i < idx ? "bg-primary" : "bg-border")} />
          </div>
          <span className={cn("mt-2 text-[11px] leading-tight sm:text-xs", i <= idx ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function StatCard({ label, value, icon, hint }: { label: string; value: ReactNode; icon: ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/40 p-10 text-center">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function readFiles(files: FileList | null): Promise<string[]> {
  if (!files) return Promise.resolve([]);
  return Promise.all(
    Array.from(files).map(
      (f) =>
        new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(f);
        }),
    ),
  );
}
