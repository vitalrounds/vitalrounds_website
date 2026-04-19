import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import WaitlistList from "./waitlist-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wait list | VitalRounds Control",
};

type Row = {
  id: string;
  created_at: string;
  applicant_email: string | null;
  payload: Record<string, unknown> | null;
};

export default async function ControlWaitlistPage() {
  let rows: Row[] = [];
  let loadError: string | null = null;

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("waitlist_submissions")
      .select("id, created_at, applicant_email, payload")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    rows = (data as Row[]) ?? [];
  } catch {
    loadError =
      "Could not load submissions. On Vercel, set SUPABASE_SERVICE_ROLE_KEY. In Supabase, run sql/waitlist_submissions.sql, then redeploy.";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Wait list</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Click an applicant row to open full details and downloadable documents.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/control/waitlist/invite"
              className="rounded-full bg-[#759d7b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5f7362]"
            >
              Invite to join wait list
            </Link>
            <button
              type="button"
              disabled
              className="rounded-full border border-[#5f7362] px-4 py-2 text-sm font-semibold text-[#a6ccac] opacity-70"
            >
              Coming Soon
            </button>
            <button
              type="button"
              disabled
              className="rounded-full border border-[#5f7362] px-4 py-2 text-sm font-semibold text-[#a6ccac] opacity-70"
            >
              Coming Soon
            </button>
            <button
              type="button"
              disabled
              className="rounded-full border border-[#5f7362] px-4 py-2 text-sm font-semibold text-[#a6ccac] opacity-70"
            >
              Coming Soon
            </button>
          </div>
        </div>
        <Link
          href="/control"
          className="rounded-full border border-[#5f7362] px-4 py-2 text-sm text-[#cbecd0] hover:bg-[#354a38]"
        >
          ← Control home
        </Link>
      </div>

      {loadError && (
        <p className="rounded-xl border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          {loadError}
        </p>
      )}

      {!loadError && <WaitlistList initialRows={rows} />}
    </div>
  );
}
