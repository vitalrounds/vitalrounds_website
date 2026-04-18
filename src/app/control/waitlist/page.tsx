import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getRoleFromUser,
  isEmailAllowedAdmin,
} from "@/lib/auth/redirect-after-login";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wait list | VitalRounds Control",
};

type Row = {
  id: string;
  created_at: string;
  applicant_email: string | null;
  payload: unknown;
  file_names: unknown;
};

export default async function ControlWaitlistPage() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  const role = getRoleFromUser(user);
  if (role !== "admin" || !isEmailAllowedAdmin(user?.email)) {
    redirect("/login?error=admin_only");
  }

  let rows: Row[] = [];
  let loadError: string | null = null;

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("waitlist_submissions")
      .select("id, created_at, applicant_email, payload, file_names")
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
            Submissions from the public wait list form (survey + details). File uploads are not
            stored yet—only filenames attached to each row.
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
        <div className="overflow-x-auto rounded-2xl border border-[#354a38] bg-[#2c3d2f]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#354a38] text-[#a6ccac]">
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Files</th>
                <th className="px-4 py-3 font-medium">Payload</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#354a38]/80 align-top text-[#cbecd0]">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#a6ccac]">
                    {new Date(row.created_at).toLocaleString("en-AU", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">{row.applicant_email ?? "—"}</td>
                  <td className="max-w-[200px] px-4 py-3 text-xs">
                    <pre className="whitespace-pre-wrap break-words font-sans text-[#a6ccac]">
                      {row.file_names
                        ? JSON.stringify(row.file_names, null, 2)
                        : "—"}
                    </pre>
                  </td>
                  <td className="min-w-[280px] px-4 py-3">
                    <details className="cursor-pointer">
                      <summary className="text-[#a6ccac] hover:text-white">
                        View JSON
                      </summary>
                      <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-[#1a241c] p-3 text-xs text-[#cbecd0]">
                        {JSON.stringify(row.payload, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
