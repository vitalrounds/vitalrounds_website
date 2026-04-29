import { requireAdmin } from "@/lib/auth/require-admin";
import { ControlShell } from "./control-shell";

export default async function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin("/control");

  return (
    <ControlShell>{children}</ControlShell>
  );
}
