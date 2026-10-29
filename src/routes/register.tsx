import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/app/AuthLayout";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/register")({
  head: () => meta("Create account", "Register as a consumer to report and track electricity complaints."),
  component: Register,
});

function Register() {
  const { register, users } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email.";
    else if (users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) er.email = "This email is already registered.";
    if (!/^[+\d][\d\s-]{6,}$/.test(f.phone)) er.phone = "Enter a valid phone number.";
    if (f.password.length < 6) er.password = "At least 6 characters.";
    if (f.confirm !== f.password) er.confirm = "Passwords do not match.";
    setErrs(er);
    if (Object.keys(er).length) return;
    register({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() });
    toast.success("Account created");
    navigate({ to: "/consumer" });
  };

  const field = (k: keyof typeof f, label: string, type = "text") => (
    <div className="space-y-2">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={f[k]} onChange={set(k)} />
      {errs[k] && <p className="text-xs text-destructive">{errs[k]}</p>}
    </div>
  );

  return (
    <AuthLayout title="Create your account" subtitle="Register as a consumer to report electricity issues.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {field("name", "Full name")}
        {field("email", "Email", "email")}
        {field("phone", "Phone number", "tel")}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("password", "Password", "password")}
          {field("confirm", "Confirm password", "password")}
        </div>
        <Button type="submit" className="w-full">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
