"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const WAITLIST_BUCKET = process.env.WAITLIST_STORAGE_BUCKET ?? "waitlist-documents";

type StoredFile = {
  path?: string;
  bucket?: string;
};

export async function deleteWaitlistSubmission(id: string) {
  await requireAdmin("/control/waitlist");

  if (!id) {
    return { ok: false as const, error: "Missing application id." };
  }

  const admin = createServiceRoleClient();
  const { data: row, error: loadError } = await admin
    .from("waitlist_submissions")
    .select("id, files")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return { ok: false as const, error: "Could not load application." };
  }
  if (!row) {
    return { ok: false as const, error: "Application not found." };
  }

  const files = row.files as Record<string, StoredFile> | null;
  const groupedPaths = new Map<string, string[]>();
  if (files && typeof files === "object") {
    Object.values(files).forEach((file) => {
      if (!file?.path) return;
      const bucket = file.bucket || WAITLIST_BUCKET;
      const paths = groupedPaths.get(bucket) ?? [];
      paths.push(file.path);
      groupedPaths.set(bucket, paths);
    });
  }

  for (const [bucket, paths] of groupedPaths.entries()) {
    const { error } = await admin.storage.from(bucket).remove(paths);
    if (error) {
      return {
        ok: false as const,
        error: "Could not delete attached files; application was not removed.",
      };
    }
  }

  const { error: deleteError } = await admin
    .from("waitlist_submissions")
    .delete()
    .eq("id", id);
  if (deleteError) {
    return { ok: false as const, error: "Could not delete application." };
  }

  revalidatePath("/control/waitlist");
  return { ok: true as const };
}
