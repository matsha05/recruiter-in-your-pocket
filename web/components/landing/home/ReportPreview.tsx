"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import sampleReport from "@/public/sample-report.json";
import { cn } from "@/lib/utils";
import styles from "./ReportPreview.module.css";

const fixes = sampleReport.top_fixes;
const criticalMiss = fixes[0];
// A fix's "what to change" comes from the rewrite written for that same line, never a neighbor's.
const changeFor = (excerpt: string) => sampleReport.rewrites.find((rewrite) => rewrite.original === excerpt)?.enhancement_note;

/** The real sample report, opened the way every report opens: Verdict, score, Critical Miss, then the fixes. */
export function ReportPreview() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = fixes.length - 1;
    const next = event.key === "ArrowDown" || event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowUp" || event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="how-it-works" className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <h2 id={`${id}-title`} className={styles.title}>Here&rsquo;s the whole report.</h2>
        <p className={styles.deck}>
          A real example, start to finish. Every report opens with the Verdict, the score, and the Critical Miss. Then it quotes your lines and tells you what to change.
        </p>
      </header>

      <article className={styles.report} aria-label="Sample resume report preview">
        <div className={styles.reportBar}>
          <p className={styles.reportName}>Resume report</p>
          <p className={styles.reportTag}>Example · Program manager</p>
        </div>

        <div className={styles.opening}>
          <div className={styles.verdict}>
            <p className={styles.label}>Verdict</p>
            <p className={styles.verdictText}>{sampleReport.first_impression}</p>
            <div className={styles.score}>
              <p className={styles.scoreValue}>{sampleReport.score}<span>/100</span></p>
              <p className={styles.scoreName}>First Impression score</p>
            </div>
          </div>
          <div className={styles.miss}>
            <p className={styles.missLabel}>Critical Miss</p>
            <p className={styles.missTitle}>{criticalMiss.fix}</p>
            <p className={styles.missWhy}>{criticalMiss.why}</p>
          </div>
        </div>

        <div className={styles.keep}>
          <p className={styles.keepLabel}>Don&rsquo;t touch these</p>
          <ul>
            {sampleReport.strengths.map((strength) => <li key={strength}>{strength}</li>)}
          </ul>
        </div>

        <div className={styles.fixes}>
          <div className={styles.fixList}>
            <h3 id={`${id}-fixes`} className={styles.fixesTitle}>Fix these first</h3>
            <div role="tablist" aria-labelledby={`${id}-fixes`} aria-orientation="vertical" className={styles.tabs}>
              {fixes.map((fix, index) => (
                <button
                  key={fix.fix}
                  ref={(element) => { tabs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${index}`}
                  aria-controls={`${id}-panel-${index}`}
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  className={cn(styles.tab, selected === index && styles.tabActive)}
                  onClick={() => setSelected(index)}
                  onKeyDown={(event) => handleKey(event, index)}
                >
                  <span className={cn(styles.tabMark, index === 0 && styles.tabMarkMiss)} aria-hidden="true">{index + 1}</span>
                  <span>{fix.fix}</span>
                </button>
              ))}
            </div>
          </div>

          {fixes.map((fix, index) => {
            const change = changeFor(fix.evidence.excerpt);
            return (
              <section
                key={fix.fix}
                role="tabpanel"
                id={`${id}-panel-${index}`}
                aria-labelledby={`${id}-tab-${index}`}
                tabIndex={0}
                hidden={selected !== index}
                className={styles.panel}
              >
                <p className={styles.quoteLabel}>From the resume · {fix.evidence.section}</p>
                <blockquote className={cn(styles.quote, index === 0 && styles.quoteMiss)}>&ldquo;{fix.evidence.excerpt}&rdquo;</blockquote>
                <p className={cn(styles.panelLabel, styles.panelLabelMissing)}>What&rsquo;s missing</p>
                <p className={styles.panelText}>{fix.why}</p>
                {change && (
                  <>
                    <p className={cn(styles.panelLabel, styles.panelLabelChange)}>What to change</p>
                    <p className={styles.panelText}>{change}</p>
                  </>
                )}
              </section>
            );
          })}
        </div>

        <div className={styles.reportFooter}>
          <p>Also inside: notes on each section, suggested rewrites, and role fit.</p>
          <Link href="/sample-report" data-analytics-cta="sample_report" className={styles.footerLink}>
            Read a sample report <ArrowRight weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </section>
  );
}
