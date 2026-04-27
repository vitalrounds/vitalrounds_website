const SALES_BROCHURES_BUCKET = process.env.SALES_BROCHURES_BUCKET?.trim() || "sales-brochures";
const SALES_BROCHURES_PREFIX = "sales-brochures";

export type SalesBrochureItem = {
  name: string;
  path: string;
  size: number;
  updatedAt: string | null;
};

export function getSalesBrochuresBucket() {
  return SALES_BROCHURES_BUCKET;
}

export function getSalesBrochuresPrefix() {
  return SALES_BROCHURES_PREFIX;
}

export function isSalesBrochurePath(path: string) {
  return path.startsWith(`${SALES_BROCHURES_PREFIX}/`);
}

export function sanitizeBrochureName(name: string) {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!normalized) return "brochure.pdf";
  return normalized.endsWith(".pdf") ? normalized : `${normalized}.pdf`;
}

export async function ensureSalesBrochuresBucket(admin: any) {
  const { error } = await admin.storage.createBucket(SALES_BROCHURES_BUCKET, {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"],
  });

  if (!error) return;
  const msg = error.message?.toLowerCase() ?? "";
  if (msg.includes("already") || msg.includes("exists")) return;
  throw new Error(error.message || "Could not create sales brochure bucket.");
}

export async function listSalesBrochures(admin: any) {
  await ensureSalesBrochuresBucket(admin);

  const { data, error } = await admin.storage.from(SALES_BROCHURES_BUCKET).list(SALES_BROCHURES_PREFIX, {
    limit: 500,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) {
    throw new Error(error.message || "Could not list brochures.");
  }

  return (data ?? [])
    .filter((entry: { name?: string }) => String(entry.name ?? "").toLowerCase().endsWith(".pdf"))
    .map(
      (entry: { name: string; updated_at?: string | null; metadata?: { size?: number } | null }): SalesBrochureItem => ({
        name: entry.name,
        path: `${SALES_BROCHURES_PREFIX}/${entry.name}`,
        size: Number(entry.metadata?.size ?? 0),
        updatedAt: entry.updated_at ?? null,
      }),
    );
}
