import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, StatusBadge } from "@/components/app/badges";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import { formatDateTime } from "@/utils/helpers";
import type { Complaint } from "@/types";

export const Route = createFileRoute("/admin/duplicates")({
  head: () => meta("Duplicate Review", "Review complaints flagged as possible duplicates."),
  component: Duplicates,
});

function Mini({ c, label }: { c: Complaint; label: string }) {
  const { userById } = useStore();
  return (
    <div className="flex-1 rounded-md border bg-surface p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <Link to="/complaints/$id" params={{ id: c.id }} className="mt-1 block font-mono text-sm text-primary hover:underline">{c.id}</Link>
      <p className="mt-1 font-medium">{c.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{c.address}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <StatusBadge status={c.status} /> {c.category} · {userById(c.consumerId)?.name} · {formatDateTime(c.createdAt)}
      </div>
    </div>
  );
}

function Duplicates() {
  const { complaints, resolveDuplicate } = useStore();
  const flagged = complaints.filter((c) => c.duplicateOf && !c.duplicateDismissed);
  return (
    <>
      <PageHeader title="Duplicate review" description="Complaints with the same category and a matching location are flagged automatically (simulated)." />
      {flagged.length === 0 ? (
        <EmptyState title="No flagged duplicates">All caught up.</EmptyState>
      ) : (
        <div className="space-y-4">
          {flagged.map((c) => {
            const orig = complaints.find((x) => x.id === c.duplicateOf);
            return (
              <div key={c.id} className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Mini c={c} label="New complaint" />
                  <ArrowRight className="mx-auto h-5 w-5 rotate-90 text-muted-foreground md:rotate-0" />
                  {orig ? <Mini c={orig} label="Possible original" /> : <div className="flex-1 text-sm text-muted-foreground">Original not found</div>}
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => (resolveDuplicate(c.id, "dismiss"), toast.success("Marked as not a duplicate"))}>Not a duplicate</Button>
                  <Button onClick={() => (resolveDuplicate(c.id, "merge"), toast.success(`Merged into ${c.duplicateOf}`))}>Merge as duplicate</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
