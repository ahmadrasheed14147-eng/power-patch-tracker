import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/badges";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/profile")({
  head: () => meta("Profile & Settings", "Manage your Power-Track profile, password and notification preferences."),
  component: () => <AppShell><Profile /></AppShell>,
});

function Profile() {
  const { currentUser, updateUser } = useStore();
  const u = currentUser!;
  const [f, setF] = useState({ name: u.name, email: u.email, phone: u.phone, area: u.area ?? "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [prefs, setPrefs] = useState({ email: true, sms: false, status: true });

  return (
    <>
      <PageHeader title="Profile & settings" />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-semibold">Personal information</h2>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (f.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("Enter a valid name and email.");
              updateUser(u.id, { ...f, name: f.name.trim() });
              toast.success("Profile updated");
            }}
          >
            {(["name", "email", "phone", "area"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label className="capitalize">{k === "area" ? "Address / zone" : k}</Label>
                <Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              </div>
            ))}
            <div className="sm:col-span-2"><Button type="submit">Save changes</Button></div>
          </form>
        </section>
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Notifications</h2>
          {([["email", "Email updates"], ["sms", "SMS alerts"], ["status", "Status change alerts"]] as const).map(([k, l]) => (
            <div key={k} className="flex items-center justify-between py-2">
              <Label>{l}</Label>
              <Switch checked={prefs[k]} onCheckedChange={(v) => (setPrefs({ ...prefs, [k]: v }), toast.success("Preference saved"))} />
            </div>
          ))}
        </section>
        <section className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-semibold">Change password</h2>
          <form
            className="grid gap-4 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!pw.current) return toast.error("Enter your current password.");
              if (pw.next.length < 6) return toast.error("New password must be at least 6 characters.");
              if (pw.next !== pw.confirm) return toast.error("Passwords do not match.");
              setPw({ current: "", next: "", confirm: "" });
              toast.success("Password updated (demo)");
            }}
          >
            {([["current", "Current"], ["next", "New"], ["confirm", "Confirm new"]] as const).map(([k, l]) => (
              <div key={k} className="space-y-1.5"><Label>{l} password</Label><Input type="password" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} /></div>
            ))}
            <div className="sm:col-span-3"><Button type="submit" variant="outline">Update password</Button></div>
          </form>
        </section>
      </div>
    </>
  );
}
