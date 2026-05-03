"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteWaitlistSubmission } from "./actions";

type Row = {
  id: string;
  created_at: string;
  applicant_email: string | null;
  payload: Record<string, unknown> | null;
};

export default function WaitlistList({ initialRows }: { initialRows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = rows.length;
  const deleting = useMemo(() => deletingId !== null, [deletingId]);

  async function onDelete(row: Row) {
    const details = (row.payload?.details ?? {}) as Record<string, unknown>;
    const name =
      typeof details.fullLegalName === "string" && details.fullLegalName.trim()
        ? details.fullLegalName.trim()
        : row.applicant_email ?? "this application";
    const confirmed = window.confirm(
      `Delete ${name}'s wait list application permanently?\n\nThis will remove the submission from the database and delete attached files. This action cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingId(row.id);
    try {
      const result = await deleteWaitlistSubmission(row.id);
      if (!result.ok) {
        throw new Error(result.error);
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete application.");
    } finally {
      setDeletingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[#a6ccac]">
        No submissions yet. After the database table exists and the service role key is set, new
        submissions will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-4">
        <p className="text-xs uppercase tracking-wider text-[#a6ccac]">Total submissions</p>
        <p className="mt-2 text-2xl font-semibold text-white">{total}</p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-700/50 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#354a38] bg-[#2c3d2f]">
        <div className="hidden grid-cols-12 border-b border-[#354a38] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#a6ccac] md:grid">
          <div className="col-span-4">Applicant</div>
          <div className="col-span-4">Current city</div>
          <div className="col-span-3">Applied</div>
          <div className="col-span-1 text-right">Delete</div>
        </div>
        {rows.map((row) => {
          const details = (row.payload?.details ?? {}) as Record<string, unknown>;
          const name = stringOrDash(details.fullLegalName);
          const city = stringOrDash(details.cityCountry);
          const isDeleting = deletingId === row.id;
          return (
            <div
              key={row.id}
              className="space-y-3 border-b border-[#354a38]/70 px-4 py-4 text-sm text-[#cbecd0] last:border-b-0 md:grid md:grid-cols-12 md:items-center md:gap-2 md:space-y-0 md:py-3"
            >
              <Link
                href={`/control/waitlist/${row.id}`}
                className="block rounded-lg px-2 py-2 transition hover:bg-[var(--control-hover)] md:col-span-11 md:-mx-2 md:grid md:grid-cols-11 md:items-center md:py-1"
              >
                <div className="min-w-0 md:col-span-4">
                  <p className="truncate font-medium text-white">{name}</p>
                  <p className="truncate text-xs text-[#a6ccac]">{row.applicant_email ?? "No email"}</p>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-[#a6ccac] sm:grid-cols-2 md:mt-0 md:contents">
                  <div className="truncate md:col-span-4 md:text-sm md:text-[#cbecd0]">
                    <span className="font-semibold uppercase tracking-wider md:hidden">City: </span>
                    {city}
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-semibold uppercase tracking-wider md:hidden">Applied: </span>
                    {new Date(row.created_at).toLocaleDateString("en-AU", {
                      dateStyle: "medium",
                    })}
                  </div>
                </div>
              </Link>
              <div className="flex justify-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  disabled={isDeleting || deleting}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7c2d2d] text-sm font-semibold text-red-200 transition hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Delete application"
                  title="Delete application"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function stringOrDash(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  return "—";
}
