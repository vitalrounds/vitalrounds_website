import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const WAITLIST_BUCKET = process.env.WAITLIST_STORAGE_BUCKET ?? "waitlist-documents";
const RESEND_API_URL = "https://api.resend.com/emails";

type UploadInfo = {
  key: string;
  name: string;
  path: string;
  size: number;
  type: string | null;
  bucket: string;
};

const FILE_FIELDS = [
  "cv",
  "passport",
  "degreeCertificate",
  "amcPart1",
  "englishTestReport",
  "internshipCertificate",
  "visa",
] as const;

function sanitizeFileName(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function getApplicantDetails(parsed: unknown) {
  const details = (parsed as { details?: Record<string, unknown> }).details;
  const emailRaw = details?.email;
  const nameRaw = details?.fullLegalName;
  const applicantEmail =
    typeof emailRaw === "string" && emailRaw.trim() ? emailRaw.trim().toLowerCase() : null;
  const applicantName = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : null;
  return { details, applicantEmail, applicantName };
}

function buildAppOrigin(req: Request) {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(req.url).origin;
}

async function sendWaitlistConfirmationEmail(opts: {
  to: string;
  name: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.WAITLIST_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    console.warn(
      "[waitlist] confirmation email skipped: missing RESEND_API_KEY or WAITLIST_FROM_EMAIL"
    );
    return;
  }

  const name = opts.name ?? "there";
  const replyTo = process.env.WAITLIST_REPLY_TO?.trim() || undefined;

  const html = `
    <p>Hi ${name},</p>
    <p>Thanks for joining the VitalRounds wait list.</p>
    <p>We have received your details and will contact you once your turn is up.</p>
    <p>Kind regards,<br/>VitalRounds Team</p>
  `;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      reply_to: replyTo ? [replyTo] : undefined,
      subject: "You have joined the VitalRounds wait list",
      html,
      text: `Hi ${name},\n\nThanks for joining the VitalRounds wait list.\nWe have received your details and will contact you once your turn is up.\n\nKind regards,\nVitalRounds Team`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend_failed:${res.status}:${body}`);
  }
}

async function provisionApplicantAccount(opts: {
  admin: ReturnType<typeof createServiceRoleClient>;
  email: string;
  fullName: string | null;
  req: Request;
}) {
  const redirectTo = `${buildAppOrigin(opts.req)}/auth/callback?next=/customer/dashboard`;

  const invite = await opts.admin.auth.admin.inviteUserByEmail(opts.email, {
    redirectTo,
    data: {
      role: "customer",
      source: "waitlist",
      full_name: opts.fullName ?? undefined,
    },
  });

  if (!invite.error) return;

  const msg = invite.error.message.toLowerCase();
  const userExists =
    msg.includes("already") || msg.includes("exists") || msg.includes("registered");
  if (!userExists) {
    throw new Error(`invite_failed:${invite.error.message}`);
  }

  // Existing user: send password setup/reset email so they can finish onboarding.
  const reset = await opts.admin.auth.resetPasswordForEmail(opts.email, { redirectTo });
  if (reset.error) {
    throw new Error(`password_setup_failed:${reset.error.message}`);
  }
}

async function uploadFiles(admin: ReturnType<typeof createServiceRoleClient>, form: FormData, submissionId: string) {
  const uploaded: UploadInfo[] = [];
  for (const key of FILE_FIELDS) {
    const entry = form.get(key);
    if (!(entry instanceof File)) continue;

    const safeName = sanitizeFileName(entry.name || `${key}.bin`);
    const objectPath = `waitlist/${submissionId}/${key}-${safeName}`;
    const fileBytes = new Uint8Array(await entry.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(WAITLIST_BUCKET)
      .upload(objectPath, fileBytes, {
        contentType: entry.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`upload_failed:${key}:${uploadError.message}`);
    }

    uploaded.push({
      key,
      name: entry.name,
      path: objectPath,
      size: entry.size,
      type: entry.type || null,
      bucket: WAITLIST_BUCKET,
    });
  }
  return uploaded;
}

/**
 * Accepts wait list payload (survey + identity + files).
 * Persists JSON to Supabase and uploads files to private Storage bucket.
 */
export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") ?? "";

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const jsonRaw = form.get("json");
      if (typeof jsonRaw !== "string") {
        return NextResponse.json({ error: "Missing json field" }, { status: 400 });
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonRaw) as unknown;
      } catch {
        return NextResponse.json({ error: "Invalid json" }, { status: 400 });
      }

      const pickName = (key: string) =>
        form.get(key) instanceof File ? (form.get(key) as File).name : null;
      const fileNames = {
        cv: pickName("cv"),
        passport: pickName("passport"),
        degreeCertificate: pickName("degreeCertificate"),
        amcPart1: pickName("amcPart1"),
        englishTestReport: pickName("englishTestReport"),
        internshipCertificate: pickName("internshipCertificate"),
        visa: pickName("visa"),
      };

      console.info("[waitlist] multipart submission", {
        keys: parsed && typeof parsed === "object" ? Object.keys(parsed as object) : [],
        files: fileNames,
        at: new Date().toISOString(),
      });

      try {
        const admin = createServiceRoleClient();
        const submissionId = crypto.randomUUID();
        const uploaded = await uploadFiles(admin, form, submissionId);
        const filesObject = Object.fromEntries(uploaded.map((f) => [f.key, f]));
        const { applicantEmail, applicantName } = getApplicantDetails(parsed);

        const { error: insertError } = await admin.from("waitlist_submissions").insert({
          id: submissionId,
          applicant_email: applicantEmail,
          payload: parsed as object,
          file_names: fileNames,
          files: filesObject,
        });

        if (insertError) {
          console.error("[waitlist] supabase insert", insertError);
          return NextResponse.json(
            { error: "Could not save submission. Try again later." },
            { status: 503 }
          );
        }

        if (applicantEmail) {
          try {
            await Promise.all([
              sendWaitlistConfirmationEmail({
                to: applicantEmail,
                name: applicantName,
              }),
              provisionApplicantAccount({
                admin,
                email: applicantEmail,
                fullName: applicantName,
                req,
              }),
            ]);
          } catch (notifyError) {
            // Submission is already persisted; keep success response but log provisioning issues.
            console.error("[waitlist] account/email workflow", notifyError);
          }
        }
      } catch (e) {
        console.error("[waitlist] persistence", e);
        return NextResponse.json(
          {
            error:
              "Server is not configured to save submissions (missing SUPABASE_SERVICE_ROLE_KEY, storage bucket, or database table).",
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    const body = (await req.json()) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.info("[waitlist] json submission", {
      keys: Object.keys(body as object),
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
