"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabase/browserClient";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        setMessage("Check your email for a magic link to sign in.");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to start sign-in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Auth</p>
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="text-slate-700">
          Magic link via Supabase Auth. Configure your Supabase URL and anon key in environment
          variables to enable this form.
        </p>
      </div>
      <form onSubmit={handleSignIn} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Sending link…" : "Send magic link"}
        </button>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <p className="text-xs text-slate-500">
          Next step: add Supabase env vars, then replace this stub with your full workspace onboarding.
        </p>
      </form>
    </main>
  );
}

