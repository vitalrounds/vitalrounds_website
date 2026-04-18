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
  file_names: Record<string, string | null> | null;
  files: Record<
    string,
    {
      key: string;
      name: string;
      path: string;
      size: number;
      type: string | null;
      bucket: string;
    }
  > | null;
};

export default async function ControlWaitlistPage() {
  let rows: Row[] = [];
  let loadError: string | null = null;

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("waitlist_submissions")
      .select("id, created_at, applicant_email, payload, file_names, files")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    rows = (data as Row[]) ?? [];
  } catch {
    loadError =
      "Could not load submissions. On Vercel, set SUPABASE_SERVICE_ROLE_KEY. In Supabase, run sql/waitlist_submissions.sql, then redeploy.";
  }

  const total = rows.length;
  const withFiles = rows.filter((row) => row.files && Object.keys(row.files).length > 0).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Wait list</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Submissions from the public wait list form with applicant details and attached documents.
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-4">
              <p className="text-xs uppercase tracking-wider text-[#a6ccac]">Total submissions</p>
              <p className="mt-2 text-2xl font-semibold text-white">{total}</p>
            </div>
            <div className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-4">
              <p className="text-xs uppercase tracking-wider text-[#a6ccac]">With documents</p>
              <p className="mt-2 text-2xl font-semibold text-white">{withFiles}</p>
            </div>
          </div>

          {rows.map((row) => {
            const payloadDetails = (row.payload?.details ?? {}) as Record<string, unknown>;
            const files = row.files ?? {};
            const fileEntries = Object.entries(files);
            return (
              <article key={row.id} className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {stringOrDash(payloadDetails.fullLegalName)}
                    </h2>
                    <p className="mt-1 text-sm text-[#a6ccac]">{row.applicant_email ?? "No email provided"}</p>
                  </div>
                  <div className="text-right text-xs text-[#a6ccac]">
                    <p>
                      {new Date(row.created_at).toLocaleString("en-AU", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="mt-1 opacity-80">Submission ID: {row.id.slice(0, 8)}</p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <Info label="Preferred name" value={stringOrDash(payloadDetails.preferredName)} />
                  <Info label="Phone" value={stringOrDash(payloadDetails.phone)} />
                  <Info label="Current city / country" value={stringOrDash(payloadDetails.cityCountry)} />
                  <Info label="Nationality" value={stringOrDash(payloadDetails.nationality)} />
                  <Info label="Degree country" value={stringOrDash(payloadDetails.degreeCountry)} />
                  <Info
                    label="Preferred specialties"
                    value={arrayOrDash(payloadDetails.preferredSpecialties)}
                  />
                </dl>

                <section className="mt-5">
                  <h3 className="text-sm font-semibold text-white">Documents</h3>
                  {fileEntries.length > 0 ? (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {fileEntries.map(([key, file]) => (
                        <li
                          key={key}
                          className="flex items-center justify-between rounded-xl border border-[#445a47] bg-[#243329] px-3 py-2 text-sm"
                        >
                          <span className="truncate pr-3 text-[#cbecd0]">{file.name}</span>
                          <Link
                            href={`/api/control/waitlist/files?path=${encodeURIComponent(file.path)}&name=${encodeURIComponent(file.name)}`}
                            className="rounded-full border border-[#5f7362] px-3 py-1 text-xs text-[#cbecd0] hover:bg-[#354a38]"
                          >
                            Download
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-[#a6ccac]">
                      {row.file_names && Object.keys(row.file_names).length > 0
                        ? "Legacy submission (filenames saved before storage upload was enabled)."
                        : "No documents attached."}
                    </p>
                  )}
                </section>

                <details className="mt-5">
                  <summary className="cursor-pointer text-sm text-[#a6ccac] hover:text-white">
                    View full JSON payload
                  </summary>
                  <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-[#1a241c] p-3 text-xs text-[#cbecd0]">
                    {JSON.stringify(row.payload ?? {}, null, 2)}
                  </pre>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function stringOrDash(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  return "—";
}

function arrayOrDash(value: unknown) {
  if (Array.isArray(value) && value.length > 0) return value.join(", ");
  return "—";
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#445a47] bg-[#243329] px-3 py-2">
      <dt className="text-xs uppercase tracking-wider text-[#a6ccac]">{label}</dt>
      <dd className="mt-1 text-sm text-[#cbecd0]">{value}</dd>
    </div>
  );
}
