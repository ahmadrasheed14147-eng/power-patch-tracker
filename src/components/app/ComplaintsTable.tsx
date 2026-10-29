import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Complaint } from "@/types";
import { CATEGORIES, PRIORITIES, STATUSES, formatDate } from "@/utils/helpers";
import { PriorityBadge, StatusBadge, EmptyState } from "./badges";
import { useStore } from "@/hooks/use-store";

type SortKey = "createdAt" | "priority" | "status";
const PRANK = { Emergency: 0, High: 1, Normal: 2 };

export function ComplaintsTable({
  complaints,
  showFilters = true,
  showConsumer = false,
  showWorker = false,
  pageSize = 8,
}: {
  complaints: Complaint[];
  showFilters?: boolean;
  showConsumer?: boolean;
  showWorker?: boolean;
  pageSize?: number;
}) {
  const { userById } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");
  const [prio, setPrio] = useState("all");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [asc, setAsc] = useState(false);
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    const r = complaints.filter(
      (c) =>
        (!t || c.id.toLowerCase().includes(t) || c.title.toLowerCase().includes(t) || c.address.toLowerCase().includes(t)) &&
        (status === "all" || c.status === status) &&
        (cat === "all" || c.category === cat) &&
        (prio === "all" || c.priority === prio),
    );
    r.sort((a, b) => {
      let d = 0;
      if (sort === "createdAt") d = a.createdAt.localeCompare(b.createdAt);
      if (sort === "priority") d = PRANK[a.priority] - PRANK[b.priority];
      if (sort === "status") d = STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
      return asc ? d : -d;
    });
    return r;
  }, [complaints, q, status, cat, prio, sort, asc]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const p = Math.min(page, pages - 1);
  const visible = rows.slice(p * pageSize, p * pageSize + pageSize);
  const toggle = (k: SortKey) => (sort === k ? setAsc(!asc) : (setSort(k), setAsc(false)));
  const SortH = ({ k, children }: { k: SortKey; children: string }) => (
    <button onClick={() => toggle(k)} className="inline-flex items-center gap-1 hover:text-foreground">
      {children} <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search ID, title, address" className="pl-9" value={q} onChange={(e) => (setQ(e.target.value), setPage(0))} />
          </div>
          {[
            [status, setStatus, STATUSES, "All statuses"],
            [cat, setCat, CATEGORIES, "All categories"],
            [prio, setPrio, PRIORITIES, "All priorities"],
          ].map(([v, set, opts, label]) => (
            <Select key={label as string} value={v as string} onValueChange={(x) => ((set as (s: string) => void)(x), setPage(0))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{label as string}</SelectItem>
                {(opts as string[]).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState title="No complaints found">Try adjusting your search or filters.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ID</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                {showConsumer && <TableHead className="hidden lg:table-cell">Consumer</TableHead>}
                {showWorker && <TableHead className="hidden lg:table-cell">Worker</TableHead>}
                <TableHead><SortH k="priority">Priority</SortH></TableHead>
                <TableHead><SortH k="status">Status</SortH></TableHead>
                <TableHead className="hidden sm:table-cell"><SortH k="createdAt">Date</SortH></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">
                    <Link to="/complaints/$id" params={{ id: c.id }} className="text-primary hover:underline">{c.id}</Link>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <Link to="/complaints/$id" params={{ id: c.id }} className="block truncate font-medium hover:underline">{c.title}</Link>
                    <span className="block truncate text-xs text-muted-foreground">{c.address}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{c.category}</TableCell>
                  {showConsumer && <TableCell className="hidden lg:table-cell text-sm">{userById(c.consumerId)?.name}</TableCell>}
                  {showWorker && <TableCell className="hidden lg:table-cell text-sm">{userById(c.workerId)?.name ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>}
                  <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {rows.length > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {p * pageSize + 1}–{Math.min(rows.length, (p + 1) * pageSize)} of {rows.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={p === 0} onClick={() => setPage(p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
