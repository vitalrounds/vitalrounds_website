import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const WAITLIST_BUCKET = process.env.WAITLIST_STORAGE_BUCKET ?? "waitlist-documents";

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
        const details = (parsed as { details?: { email?: string } }).details;
        const applicantEmail =
          typeof details?.email === "string" ? details.email.trim() : null;

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
