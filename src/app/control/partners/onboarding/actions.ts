"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/auth/require-admin";

const PARTNER_ASSETS_BUCKET = process.env.PARTNER_ASSETS_BUCKET?.trim() || "partner-assets";
const AVATAR_LIMIT_BYTES = 2 * 1024 * 1024;
const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type CreatePartnerState = {
  ok: boolean;
  message: string;
};

function stringField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function sanitizeFileName(name: string) {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
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

async function ensurePartnerAssetsBucket(admin: ReturnType<typeof createServiceRoleClient>) {
  const options = {
    public: false,
    fileSizeLimit: AVATAR_LIMIT_BYTES,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  };
  const { error } = await admin.storage.createBucket(PARTNER_ASSETS_BUCKET, options);
  if (!error) return;
  const msg = error.message.toLowerCase();
  if (msg.includes("already") || msg.includes("exists")) {
    await admin.storage.updateBucket(PARTNER_ASSETS_BUCKET, options);
    return;
  }
  throw error;
}

export async function createPartnerAccount(
  _prevState: CreatePartnerState,
  formData: FormData,
): Promise<CreatePartnerState> {
  await requireAdmin("/control/partners/onboarding");

  const email = stringField(formData, "email").toLowerCase();
  const password = stringField(formData, "password");
  const organisationLegalName = stringField(formData, "organisationLegalName");
  const tradingName = stringField(formData, "tradingName");
  const facilityType = stringField(formData, "facilityType");
  const abnAcn = stringField(formData, "abnAcn");
  const primaryContactName = stringField(formData, "primaryContactName");
  const primaryContactRole = stringField(formData, "primaryContactRole");
  const contactPhone = stringField(formData, "contactPhone");
  const physicalAddress = stringField(formData, "physicalAddress");
  const website = stringField(formData, "website");
  const departments = stringField(formData, "departments");
  const adminNotes = stringField(formData, "adminNotes");

  if (!organisationLegalName || !email || !password || !primaryContactName) {
    return {
      ok: false,
      message: "Organisation legal name, primary contact, email, and temporary password are required.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Enter a valid partner login email." };
  }

  if (!passwordIsStrong(password)) {
    return {
      ok: false,
      message:
        "Temporary password must be at least 12 characters and include uppercase, lowercase, number, and special character.",
    };
  }

  const admin = createServiceRoleClient();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "partner",
      organization_name: tradingName || organisationLegalName,
      organisation_legal_name: organisationLegalName,
      primary_contact_name: primaryContactName,
      source: "admin_partner_onboarding",
    },
  });

  if (created.error || !created.data.user) {
    return {
      ok: false,
      message: created.error?.message ?? "Could not create partner login account.",
    };
  }

  const userId = created.data.user.id;
  let avatar: Record<string, unknown> = {};
  const avatarFile = formData.get("avatar");

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.size > AVATAR_LIMIT_BYTES) {
      return { ok: false, message: "Partner avatar must be 2 MB or smaller." };
    }
    if (!allowedAvatarTypes.has(avatarFile.type)) {
      return { ok: false, message: "Partner avatar must be JPG, PNG, or WebP." };
    }

    await ensurePartnerAssetsBucket(admin);
    const safeName = sanitizeFileName(avatarFile.name || "partner-avatar");
    const path = `partners/${userId}/avatar-${Date.now()}-${safeName}`;
    const bytes = new Uint8Array(await avatarFile.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(PARTNER_ASSETS_BUCKET)
      .upload(path, bytes, {
        contentType: avatarFile.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, message: uploadError.message };
    }

    avatar = {
      name: avatarFile.name,
      path,
      size: avatarFile.size,
      type: avatarFile.type || null,
      bucket: PARTNER_ASSETS_BUCKET,
      uploadedAt: new Date().toISOString(),
    };
  }

  const profile = await admin.from("partner_profiles").upsert({
    user_id: userId,
    email,
    organisation_legal_name: organisationLegalName,
    trading_name: tradingName || null,
    facility_type: facilityType || null,
    abn_acn: abnAcn || null,
    primary_contact_name: primaryContactName,
    primary_contact_role: primaryContactRole || null,
    contact_phone: contactPhone || null,
    physical_address: physicalAddress || null,
    website: website || null,
    departments: departments || null,
    admin_notes: adminNotes || null,
    avatar,
    status: "active",
    updated_at: new Date().toISOString(),
  });

  if (profile.error) {
    await admin.auth.admin.deleteUser(userId).catch(() => null);
    return {
      ok: false,
      message:
        profile.error.message.includes("partner_profiles") ||
        profile.error.message.toLowerCase().includes("schema cache")
          ? "Partner login was not created because the partner profile table is missing. Run sql/partner_portal.sql in Supabase first."
          : profile.error.message,
    };
  }

  revalidatePath("/control/partners");
  revalidatePath("/control/partners/onboarding");

  return {
    ok: true,
    message: `Partner account created for ${email}. Share the login email and temporary password securely with the partner.`,
  };
}
