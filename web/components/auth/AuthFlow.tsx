"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { cn } from "@/lib/utils";
import { getAuthCopy, type AuthContext } from "@/lib/auth/content";
import { isValidAuthEmail, normalizeAuthEmail, safeAuthRedirect } from "@/lib/auth/utils";
import { signInLanding } from "@/lib/auth/landing";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { useAuthFieldFocus } from "./useAuthFieldFocus";
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

type AuthStep = "email" | "code" | "name";

interface AuthFlowProps {
  variant?: "page" | "modal";
  context?: AuthContext;
  onSuccess?: () => void;
  onClose?: () => void;
  redirectTo?: string;
  /** A plain sign-in with nowhere to go back to: land on My reports when the person has a saved report (lib/auth/landing.ts). */
  landOnSavedReports?: boolean;
  isOpen?: boolean;
  initialError?: string | null;
}

const EMAIL_REQUIRED = "Enter your email address.";
const EMAIL_INVALID = "That email address doesn’t look right. Check it and try again.";

export function AuthFlow({
  variant = "page",
  context = "default",
  onSuccess,
  onClose,
  redirectTo,
  landOnSavedReports = false,
  isOpen = true,
  initialError = null
}: AuthFlowProps) {
  const copy = getAuthCopy(context, {
    billingEnabled: isLaunchFlagEnabled("billingUnlock"),
    extensionEnabled: isLaunchFlagEnabled("extensionSync"),
  });

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  // After verification, while the landing for a plain sign-in is being decided.
  const [finishing, setFinishing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"send" | "verify" | "name" | null>(null);
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
    setLoadingAction(null);
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

  // Only problems with what was typed mark the field; delivery failures stay in the alert.
  const emailFieldError = error === EMAIL_REQUIRED || error === EMAIL_INVALID;

  const handleSendCode = useCallback(async () => {
    if (!isOpen || authRequestRef.current.pending) return;
    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail) {
      setError(EMAIL_REQUIRED);
      return;
    }
    if (!isValidAuthEmail(normalizedEmail)) {
      setError(EMAIL_INVALID);
      return;
    }
    const requestId = ++authRequestRef.current.id;
    authRequestRef.current.pending = true;
    setLoading(true);
    setLoadingAction("send");
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
          throw new ClientActionError(null, "Email sign-in is temporarily unavailable. Contact support if you need access now.");
        }
        if (data?.errorCode === "rate_limited") {
          throw new ClientActionError(data?.hint, "We’ve sent several codes already. Wait a little before you ask for another.");
        }
        throw new ClientActionError(data?.message || data?.hint, "We couldn’t send a code. Try again.");
      }
      // A new email invalidates the previous code and its automatic attempt.
      currentCodeRef.current = "";
      authRequestRef.current.attemptedCode = null;
      authRequestRef.current.verified = false;
      setCode("");
      setStep("code");
      setResendCooldown(30);
    } catch (err: any) {
      if (requestId === authRequestRef.current.id) setError(getClientActionError(err, "We couldn’t send a code. Try again."));
    } finally {
      if (requestId === authRequestRef.current.id) {
        authRequestRef.current.pending = false;
        setLoading(false);
        setLoadingAction(null);
      }
    }
  }, [email, isOpen, redirectTo]);

  const finishAuth = useCallback(() => {
    onSuccess?.();
    if (variant === "page") {
      // Verification sets cookies server-side. Recreate the browser auth state
      // before opening a protected destination; a router refresh preserves it.
      if (landOnSavedReports) {
        // The button stays busy while we ask whether there is a saved report to open; the answer can't fail the sign-in.
        setFinishing(true);
        void signInLanding().then((landing) => window.location.replace(landing));
        return;
      }
      window.location.replace(safeAuthRedirect(redirectTo ?? null, "/workspace"));
    } else {
      onClose?.();
    }
  }, [landOnSavedReports, onClose, onSuccess, redirectTo, variant]);

  const verifyCode = useCallback(async () => {
    if (!isOpen || step !== "code" || !/^\d{8}$/.test(code) || authRequestRef.current.pending || authRequestRef.current.verified) return;
    const requestId = ++authRequestRef.current.id;
    const submittedCode = code;
    authRequestRef.current.pending = true;
    authRequestRef.current.attemptedCode = submittedCode;
    setLoading(true);
    setLoadingAction("verify");
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
        throw new ClientActionError(data?.message, "That code didn’t work. Check the email or request a new code.");
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
        setError(getClientActionError(err, "We couldn’t verify that code. Try again."));
      }
    } finally {
      if (requestId === authRequestRef.current.id) {
        authRequestRef.current.pending = false;
        setLoading(false);
        setLoadingAction(null);
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
      setError("Add a first name, or choose Skip for now.");
      return;
    }
    setLoading(true);
    setLoadingAction("name");
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
      setError("We couldn’t save your name. Try again.");
    } finally {
      setLoading(false);
      setLoadingAction(null);
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
    return "What should we call you?";
  }, [copy.headline, step]);

  // Only the code step needs a line under the title: which inbox to check.
  const stepSubtitle = step === "code" ? (
    <p className="text-base text-muted-foreground">
      We sent an 8-digit code to <span className="font-medium text-foreground">{email || "your email"}</span>.
      {" "}Not there? Check spam and Promotions.
    </p>
  ) : null;
  // The page variant sits bare on the ground (Nov 4, 2026): no card, no padding of its own; app/auth lays it out.
  const outerClass = variant === "page" ? "text-foreground" : "";
  const panelClass = "grid gap-5";

  return (
    <div
      data-visual-anchor={variant === "page" ? "auth-page" : undefined}
      className={outerClass}
    >
      <div className={cn("grid w-full gap-6", variant === "page" && "mx-auto max-w-auth")}>
        <div className="grid gap-3 text-left">
          <h1 className={cn("text-balance text-title text-foreground", variant === "page" ? "font-display" : "font-sans")}>
            {stepTitle}
          </h1>
          {stepSubtitle}
        </div>

        <div className="grid min-w-0 gap-4">
          <form className={panelClass} onSubmit={handleSubmit} noValidate>
          {error && (
            <div ref={errorRef} id="auth-error" role="alert" tabIndex={-1} className="rounded-xl border border-destructive/35 bg-error px-4 py-3 text-left text-sm text-destructive outline-none">
              {error}
            </div>
          )}

          {step === "email" && (
            <div className="ui-state-enter grid gap-5">
              <div className="grid gap-3">
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
                    aria-describedby={error ? "auth-error" : undefined}
                    error={emailFieldError}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "h-12 pl-10 text-base",
                      !emailFieldError && "bg-card placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-brand"
                    )}
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" isLoading={loading || finishing} loadingLabel="Sending sign-in code…" className="w-full whitespace-normal">
                Send sign-in code
                <ArrowRight className="ml-2 size-4" weight="bold" />
              </Button>
              {variant === "page" ? (
                <p className="text-sm text-muted-foreground">No password. The code works once and expires soon.</p>
              ) : null}
            </div>
          )}

          {step === "code" && (
            <div className="ui-state-enter grid gap-5">
              <div className="grid gap-3">
                <Label htmlFor="auth-code" className="sr-only">Sign-in code</Label>
                <Input
                  ref={codeInputRef}
                  id="auth-code"
                  type="text"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="8-digit code"
                  className={cn(
                    "h-14 text-center font-mono text-heading tracking-wide",
                    !error && "bg-card placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-brand"
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
              <Button type="submit" variant="primary" disabled={code.length !== 8} isLoading={loading || finishing} loadingLabel={finishing ? "Signing you in…" : loadingAction === "send" ? "Sending a new code…" : "Verifying code…"} className="w-full">
                Verify code
                <Check className="ml-2 size-4" weight="bold" />
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-x-3 text-sm text-muted-foreground">
                <button
                  type="button"
                  className="focus-ring min-h-11 rounded-md text-left transition-colors hover:text-foreground disabled:opacity-60"
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
                    "focus-ring min-h-11 min-w-[7rem] rounded-md text-left tabular-nums transition-colors hover:text-foreground",
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
            <div className="ui-state-enter grid gap-5">
              <div className="grid gap-3">
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
                    !error && "bg-card placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-brand"
                  )}
                />
              </div>
              <Button type="submit" variant="primary" disabled={!firstName.trim()} isLoading={loading || finishing} loadingLabel={finishing ? "Signing you in…" : "Saving your name…"} className="w-full">
                Continue
              </Button>
              <Button
                type="button"
                variant="quiet"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => finishAuth()}
                disabled={finishing}
              >
                Skip for now
              </Button>
            </div>
          )}
          </form>

        </div>
      </div>
    </div>
  );
}
