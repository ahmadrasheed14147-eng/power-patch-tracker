import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/app/AuthLayout";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/forgot-password")({
  head: () => meta("Reset password", "Request a password reset link for your Power-Track account."),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  return (
    <AuthLayout title="Forgot password" subtitle="We'll send you a link to reset your password.">
      {sent ? (
        <div className="text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-sm">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
          <p className="mt-1 text-xs text-muted-foreground">(Demo: no email is actually sent.)</p>
          <Button asChild variant="outline" className="mt-6 w-full"><Link to="/login">Back to sign in</Link></Button>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
            setSent(true);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => (setEmail(e.target.value), setErr(""))} />
            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>
          <Button type="submit" className="w-full">Send reset link</Button>
          <p className="text-center text-sm"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
        </form>
      )}
    </AuthLayout>
  );
}
