import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Siren, Wrench } from "lucide-react";
import { EmptyState, PageHeader, StatCard } from "@/components/app/badges";
import { TaskCard } from "@/components/app/TaskCard";
import { ActivityTimeline } from "@/components/app/ActivityTimeline";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/worker/")({
  head: () => meta("Field Worker Dashboard", "Your assigned electricity repair tasks at a glance."),
  component: WorkerDashboard,
});

const RANK = { Emergency: 0, High: 1, Normal: 2 };

function WorkerDashboard() {
  const { complaints, currentUser } = useStore();
  const mine = complaints.filter((c) => c.workerId === currentUser?.id);
  const open = mine.filter((c) => c.status !== "Resolved").sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  return (
    <>
      <PageHeader title={`Good day, ${currentUser?.name.split(" ")[0]}`} description={`Zone: ${currentUser?.area ?? "—"}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned to me" value={mine.length} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Open tasks" value={open.length} icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Emergencies" value={open.filter((c) => c.priority === "Emergency").length} icon={<Siren className="h-4 w-4" />} />
        <StatCard label="Completed" value={mine.length - open.length} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Priority queue</h2>
            <Link to="/worker/tasks" className="text-sm text-primary hover:underline">All tasks</Link>
          </div>
          {open.length ? <div className="grid gap-3 sm:grid-cols-2">{open.slice(0, 4).map((c) => <TaskCard key={c.id} c={c} />)}</div> : <EmptyState title="No open tasks">You're all caught up.</EmptyState>}
        </section>
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Recent activity</h2>
          <ActivityTimeline complaints={mine} />
        </section>
      </div>
    </>
  );
}
