"use client";

import { PRIVACY_OPEN_EVENT } from "@/lib/analyticsConsent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrivacyPreferencesButton({ className }: { className?: string }) {
  return <Button type="button" variant="link" size="sm" className={cn("rounded-none p-0 text-inherit font-normal", className)} onClick={() => window.dispatchEvent(new Event(PRIVACY_OPEN_EVENT))}>Privacy choices</Button>;
}
