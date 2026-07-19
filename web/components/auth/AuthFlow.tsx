"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CircleNotch, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { cn } from "@/lib/utils";
import { getAuthCopy, type AuthContext } from "@/lib/auth/content";

type AuthStep = "email" | "code" | "link" | "name";

interface AuthFlowProps {
  variant?: "page" | "modal";
  context?: AuthContext;
  onSuccess?: () => void;
  onClose?: () => void;
  redirectTo?: string;
  isOpen?: boolean;
  initialError?: string | null;
}

export function AuthFlow({
  variant = "page",
  context = "default",
  onSuccess,
  onClose,
  redirectTo,
  isOpen = true,
  initialError = null
}: AuthFlowProps) {
  const { push, refresh } = useRouter();
  const copy = getAuthCopy(context);

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showMagicLinkFallback, setShowMagicLinkFallback] = useState(false);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const resetFlow = useCallback(() => {
    setStep("email");
    setEmail("");
    setCode("");
    setFirstName("");
    setLoading(false);
    setError(null);
    setResendCooldown(0);
    setShowMagicLinkFallback(false);
    isVerifyingRef.current = false;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetFlow();
    }
  }, [isOpen, resetFlow]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendCode = useCallback(async (mode: "otp" | "magic_link" = "otp") => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError(null);
    setShowMagicLinkFallback(false);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), mode, next: redirectTo || "/workspace" })
      });
      const data = await res.json();
      if (!data?.ok) {
        if (data?.errorCode === "otp_disabled") {
          setShowMagicLinkFallback(true);
          throw new Error(data?.hint || "Email codes are disabled for this project.");
        }
        throw new Error(data?.message || data?.hint || "Failed to send code");
      }
      setStep(mode === "magic_link" ? "link" : "code");
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }, [email, redirectTo]);

  const finishAuth = useCallback(() => {
    onSuccess?.();
    if (variant === "page") {
      refresh();
      push(redirectTo || "/workspace");
    } else {
      onClose?.();
    }
  }, [onClose, onSuccess, redirectTo, push, refresh, variant]);

  const verifyCode = useCallback(async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });
      const data = await res.json();
      if (!data?.ok) {
        throw new Error(data?.message || "Invalid code");
      }
      if (data.user?.firstName) {
        finishAuth();
      } else {
        setStep("name");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid code. Please try again.");
      isVerifyingRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [code, email, finishAuth, loading]);

  useEffect(() => {
    if (step === "code" && code.length === 8 && !loading && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      verifyCode();
    }
  }, [code, step, loading, verifyCode]);

  const handleSaveName = useCallback(async () => {
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: { first_name: firstName.trim() }
      });
      if (updateError) {
        throw new Error(updateError.message);
      }
      finishAuth();
    } catch (err: any) {
      setError(err?.message || "Could not save your name. Try again.");
    } finally {
      setLoading(false);
    }
  }, [finishAuth, firstName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === "email") void handleSendCode("otp");
    if (step === "code") void verifyCode();
    if (step === "name") void handleSaveName();
  };

  const stepTitle = useMemo(() => {
    if (step === "email") return copy.headline;
    if (step === "code") return "Check your inbox";
    if (step === "link") return "Check your inbox";
    return "One last thing";
  }, [copy.headline, step]);

  const stepSubtitle = useMemo(() => {
    if (step === "email") return copy.subtext;
    if (step === "code") {
      return (
        <span>
          We sent an 8-digit code to{" "}
          <span className="text-foreground font-medium">{email || "your email"}</span>
        </span>
      );
    }
    if (step === "link") {
      return (
        <span>
          We sent a sign-in link to{" "}
          <span className="text-foreground font-medium">{email || "your email"}</span>
        </span>
      );
    }
    return "What should we call you?";
  }, [copy.subtext, email, step]);

  const outerClass = variant === "page"
    ? "min-h-screen bg-paper px-4 pb-16 pt-24 text-foreground selection:bg-brand/15 sm:px-5 sm:pt-28 md:px-8 md:pb-20 md:pt-36"
    : "";

  const panelClass = cn(
    "gap-y-5",
    variant === "page" && "border border-line bg-background p-5 sm:p-6 md:p-8"
  );

  return (
    <div
      data-visual-anchor={variant === "page" ? "auth-page" : undefined}
      className={outerClass}
    >
      <div
        className={cn(
          "w-full gap-y-6",
          variant === "page" && "mx-auto grid max-w-[70rem] gap-8 sm:gap-12 lg:grid-cols-[minmax(0,0.9fr)_30rem] lg:items-start lg:gap-16",
          variant === "modal" && "max-w-none"
        )}
      >
        {variant === "page" ? (
          <div className="gap-y-10 pt-2 lg:pt-6">
            <div className="gap-y-4">
              <div className="text-xs font-semibold uppercase riyp-track-010 text-brand">Secure sign-in</div>
              <h1
                className="max-w-[31rem] text-balance font-display text-[clamp(2.7rem,11vw,4.8rem)] riyp-weight-520 leading-[0.96] tracking-[-0.04em] text-foreground riyp-stretch-90"
              >
                {stepTitle}
              </h1>
              <div className="max-w-[32rem] text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {stepSubtitle}
              </div>
            </div>

            <div className="hidden max-w-[36rem] gap-y-5 border-t border-line pt-6 md:grid">
              {step === "email" ? (
                <>
                  <p className="text-[1.02rem] leading-8 text-foreground/85">
                    Sign in is for report history and role context you choose to keep. Anonymous reports stay separate unless you choose otherwise.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Reports", value: "Keep versions in one place." },
                      { label: "Privacy", value: "Anonymous work stays separate." },
                      { label: "Role context", value: "Keep the jobs that matter with the report." },
                    ].map((item) => (
                      <div key={item.label} className="border-t border-line pt-3">
                        <p className="text-xs font-semibold uppercase riyp-track-008 text-brand">{item.label}</p>
                        <p className="mt-2 text-base leading-6 text-muted-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="max-w-[28rem] border-t border-line pt-4">
                  <p className="text-base leading-7 text-muted-foreground">
                    One quick step and you&apos;re back in. We keep the flow short on purpose.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center gap-y-2">
            <h1 className="font-display font-medium text-2xl text-foreground tracking-tight">
              {stepTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{stepSubtitle}</p>
            {step === "email" ? (
              <div className="mx-auto max-w-sm rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-left text-xs leading-5 text-muted-foreground">
                Sign-in is only for report history and role context you choose to keep. Anonymous reports are not silently attached to an account.
              </div>
            ) : null}
          </div>
        )}

        <div className={cn(variant === "page" ? "gap-y-5" : "max-w-md gap-y-5", variant === "modal" && "max-w-none")}>
          {variant === "page" ? (
            <div>
              <div className="text-xs font-semibold uppercase riyp-track-008 text-brand">
                {step === "email" ? "Enter your email" : step === "code" ? "Enter your code" : step === "link" ? "Check your link" : "Finish setup"}
              </div>
            </div>
          ) : null}

          <form className={panelClass} onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="p-3 text-sm text-center text-destructive bg-destructive/10 rounded border border-destructive/20">
              {error}
            </div>
          )}

          {step === "email" && (
            <div className="gap-y-4">
              <div className="gap-y-2">
                <Label htmlFor="auth-email" className="sr-only">Email address</Label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" weight="bold" />
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus={variant === "modal"}
                    className="h-12 pl-10 text-base bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/40"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll email a one-time code so you can save securely without a password.
                </p>
              </div>
              <Button type="submit" variant="brand" disabled={loading} className="min-h-12 w-full whitespace-normal px-4 text-base font-medium">
                {loading && <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />}
                Send sign-in code
                {!loading && <ArrowRight className="ml-2 size-4" weight="bold" />}
              </Button>
              {showMagicLinkFallback && (
                <button
                  type="button"
                  onClick={() => handleSendCode("magic_link")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Send a sign-in link instead
                </button>
              )}
            </div>
          )}

          {step === "code" && (
            <div className="gap-y-4">
              <div className="gap-y-2">
                <Label htmlFor="auth-code" className="sr-only">Login code</Label>
                <Input
                  id="auth-code"
                  type="text"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="00000000"
                  className="h-14 font-mono tracking-wide text-center text-2xl bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/20"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setCode(value);
                  }}
                  autoFocus={variant === "modal"}
                />
              </div>
              <Button type="submit" variant="brand" disabled={loading || code.length !== 8} className="h-12 w-full text-base font-medium">
                {loading && <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />}
                Verify Code
                {!loading && <Check className="ml-2 size-4" weight="bold" />}
              </Button>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  className="hover:text-foreground transition-colors"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                    isVerifyingRef.current = false;
                  }}
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  className={cn(
                    "hover:text-foreground transition-colors",
                    resendCooldown > 0 && "cursor-not-allowed opacity-60"
                  )}
                  disabled={resendCooldown > 0}
                  onClick={() => handleSendCode("otp")}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleSendCode("magic_link")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Send a sign-in link instead
              </button>
            </div>
          )}

          {step === "link" && (
            <div className="gap-y-4">
              <div className="rounded border border-border/60 bg-secondary/10 p-4 text-sm text-muted-foreground">
                Click the link in your email to sign in. You can close this tab after it opens.
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  className="hover:text-foreground transition-colors"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  className={cn(
                    "hover:text-foreground transition-colors",
                    resendCooldown > 0 && "cursor-not-allowed opacity-60"
                  )}
                  disabled={resendCooldown > 0}
                  onClick={() => handleSendCode("magic_link")}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend link"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleSendCode("otp")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Use an 8-digit code instead
              </button>
            </div>
          )}

          {step === "name" && (
            <div className="gap-y-4">
              <div className="gap-y-2">
                <Label htmlFor="auth-name" className="sr-only">First name</Label>
                <Input
                  id="auth-name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                  className="h-12 text-base bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40"
                />
              </div>
              <Button type="submit" variant="brand" disabled={loading || !firstName.trim()} className="h-12 w-full text-base font-medium">
                {loading && <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />}
                Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => finishAuth()}
              >
                Skip for now
              </Button>
            </div>
          )}
          </form>

          <div className={cn("gap-y-2", variant === "page" ? "pt-1" : "text-center")}>
            {variant === "modal" ? (
              <div className="text-xs font-medium text-muted-foreground">
                Secure sign-in. No password required.
              </div>
            ) : null}
            {variant === "page" ? (
              <p className="text-xs text-muted-foreground">
                Questions about privacy or billing? <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link> · <Link href="/security" className="underline underline-offset-4 hover:text-foreground">Security</Link> · <a href="mailto:support@recruiterinyourpocket.com" className="underline underline-offset-4 hover:text-foreground">Support</a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
