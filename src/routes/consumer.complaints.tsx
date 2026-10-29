import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/badges";
import { ComplaintsTable } from "@/components/app/ComplaintsTable";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/consumer/complaints")({
  head: () => meta("My Complaints", "Search, filter and track all complaints you have submitted."),
  component: MyComplaints,
});

function MyComplaints() {
  const { complaints, currentUser } = useStore();
  const mine = complaints.filter((c) => c.consumerId === currentUser?.id);
  return (
    <>
      <PageHeader
        title="My complaints"
        description="Search and filter complaints you've submitted. Click any row for full details."
        actions={<Button asChild><Link to="/consumer/submit"><Plus className="mr-1 h-4 w-4" />New complaint</Link></Button>}
      />
      <ComplaintsTable complaints={mine} showWorker />
    </>
  );
}
