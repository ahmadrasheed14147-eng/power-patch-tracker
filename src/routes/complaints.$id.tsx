import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Camera, CheckCircle2, MapPin, Phone, Tag, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PriorityBadge, StatusBadge, StatusProgress, readFiles } from "@/components/app/badges";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import { PRIORITIES, STATUSES, formatDateTime } from "@/utils/helpers";
import type { Complaint, Priority, Status } from "@/types";

export const Route = createFileRoute("/complaints/$id")({
  head: ({ params }) => meta(`Complaint ${params.id}`, "Complaint details, status history and assigned field worker."),
  component: () => (
    <AppShell>
      <Detail />
    </AppShell>
  ),
});

const Card = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="rounded-lg border bg-card p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2>{action}</div>
    {children}
  </section>
);

const Gallery = ({ imgs }: { imgs: string[] }) =>
  imgs.length ? (
    <div className="flex flex-wrap gap-2">
      {imgs.map((s, i) => (
        <a key={i} href={s} target="_blank" rel="noreferrer"><img src={s} alt="" className="h-24 w-24 rounded-md border object-cover sm:h-28 sm:w-28" /></a>
      ))}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">No images.</p>
  );

function Detail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { complaints, currentUser, userById } = useStore();
  const c = complaints.find((x) => x.id === id);
  const role = currentUser!.role;

  if (!c) return <EmptyState title="Complaint not found">No complaint with ID {id}.</EmptyState>;
  const allowed = role === "admin" || (role === "consumer" && c.consumerId === currentUser!.id) || (role === "worker" && c.workerId === currentUser!.id);
  if (!allowed) return <EmptyState title="Not available">You don't have access to this complaint.</EmptyState>;

  const worker = userById(c.workerId);
  const consumer = userById(c.consumerId);

  return (
    <>
      <button onClick={() => router.history.back()} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-sm text-primary">{c.id}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{c.title}</h1>
        </div>
        <div className="flex gap-2"><PriorityBadge priority={c.priority} /><StatusBadge status={c.status} /></div>
      </div>

      <div className="mb-6 rounded-lg border bg-card p-5 shadow-sm"><StatusProgress status={c.status} /></div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Details">
            <p className="whitespace-pre-line text-sm leading-relaxed">{c.description}</p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex gap-2"><Tag className="h-4 w-4 text-muted-foreground" /><dd>{c.category}</dd></div>
              <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><dd>{c.address}</dd></div>
              <div className="flex gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><dd>Reported {formatDateTime(c.createdAt)}</dd></div>
              {role !== "consumer" && <div className="flex gap-2"><User className="h-4 w-4 text-muted-foreground" /><dd>{consumer?.name} · {consumer?.phone}</dd></div>}
            </dl>
          </Card>
          <Card title="Images"><Gallery imgs={c.images} /></Card>
          {role === "worker" ? <WorkerPanel c={c} /> : (
            <Card title="Completion evidence">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Before</p><Gallery imgs={c.evidence.before} /></div>
                <div><p className="mb-2 text-xs font-medium uppercase text-muted-foreground">After</p><Gallery imgs={c.evidence.after} /></div>
              </div>
            </Card>
          )}
          {c.notes.length > 0 && role !== "worker" && (
            <Card title="Work notes">
              <ul className="space-y-3">{c.notes.map((n, i) => <li key={i} className="rounded-md bg-muted p-3 text-sm">{n.text}<p className="mt-1 text-xs text-muted-foreground">{n.by} · {formatDateTime(n.at)}</p></li>)}</ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {role === "admin" && <AdminPanel c={c} />}
          <Card title="Assigned worker">
            {worker ? (
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">{worker.name.split(" ").map((p) => p[0]).join("")}</span>
                <div className="text-sm">
                  <p className="font-medium">{worker.name}</p>
                  <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{worker.phone}</p>
                  <p className="text-xs text-muted-foreground">Zone: {worker.area}</p>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">Not yet assigned.</p>}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Work progress</span><span>{c.progress}%</span></div>
              <Progress value={c.progress} />
            </div>
          </Card>
          <Card title="Status history">
            <ol className="relative space-y-4 border-l pl-5">
              {[...c.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                  <StatusBadge status={h.status} />
                  {h.note && <p className="mt-1 text-sm">{h.note}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(h.at)} · {h.by}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

function AdminPanel({ c }: { c: Complaint }) {
  const { users, assign, setPriority, setStatus } = useStore();
  const workers = users.filter((u) => u.role === "worker" && u.active);
  return (
    <section className="rounded-lg border border-primary/30 bg-card p-5 shadow-sm">
      <h2 className="mb-4 font-semibold">Review & manage</h2>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Priority</p>
          <Select value={c.priority} onValueChange={(v) => (setPriority(c.id, v as Priority), toast.success(`Priority set to ${v}`))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Assign field worker</p>
          <Select value={c.workerId ?? ""} onValueChange={(v) => (assign(c.id, v), toast.success("Worker assigned"))}>
            <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
            <SelectContent>{workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.name} — {w.area}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <Select value={c.status} onValueChange={(v) => v !== c.status && (setStatus(c.id, v as Status), toast.success(`Status: ${v}`))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {c.status === "Submitted" && <Button variant="outline" className="w-full" onClick={() => setStatus(c.id, "Under Review", "Complaint verified by admin")}>Mark as under review</Button>}
        {c.duplicateOf && !c.duplicateDismissed && (
          <p className="rounded-md bg-warning-soft p-2 text-xs">Flagged as possible duplicate of <Link to="/complaints/$id" params={{ id: c.duplicateOf }} className="font-mono text-primary">{c.duplicateOf}</Link>. <Link to="/admin/duplicates" className="underline">Review</Link></p>
        )}
      </div>
    </section>
  );
}

function WorkerPanel({ c }: { c: Complaint }) {
  const { setStatus, setProgress, addNote, addEvidence } = useStore();
  const [note, setNote] = useState("");
  const [prog, setProg] = useState(c.progress);
  const resolved = c.status === "Resolved";

  const Upload = ({ kind }: { kind: "before" | "after" }) => (
    <div>
      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">{kind}</p>
      <div className="flex flex-wrap gap-2">
        {c.evidence[kind].map((s, i) => <img key={i} src={s} alt="" className="h-20 w-20 rounded-md border object-cover" />)}
        {!resolved && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted">
            <Camera className="h-4 w-4" />Upload
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { (await readFiles(e.target.files)).forEach((u) => addEvidence(c.id, kind, u)); toast.success("Evidence uploaded"); }} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <section className="rounded-lg border border-primary/30 bg-card p-5 shadow-sm">
      <h2 className="mb-4 font-semibold">Field work</h2>
      <div className="space-y-6">
        {!resolved && (
          <div className="flex flex-wrap gap-2">
            {c.status === "Assigned" && <Button onClick={() => (setStatus(c.id, "In Progress", "Work started on site"), setProg(Math.max(prog, 60)), toast.success("Marked in progress"))}>Start work</Button>}
            <Button
              variant={c.status === "In Progress" ? "default" : "outline"}
              onClick={() => {
                if (!c.evidence.after.length) return toast.error("Upload at least one 'after' photo before resolving.");
                setStatus(c.id, "Resolved", note || "Work completed");
                toast.success("Complaint marked as resolved");
              }}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />Mark resolved
            </Button>
          </div>
        )}
        <div>
          <div className="mb-2 flex justify-between text-sm"><span>Progress</span><span className="font-medium">{prog}%</span></div>
          <Slider value={[prog]} step={5} max={100} disabled={resolved} onValueChange={([v]) => setProg(v)} onValueCommit={([v]) => setProgress(c.id, v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2"><Upload kind="before" /><Upload kind="after" /></div>
        <div>
          <p className="mb-2 text-sm font-medium">Work notes</p>
          <ul className="mb-3 space-y-2">{c.notes.map((n, i) => <li key={i} className="rounded-md bg-muted p-3 text-sm">{n.text}<p className="mt-1 text-xs text-muted-foreground">{n.by} · {formatDateTime(n.at)}</p></li>)}</ul>
          {!resolved && (
            <div className="flex flex-col gap-2">
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe work done, parts used, issues found…" />
              <Button variant="outline" className="self-end" onClick={() => { if (note.trim().length < 3) return toast.error("Note is too short."); addNote(c.id, note.trim()); setNote(""); toast.success("Note added"); }}>Add note</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
