import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

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
  if (!supabaseAnonKey) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 500 });
  }

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

  const anon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const redirectTo = `${buildAppOrigin(req)}/auth/callback?next=/dashboard`;
  const signUp = await anon.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        role: "applicant",
        source: "public_signup",
        full_name: fullName,
      },
    },
  });

  if (signUp.error || !signUp.data.user) {
    return NextResponse.json(
      { error: signUp.error?.message || "Could not create applicant account." },
      { status: 400 },
    );
  }

  const userId = signUp.data.user.id;
  const admin = createServiceRoleClient();
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

  const confirmed = Boolean(signUp.data.user.email_confirmed_at);
  const { error: profileError } = await admin.from("applicant_profiles").upsert({
    user_id: userId,
    email,
    full_name: fullName,
    status: confirmed ? "active" : "pending_email_verification",
    survey: parsed.survey ?? {},
    details: {
      ...details,
      privacyConsent: parsed.privacyConsent ?? null,
    },
    documents,
    email_verified_at: confirmed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return NextResponse.json(
      { error: "Account was created, but applicant profile could not be saved. Contact admin." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, requiresEmailVerification: !confirmed });
}
