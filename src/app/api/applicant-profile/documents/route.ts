import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const APPLICANT_DOCUMENTS_BUCKET =
  process.env.APPLICANT_DOCUMENTS_BUCKET?.trim() || "applicant-documents";
const DOCUMENT_LIMIT_BYTES = 10 * 1024 * 1024;
const AVATAR_LIMIT_BYTES = 2 * 1024 * 1024;

const allowedDocumentTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFileName(name: string) {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

async function requireApplicant() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user || user.user_metadata?.role !== "applicant") return null;
  return user;
}

async function ensureBucket(admin: ReturnType<typeof createServiceRoleClient>) {
  const options = {
    public: false,
    fileSizeLimit: DOCUMENT_LIMIT_BYTES,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  };
  const { error } = await admin.storage.createBucket(APPLICANT_DOCUMENTS_BUCKET, options);
  if (!error) return;
  const msg = error.message.toLowerCase();
  if (msg.includes("already") || msg.includes("exists")) {
    await admin.storage.updateBucket(APPLICANT_DOCUMENTS_BUCKET, options);
    return;
  }
  throw error;
}

export async function POST(req: Request) {
  const user = await requireApplicant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const form = await req.formData();
  const kind = String(form.get("kind") ?? "");
  const label = String(form.get("label") ?? "").trim();
  const avatarPosition = String(form.get("avatarPosition") ?? "50% 50%");
  const file = form.get("file");

  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "Please select a file." }, { status: 400 });
  }

  const isAvatar = kind === "avatar";
  if (isAvatar) {
    if (file.size > AVATAR_LIMIT_BYTES) {
      return NextResponse.json({ error: "Profile photo must be 2 MB or smaller." }, { status: 400 });
    }
    if (!allowedAvatarTypes.has(file.type)) {
      return NextResponse.json({ error: "Profile photo must be JPG, PNG, or WebP." }, { status: 400 });
    }
  } else {
    if (file.size > DOCUMENT_LIMIT_BYTES) {
      return NextResponse.json({ error: "Document must be 10 MB or smaller." }, { status: 400 });
    }
    if (!allowedDocumentTypes.has(file.type)) {
      return NextResponse.json({ error: "Document must be PDF, JPG, or PNG." }, { status: 400 });
    }
  }

  const admin = createServiceRoleClient();
  await ensureBucket(admin);

  const { data: profile, error: profileError } = await admin
    .from("applicant_profiles")
    .select("documents")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const currentDocuments =
    profile?.documents && typeof profile.documents === "object"
      ? (profile.documents as Record<string, unknown>)
      : {};
  const safeName = sanitizeFileName(file.name || "upload");
  const prefix = isAvatar ? "avatar" : "additional";
  const path = `applicants/${user.id}/${prefix}-${Date.now()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(APPLICANT_DOCUMENTS_BUCKET)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const uploaded = {
    name: file.name,
    label: label || (isAvatar ? "Profile photo" : "Additional document"),
    path,
    size: file.size,
    type: file.type || null,
    bucket: APPLICANT_DOCUMENTS_BUCKET,
    ...(isAvatar ? { avatarPosition } : {}),
    uploadedAt: new Date().toISOString(),
  };

  const nextDocuments = isAvatar
    ? { ...currentDocuments, avatar: uploaded }
    : {
        ...currentDocuments,
        additionalDocuments: [
          ...((Array.isArray(currentDocuments.additionalDocuments)
            ? currentDocuments.additionalDocuments
            : []) as unknown[]),
          uploaded,
        ],
      };

  const previousAvatar =
    isAvatar &&
    currentDocuments.avatar &&
    typeof currentDocuments.avatar === "object" &&
    "path" in currentDocuments.avatar &&
    typeof currentDocuments.avatar.path === "string"
      ? currentDocuments.avatar.path
      : null;

  const { error: updateError } = await admin
    .from("applicant_profiles")
    .update({ documents: nextDocuments, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (previousAvatar) {
    await admin.storage.from(APPLICANT_DOCUMENTS_BUCKET).remove([previousAvatar]);
  }

  return NextResponse.json({ document: uploaded, documents: nextDocuments });
}

export async function DELETE() {
  const user = await requireApplicant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { data: profile, error: profileError } = await admin
    .from("applicant_profiles")
    .select("documents")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const currentDocuments =
    profile?.documents && typeof profile.documents === "object"
      ? (profile.documents as Record<string, unknown>)
      : {};
  const avatarPath =
    currentDocuments.avatar &&
    typeof currentDocuments.avatar === "object" &&
    "path" in currentDocuments.avatar &&
    typeof currentDocuments.avatar.path === "string"
      ? currentDocuments.avatar.path
      : null;
  const nextDocuments = { ...currentDocuments };
  delete nextDocuments.avatar;

  const { error: updateError } = await admin
    .from("applicant_profiles")
    .update({ documents: nextDocuments, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (avatarPath) {
    await admin.storage.from(APPLICANT_DOCUMENTS_BUCKET).remove([avatarPath]);
  }

  return NextResponse.json({ documents: nextDocuments });
}
