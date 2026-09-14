"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import styles from "./MobileReportCTA.module.css";

export function MobileReportCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('[data-testid="landing-primary-cta"]');
    const otherActions = [...document.querySelectorAll('a[data-analytics-cta][href="/workspace"], footer')];
    if (!hero) return;
    const update = () => {
      const onScreen = otherActions.some(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;
      });
      setVisible(innerWidth <= 700 && hero.getBoundingClientRect().bottom < 0 && !onScreen);
    };
    const observer = new IntersectionObserver(update);
    [hero, ...otherActions].forEach(element => observer.observe(element));
    window.addEventListener("resize", update);
    update();
    return () => { observer.disconnect(); window.removeEventListener("resize", update); };
  }, []);
  if (!visible) return null;
  // A portal keeps the fixed action outside animated page containers.
  return createPortal(
    <nav className={styles.rail} aria-label="Get your report" data-testid="mobile-report-cta">
      <Link href="/workspace" data-analytics-cta="mobile_sticky_report">Get your free report <ArrowRight aria-hidden="true" /></Link>
    </nav>, document.body,
  );
}
