import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getRoleFromUser,
  isEmailAllowedAdmin,
} from "@/lib/auth/redirect-after-login";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const WAITLIST_BUCKET = process.env.WAITLIST_STORAGE_BUCKET ?? "waitlist-documents";

function contentDisposition(filename: string) {
  const fallback = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

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

export async function GET(req: Request) {
  const adminCheck = await requireAdminForApi();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const name = searchParams.get("name") ?? "document";

  if (!path || !path.startsWith("waitlist/")) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin.storage.from(WAITLIST_BUCKET).download(path);
  if (error || !data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new Response(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Disposition": contentDisposition(name),
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
