"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Check, Mail } from "lucide-react";
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
  const router = useRouter();
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
      router.refresh();
      router.push(redirectTo || "/workspace");
    } else {
      onClose?.();
    }
  }, [onClose, onSuccess, redirectTo, router, variant]);

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
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [finishAuth, firstName]);

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
    ? "bg-paper min-h-screen px-6 pb-16 pt-28 md:px-8"
    : "";

  const panelClass = cn(
    "space-y-5",
    variant === "page" && "rounded-[28px] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_56px_-40px_rgba(15,23,42,0.22)]"
  );

  return (
    <div
      data-visual-anchor={variant === "page" ? "auth-page" : undefined}
      className={outerClass}
    >
      <div
        className={cn(
          "w-full space-y-6",
          variant === "page" && "mx-auto grid max-w-[72rem] gap-12 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-start",
          variant === "modal" && "max-w-none"
        )}
      >
        {variant === "page" ? (
          <div className="space-y-8 pt-6">
            <div className="space-y-4">
              <div className="editorial-kicker text-slate-400">Secure sign-in</div>
              <h1
                className="font-display max-w-[34rem] text-slate-950"
                style={{
                  fontSize: "clamp(3rem, 6.5vw, 5rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.04em",
                  fontWeight: 400,
                }}
              >
                {stepTitle}
              </h1>
              <div className="max-w-[32rem] text-base leading-8 text-slate-500">
                {stepSubtitle}
              </div>
            </div>

            <div className="max-w-[34rem] space-y-4 border-t border-slate-200/85 pt-6">
              {step === "email" ? (
                <>
                  <p className="text-[1.02rem] leading-8 text-slate-700">
                    Sign in is for saved history, billing controls, and synced jobs. Anonymous reports stay separate unless you choose otherwise.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Reports", value: "Keep versions in one place." },
                      { label: "Billing", value: "Reach receipts and restores fast." },
                      { label: "Saved jobs", value: "Sync extension history only if you want it." },
                    ].map((item) => (
                      <div key={item.label} className="border-t border-slate-200/80 pt-3">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="max-w-[28rem] border-t border-slate-200/80 pt-4">
                  <p className="text-sm leading-7 text-slate-600">
                    One quick step and you&apos;re back in. We keep the flow short on purpose.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <h1 className="font-display font-medium text-2xl text-foreground tracking-tight">
              {stepTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{stepSubtitle}</p>
            {step === "email" ? (
              <div className="mx-auto max-w-sm rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-left text-xs leading-5 text-muted-foreground">
                Sign-in is only for durable history, billing controls, and synced saved jobs. Anonymous reports are not silently attached to an account.
              </div>
            ) : null}
          </div>
        )}

        <div className={cn(variant === "page" ? "space-y-5" : "max-w-md space-y-5", variant === "modal" && "max-w-none")}>
          {variant === "page" ? (
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                {step === "email" ? "Enter your email" : step === "code" ? "Enter your code" : step === "link" ? "Check your link" : "Finish setup"}
              </div>
              <p className="text-sm text-slate-500">
                {step === "email" ? "We&apos;ll send a one-time code. No password to remember." : "A short sign-in flow, then you&apos;re back where you left off."}
              </p>
            </div>
          ) : null}

          <div className={panelClass}>
          {error && (
            <div className="p-3 text-sm text-center text-destructive bg-destructive/10 rounded border border-destructive/20">
              {error}
            </div>
          )}

          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-email" className="sr-only">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    autoFocus
                    className="h-12 pl-10 text-base bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/40"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll email a one-time code so you can save securely without a password.
                </p>
              </div>
              <Button onClick={() => handleSendCode("otp")} disabled={loading} className="w-full h-12 text-base font-medium">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Email secure sign-in code
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-code" className="sr-only">Login code</Label>
                <Input
                  id="auth-code"
                  type="text"
                  placeholder="00000000"
                  className="h-14 font-mono tracking-widest text-center text-2xl bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/20"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setCode(value);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                  autoFocus
                />
              </div>
              <Button onClick={verifyCode} disabled={loading || code.length !== 8} className="w-full h-12 text-base font-medium">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
                {!loading && <Check className="ml-2 h-4 w-4" />}
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
            <div className="space-y-4">
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-name" className="sr-only">First name</Label>
                <Input
                  id="auth-name"
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  className="h-12 text-base bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40"
                />
              </div>
              <Button onClick={handleSaveName} disabled={loading || !firstName.trim()} className="w-full h-12 text-base font-medium">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => finishAuth()}
              >
                Skip for now
              </Button>
            </div>
          )}
        </div>

          <div className={cn("space-y-2", variant === "page" ? "pt-1" : "text-center")}>
            <div className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
              Secure Login • No Password Required
            </div>
            {variant === "page" ? (
              <p className="text-xs text-muted-foreground">
                Questions about privacy or billing? <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</a> · <a href="/security" className="underline underline-offset-4 hover:text-foreground">Security</a> · <a href="mailto:support@recruiterinyourpocket.com" className="underline underline-offset-4 hover:text-foreground">Support</a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
