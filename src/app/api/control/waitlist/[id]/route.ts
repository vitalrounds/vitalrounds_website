import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getRoleFromUser,
  isEmailAllowedAdmin,
} from "@/lib/auth/redirect-after-login";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const WAITLIST_BUCKET = process.env.WAITLIST_STORAGE_BUCKET ?? "waitlist-documents";

type StoredFile = {
  path?: string;
  bucket?: string;
};

async function requireAdminForApi() {
  const auth = await createServerSupabaseClient();
  await auth.auth.getSession();
  const {
    data: { user: verifiedUser },
  } = await auth.auth.getUser();
  const {
    data: { session },
  } = await auth.auth.getSession();
  const user = verifiedUser ?? session?.user ?? null;
  if (!user) return { ok: false as const, status: 401 };
  const role = getRoleFromUser(user);
  if (role !== "admin" || !isEmailAllowedAdmin(user.email ?? undefined)) {
    return { ok: false as const, status: 403 };
  }
  return { ok: true as const };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminForApi();
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
