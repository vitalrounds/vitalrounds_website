import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const editableFields = [
  "preferredName",
  "dateOfBirth",
  "nationality",
  "degreeCountry",
  "degreeInstitution",
  "phone",
  "cityCountry",
  "linkedIn",
  "ahpraNumber",
  "amcCandidateNumber",
  "englishTestType",
  "englishTestScore",
  "englishTestExpiry",
  "visaStatus",
  "preferredSpecialties",
  "additionalNotes",
  "personalStatement",
] as const;

export async function PATCH(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user || user.user_metadata?.role !== "applicant") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { details?: Record<string, unknown> };
  const updates = body.details ?? {};
  const admin = createServiceRoleClient();

  const { data: profile, error: profileError } = await admin
    .from("applicant_profiles")
    .select("details")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const currentDetails =
    profile?.details && typeof profile.details === "object"
      ? (profile.details as Record<string, unknown>)
      : {};
  const nextDetails = { ...currentDetails };

  editableFields.forEach((field) => {
    if (field in updates) {
      nextDetails[field] = updates[field];
    }
  });

  const { error: updateError } = await admin
    .from("applicant_profiles")
    .update({ details: nextDetails, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ details: nextDetails });
}
