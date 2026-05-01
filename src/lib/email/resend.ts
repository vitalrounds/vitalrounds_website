const RESEND_API_URL = "https://api.resend.com/emails";

export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.WAITLIST_FROM_EMAIL?.trim();
  const replyTo = process.env.WAITLIST_REPLY_TO?.trim() || undefined;
  if (!apiKey || !from) return null;
  return { apiKey, from, replyTo };
}

export async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const cfg = getResendConfig();
  if (!cfg) {
    throw new Error("resend_not_configured");
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
    throw new Error(`resend_failed:${res.status}:${await res.text()}`);
  }
}

export function buildEmailLogoUrl(origin: string) {
  return process.env.WAITLIST_EMAIL_LOGO_URL?.trim() || `${origin.replace(/\/$/, "")}/logo-original.png`;
}
