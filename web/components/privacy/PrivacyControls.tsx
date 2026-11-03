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
  const panel = useRef<HTMLElement>(null);
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
  useEffect(() => {
    const element = panel.current;
    if (!visible || !element) return;
    // The card's height plus its gap from the bottom edge: the room globals.css leaves under the page.
    const root = document.documentElement;
    const measure = () => root.style.setProperty("--privacy-panel-space", `${Math.ceil(window.innerHeight - element.getBoundingClientRect().top)}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      root.style.removeProperty("--privacy-panel-space");
    };
  }, [visible]);
  const close = () => { setReopened(false); trigger.current?.focus({ preventScroll: true }); };
  const choose = (choice: AnalyticsChoice) => { setAnalyticsConsent(choice); close(); };
  if (!visible) return null;
  return (
    <section ref={panel} className={styles.panel} role="region" aria-labelledby="privacy-choices-title" data-testid="privacy-panel">
      {/* One line (Matt, Nov 2, 2026): essential storage needs no consent, so the only choice is optional
          analytics (Mixpanel), and the resume text never goes to it. The heading names the region for
          assistive technology and takes focus when the card is reopened from the footer. */}
      <h2 id="privacy-choices-title" ref={heading} tabIndex={-1} className="sr-only">Your privacy choices</h2>
      <p className={styles.line}>
        Optional analytics only, if you allow it. Your resume text never goes to analytics. <Link href="/privacy" className={styles.inlineLink}>Privacy</Link>
      </p>
      {consent === "blocked" ? <p className={styles.line}>Your browser asks us not to track. Optional analytics stays off.</p> : <div className={styles.actions}>
        <Button type="button" variant="secondary" size="sm" onClick={() => choose("declined")}>Decline<span className="sr-only"> analytics</span></Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => choose("accepted")}>Allow<span className="sr-only"> analytics</span></Button>
      </div>}
      {reopened && <div className={styles.links}>
        <button type="button" className="focus-ring riyp-link-quiet" onClick={close}>Close</button>
      </div>}
    </section>
  );
}
