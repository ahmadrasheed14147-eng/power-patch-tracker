import { Link } from "@tanstack/react-router";
import type { Complaint } from "@/types";
import { formatDateTime } from "@/utils/helpers";

export function ActivityTimeline({ complaints, limit = 6 }: { complaints: Complaint[]; limit?: number }) {
  const events = complaints
    .flatMap((c) => c.history.map((h) => ({ ...h, id: c.id, title: c.title })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
  if (!events.length) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <ol className="relative space-y-5 border-l pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          <p className="text-sm">
            <Link to="/complaints/$id" params={{ id: e.id }} className="font-mono text-xs text-primary hover:underline">{e.id}</Link>{" "}
            marked <span className="font-medium">{e.status}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{e.note ?? e.title}</p>
          <p className="text-[11px] text-muted-foreground">{formatDateTime(e.at)} · {e.by}</p>
        </li>
      ))}
    </ol>
  );
}
