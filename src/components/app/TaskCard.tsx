import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Complaint } from "@/types";
import { PriorityBadge, StatusBadge } from "./badges";
import { formatDate } from "@/utils/helpers";

export function TaskCard({ c }: { c: Complaint }) {
  return (
    <Link to="/complaints/$id" params={{ id: c.id }} className="block rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-primary">{c.id}</span>
        <PriorityBadge priority={c.priority} />
      </div>
      <p className="mt-2 font-medium">{c.title}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{c.address}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <StatusBadge status={c.status} /><span>{c.category} · {formatDate(c.createdAt)}</span>
      </div>
      <Progress value={c.progress} className="mt-3 h-1.5" />
    </Link>
  );
}
