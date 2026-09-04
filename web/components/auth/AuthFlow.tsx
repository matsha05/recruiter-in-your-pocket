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
import { isValidAuthEmail, normalizeAuthEmail } from "@/lib/auth/utils";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { useAuthFieldFocus } from "./useAuthFieldFocus";

type AuthStep = "email" | "code" | "name";

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
  const copy = getAuthCopy(context, {
    billingEnabled: isLaunchFlagEnabled("billingUnlock"),
    extensionEnabled: isLaunchFlagEnabled("extensionSync"),
  });

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [resendCooldown, setResendCooldown] = useState(0);
  const authRequestRef = useRef({ id: 0, pending: false, verified: false, attemptedCode: null as string | null });
  const currentCodeRef = useRef("");

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const { errorRef, emailInputRef, codeInputRef, nameInputRef } = useAuthFieldFocus(step, isOpen, error);

  const resetFlow = useCallback(() => {
    setStep("email");
    setEmail("");
    setCode("");
    setFirstName("");
    setLoading(false);
    setError(null);
    setResendCooldown(0);
    authRequestRef.current = { id: authRequestRef.current.id + 1, pending: false, verified: false, attemptedCode: null };
    currentCodeRef.current = "";
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetFlow();
    }
  }, [isOpen, resetFlow]);

  useEffect(() => () => {
    authRequestRef.current.id += 1;
    authRequestRef.current.pending = false;
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendCode = useCallback(async () => {
    if (!isOpen || authRequestRef.current.pending) return;
    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail) {
      setError("Please enter your email");
      return;
    }
    if (!isValidAuthEmail(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    const requestId = ++authRequestRef.current.id;
    authRequestRef.current.pending = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, next: redirectTo || "/workspace" })
      });
      const data = await res.json();
      if (requestId !== authRequestRef.current.id) return;
      if (!data?.ok) {
        if (data?.errorCode === "otp_disabled") {
          throw new Error("Email sign-in is temporarily unavailable. Contact support if you need access now.");
        }
        if (data?.errorCode === "rate_limited") {
          throw new Error(data?.hint || "Too many sign-in emails were sent. Wait before requesting another.");
        }
        throw new Error(data?.message || data?.hint || "Failed to send code");
      }
      // A new email invalidates the previous code and its automatic attempt.
      currentCodeRef.current = "";
      authRequestRef.current.attemptedCode = null;
      authRequestRef.current.verified = false;
      setCode("");
      setStep("code");
      setResendCooldown(30);
    } catch (err: any) {
      if (requestId === authRequestRef.current.id) setError(err?.message || "Failed to send code");
    } finally {
      if (requestId === authRequestRef.current.id) {
        authRequestRef.current.pending = false;
        setLoading(false);
      }
    }
  }, [email, isOpen, redirectTo]);

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
    if (!isOpen || step !== "code" || !/^\d{8}$/.test(code) || authRequestRef.current.pending || authRequestRef.current.verified) return;
    const requestId = ++authRequestRef.current.id;
    const submittedCode = code;
    authRequestRef.current.pending = true;
    authRequestRef.current.attemptedCode = submittedCode;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: submittedCode })
      });
      const data = await res.json();
      if (requestId !== authRequestRef.current.id) return;
      if (!data?.ok) {
        throw new Error(data?.message || "Invalid code");
      }
      authRequestRef.current.verified = true;
      if (data.user?.firstName) {
        finishAuth();
      } else {
        setStep("name");
      }
    } catch (err: any) {
      // A response to the previous value must not replace feedback for an edit.
      if (requestId === authRequestRef.current.id && submittedCode === currentCodeRef.current) {
        setError(err?.message || "Invalid code. Please try again.");
      }
    } finally {
      if (requestId === authRequestRef.current.id) {
        authRequestRef.current.pending = false;
        setLoading(false);
      }
    }
  }, [code, email, finishAuth, isOpen, step]);

  useEffect(() => {
    if (isOpen && step === "code" && code.length === 8 && !loading && authRequestRef.current.attemptedCode !== code) {
      void verifyCode();
    }
  }, [code, isOpen, step, loading, verifyCode]);

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
    if (step === "email") void handleSendCode();
    if (step === "code") void verifyCode();
    if (step === "name") void handleSaveName();
  };

  const stepTitle = useMemo(() => {
    if (step === "email") return copy.headline;
    if (step === "code") return "Check your inbox";
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
              <div className="mx-auto max-w-sm border-l-2 border-cyan-bright bg-surface-sky px-4 py-3 text-left text-xs leading-5 text-muted-foreground">
                Sign-in is only for report history and role context you choose to keep. Anonymous reports are not silently attached to an account.
              </div>
            ) : null}
          </div>
        )}

        <div className={cn(variant === "page" ? "gap-y-5" : "max-w-md gap-y-5", variant === "modal" && "max-w-none")}>
          {variant === "page" ? (
            <div>
              <div className="text-xs font-semibold uppercase riyp-track-008 text-brand">
                {step === "email" ? "Enter your email" : step === "code" ? "Enter your code" : "Finish setup"}
              </div>
            </div>
          ) : null}

          <form className={panelClass} onSubmit={handleSubmit} noValidate>
          {error && (
            <div ref={errorRef} id="auth-error" role="alert" tabIndex={-1} className="border-l-2 border-destructive bg-error px-3 py-2 text-center text-sm text-destructive outline-none">
              {error}
            </div>
          )}

          {step === "email" && (
            <div className="gap-y-4">
              <div className="gap-y-2">
                <Label htmlFor="auth-email" className="sr-only">Email address</Label>
                <div className="relative">
                  <EnvelopeSimple
                    aria-hidden="true"
                    className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/90"
                    weight="bold"
                  />
                  <Input
                    ref={emailInputRef}
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    aria-describedby={error ? "auth-error auth-email-help" : "auth-email-help"}
                    error={Boolean(error)}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "h-12 pl-10 text-base",
                      !error && "bg-secondary/10 placeholder:text-muted-foreground/90 focus-visible:border-brand focus-visible:ring-brand"
                    )}
                  />
                </div>
                <p id="auth-email-help" className="text-xs text-muted-foreground">
                  We&apos;ll email a one-time code so you can save securely without a password.
                </p>
              </div>
              <Button type="submit" variant="brand" disabled={loading} className="min-h-12 w-full whitespace-normal px-4 text-base font-medium">
                {loading && <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />}
                Send sign-in code
                {!loading && <ArrowRight className="ml-2 size-4" weight="bold" />}
              </Button>
            </div>
          )}

          {step === "code" && (
            <div className="gap-y-4">
              <div className="gap-y-2">
                <Label htmlFor="auth-code" className="sr-only">Login code</Label>
                <Input
                  ref={codeInputRef}
                  id="auth-code"
                  type="text"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="00000000"
                  className={cn(
                    "h-14 text-center font-mono text-2xl tracking-wide",
                    !error && "bg-secondary/10 placeholder:text-muted-foreground/90 focus-visible:border-brand focus-visible:ring-brand"
                  )}
                  value={code}
                  aria-describedby={error ? "auth-error" : undefined}
                  error={Boolean(error)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                    if (value !== currentCodeRef.current) {
                      authRequestRef.current.attemptedCode = null;
                      currentCodeRef.current = value;
                      setError(null);
                    }
                    setCode(value);
                  }}
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
                  disabled={loading}
                  onClick={() => {
                    if (authRequestRef.current.pending) return;
                    setStep("email");
                    setCode("");
                    setError(null);
                    currentCodeRef.current = "";
                    authRequestRef.current.attemptedCode = null;
                    authRequestRef.current.verified = false;
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
                  disabled={loading || resendCooldown > 0}
                  onClick={() => handleSendCode()}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}

          {step === "name" && (
            <div className="gap-y-4">
              <div className="gap-y-2">
                <Label htmlFor="auth-name" className="sr-only">First name</Label>
                <Input
                  ref={nameInputRef}
                  id="auth-name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  value={firstName}
                  aria-describedby={error ? "auth-error" : undefined}
                  error={Boolean(error)}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={cn(
                    "h-12 text-base",
                    !error && "bg-secondary/10 placeholder:text-muted-foreground/90 focus-visible:border-brand focus-visible:ring-brand"
                  )}
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
                Questions about privacy or billing? <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link> · <Link href="/security" className="underline underline-offset-4 hover:text-foreground">Security</Link> · <Link href="/support" className="underline underline-offset-4 hover:text-foreground">Support</Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
