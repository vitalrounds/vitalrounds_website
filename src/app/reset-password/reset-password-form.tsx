"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(
    () => ({
      length: password.length >= 12,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );
  const strong = Object.values(checks).every(Boolean);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!strong) {
      setError("Choose a stronger password before continuing.");
      return;
    }
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await fetch("/api/auth/password-changed-email", { method: "POST" }).catch(() => null);
    setPassword("");
    setMessage("Password changed successfully. You can now continue to your dashboard.");
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md space-y-5 rounded-3xl border border-[#c8ddcb] bg-white p-8 shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold text-[#2c3d2f]">Create a new password</h1>
        <p className="mt-2 text-sm leading-6 text-[#5f7362]">
          Your new password must be at least 12 characters with uppercase, lowercase, number, and special character.
        </p>
      </div>
      <label className="block text-sm font-medium text-[#354a38]">
        New password
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[#cbecd0] px-3 py-2 text-[#2c3d2f] outline-none focus:border-[#759d7b]"
        />
      </label>
      <ul className="grid gap-1 rounded-2xl border border-[#dfece0] bg-[#f5fbf6] p-4 text-sm text-[#5f7362] sm:grid-cols-2">
        <Check ok={checks.length} text="At least 12 characters" />
        <Check ok={checks.upper} text="Uppercase letter" />
        <Check ok={checks.lower} text="Lowercase letter" />
        <Check ok={checks.number} text="Number" />
        <Check ok={checks.special} text="Special character" />
      </ul>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-[#354a38]">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#759d7b] py-3 text-sm font-semibold text-white transition hover:bg-[#5f7362] disabled:opacity-60"
      >
        {loading ? "Changing..." : "Change password"}
      </button>
      <Link href="/dashboard" className="block text-center text-sm font-semibold text-[#354a38] underline-offset-4 hover:underline">
        Go to dashboard
      </Link>
    </form>
  );
}

function Check({ ok, text }: { ok: boolean; text: string }) {
  return <li className={ok ? "text-[#4f7e57]" : ""}>{ok ? "OK" : "-"} {text}</li>;
}
