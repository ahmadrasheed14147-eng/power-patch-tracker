import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "./AppShell";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy p-10 text-navy-foreground lg:flex">
        <Logo className="text-navy-foreground" />
        <div>
          <h2 className="text-3xl font-semibold leading-tight">Report power problems.<br />Track every fix.</h2>
          <ul className="mt-8 space-y-3 text-sm opacity-90">
            {["Submit complaints with photos in under a minute", "Follow each step from review to resolution", "Field teams update progress in real time"].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-60">Demo prototype — not connected to any utility provider.</p>
      </div>
      <div className="flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <div className="rounded-lg border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
