const SALES_BROCHURES_BUCKET = process.env.SALES_BROCHURES_BUCKET?.trim() || "sales-brochures";
const SALES_BROCHURES_PREFIX = "sales-brochures";

export type SalesBrochureItem = {
  name: string;
  path: string;
  size: number;
  updatedAt: string | null;
};

type StorageError = {
  message?: string;
};

type StorageListEntry = {
  name?: string;
  updated_at?: string | null;
  metadata?: { size?: number } | null;
};

type SalesBrochuresAdmin = {
  storage: {
    createBucket: (
      id: string,
      options: {
        public: boolean;
        fileSizeLimit: number;
        allowedMimeTypes: string[];
      },
    ) => Promise<{ error: StorageError | null }>;
    from: (id: string) => {
      list: (
        path: string,
        options: {
          limit: number;
          sortBy: { column: string; order: "asc" | "desc" };
        },
      ) => Promise<{ data: StorageListEntry[] | null; error: StorageError | null }>;
    };
  };
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

export async function ensureSalesBrochuresBucket(admin: SalesBrochuresAdmin) {
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

export async function listSalesBrochures(admin: SalesBrochuresAdmin) {
  await ensureSalesBrochuresBucket(admin);

  const { data, error } = await admin.storage.from(SALES_BROCHURES_BUCKET).list(SALES_BROCHURES_PREFIX, {
    limit: 500,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) {
    throw new Error(error.message || "Could not list brochures.");
  }

  return (data ?? [])
    .filter((entry) => String(entry.name ?? "").toLowerCase().endsWith(".pdf"))
    .map(
      (entry): SalesBrochureItem => {
        const name = entry.name ?? "brochure.pdf";
        return {
          name,
          path: `${SALES_BROCHURES_PREFIX}/${name}`,
          size: Number(entry.metadata?.size ?? 0),
          updatedAt: entry.updated_at ?? null,
        };
      },
    );
}
