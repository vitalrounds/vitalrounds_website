import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const auth = await createServerSupabaseClient();
  const {
    data: { session },
  } = await auth.auth.getSession();
  const user = session?.user ?? null;
  if (!user || user.user_metadata?.role !== "applicant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const programId = typeof body.programId === "string" && body.programId.trim() ? body.programId.trim() : null;
  if (!programId) {
    return NextResponse.json({ error: "Program is required." }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.from("program_applications").insert({
    applicant_user_id: user.id,
    program_id: programId,
    status: "submitted",
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
