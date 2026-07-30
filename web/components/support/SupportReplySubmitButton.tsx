"use client";

import { useFormStatus } from "react-dom";

export function SupportReplySubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Sending privately…" : disabled ? "Reply sent" : "Send private reply"}
    </button>
  );
}
