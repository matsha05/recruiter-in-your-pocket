"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { cn } from "@/lib/utils";

export type AuthContext = "default" | "report" | "settings" | "paywall";
type AuthStep = "email" | "code" | "link" | "name";

const AUTH_COPY: Record<AuthContext, { headline: string; subtext: string }> = {
  default: {
    headline: "Welcome back",
    subtext: "Sign in to access your reports and history."
  },
  report: {
    headline: "Save this report",
    subtext: "Keep this report and track improvements over time."
  },
  settings: {
    headline: "Manage your account",
    subtext: "Access billing, receipts, and saved reports."
  },
  paywall: {
    headline: "Use your credits",
    subtext: "Your purchases are linked to your account."
  }
};

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
  const copy = AUTH_COPY[context] || AUTH_COPY.default;

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
    ? "flex flex-col items-center justify-center min-h-[85vh] px-4 bg-background"
    : "";

  const panelClass = cn(
    "space-y-5",
    variant === "page" && "rounded border border-border/60 bg-card p-8"
  );

  return (
    <div className={outerClass}>
      <div className={cn("w-full max-w-md space-y-6", variant === "modal" && "max-w-none")}>
        <div className="text-center space-y-2">
          <h1 className={cn("font-display font-medium text-foreground tracking-tight", variant === "page" ? "text-3xl" : "text-2xl")}>
            {stepTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{stepSubtitle}</p>
        </div>

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
                <p className="text-[11px] text-muted-foreground">
                  We&apos;ll email a one-time code. No password required.
                </p>
              </div>
              <Button onClick={() => handleSendCode("otp")} disabled={loading} className="w-full h-12 text-base font-medium">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Login Code
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
                  className="h-14 font-mono tracking-[0.5em] text-center text-2xl bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/20"
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

        <div className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-widest font-medium">
          Secure Login • No Password Required
        </div>
      </div>
    </div>
  );
}
