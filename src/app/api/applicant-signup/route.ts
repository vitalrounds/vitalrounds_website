import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const RESEND_API_URL = "https://api.resend.com/emails";
const APPLICANT_DOCUMENTS_BUCKET =
  process.env.APPLICANT_DOCUMENTS_BUCKET?.trim() || "applicant-documents";

const DOCUMENT_FIELDS = [
  "cv",
  "degreeCertificate",
  "identityDocument",
  "amcPart1",
  "englishTestReport",
  "internshipCertificate",
  "visa",
] as const;

function buildAppOrigin(req: Request) {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(req.url).origin;
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.WAITLIST_FROM_EMAIL?.trim();
  const replyTo = process.env.WAITLIST_REPLY_TO?.trim() || undefined;
  if (!apiKey || !from) return null;
  return { apiKey, from, replyTo };
}

async function sendResendEmail(opts: {
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

function sanitizeFileName(name: string) {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

async function ensureBucket(admin: ReturnType<typeof createServiceRoleClient>) {
  const { error } = await admin.storage.createBucket(APPLICANT_DOCUMENTS_BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf", "image/jpeg"],
  });
  if (!error) return;
  const msg = error.message.toLowerCase();
  if (msg.includes("already") || msg.includes("exists")) return;
  throw error;
}

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
  const form = await req.formData();
  const rawJson = form.get("json");
  const password = String(form.get("password") ?? "");
  if (typeof rawJson !== "string") {
    return NextResponse.json({ error: "Missing application details." }, { status: 400 });
  }
  if (!passwordIsStrong(password)) {
    return NextResponse.json({ error: "Password does not meet strength requirements." }, { status: 400 });
  }

  const parsed = JSON.parse(rawJson) as {
    survey?: Record<string, unknown>;
    details?: Record<string, unknown>;
    privacyConsent?: Record<string, unknown>;
  };
  const details = parsed.details ?? {};
  const email =
    typeof details.email === "string" && details.email.trim()
      ? details.email.trim().toLowerCase()
      : null;
  const fullName =
    typeof details.fullLegalName === "string" && details.fullLegalName.trim()
      ? details.fullLegalName.trim()
      : null;

  if (!email || !fullName) {
    return NextResponse.json({ error: "Full name and email are required." }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const redirectTo = `${buildAppOrigin(req)}/auth/callback?next=/dashboard`;
  const signUp = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo,
      data: {
        role: "applicant",
        source: "public_signup",
        full_name: fullName,
      },
    },
  });

  if (signUp.error || !signUp.data.user || !signUp.data.properties?.action_link) {
    return NextResponse.json(
      { error: signUp.error?.message || "Could not create applicant account." },
      { status: 400 },
    );
  }

  const userId = signUp.data.user.id;
  await ensureBucket(admin);

  const documents: Record<string, unknown> = {};
  for (const key of DOCUMENT_FIELDS) {
    const file = form.get(key);
    if (!(file instanceof File) || file.size <= 0) continue;
    const safeName = sanitizeFileName(file.name || `${key}.bin`);
    const path = `applicants/${userId}/${key}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await admin.storage.from(APPLICANT_DOCUMENTS_BUCKET).upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    });
    if (!error) {
      documents[key] = {
        name: file.name,
        path,
        size: file.size,
        type: file.type || null,
        bucket: APPLICANT_DOCUMENTS_BUCKET,
      };
    }
  }

  const { error: profileError } = await admin.from("applicant_profiles").upsert({
    user_id: userId,
    email,
    full_name: fullName,
    status: "pending_email_verification",
    survey: parsed.survey ?? {},
    details: {
      ...details,
      privacyConsent: parsed.privacyConsent ?? null,
    },
    documents,
    email_verified_at: null,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error("applicant_profile_save_failed", profileError);
    const missingTable =
      profileError.message?.toLowerCase().includes("applicant_profiles") ||
      profileError.message?.toLowerCase().includes("schema cache") ||
      profileError.message?.toLowerCase().includes("relation");

    return NextResponse.json(
      {
        error: missingTable
          ? "Account was created, but applicant profile setup is incomplete. Admin needs to run sql/applicant_portal.sql in Supabase."
          : `Account was created, but applicant profile could not be saved. Admin detail: ${profileError.message}`,
      },
      { status: 500 },
    );
  }

  const appOrigin = buildAppOrigin(req);
  const logoUrl = process.env.WAITLIST_EMAIL_LOGO_URL?.trim() || `${appOrigin}/logo-original.png`;
  const verifyLink = signUp.data.properties.action_link;
  await sendResendEmail({
    to: email,
    subject: "Confirm your VitalRounds applicant account",
    html: `
      <div style="font-family: Arial, sans-serif; color: #243329; line-height: 1.6;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${logoUrl}" alt="VitalRounds" style="max-width:180px; height:auto;" />
        </div>
        <p>Hi ${fullName},</p>
        <p>Thank you for creating your VitalRounds applicant account.</p>
        <p>Please confirm your email address to activate your doctor portal.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyLink}" style="display:inline-block; background:#759d7b; color:#ffffff; text-decoration:none; padding:11px 18px; border-radius:999px; font-weight:600;">
            Confirm email address
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break:break-all;"><a href="${verifyLink}">${verifyLink}</a></p>
        <p>Thanks,<br/>VitalRounds Team</p>
      </div>
    `,
    text: `Hi ${fullName},\n\nThank you for creating your VitalRounds applicant account.\nPlease confirm your email address to activate your doctor portal:\n${verifyLink}\n\nThanks,\nVitalRounds Team`,
  });

  return NextResponse.json({ ok: true, requiresEmailVerification: true });
}
