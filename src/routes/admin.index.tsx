import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, Siren, UserX } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatCard } from "@/components/app/badges";
import { ComplaintsTable } from "@/components/app/ComplaintsTable";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import { STATUSES } from "@/utils/helpers";

export const Route = createFileRoute("/admin/")({
  head: () => meta("Admin Dashboard", "Overview of all electricity complaints, priorities and assignments."),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { complaints } = useStore();
  const open = complaints.filter((c) => c.status !== "Resolved");
  const emergency = open.filter((c) => c.priority === "Emergency").length;
  const unassigned = open.filter((c) => !c.workerId).length;
  const dups = complaints.filter((c) => c.duplicateOf && !c.duplicateDismissed).length;
  const byStatus = STATUSES.map((s) => ({ name: s, count: complaints.filter((c) => c.status === s).length }));

  return (
    <>
      <PageHeader title="Administrator dashboard" description="Monitor complaints and keep field teams moving." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={complaints.length} icon={<ClipboardList className="h-4 w-4" />} hint={`${open.length} open`} />
        <StatCard label="Open emergencies" value={emergency} icon={<Siren className="h-4 w-4" />} />
        <StatCard label="Unassigned" value={unassigned} icon={<UserX className="h-4 w-4" />} />
        <StatCard label="Resolved" value={complaints.length - open.length} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {dups > 0 && (
        <Link to="/admin/duplicates" className="mt-6 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm hover:bg-warning-soft/70">
          <Copy className="h-4 w-4 text-warning" />
          <span><strong>{dups}</strong> complaint{dups > 1 ? "s" : ""} flagged as possible duplicates need review.</span>
        </Link>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-semibold">Complaints by status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-destructive" />Needs attention</h2>
          <ul className="space-y-3">
            {open.filter((c) => c.priority === "Emergency" || !c.workerId).slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to="/complaints/$id" params={{ id: c.id }} className="block rounded-md border p-3 hover:bg-muted">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-mono">{c.id}</span> · {c.priority} · {c.workerId ? "Assigned" : "Unassigned"}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Latest complaints</h2>
          <Link to="/admin/complaints" className="text-sm text-primary hover:underline">Manage all</Link>
        </div>
        <ComplaintsTable complaints={complaints} showFilters={false} showConsumer showWorker pageSize={5} />
      </section>
    </>
  );
}
