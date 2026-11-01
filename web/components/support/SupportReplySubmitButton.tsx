"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export function SupportReplySubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
        className="disabled:cursor-not-allowed"
    >
      {pending ? "Sending privately…" : disabled ? "Reply sent" : "Send private reply"}
    </Button>
  );
}
