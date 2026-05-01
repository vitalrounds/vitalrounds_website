import { NextResponse } from "next/server";
import { buildEmailLogoUrl, sendResendEmail } from "@/lib/email/resend";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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
    console.error("password_changed_email_failed", error);
  }

  return NextResponse.json({ ok: true });
}
