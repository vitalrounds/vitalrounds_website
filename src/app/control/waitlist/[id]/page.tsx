import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wait list submission | VitalRounds Control",
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

export default async function ControlWaitlistSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("waitlist_submissions")
    .select("id, created_at, applicant_email, payload, file_names, files")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load submission");
  }

  if (!data) {
    notFound();
  }

  const row = data as Row;
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const payloadDetails = (payload.details ?? {}) as Record<string, unknown>;
  const payloadSurvey = (payload.survey ?? {}) as Record<string, unknown>;
  const submittedAtRaw =
    typeof payload.submittedAt === "string" ? payload.submittedAt : null;
  const files = row.files ?? {};
  const fileEntries = Object.entries(files);
  const detailsEntries = Object.entries(payloadDetails);
  const surveyEntries = Object.entries(payloadSurvey);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {stringOrDash(payloadDetails.fullLegalName)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Full wait list submission details with attached documents.
          </p>
        </div>
        <Link
          href="/control/waitlist"
          className="rounded-full border border-[#5f7362] px-4 py-2 text-sm text-[#cbecd0] hover:bg-[#354a38]"
        >
          ← Back to list
        </Link>
      </div>

      <article className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#a6ccac]">{row.applicant_email ?? "No email provided"}</p>
            <p className="mt-1 text-xs text-[#a6ccac]/80">
              Submitted at: {formatMelbourneDateTime(submittedAtRaw)}
            </p>
          </div>
          <div className="text-left text-xs text-[#a6ccac] sm:text-right">
            <p>{formatMelbourneDateTime(row.created_at)}</p>
            <p className="mt-1 opacity-80">Submission ID: {row.id}</p>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Preferred name" value={stringOrDash(payloadDetails.preferredName)} />
          <Info label="Phone" value={stringOrDash(payloadDetails.phone)} />
          <Info label="Current city / country" value={stringOrDash(payloadDetails.cityCountry)} />
          <Info label="Nationality" value={stringOrDash(payloadDetails.nationality)} />
          <Info label="Degree country" value={stringOrDash(payloadDetails.degreeCountry)} />
          <Info label="Preferred specialties" value={arrayOrDash(payloadDetails.preferredSpecialties)} />
          <Info label="AHPRA number" value={stringOrDash(payloadDetails.ahpraNumber)} />
          <Info label="AMC candidate number" value={stringOrDash(payloadDetails.amcCandidateNumber)} />
          <Info label="Visa status" value={stringOrDash(payloadDetails.visaStatus)} />
        </dl>

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-white">All details fields</h3>
          {detailsEntries.length > 0 ? (
            <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--control-table-border)]">
              <table className="min-w-[40rem] text-left text-sm">
                <tbody>
                  {detailsEntries.map(([key, value]) => (
                    <tr key={key} className="border-b border-[var(--control-table-border)] last:border-b-0">
                      <th className="w-1/3 bg-[#243329] px-3 py-2 text-xs uppercase tracking-wider text-[#a6ccac]">
                        {humanizeKey(key)}
                      </th>
                      <td className="bg-[#1f2d24] px-3 py-2 text-[#cbecd0]">
                        {renderValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#a6ccac]">No details fields found.</p>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-white">All survey answers</h3>
          {surveyEntries.length > 0 ? (
            <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--control-table-border)]">
              <table className="min-w-[40rem] text-left text-sm">
                <tbody>
                  {surveyEntries.map(([key, value]) => (
                    <tr key={key} className="border-b border-[var(--control-table-border)] last:border-b-0">
                      <th className="w-1/3 bg-[#243329] px-3 py-2 text-xs uppercase tracking-wider text-[#a6ccac]">
                        {humanizeKey(key)}
                      </th>
                      <td className="bg-[#1f2d24] px-3 py-2 text-[#cbecd0]">
                        {renderValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#a6ccac]">No survey answers found.</p>
          )}
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-white">Documents</h3>
          {fileEntries.length > 0 ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {fileEntries.map(([key, file]) => (
                <li
                  key={key}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--control-table-border)] bg-[#243329] px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0 break-words text-[#cbecd0] sm:truncate sm:pr-3">{file.name}</span>
                  <Link
                    href={`/api/control/waitlist/files?path=${encodeURIComponent(file.path)}&name=${encodeURIComponent(file.name)}`}
                    className="w-fit rounded-full border border-[#5f7362] px-3 py-1 text-xs text-[#cbecd0] hover:bg-[#354a38]"
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
    </div>
  );
}

function stringOrDash(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  return "—";
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .trim();
}

function arrayOrDash(value: unknown) {
  if (Array.isArray(value) && value.length > 0) return value.join(", ");
  return "—";
}

function renderValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  const asString = String(value).trim();
  return asString || "—";
}

function formatMelbourneDateTime(value: string | null) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  }).format(date);
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--control-table-border)] bg-[#243329] px-3 py-2">
      <dt className="text-xs uppercase tracking-wider text-[#a6ccac]">{label}</dt>
      <dd className="mt-1 text-sm text-[#cbecd0]">{value}</dd>
    </div>
  );
}
