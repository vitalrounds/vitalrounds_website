import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

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

  const total = rows.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Wait list</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Click an applicant row to open full details and downloadable documents.
          </p>
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

      {!loadError && rows.length === 0 && (
        <p className="text-sm text-[#a6ccac]">
          No submissions yet. After the database table exists and the service role key is set,
          new submissions will appear here.
        </p>
      )}

      {!loadError && rows.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-4">
            <p className="text-xs uppercase tracking-wider text-[#a6ccac]">Total submissions</p>
            <p className="mt-2 text-2xl font-semibold text-white">{total}</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#354a38] bg-[#2c3d2f]">
            <div className="grid grid-cols-12 border-b border-[#354a38] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#a6ccac]">
              <div className="col-span-5">Applicant</div>
              <div className="col-span-4">Current city</div>
              <div className="col-span-3">Applied</div>
            </div>
            {rows.map((row) => {
              const details = (row.payload?.details ?? {}) as Record<string, unknown>;
              const name = stringOrDash(details.fullLegalName);
              const city = stringOrDash(details.cityCountry);
              return (
                <Link
                  key={row.id}
                  href={`/control/waitlist/${row.id}`}
                  className="grid grid-cols-12 items-center gap-2 border-b border-[#354a38]/70 px-4 py-3 text-sm text-[#cbecd0] transition hover:bg-[#354a38] last:border-b-0"
                >
                  <div className="col-span-5 min-w-0">
                    <p className="truncate font-medium text-white">{name}</p>
                    <p className="truncate text-xs text-[#a6ccac]">{row.applicant_email ?? "No email"}</p>
                  </div>
                  <div className="col-span-4 truncate">{city}</div>
                  <div className="col-span-3 text-xs text-[#a6ccac]">
                    {new Date(row.created_at).toLocaleDateString("en-AU", {
                      dateStyle: "medium",
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function stringOrDash(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  return "—";
}
