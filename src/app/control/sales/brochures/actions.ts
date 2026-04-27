"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  ensureSalesBrochuresBucket,
  getSalesBrochuresBucket,
  getSalesBrochuresPrefix,
  isSalesBrochurePath,
  sanitizeBrochureName,
} from "@/lib/sales-brochures";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

function hasPdfMimeOrExtension(file: File) {
  const mime = file.type.toLowerCase();
  const byMime = mime === "application/pdf";
  const byExt = file.name.toLowerCase().endsWith(".pdf");
  return byMime || byExt;
}

export async function uploadSalesBrochure(formData: FormData) {
  await requireAdmin("/control/sales/brochures");

  const file = formData.get("brochure");
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false as const, error: "Please choose a PDF brochure to upload." };
  }

  if (!hasPdfMimeOrExtension(file)) {
    return { ok: false as const, error: "Only PDF files are supported." };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return { ok: false as const, error: "File is too large. Maximum size is 20 MB." };
  }

  const admin = createServiceRoleClient();
  await ensureSalesBrochuresBucket(admin);

  const safeName = sanitizeBrochureName(file.name);
  const path = `${getSalesBrochuresPrefix()}/${crypto.randomUUID()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await admin.storage.from(getSalesBrochuresBucket()).upload(path, bytes, {
    contentType: "application/pdf",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return { ok: false as const, error: error.message || "Upload failed." };
  }

  revalidatePath("/control/sales/brochures");
  return { ok: true as const };
}

export async function deleteSalesBrochure(path: string) {
  await requireAdmin("/control/sales/brochures");

  const cleanedPath = String(path ?? "").trim();
  if (!cleanedPath || !isSalesBrochurePath(cleanedPath)) {
    return { ok: false as const, error: "Invalid brochure path." };
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.storage.from(getSalesBrochuresBucket()).remove([cleanedPath]);
  if (error) {
    return { ok: false as const, error: error.message || "Could not delete brochure." };
  }

  revalidatePath("/control/sales/brochures");
  return { ok: true as const };
}

export async function createSalesBrochureShareLink(input: { path: string; ttlSeconds?: number }) {
  await requireAdmin("/control/sales/brochures");

  const path = String(input.path ?? "").trim();
  if (!path || !isSalesBrochurePath(path)) {
    return { ok: false as const, error: "Invalid brochure path." };
  }

  const ttlSeconds = Math.min(Math.max(Number(input.ttlSeconds ?? 604800), 900), 60 * 24 * 60 * 60);

  const admin = createServiceRoleClient();
  const { data, error } = await admin.storage.from(getSalesBrochuresBucket()).createSignedUrl(path, ttlSeconds, {
    download: false,
  });

  if (error || !data?.signedUrl) {
    return { ok: false as const, error: error?.message || "Could not generate secure link." };
  }

  return {
    ok: true as const,
    url: data.signedUrl,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  };
}
