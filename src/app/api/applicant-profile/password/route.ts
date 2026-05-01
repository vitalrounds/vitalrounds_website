import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { buildEmailLogoUrl, sendResendEmail } from "@/lib/email/resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const supabaseProjectId =
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID ??
  process.env.SUPABASE_PROJECT_ID ??
  "jxumcqmagdwyvsanmauw";
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  `https://${supabaseProjectId}.supabase.co`;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

function passwordIsStrong(password: string) {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user || user.user_metadata?.role !== "applicant" || !user.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!supabaseAnonKey) {
    return NextResponse.json({ error: "Password verification is not configured." }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    currentPassword?: string;
    newPassword?: string;
  };
  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";

  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }
  if (!passwordIsStrong(newPassword)) {
    return NextResponse.json(
      { error: "New password must be 12+ characters and include uppercase, lowercase, number, and special character." },
      { status: 400 },
    );
  }

  const verifier = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  try {
    await sendResendEmail({
      to: user.email,
      subject: "Your VitalRounds password was changed",
      html: `
        <div style="font-family: Arial, sans-serif; color: #243329; line-height: 1.6;">
          <div style="text-align:center; margin-bottom:20px;">
            <img src="${buildEmailLogoUrl(origin)}" alt="VitalRounds" style="max-width:180px; height:auto;" />
          </div>
          <p>Hi ${user.user_metadata?.full_name ?? "there"},</p>
          <p>Your VitalRounds account password was changed successfully.</p>
          <p>If you did not make this change, please contact VitalRounds immediately.</p>
          <p>Thanks,<br/>VitalRounds Team</p>
        </div>
      `,
      text: `Hi ${user.user_metadata?.full_name ?? "there"},\n\nYour VitalRounds account password was changed successfully.\nIf you did not make this change, please contact VitalRounds immediately.\n\nThanks,\nVitalRounds Team`,
    });
  } catch (error) {
    console.error("password_change_email_failed", error);
  }

  return NextResponse.json({ ok: true });
}
