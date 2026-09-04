"use client";

import { useEffect, useRef } from "react";

export function useAuthFieldFocus(
  step: "email" | "code" | "name",
  isOpen: boolean,
  error: string | null,
) {
  const errorRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus({ preventScroll: true });
  }, [error]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => {
      if (step === "email") emailInputRef.current?.focus({ preventScroll: true });
      if (step === "code") codeInputRef.current?.focus({ preventScroll: true });
      if (step === "name") nameInputRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, step]);

  return { errorRef, emailInputRef, codeInputRef, nameInputRef };
}
