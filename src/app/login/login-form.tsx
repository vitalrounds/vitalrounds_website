"use client";

import Image from "next/image";
import Link from "next/link";
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
  const [forgotMode, setForgotMode] = useState(false);

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
    if (forgotMode) {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const body = await res.json().catch(() => ({}));
        setMessage(
          res.ok
            ? "If an account exists for this email, a reset link has been sent."
            : body.error ?? "Could not send reset link.",
        );
      } catch {
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }
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
          "Your account has no role set. Ask VitalRounds to assign applicant, partner, or admin access."
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
          ((role === "provider" || role === "partner") && nextPath.startsWith("/provider")) ||
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-5 rounded-3xl border border-[#a6ccac] bg-white p-8 shadow-sm"
    >
      <div>
        <Image
          src="/logo.png"
          alt="VitalRounds"
          width={210}
          height={48}
          priority
          className="mx-auto mb-6 h-auto w-[170px]"
        />
        <h1 className="text-2xl font-semibold text-[#2c3d2f]">
          {forgotMode ? "Reset password" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm text-[#6e706e]">
          {forgotMode
            ? "Enter your email and we will send a secure password reset link."
            : "Access your secure VitalRounds workspace with your registered email and password."}
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

      {!forgotMode ? (
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
      ) : null}

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
        {loading ? (forgotMode ? "Sending..." : "Signing in...") : forgotMode ? "Send reset link" : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => {
          setForgotMode((current) => !current);
          setMessage(null);
        }}
        className="w-full text-center text-sm font-semibold text-[#354a38] underline-offset-4 hover:underline"
      >
        {forgotMode ? "Back to sign in" : "Forgot your password?"}
      </button>
      <div className="rounded-2xl border border-[#dfece0] bg-[#f5fbf6] px-4 py-3 text-center text-sm text-[#5f7362]">
        New applicant?{" "}
        <Link href="/signup" className="font-semibold text-[#354a38] underline-offset-4 hover:underline">
          Create an applicant account
        </Link>
      </div>
    </form>
  );
}
