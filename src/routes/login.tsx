import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HardHat, User, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/app/AuthLayout";
import { homeFor, useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import type { Role } from "@/types";

export const Route = createFileRoute("/login")({
  head: () => meta("Sign in", "Sign in to Power-Track as a consumer, administrator or field worker."),
  component: Login,
});

function Login() {
  const { loginEmail, loginAs } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    const u = loginEmail(email);
    if (!u) return setErr("No account found with that email. Try a demo account below.");
    toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
    navigate({ to: homeFor(u.role) });
  };
  const demo = (r: Role) => {
    const u = loginAs(r);
    toast.success(`Signed in as ${u.name}`);
    navigate({ to: homeFor(r) });
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back. Enter your details to continue.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="pw">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or use a demo account <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2">
        {([["consumer", "Consumer", User], ["admin", "Administrator", UserCog], ["worker", "Field Worker", HardHat]] as const).map(([r, l, I]) => (
          <Button key={r} variant="outline" className="justify-start" onClick={() => demo(r)}>
            <I className="mr-2 h-4 w-4 text-primary" /> Continue as {l}
          </Button>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account? <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
      </p>
    </AuthLayout>
  );
}
