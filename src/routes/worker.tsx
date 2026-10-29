import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/worker")({
  component: () => (
    <AppShell role="worker">
      <Outlet />
    </AppShell>
  ),
});
