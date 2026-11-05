"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Paper } from "@/components/materials/Paper";
import { MarkerStroke } from "@/components/materials/Pen";
import clip from "@/components/materials/Clipping.module.css";
import { Button } from "@/components/ui/button";
import { askFirstPlaceholder, type AskFirstAnswers, type AskFirstQuestion } from "@/lib/reports/ask-first";
import { readCriticalMisses } from "@/lib/reports/report-presentation";
import { candidateNameOf } from "@/lib/reports/report-opening";
import { cn } from "@/lib/utils";
import type { ReportData } from "./ReportTypes";
import { ScoreBand } from "./markup/ScoreBand";
import { quotedLine } from "./markup/MarkedRows";
import report from "./markup/MarkedReport.module.css";
import styles from "./AskFirst.module.css";

const COUNT_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

function countWord(count: number) {
  return COUNT_WORDS[count] || String(count);
}

/** The lines just above and below the quoted one, so the question reads as a clipping cut from the page. */
function neighbours(resumeText: string | undefined, excerpt: string): { above?: string; below?: string } {
  if (!resumeText || !excerpt) return {};
  const lines = resumeText.replace(/\r\n?/gu, "\n").split("\n").map((line) => line.trim().replace(/^[-•*]\s+/u, ""));
  const key = excerpt.trim().replace(/^[-•*]\s+/u, "").replace(/\s+/g, " ").toLocaleLowerCase();
  const index = lines.findIndex((line) => line.replace(/\s+/g, " ").toLocaleLowerCase().includes(key));
  if (index === -1) return {};
  const pick = (from: number, step: number) => {
    for (let i = from; i >= 0 && i < lines.length; i += step) if (lines[i]) return lines[i];
    return undefined;
  };
  return { above: pick(index - 1, -1), below: pick(index + 1, 1) };
}

function sectionLabel(section?: string) {
  const value = section?.trim();
  if (!value) return undefined;
  return value === value.toLocaleUpperCase() ? value.charAt(0) + value.slice(1).toLocaleLowerCase() : value;
}

/**
 * Questions first (Matt, Nov 5, 2026). The page landed on the bottom rung, so before the report the
 * person sees where they stand and the questions a recruiter would ask and never get to: each on
 * the line it is about, in the recruiter's own words, with a field. "Write my report" writes the
 * report again from the page plus the answers (with none, it shows the first read); "Skip" shows
 * the first read as it is.
 */
export function AskFirst({
  report: data,
  questions,
  resumeText,
  onWrite,
  onSkip,
}: {
  report: ReportData;
  questions: AskFirstQuestion[];
  resumeText?: string;
  onWrite: (answers: AskFirstAnswers) => void;
  onSkip: () => void;
}) {
  const [answers, setAnswers] = useState<AskFirstAnswers>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const titleRef = useRef<HTMLHeadingElement>(null);
  const baseId = useId();
  const misses = readCriticalMisses(data);
  const name = candidateNameOf(resumeText);

  // The screen opens at its heading, with the band and the first question in view.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      titleRef.current?.scrollIntoView({ block: "start" });
      titleRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const setAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    if (value.trim()) setSkipped((current) => (current[id] ? { ...current, [id]: false } : current));
  };
  const skip = (id: string) => {
    setAnswers((current) => ({ ...current, [id]: "" }));
    setSkipped((current) => ({ ...current, [id]: true }));
  };

  return (
    <div className={cn(report.root, styles.root)} data-testid="ask-first">
      <div className={styles.head}>
        <p className="text-small font-semibold text-foreground">{name || "Your resume report"}</p>
      </div>

      <section className={report.opening} aria-labelledby="ask-first-title">
        <h1 id="ask-first-title" ref={titleRef} tabIndex={-1} className={styles.title}>
          {countWord(questions.length)} {questions.length === 1 ? "question" : "questions"} before the report.
        </h1>
        {typeof data.score === "number" && <ScoreBand score={data.score} misses={misses} anchorOnPhones />}
      </section>

      <section className={cn(report.page, styles.page)} aria-labelledby="ask-first-questions">
        <div className={report.countHead}>
          <h2 id="ask-first-questions" className={report.sectionTitle}>A recruiter would ask these. They won&apos;t get to.</h2>
          <p className={report.countLead}>Only what&apos;s true. Every answer goes into your resume in your own words.</p>
        </div>
        <ol className={styles.list}>
          {questions.map((question, index) => {
            const fieldId = `${baseId}-${question.id}`;
            const onPage = Boolean(question.excerpt);
            const around = onPage ? neighbours(resumeText, question.excerpt) : {};
            const isSkipped = Boolean(skipped[question.id]);
            // One voice per row: the note and the question are the model's words, in the pen.
            const ask = question.question || question.note;
            return (
              <li key={question.id} className={styles.row} data-kind={question.kind} data-skipped={isSkipped || undefined}>
                <p className={styles.rowLabel}>
                  <span className={styles.position}>{index + 1} of {questions.length}</span>
                  {sectionLabel(question.section) && <span className={styles.section}>· {sectionLabel(question.section)}</span>}
                </p>
                {onPage && (
                  <Paper kind="strip" className={cn(styles.strip, clip.marked)}>
                    {around.above && <p className={cn(clip.ghost, clip.ghostTop)} aria-hidden="true">{around.above}</p>}
                    <blockquote className={styles.line}>
                      <span className={clip.line}><MarkerStroke drawn filterId={`${fieldId}-marker`} />{quotedLine({ evidence: question.excerpt })}</span>
                    </blockquote>
                    {around.below && <p className={cn(clip.ghost, clip.ghostBottom)} aria-hidden="true">{around.below}</p>}
                  </Paper>
                )}
                {question.note && question.question && <p className={styles.note}>{question.note}</p>}
                <div className={styles.field}>
                  <label htmlFor={fieldId} className={cn(styles.note, styles.ask)}>{ask}</label>
                  <input
                    id={fieldId}
                    type="text"
                    className={report.liftInput}
                    value={answers[question.id] || ""}
                    onChange={(event) => setAnswer(question.id, event.target.value)}
                    placeholder={isSkipped ? "Left out" : askFirstPlaceholder(question.kind)}
                    autoComplete="off"
                    maxLength={300}
                  />
                  {!isSkipped && !(answers[question.id] || "").trim() && (
                    <div className={report.liftSkips}>
                      <Button type="button" variant="quiet" size="sm" onClick={() => skip(question.id)}>I don&apos;t know</Button>
                    </div>
                  )}
                  {isSkipped && <p className={report.liftSkipped}>Left out. Type here if you find out.</p>}
                </div>
              </li>
            );
          })}
        </ol>
        <div className={styles.actions}>
          <Button type="button" variant="primary" onClick={() => onWrite(answers)} data-testid="ask-first-write">
            Write my report <ArrowRight className="size-4" weight="bold" />
          </Button>
          <Button type="button" variant="quiet" className={styles.skip} onClick={onSkip} data-testid="ask-first-skip">Skip the questions and read it as it is</Button>
        </div>
      </section>
    </div>
  );
}
