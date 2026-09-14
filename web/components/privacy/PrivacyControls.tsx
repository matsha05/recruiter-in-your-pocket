"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getAnalyticsConsent, PRIVACY_OPEN_EVENT, setAnalyticsConsent, subscribeAnalyticsConsent, type AnalyticsChoice } from "@/lib/analyticsConsent";
import { Button } from "@/components/ui/button";
import styles from "./PrivacyControls.module.css";

export function PrivacyControls() {
  const consent = useSyncExternalStore(subscribeAnalyticsConsent, getAnalyticsConsent, () => "unknown" as const);
  const [ready, setReady] = useState(false);
  const [reopened, setReopened] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const visible = ready && (consent === "unknown" || reopened);
  useEffect(() => {
    setReady(true);
    const open = () => { trigger.current = document.activeElement as HTMLElement; setReopened(true); };
    window.addEventListener(PRIVACY_OPEN_EVENT, open);
    return () => window.removeEventListener(PRIVACY_OPEN_EVENT, open);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.privacyPanelOpen = String(visible);
    if (reopened) heading.current?.focus();
    return () => { delete document.documentElement.dataset.privacyPanelOpen; };
  }, [visible, reopened]);
  const close = () => { setReopened(false); trigger.current?.focus({ preventScroll: true }); };
  const choose = (choice: AnalyticsChoice) => { setAnalyticsConsent(choice); close(); };
  if (!visible) return null;
  return (
    <section className={styles.panel} role="region" aria-labelledby="privacy-choices-title" data-testid="privacy-panel">
      <h2 id="privacy-choices-title" ref={heading} tabIndex={-1}>Your privacy choices</h2>
      <p>We use essential storage to keep the site working. With your permission, Mixpanel helps us understand which features people use. Your resume text is never included.</p>
      {consent === "blocked" ? <p>Your browser asks us not to track. Optional analytics stays off.</p> : <div className={styles.actions}>
        <Button type="button" variant="outline" size="sm" onClick={() => choose("declined")}>Decline analytics</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => choose("accepted")}>Allow analytics</Button>
      </div>}
      <div className={styles.links}>
        <Link href="/privacy">Privacy policy</Link>
        {reopened && <Button type="button" variant="link" size="sm" className="rounded-none p-0 text-inherit font-normal" onClick={close}>Close</Button>}
      </div>
    </section>
  );
}
