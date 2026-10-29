import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, Percent, Timer, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/badges";
import { useStore } from "@/hooks/use-store";
import { meta } from "@/lib/meta";
import { CATEGORIES, PRIORITIES } from "@/utils/helpers";

export const Route = createFileRoute("/admin/analytics")({
  head: () => meta("Analytics", "Complaint statistics by category, priority, trend and worker."),
  component: Analytics,
});

const COLORS = ["var(--chart-1)", "var(--chart-4)", "var(--chart-3)"];
const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg border bg-card p-5 shadow-sm">
    <h2 className="mb-4 font-semibold">{title}</h2>
    <div className="h-64">{children}</div>
  </section>
);

function Analytics() {
  const { complaints, users } = useStore();
  const resolved = complaints.filter((c) => c.status === "Resolved");
  const avgH = resolved.length
    ? Math.round(resolved.reduce((s, c) => s + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()), 0) / resolved.length / 3600000)
    : 0;
  const byCat = CATEGORIES.map((c) => ({ name: c.replace(" Issue", ""), count: complaints.filter((x) => x.category === c).length }));
  const byPrio = PRIORITIES.map((p) => ({ name: p, value: complaints.filter((x) => x.priority === p).length }));
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const end = Date.UTC(2026, 9, 29) - (5 - i) * 7 * 86400000;
    const start = end - 7 * 86400000;
    const inRange = (iso: string) => { const t = new Date(iso).getTime(); return t >= start && t < end; };
    return { name: `W${i + 1}`, submitted: complaints.filter((c) => inRange(c.createdAt)).length, resolved: resolved.filter((c) => inRange(c.updatedAt)).length };
  });
  const workers = users.filter((u) => u.role === "worker").map((w) => ({
    name: w.name.split(" ")[0],
    open: complaints.filter((c) => c.workerId === w.id && c.status !== "Resolved").length,
    resolved: resolved.filter((c) => c.workerId === w.id).length,
  }));
  const axis = { tick: { fontSize: 11 }, stroke: "var(--muted-foreground)" };

  return (
    <>
      <PageHeader title="Analytics" description="Key complaint statistics across the network (demo data)." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Resolution rate" value={`${Math.round((resolved.length / Math.max(1, complaints.length)) * 100)}%`} icon={<Percent className="h-4 w-4" />} />
        <StatCard label="Avg. resolution time" value={`${avgH} h`} icon={<Timer className="h-4 w-4" />} />
        <StatCard label="Open complaints" value={complaints.length - resolved.length} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Active workers" value={users.filter((u) => u.role === "worker" && u.active).length} icon={<Users className="h-4 w-4" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Box title="Complaints by category">
          <ResponsiveContainer><BarChart data={byCat} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" allowDecimals={false} {...axis} /><YAxis type="category" dataKey="name" width={100} {...axis} />
            <Tooltip cursor={{ fill: "var(--muted)" }} /><Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
          </BarChart></ResponsiveContainer>
        </Box>
        <Box title="Priority distribution">
          <ResponsiveContainer><PieChart>
            <Pie data={byPrio} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {byPrio.map((_, i) => <Cell key={i} fill={["var(--destructive)", "var(--chart-4)", "var(--chart-3)"][i]} />)}
            </Pie><Tooltip /><Legend />
          </PieChart></ResponsiveContainer>
        </Box>
        <Box title="Weekly trend">
          <ResponsiveContainer><LineChart data={weeks}>
            <CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="name" {...axis} /><YAxis allowDecimals={false} {...axis} />
            <Tooltip /><Legend />
            <Line type="monotone" dataKey="submitted" stroke="var(--chart-1)" strokeWidth={2} />
            <Line type="monotone" dataKey="resolved" stroke="var(--chart-5)" strokeWidth={2} />
          </LineChart></ResponsiveContainer>
        </Box>
        <Box title="Worker workload">
          <ResponsiveContainer><BarChart data={workers}>
            <CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="name" {...axis} /><YAxis allowDecimals={false} {...axis} />
            <Tooltip cursor={{ fill: "var(--muted)" }} /><Legend />
            <Bar dataKey="open" fill={COLORS[0]} radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer>
        </Box>
      </div>
    </>
  );
}
