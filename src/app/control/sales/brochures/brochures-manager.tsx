"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSalesBrochureShareLink,
  deleteSalesBrochure,
  uploadSalesBrochure,
} from "./actions";

type BrochureRow = {
  name: string;
  path: string;
  size: number;
  updatedAt: string | null;
};

type ShareLinkState = {
  url: string;
  expiresAt: string;
};

const SHARE_DURATIONS = [
  { label: "24 hours", seconds: 24 * 60 * 60 },
  { label: "7 days", seconds: 7 * 24 * 60 * 60 },
  { label: "30 days", seconds: 30 * 24 * 60 * 60 },
] as const;

export default function BrochuresManager({ initialRows }: { initialRows: BrochureRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shareDuration, setShareDuration] = useState<number>(SHARE_DURATIONS[1].seconds);
  const [shareLinks, setShareLinks] = useState<Record<string, ShareLinkState>>({});

  const rows = useMemo(
    () =>
      [...initialRows].sort((a, b) => {
        const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
        const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
        return bTime - aTime;
      }),
    [initialRows],
  );

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    setSuccessMessage(null);
    setIsUploading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const result = await uploadSalesBrochure(formData);
      if (!result.ok) {
        setUploadError(result.error ?? "Could not upload brochure.");
        return;
      }

      form.reset();
      setSuccessMessage("Brochure uploaded successfully.");
      router.refresh();
    } catch {
      setUploadError("Could not upload brochure right now.");
    } finally {
      setIsUploading(false);
    }
  }

  function onDelete(path: string, name: string) {
    const confirmed = window.confirm(`Delete "${name}"? This will permanently remove the PDF.`);
    if (!confirmed) return;

    setUploadError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await deleteSalesBrochure(path);
      if (!result.ok) {
        setUploadError(result.error ?? "Could not delete brochure.");
        return;
      }
      setShareLinks((prev) => {
        const next = { ...prev };
        delete next[path];
        return next;
      });
      setSuccessMessage("Brochure deleted.");
      router.refresh();
    });
  }

  function onCreateLink(path: string, autoOpen = false) {
    setUploadError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await createSalesBrochureShareLink({ path, ttlSeconds: shareDuration });
      if (!result.ok) {
        setUploadError(result.error ?? "Could not generate share link.");
        return;
      }

      setShareLinks((prev) => ({
        ...prev,
        [path]: { url: result.url, expiresAt: result.expiresAt },
      }));

      if (autoOpen) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        return;
      }

      try {
        await navigator.clipboard.writeText(result.url);
        setSuccessMessage("Secure link copied to clipboard.");
      } catch {
        setSuccessMessage("Secure link generated. Copy it from the row below.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Upload brochure PDF</h2>
            <p className="mt-1 text-sm text-[#a6ccac]">
              Files stay private and are shared only through secure expiring links.
            </p>
          </div>
          <div className="min-w-56">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#a6ccac]">
              Share link expiry
            </label>
            <select
              value={shareDuration}
              onChange={(e) => setShareDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-[#5f7362] bg-[#1f2d24] px-3 py-2 text-sm text-[#cbecd0] outline-none focus:border-[#a6ccac]"
            >
              {SHARE_DURATIONS.map((item) => (
                <option key={item.seconds} value={item.seconds}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            required
            type="file"
            name="brochure"
            accept="application/pdf,.pdf"
            className="max-w-full cursor-pointer rounded-lg border border-[#5f7362] bg-[#1f2d24] px-3 py-2 text-sm text-[#cbecd0] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#759d7b] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-[#5f7362]"
          />
          <button
            type="submit"
            disabled={isUploading || isPending}
            className="rounded-full bg-[#759d7b] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7362] disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
      </form>

      {successMessage && (
        <p className="rounded-xl border border-emerald-700/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </p>
      )}
      {uploadError && (
        <p className="rounded-xl border border-red-700/50 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {uploadError}
        </p>
      )}

      <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f]">
        <div className="border-b border-[#354a38] px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Saved brochures</h2>
          <p className="mt-1 text-sm text-[#a6ccac]">
            Open a brochure, generate a share link, or delete files you no longer need.
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-5 text-sm text-[#a6ccac]">No brochures uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#354a38] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#7a9b80]">
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#354a38]">
                {rows.map((row) => {
                  const share = shareLinks[row.path];
                  return (
                    <tr key={row.path} className="align-top">
                      <td className="px-5 py-4 text-[#cbecd0]">
                        <p className="font-medium">{stripFilePrefix(row.name)}</p>
                        <p className="mt-1 text-xs text-[#7a9b80] break-all">{row.path}</p>
                        {share && (
                          <div className="mt-2 rounded-lg border border-[#4a6250] bg-[#1f2d24] p-2">
                            <p className="mb-1 text-xs font-semibold text-[#a6ccac]">
                              Secure link expires {formatDateTime(share.expiresAt)}
                            </p>
                            <p className="break-all text-xs text-[#cbecd0]">{share.url}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#a6ccac]">{formatDateTime(row.updatedAt)}</td>
                      <td className="px-5 py-4 text-[#a6ccac]">{formatBytes(row.size)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onCreateLink(row.path, true)}
                            disabled={isPending}
                            className="rounded-full border border-[#5f7362] px-3 py-1.5 text-xs font-semibold text-[#cbecd0] hover:bg-[#354a38] disabled:opacity-60"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => onCreateLink(row.path, false)}
                            disabled={isPending}
                            className="rounded-full border border-[#5f7362] px-3 py-1.5 text-xs font-semibold text-[#cbecd0] hover:bg-[#354a38] disabled:opacity-60"
                          >
                            Copy secure link
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(row.path, row.name)}
                            disabled={isPending}
                            className="rounded-full border border-red-700/70 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-900/30 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  }).format(date);
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function stripFilePrefix(fileName: string) {
  return fileName.replace(/^[0-9a-f-]{36}-/i, "");
}
