"use server";

import { requireAdmin } from "@/lib/auth/require-admin";

const RESEND_API_URL = "https://api.resend.com/emails";

function buildAppOrigin() {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "https://vitalrounds.com.au";
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.WAITLIST_FROM_EMAIL?.trim();
  const replyTo = process.env.WAITLIST_REPLY_TO?.trim() || undefined;
  if (!apiKey || !from) return null;
  return { apiKey, from, replyTo };
}

function normalizeEmails(values: string[]) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return [...new Set(values.map((v) => v.trim().toLowerCase()).filter((v) => emailRegex.test(v)))];
}

async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const cfg = getResendConfig();
  if (!cfg) {
    throw new Error("Email sender is not configured (RESEND_API_KEY / WAITLIST_FROM_EMAIL).");
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: cfg.from,
      to: [opts.to],
      reply_to: cfg.replyTo ? [cfg.replyTo] : undefined,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend_failed:${res.status}:${body}`);
  }
}

export async function sendWaitlistInviteEmails(input: { emails: string[] }) {
  await requireAdmin("/control/waitlist/invite");

  const emails = normalizeEmails(input.emails ?? []);
  if (emails.length === 0) {
    return { ok: false as const, error: "Please enter at least one valid email address." };
  }

  const appOrigin = buildAppOrigin();
  const waitlistUrl = `${appOrigin}/waitlist`;
  const logoUrl =
    process.env.WAITLIST_EMAIL_LOGO_URL?.trim() || `${appOrigin}/short-logo.png`;

  const failed: string[] = [];
  for (const email of emails) {
    const html = `
      <div style="font-family: Arial, sans-serif; color: #243329; line-height: 1.6;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${logoUrl}" alt="VitalRounds" style="max-width:180px; height:auto;" />
        </div>
        <p>Hi,</p>
        <p>You are warmly invited to join the VitalRounds wait list.</p>
        <p>Submit your application and our team will review your profile for suitable placement opportunities.</p>
        <p style="margin: 24px 0;">
          <a href="${waitlistUrl}" style="display:inline-block; background:#759d7b; color:#ffffff; text-decoration:none; padding:10px 16px; border-radius:999px; font-weight:600;">
            Join the waiting list
          </a>
        </p>
        <p>Thank you,<br/>VitalRounds Team</p>
      </div>
    `;

    try {
      await sendResendEmail({
        to: email,
        subject: "Invitation to join the VitalRounds wait list",
        html,
        text: `Hi,\n\nYou are invited to join the VitalRounds wait list.\nSubmit your application here: ${waitlistUrl}\n\nThank you,\nVitalRounds Team`,
      });
    } catch {
      failed.push(email);
    }
  }

  return {
    ok: failed.length < emails.length,
    sent: emails.length - failed.length,
    failed,
  };
}
