import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/badges";
import { ComplaintsTable } from "@/components/app/ComplaintsTable";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/admin/complaints")({
  head: () => meta("All Complaints", "Search, filter, sort and manage every complaint."),
  component: () => {
    const { complaints } = useStore();
    return (
      <>
        <PageHeader title="All complaints" description="Open a complaint to review it, set priority and assign a field worker." />
        <ComplaintsTable complaints={complaints} showConsumer showWorker pageSize={10} />
      </>
    );
  },
});
