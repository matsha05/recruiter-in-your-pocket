"use client";

import { useFormStatus } from "react-dom";

export function SupportReplySubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Sending privately…" : disabled ? "Reply sent" : "Send private reply"}
    </button>
  );
}
