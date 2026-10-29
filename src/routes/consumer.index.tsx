import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Clock, Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/app/badges";
import { ComplaintsTable } from "@/components/app/ComplaintsTable";
import { ActivityTimeline } from "@/components/app/ActivityTimeline";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/consumer/")({
  head: () => meta("Consumer Dashboard", "Overview of your electricity complaints and recent activity."),
  component: ConsumerDashboard,
});

function ConsumerDashboard() {
  const { complaints, currentUser } = useStore();
  const mine = complaints.filter((c) => c.consumerId === currentUser?.id);
  const pending = mine.filter((c) => c.status === "Submitted" || c.status === "Under Review" || c.status === "Assigned").length;
  const inProg = mine.filter((c) => c.status === "In Progress").length;
  const resolved = mine.filter((c) => c.status === "Resolved").length;

  return (
    <>
      <PageHeader
        title={`Hello, ${currentUser?.name.split(" ")[0]}`}
        description="Here's what's happening with your complaints."
        actions={<Button asChild><Link to="/consumer/submit"><Plus className="mr-1 h-4 w-4" />Submit complaint</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={mine.length} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Pending" value={pending} icon={<Clock className="h-4 w-4" />} hint="Submitted, reviewing or assigned" />
        <StatCard label="In progress" value={inProg} icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent complaints</h2>
            <Link to="/consumer/complaints" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <ComplaintsTable complaints={mine} showFilters={false} pageSize={5} />
        </section>
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Activity timeline</h2>
          <ActivityTimeline complaints={mine} />
        </section>
      </div>
    </>
  );
}
