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
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-16 text-foreground">
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Studio</p>
        <h1 className="text-3xl font-display font-medium">Sign in</h1>
        <p className="text-muted-foreground">
          We send a secure login link to your email. No password required.
        </p>
      </div>
      <form onSubmit={handleSignIn} className="space-y-4 rounded bg-card p-6 border border-border/60">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-border/60 bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground/60 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Sending link…" : "Send magic link"}
        </button>
        {message && <p className="text-sm text-success">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Configure Supabase env vars to enable sign-in for this page.
        </p>
      </form>
    </main>
  );
}
