"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  getPostLoginPath,
  getRoleFromUser,
  isEmailAllowedAdmin,
} from "@/lib/auth/redirect-after-login";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type LoginFormProps = {
  controlOrigin: string | undefined;
};

export default function LoginForm({ controlOrigin }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errorParam = searchParams.get("error");
  const errorHint = useMemo(() => {
    if (errorParam === "admin_only")
      return "This area is for VitalRounds administrators only.";
    if (errorParam === "wrong_role")
      return "That account cannot open this portal. Use the correct login link.";
    if (errorParam === "auth") return "Sign-in failed. Try again.";
    return null;
  }, [errorParam]);

  const nextPath = searchParams.get("next") ?? undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      const user = data.user;
      const role = getRoleFromUser(user);
      if (!role) {
        setMessage(
          "Your account has no role set. Ask VitalRounds to assign customer, provider, or admin in Supabase user metadata."
        );
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      if (role === "admin" && !isEmailAllowedAdmin(user.email ?? undefined)) {
        setMessage("This admin email is not authorized for access.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const safeNext =
        nextPath &&
        ((role === "customer" && nextPath.startsWith("/customer")) ||
          (role === "provider" && nextPath.startsWith("/provider")) ||
          (role === "admin" && nextPath.startsWith("/control")));

      if (safeNext) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      const path = getPostLoginPath(role, { controlOrigin });

      if (path.startsWith("http")) {
        window.location.href = path;
      } else {
        router.push(path);
        router.refresh();
      }
    } catch {
      setMessage("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-5 rounded-3xl border border-[#a6ccac] bg-white p-8 shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold text-[#2c3d2f]">Sign in</h1>
        <p className="mt-2 text-sm text-[#6e706e]">
          IMGs and hospitals use the same login. You will be sent to the right
          workspace automatically.
        </p>
      </div>

      {errorHint ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {errorHint}
        </p>
      ) : null}

      <label className="block text-sm font-medium text-[#354a38]">
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#cbecd0] px-3 py-2 text-[#2c3d2f] outline-none focus:border-[#759d7b]"
        />
      </label>

      <label className="block text-sm font-medium text-[#354a38]">
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#cbecd0] px-3 py-2 text-[#2c3d2f] outline-none focus:border-[#759d7b]"
        />
      </label>

      {message ? (
        <p className="text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#759d7b] py-3 text-sm font-semibold text-white transition hover:bg-[#5f7362] disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
