import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app/badges";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import type { Role } from "@/types";

export const Route = createFileRoute("/admin/users")({
  head: () => meta("Users & Workers", "Manage consumers, administrators and field workers."),
  component: Users,
});

const LABEL: Record<Role, string> = { consumer: "Consumer", admin: "Administrator", worker: "Field Worker" };

function Users() {
  const { users, complaints, updateUser, addUser, currentUser } = useStore();
  const [tab, setTab] = useState<"all" | Role>("worker");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", area: "", role: "worker" as Role });

  const rows = users.filter((u) => (tab === "all" || u.role === tab) && (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  const load = (id: string) => complaints.filter((c) => c.workerId === id && c.status !== "Resolved").length;

  const save = () => {
    if (f.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("Enter a name and valid email.");
    if (users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) return toast.error("Email already exists.");
    addUser({ ...f, active: true });
    toast.success(`${LABEL[f.role]} added`);
    setOpen(false);
    setF({ name: "", email: "", phone: "", area: "", role: "worker" });
  };

  return (
    <>
      <PageHeader title="Users & field workers" description="Manage accounts and see each worker's current workload." actions={<Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />Add user</Button>} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="worker">Field workers</TabsTrigger>
            <TabsTrigger value="consumer">Consumers</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Zone</TableHead>
              <TableHead className="hidden sm:table-cell">Open tasks</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{u.email}<br />{u.phone}</TableCell>
                <TableCell className="text-sm">{LABEL[u.role]}</TableCell>
                <TableCell className="hidden text-sm sm:table-cell">{u.area ?? "—"}</TableCell>
                <TableCell className="hidden text-sm sm:table-cell">{u.role === "worker" ? load(u.id) : "—"}</TableCell>
                <TableCell className="text-right">
                  <Switch checked={u.active} disabled={u.id === currentUser?.id} onCheckedChange={(v) => (updateUser(u.id, { active: v }), toast.success(`${u.name} ${v ? "activated" : "deactivated"}`))} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add user</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(["name", "email", "phone", "area"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label className="capitalize">{k === "area" ? "Zone / area" : k}</Label>
                <Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={f.role} onValueChange={(v) => setF({ ...f, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(LABEL) as Role[]).map((r) => <SelectItem key={r} value={r}>{LABEL[r]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Add user</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
