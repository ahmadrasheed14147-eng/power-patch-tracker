import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PageHeader } from "@/components/app/badges";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/helpers";

export const Route = createFileRoute("/notifications")({
  head: () => meta("Notifications", "Updates on assignments, status changes and resolutions."),
  component: () => <AppShell><Notifications /></AppShell>,
});

function Notifications() {
  const { myNotifications, markRead, markAllRead } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const list = myNotifications.filter((n) => tab === "all" || !n.read);
  return (
    <>
      <PageHeader title="Notifications" actions={<Button variant="outline" onClick={markAllRead}>Mark all as read</Button>} />
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({myNotifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({myNotifications.filter((n) => !n.read).length})</TabsTrigger>
        </TabsList>
      </Tabs>
      {list.length === 0 ? <EmptyState title="Nothing here" /> : (
        <ul className="divide-y overflow-hidden rounded-lg border bg-card">
          {list.map((n) => (
            <li key={n.id}>
              <button
                className={cn("flex w-full items-start gap-3 p-4 text-left hover:bg-muted", !n.read && "bg-accent/50")}
                onClick={() => { markRead(n.id); if (n.complaintId) navigate({ to: "/complaints/$id", params: { id: n.complaintId } }); }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary"><Bell className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.at)}</p>
                </div>
                {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
