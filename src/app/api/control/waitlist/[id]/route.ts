import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth/require-admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const WAITLIST_BUCKET = process.env.WAITLIST_STORAGE_BUCKET ?? "waitlist-documents";

type StoredFile = {
  path?: string;
  bucket?: string;
};

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminForApi(req);
  if (!adminCheck.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: adminCheck.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing application id" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data: row, error: loadError } = await admin
    .from("waitlist_submissions")
    .select("id, files")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: "Could not load application" }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "Could not delete attached files; application was not removed." },
        { status: 500 }
      );
    }
  }

  const { error: deleteError } = await admin
    .from("waitlist_submissions")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: "Could not delete application" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
