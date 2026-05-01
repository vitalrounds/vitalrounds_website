import { NextResponse } from "next/server";
import { buildEmailLogoUrl, sendResendEmail } from "@/lib/email/resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

function buildAppOrigin(req: Request) {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const origin = buildAppOrigin(req);
  const redirectTo = `${origin}/auth/callback?next=/reset-password`;
  const admin = createServiceRoleClient();
  const recovery = await admin.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (recovery.error || !recovery.data.properties?.action_link) {
    console.error("forgot_password_link_failed", recovery.error);
    return NextResponse.json({ ok: true });
  }

  try {
    await sendResendEmail({
      to: normalizedEmail,
      subject: "Reset your VitalRounds password",
      html: `
        <div style="font-family: Arial, sans-serif; color: #243329; line-height: 1.6;">
          <div style="text-align:center; margin-bottom:20px;">
            <img src="${buildEmailLogoUrl(origin)}" alt="VitalRounds" style="max-width:180px; height:auto;" />
          </div>
          <p>We received a request to reset your VitalRounds password.</p>
          <p style="margin: 24px 0;">
            <a href="${recovery.data.properties.action_link}" style="display:inline-block; background:#759d7b; color:#ffffff; text-decoration:none; padding:11px 18px; border-radius:999px; font-weight:600;">
              Reset password
            </a>
          </p>
          <p>If you did not request this, you can ignore this email.</p>
          <p>Thanks,<br/>VitalRounds Team</p>
        </div>
      `,
      text: `We received a request to reset your VitalRounds password.\n\nReset it here:\n${recovery.data.properties.action_link}\n\nIf you did not request this, you can ignore this email.\n\nThanks,\nVitalRounds Team`,
    });
  } catch (error) {
    console.error("forgot_password_email_failed", error);
    await admin.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
  }

  return NextResponse.json({ ok: true });
}
