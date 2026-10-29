import { useNavigate } from "@tanstack/react-router";
import { FlaskConical, RotateCcw } from "lucide-react";
import { homeFor, useStore } from "@/hooks/use-store";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLES: [Role, string][] = [
  ["consumer", "Consumer"],
  ["admin", "Administrator"],
  ["worker", "Field Worker"],
];

export function DemoToolbar() {
  const { currentUser, loginAs, resetDemo } = useStore();
  const navigate = useNavigate();
  return (
    <div className="flex h-9 items-center justify-between gap-2 border-b bg-navy px-4 text-xs text-navy-foreground lg:px-6">
      <span className="flex items-center gap-1.5 font-medium">
        <FlaskConical className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Demo mode — view as:</span>
      </span>
      <div className="flex items-center gap-1">
        {ROLES.map(([r, l]) => (
          <button
            key={r}
            onClick={() => (loginAs(r), navigate({ to: homeFor(r) }))}
            className={cn("rounded px-2 py-1 font-medium", currentUser?.role === r ? "bg-primary text-primary-foreground" : "hover:bg-navy-foreground/10")}
          >
            {l}
          </button>
        ))}
        <button
          onClick={() => (resetDemo(), toast.success("Demo data reset"))}
          className="ml-1 flex items-center gap-1 rounded px-2 py-1 hover:bg-navy-foreground/10"
          title="Reset demo data"
        >
          <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden md:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
