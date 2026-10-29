import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Camera, ClipboardCheck, HardHat, MapPin, ShieldCheck, Sparkles, UserCog, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/AppShell";
import { StatusBadge } from "@/components/app/badges";
import { meta } from "@/lib/meta";
import { CATEGORIES } from "@/utils/helpers";

export const Route = createFileRoute("/")({
  head: () => meta("Electricity Complaint Management", "Power-Track lets consumers report electricity problems, admins assign field workers, and everyone track progress to resolution."),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/register">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="border-b bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> Electricity complaint management
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Every outage, fallen pole and faulty meter — tracked to resolution.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Power-Track connects consumers, administrators and field workers in one place so electricity problems get reported clearly and fixed faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/login">Try the demo <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link to="/register">Create account</Link></Button>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Recent complaints</span>
              <span className="text-xs text-muted-foreground">Live preview</span>
            </div>
            {[
              ["PT-2026-1001", "Live wire hanging over street", "In Progress"],
              ["PT-2026-1004", "Transformer smoking", "Assigned"],
              ["PT-2026-1003", "Frequent voltage drops", "Under Review"],
              ["PT-2026-1002", "Meter display blank", "Resolved"],
            ].map(([id, t, s]) => (
              <div key={id} className="flex items-center justify-between gap-3 border-b py-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t}</p>
                  <p className="font-mono text-xs text-muted-foreground">{id}</p>
                </div>
                <StatusBadge status={s as "Resolved"} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            [MapPin, "Report", "Choose a category, describe the issue, add the address and photos."],
            [ClipboardCheck, "Review", "Administrators verify, set priority and spot duplicates."],
            [HardHat, "Fix", "A field worker is assigned and updates progress on site."],
            [Bell, "Resolve", "You get notified at each step with completion evidence."],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof MapPin;
            return (
              <div key={t as string} className="rounded-lg border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary"><I className="h-4 w-4" /></span>
                  <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{t as string}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-surface">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-3">
          {[
            [Users, "For consumers", "Submit complaints, get smart category suggestions and follow a clear status timeline."],
            [UserCog, "For administrators", "Manage all complaints, set priorities, assign workers, review duplicates and view analytics."],
            [HardHat, "For field workers", "See assigned tasks by priority, add work notes and upload before/after evidence."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Users;
            return (
              <div key={t as string} className="rounded-lg border bg-card p-6 shadow-sm">
                <I className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{t as string}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Issues you can report</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => <span key={c} className="rounded-md border bg-surface px-3 py-1.5 text-sm">{c}</span>)}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[[Sparkles, "Smart suggestions"], [Camera, "Photo evidence"], [ShieldCheck, "Duplicate detection"]].map(([Icon, t]) => {
              const I = Icon as typeof Users;
              return (
                <div key={t as string} className="rounded-lg border p-4 text-center">
                  <I className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-medium">{t as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>© 2026 Power-Track</span>
          <span>Demo prototype. Not affiliated with any electricity provider.</span>
        </div>
      </footer>
    </div>
  );
}
