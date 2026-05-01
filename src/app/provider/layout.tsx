import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PartnerPortalShell } from "./partner-shell";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) redirect("/login?next=/provider/dashboard");
  const role = user.user_metadata?.role;
  if (role !== "provider" && role !== "partner") redirect("/login?error=wrong_role");

  const userName =
    typeof user.user_metadata?.organization_name === "string"
      ? user.user_metadata.organization_name
      : user.email ?? "Partner";

  return <PartnerPortalShell userName={userName}>{children}</PartnerPortalShell>;
}
