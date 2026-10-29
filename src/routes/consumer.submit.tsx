import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ImagePlus, Info, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, PriorityBadge, readFiles } from "@/components/app/badges";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";
import type { Category, Complaint } from "@/types";
import { CATEGORIES, DEFAULT_PRIORITY, generateComplaintId, suggestCategory, suggestDescription } from "@/utils/helpers";

export const Route = createFileRoute("/consumer/submit")({
  head: () => meta("Submit Complaint", "Report an electricity problem with category, location and photos."),
  component: Submit,
});

function Submit() {
  const { complaints, currentUser, addComplaint } = useStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [thinking, setThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Category | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const similar = useMemo(() => {
    if (!category || address.trim().length < 4) return [];
    const words = address.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 3);
    return complaints.filter(
      (c) => c.status !== "Resolved" && c.category === category && words.some((w) => c.address.toLowerCase().includes(w)),
    );
  }, [category, address, complaints]);

  const runAI = () => {
    const text = `${title} ${description}`;
    if (text.trim().length < 5) return toast.error("Write a title or description first so we can analyse it.");
    setThinking(true);
    setAiSuggestion(null);
    setTimeout(() => {
      setAiSuggestion(suggestCategory(text) ?? "Other");
      setThinking(false);
    }, 900);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!category) er.category = "Select a category.";
    if (title.trim().length < 5) er.title = "Title must be at least 5 characters.";
    if (description.trim().length < 15) er.description = "Please describe the issue (min 15 characters).";
    if (address.trim().length < 5) er.address = "Enter the location / address.";
    setErrs(er);
    if (Object.keys(er).length || !category || !currentUser) return;
    const id = generateComplaintId(complaints.map((c) => c.id));
    const now = new Date().toISOString();
    const c: Complaint = {
      id, title: title.trim(), description: description.trim(), category, priority: DEFAULT_PRIORITY[category],
      status: "Submitted", address: address.trim(), consumerId: currentUser.id, createdAt: now, updatedAt: now,
      images, evidence: { before: [], after: [] }, history: [{ status: "Submitted", at: now, by: "Consumer" }],
      notes: [], progress: 0, duplicateOf: similar[0]?.id,
    };
    addComplaint(c);
    setDone(id);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h1 className="mt-4 text-xl font-semibold">Complaint submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your complaint ID is</p>
        <p className="mt-1 font-mono text-2xl font-semibold text-primary">{done}</p>
        <p className="mt-3 text-sm text-muted-foreground">An administrator will review it shortly. You'll be notified at every step.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link to="/complaints/$id" params={{ id: done }}>View complaint</Link></Button>
          <Button variant="outline" onClick={() => { setDone(null); setCategory(null); setTitle(""); setDescription(""); setAddress(""); setImages([]); setAiSuggestion(null); }}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Submit a complaint" description="Tell us what's wrong and where. Fields marked * are required." />
      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <Label>Category *</Label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((c) => (
                <button
                  type="button" key={c} onClick={() => setCategory(c)}
                  className={cn("rounded-md border px-3 py-2.5 text-left text-sm transition-colors", category === c ? "border-primary bg-accent font-medium text-primary" : "hover:bg-muted")}
                >
                  {c}
                </button>
              ))}
            </div>
            {errs.category && <p className="mt-2 text-xs text-destructive">{errs.category}</p>}
          </section>

          <section className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wire hanging low near school" />
              {errs.title && <p className="text-xs text-destructive">{errs.title}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="desc">Description *</Label>
                {category && (
                  <button type="button" className="text-xs text-primary hover:underline" onClick={() => setDescription(suggestDescription(category, address))}>
                    Use suggested description
                  </button>
                )}
              </div>
              <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you see, since when, and any danger." />
              {errs.description && <p className="text-xs text-destructive">{errs.description}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr">Location / address *</Label>
              <Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no., street, area" />
              {errs.address && <p className="text-xs text-destructive">{errs.address}</p>}
            </div>
            {similar.length > 0 && (
              <div className="flex gap-3 rounded-md border border-warning/30 bg-warning-soft p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <p className="font-medium">Similar complaint already reported</p>
                  <p className="text-muted-foreground">
                    {similar.slice(0, 2).map((s) => (
                      <span key={s.id} className="block"><span className="font-mono text-xs">{s.id}</span> — {s.title} ({s.status})</span>
                    ))}
                    You can still submit; it will be flagged for admin review.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <Label>Photos (optional)</Label>
            <div className="mt-3 flex flex-wrap gap-3">
              {images.map((src, i) => (
                <div key={i} className="relative h-24 w-24 overflow-hidden rounded-md border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-background/90 p-0.5" aria-label="Remove">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted">
                <ImagePlus className="h-5 w-5" /> Add photo
                <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => setImages([...images, ...(await readFiles(e.target.files))].slice(0, 4))} />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" />Smart assistant</div>
            <p className="mt-1 text-sm text-muted-foreground">Analyse your title and description to suggest the right category.</p>
            <Button type="button" variant="outline" className="mt-4 w-full" onClick={runAI} disabled={thinking}>
              {thinking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analysing…</> : "Suggest category"}
            </Button>
            {aiSuggestion && (
              <div className="mt-4 rounded-md border bg-accent p-3 text-sm">
                <p>Suggested: <strong>{aiSuggestion}</strong></p>
                <div className="mt-2 flex gap-2">
                  <Button type="button" size="sm" onClick={() => { setCategory(aiSuggestion); if (!description) setDescription(suggestDescription(aiSuggestion, address)); }}>Apply</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAiSuggestion(null)}>Dismiss</Button>
                </div>
              </div>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">Simulated suggestions for demo purposes.</p>
          </section>
          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><Info className="h-4 w-4 text-primary" />Priority</div>
            {category ? (
              <p className="mt-2 text-sm">This category is usually treated as <PriorityBadge priority={DEFAULT_PRIORITY[category]} /></p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Select a category to see the expected priority.</p>
            )}
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li><strong className="text-foreground">Emergency</strong> — immediate danger to life (live wires, fallen poles).</li>
              <li><strong className="text-foreground">High</strong> — area-wide outage or transformer faults.</li>
              <li><strong className="text-foreground">Normal</strong> — meter and household connection issues.</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Admins may adjust priority after review.</p>
          </section>
          <Button type="submit" size="lg" className="w-full">Submit complaint</Button>
        </aside>
      </form>
    </>
  );
}
