import Link from "next/link";
import BrochuresManager from "./brochures-manager";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { listSalesBrochures, type SalesBrochureItem } from "@/lib/sales-brochures";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sales brochures | VitalRounds Control",
};

export default async function SalesBrochuresPage() {
  let rows: SalesBrochureItem[] = [];
  let loadError: string | null = null;

  try {
    const admin = createServiceRoleClient();
    rows = await listSalesBrochures(admin);
  } catch {
    loadError = "Could not load brochures. Confirm SUPABASE_SERVICE_ROLE_KEY is configured and redeploy.";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Sales brochures</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Upload campaign PDFs, manage files, and generate secure share links for outreach emails.
          </p>
        </div>
        <Link
          href="/control/sales"
          className="rounded-full border border-[#5f7362] px-4 py-2 text-sm text-[#cbecd0] hover:bg-[#354a38]"
        >
          ← Sales home
        </Link>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          {loadError}
        </p>
      ) : (
        <BrochuresManager initialRows={rows} />
      )}
    </div>
  );
}
