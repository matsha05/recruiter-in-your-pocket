"use client";

import { PRIVACY_OPEN_EVENT } from "@/lib/analyticsConsent";
import { cn } from "@/lib/utils";

export function PrivacyPreferencesButton({ className }: { className?: string }) {
  // An inline text action among footer links, so it takes the quiet link treatment rather than a Button.
  return <button type="button" className={cn("focus-ring riyp-link-quiet", className)} onClick={() => window.dispatchEvent(new Event(PRIVACY_OPEN_EVENT))}>Privacy choices</button>;
}
