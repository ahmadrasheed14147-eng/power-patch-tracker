import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader } from "@/components/app/badges";
import { TaskCard } from "@/components/app/TaskCard";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/worker/tasks")({
  head: () => meta("My Tasks", "All complaints assigned to you, sorted by priority."),
  component: Tasks,
});

const RANK = { Emergency: 0, High: 1, Normal: 2 };

function Tasks() {
  const { complaints, currentUser } = useStore();
  const [tab, setTab] = useState("open");
  const mine = complaints
    .filter((c) => c.workerId === currentUser?.id)
    .filter((c) => (tab === "open" ? c.status !== "Resolved" : tab === "done" ? c.status === "Resolved" : true))
    .sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  return (
    <>
      <PageHeader title="My tasks" description="Open a task to update progress, add notes and upload evidence." />
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList><TabsTrigger value="open">Open</TabsTrigger><TabsTrigger value="done">Completed</TabsTrigger><TabsTrigger value="all">All</TabsTrigger></TabsList>
      </Tabs>
      {mine.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{mine.map((c) => <TaskCard key={c.id} c={c} />)}</div> : <EmptyState title="No tasks here" />}
    </>
  );
}
