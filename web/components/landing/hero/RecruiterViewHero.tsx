"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE, INSTANT_TRANSITION } from "@/lib/animation";
import { cn } from "@/lib/utils";
import styles from "./RecruiterViewHero.module.css";

type View = "you" | "recruiter";
type LineRead = "skim" | "works" | "miss";

interface ResumeLine {
  text: string;
  read?: LineRead;
  note?: string;
}

const EXAMPLE_LINES: ResumeLine[] = [
  { text: "Responsible for managing customer relationships and renewals.", read: "skim", note: "This line has been on a lot of resumes. What did you do that the others didn’t?" },
  { text: "Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue.", read: "works", note: "32 accounts and $2.4M. Size and stakes in one line." },
  { text: "Introduced monthly renewal-risk reviews across the portfolio.", read: "miss", note: "Your best example stops right before the good part. Did renewals go up?" },
  { text: "Collaborated cross-functionally with Product and Support.", read: "skim", note: "Easy to skim past. Name one thing you changed with Product." },
];

const NOTE_TRANSITION = { duration: 0.42, ease: EASE };

function Note({ show, index, reduced, children, className }: { show: boolean; index: number; reduced: boolean; children: React.ReactNode; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <m.div
          className={cn(styles.noteMotion, className)}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: reduced ? INSTANT_TRANSITION : { ...NOTE_TRANSITION, delay: 0.12 + index * 0.08 } }}
          exit={{ height: 0, opacity: 0, transition: reduced ? INSTANT_TRANSITION : { duration: 0.2, ease: EASE } }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}

export function RecruiterViewHero() {
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>("you");
  const chosen = useRef(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const recruiter = view === "recruiter";

  // Show the recruiter's read once when the example comes into view; a choice by the visitor always wins.
  useEffect(() => {
    const node = demoRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      window.setTimeout(() => {
        if (!chosen.current) setView("recruiter");
      }, reduced ? 0 : 700);
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const choose = (next: View) => {
    chosen.current = true;
    setView(next);
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.intro}>
        <h1 id="hero-title" className={styles.title}>See what a recruiter sees.</h1>
        <p className={styles.deck}>What you meant isn&rsquo;t always what they read. See what comes through, what slips past, and what to fix first.</p>
        <div className={styles.actions}>
          <Link href="/workspace" className={styles.primary} data-testid="landing-primary-cta" data-analytics-cta="hero_report">
            Get your free report <ArrowRight weight="bold" aria-hidden="true" />
          </Link>
          <Link href="/sample-report" className={styles.secondary} data-analytics-cta="hero_sample">See a sample report</Link>
        </div>
        <p className={styles.free}>Your first report is free. No account or card needed, and anonymous reports don&rsquo;t store your resume text.</p>
      </div>

      <div className={styles.demo} ref={demoRef} data-testid="recruiter-view-demo" data-view={view} aria-label="Example: the same resume, read two ways" role="region">
        <div className={styles.toggleWrap}>
          <div className={styles.toggle} role="group" aria-label="Choose whose view">
            {(["you", "recruiter"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                className={cn(styles.toggleButton, view === option && styles.toggleActive)}
                onClick={() => choose(option)}
              >
                {view === option && (
                  <m.span layoutId="hero-view-thumb" className={styles.thumb} transition={reduced ? INSTANT_TRANSITION : { duration: 0.4, ease: EASE }} aria-hidden="true" />
                )}
                <span className={styles.toggleLabel}>{option === "you" ? "Your view" : "A recruiter’s view"}</span>
              </button>
            ))}
          </div>
          <p className={styles.toggleHint}>Same example resume. Two readers.</p>
        </div>

        <div className={cn(styles.stage, recruiter && styles.stageRecruiter)}>
          <div className={styles.row}>
            <div className={cn(styles.paper, styles.paperTop)}>
              <p className={styles.name}>Dana Whitfield</p>
              <p className={styles.meta}>Denver, CO · dana@example.com</p>
              <p className={styles.sectionLabel}>Experience</p>
              <p className={styles.role}>Customer Success Manager, Northwind Analytics</p>
              <p className={styles.meta}>2021 – Present</p>
            </div>
            <div className={styles.gutter} />
            <div className={cn(styles.noteCell, styles.firstImpressionCell)}>
              <Note show={recruiter} index={0} reduced={reduced}>
                <div className={styles.firstImpression}>
                  <p className={styles.noteLabel}>First impression</p>
                  <p className={styles.verdict}>A capable CSM with a real book of business. What&rsquo;s missing is proof you changed the outcome.</p>
                  <div className={styles.score}>
                    <p className={styles.scoreValue}>71<span>/100</span></p>
                    <span className={styles.scoreTrack} aria-hidden="true"><span /></span>
                  </div>
                  <p className={styles.scoreNote}>Example score. It doesn&rsquo;t predict interviews.</p>
                </div>
              </Note>
            </div>
          </div>

          {EXAMPLE_LINES.map((line, index) => (
            <div className={styles.row} key={line.text}>
              <div className={styles.paper}>
                <p className={cn(styles.line, recruiter && line.read && styles[line.read])}>
                  <span>{line.text}</span>
                </p>
              </div>
              <div className={styles.gutter}>
                <m.span
                  className={cn(styles.leader, line.read === "miss" && styles.leaderMiss)}
                  initial={false}
                  animate={{ scaleX: recruiter ? 1 : 0 }}
                  transition={reduced ? INSTANT_TRANSITION : { duration: 0.35, ease: EASE, delay: recruiter ? 0.1 + index * 0.08 : 0 }}
                  aria-hidden="true"
                />
              </div>
              <div className={styles.noteCell}>
                <Note show={recruiter} index={index + 1} reduced={reduced} className={styles.inlineNote}>
                  {line.read === "miss" || line.read === "works" ? (
                    <div className={styles.note}>
                      <p className={line.read === "miss" ? styles.missLabel : styles.keepLabel}>{line.read === "miss" ? "Critical Miss" : "Don’t touch this one"}</p>
                      <p>{line.note}</p>
                    </div>
                  ) : (
                    <p className={styles.note}>{line.note}</p>
                  )}
                </Note>
              </div>
            </div>
          ))}

          <div className={styles.row}>
            <div className={cn(styles.paper, styles.paperBottom)}>
              <p className={cn(styles.role, styles.roleSpaced)}>Account Coordinator, Brightpath Logistics</p>
              <p className={styles.meta}>2018 – 2021</p>
              <p className={cn(styles.line, recruiter && styles.skim)}><span>Supported account managers with reporting and renewals.</span></p>
            </div>
            <div className={styles.gutter} />
            <div className={styles.noteCell} />
          </div>
        </div>
      </div>
    </section>
  );
}
