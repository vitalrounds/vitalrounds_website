"use client";

import Link from "next/link";
import { useState } from "react";
import { sendWaitlistInviteEmails } from "./actions";

export default function InviteForm() {
  const [emails, setEmails] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateEmail(index: number, value: string) {
    setEmails((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addRow() {
    setEmails((prev) => [...prev, ""]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const result = await sendWaitlistInviteEmails({ emails });
      if (!result.ok && "error" in result) {
        setError(result.error ?? "Could not send invitations.");
        return;
      }
      const failed = result.failed ?? [];
      if (failed.length > 0) {
        setError(`Some invites failed: ${failed.join(", ")}`);
      }
      setMessage(`Invitations sent: ${result.sent}`);
      setEmails([""]);
    } catch {
      setError("Could not send invitations right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-5">
      <p className="text-sm text-[#a6ccac]">
        Add one or more emails below. A branded invitation email with a wait list link will be sent.
      </p>

      <div className="space-y-3">
        {emails.map((value, idx) => (
          <input
            key={idx}
            type="email"
            value={value}
            onChange={(e) => updateEmail(idx, e.target.value)}
            placeholder="name@example.com"
            className="w-full rounded-xl border border-[#5f7362] bg-[#1f2d24] px-3 py-2 text-sm text-[#cbecd0] outline-none focus:border-[#a6ccac]"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#5f7362] text-lg text-[#cbecd0] hover:bg-[#354a38]"
        aria-label="Add another email field"
        title="Add another email"
      >
        +
      </button>

      {message && (
        <p className="rounded-xl border border-emerald-700/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-700/50 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#759d7b] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7362] disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Submit"}
        </button>
        <Link
          href="/control/waitlist"
          className="rounded-full border border-[#5f7362] px-5 py-2 text-sm font-semibold text-[#cbecd0] hover:bg-[#354a38]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
