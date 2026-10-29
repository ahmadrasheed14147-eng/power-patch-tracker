import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/consumer")({
  component: () => (
    <AppShell role="consumer">
      <Outlet />
    </AppShell>
  ),
});
