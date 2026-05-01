import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const APPLICANT_DOCUMENTS_BUCKET =
  process.env.APPLICANT_DOCUMENTS_BUCKET?.trim() || "applicant-documents";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user || user.user_metadata?.role !== "applicant") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { path } = (await req.json().catch(() => ({}))) as { path?: string };
  if (!path || !path.startsWith(`applicants/${user.id}/`)) {
    return NextResponse.json({ error: "Document is not available." }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin.storage
    .from(APPLICANT_DOCUMENTS_BUCKET)
    .createSignedUrl(path, 10 * 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Could not open document." }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
