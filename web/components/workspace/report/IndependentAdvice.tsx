"use client";

import { useState } from "react";
import { BracketsAngle, Check, Copy, Question } from "@phosphor-icons/react";
import {
  resolveRewriteCopyPolicy,
  questionForPlaceholder,
  type IndependentQuestion,
  type IndependentRewrite,
} from "@/lib/reports/report-presentation";
import { RewriteEnhancementNote } from "@/lib/reports/rewrite-enhancement-note";
import { bracketPlaceholderKeys, hasBracketPlaceholders } from "@/lib/llm/report-placeholder-policy";
import styles from "./ReportStream.module.css";

function IndependentRewriteCard({
  item,
  resumeText,
  isReadOnly,
}: {
  item: IndependentRewrite;
  resumeText?: string;
  isReadOnly: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const needsFacts = hasBracketPlaceholders(item.rewrite.better);
  const policy = resolveRewriteCopyPolicy({
    sourceText: resumeText,
    original: item.rewrite.original,
    draft: item.rewrite.better,
  });
  const guidance = isReadOnly
    ? "This example uses only the details in the original line."
    : policy.reason === "source_unavailable"
      ? "The original resume is not available in this view, so copying is disabled."
      : policy.reason === "unsafe"
        ? "This draft changes or leaves out a detail from your resume, so copying is disabled."
        : "Check the wording, then make it sound like you.";

  const handleCopy = async () => {
    if (!policy.copyable) return;
    try {
      await navigator.clipboard.writeText(item.rewrite.better);
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <article className="border-t border-[hsl(var(--paper-line))] py-6 first:border-t-0">
      <p className="text-xs font-semibold uppercase riyp-track-015 text-muted-foreground">
        {item.rewrite.label || `Rewrite ${String(item.originalIndex + 1).padStart(2, "0")}`}
      </p>
      <div className="mt-4 grid overflow-hidden rounded-xl border border-line md:grid-cols-2">
        <div className="bg-proof/50 px-5 py-5">
          <p className="text-xs font-semibold uppercase riyp-track-015 text-muted-foreground">Original</p>
          <p className="mt-3 text-base text-foreground">{item.rewrite.original}</p>
        </div>
        <div className="border-t border-line bg-surface-sky/50 px-5 py-5 md:border-l md:border-t-0">
          {needsFacts ? (
            <>
              {item.rewrite.enhancement_note ? (
                <RewriteEnhancementNote note={item.rewrite.enhancement_note} label="Details to add" />
              ) : (
                <ul className="list-disc space-y-2 pl-5 text-base text-foreground">
                  {bracketPlaceholderKeys(item.rewrite.better).map((key) => <li key={key}>{questionForPlaceholder(key)}</li>)}
                </ul>
              )}
              <details className="mt-4 border-t border-brand/15 pt-2">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-4">View draft template</summary>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">This is unfinished wording. Add the missing facts and edit the sentence before using it.</p>
                <p className="mt-3 text-base leading-7 text-foreground/85">{item.rewrite.better}</p>
              </details>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase riyp-track-015 text-brand">{isReadOnly ? "Example wording" : "Suggested wording"}</p>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!policy.copyable}
                    title={!policy.copyable ? guidance : undefined}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1.5 px-2 text-xs font-semibold text-brand disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-70"
                  >
                    {!policy.copyable ? <BracketsAngle className="size-4" /> : copied ? <Check className="size-4" weight="bold" /> : <Copy className="size-4" />}
                    {!policy.copyable ? "Not copy-ready" : copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <p className={`${styles.body} mt-3 text-foreground`}>{item.rewrite.better}</p>
              <RewriteEnhancementNote note={item.rewrite.enhancement_note} className="mt-4" />
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{guidance}</p>
              {copyError && <p role="status" className="mt-3 text-base text-muted-foreground">Couldn&apos;t copy. Select the text and copy it manually.</p>}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function IndependentAdvice({
  rewrites,
  questions,
  resumeText,
  isReadOnly = false,
}: {
  rewrites: IndependentRewrite[];
  questions: IndependentQuestion[];
  resumeText?: string;
  isReadOnly?: boolean;
}) {
  if (rewrites.length === 0 && questions.length === 0) return null;

  return (
    <section id="section-independent-advice" className="scroll-mt-36 border-t border-line py-8 sm:py-10">
      {rewrites.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase riyp-track-017 text-brand">More from your resume</p>
          <h2 className={`${styles.sectionTitle} mt-3`}>Other suggested edits.</h2>
          <p className="mt-3 max-w-[42rem] text-base text-muted-foreground">
            Compare each suggestion with the original before you use it.
          </p>
          <div className="mt-6 border-y border-[hsl(var(--paper-line))]">
            {rewrites.map((item) => <IndependentRewriteCard key={`${item.originalIndex}-${item.rewrite.original}`} item={item} resumeText={resumeText} isReadOnly={isReadOnly} />)}
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className={rewrites.length > 0 ? "mt-12 border-t border-[hsl(var(--paper-line))] pt-10" : ""}>
          <div className="flex items-center gap-2 text-brand">
            <Question className="size-5" weight="duotone" />
            <p className="text-xs font-semibold uppercase riyp-track-017">Other experience to consider</p>
          </div>
          <h2 className={`${styles.sectionTitle} mt-3`}>Questions only you can answer.</h2>
          <p className="mt-3 max-w-[42rem] text-base text-muted-foreground">Use these prompts to recall relevant examples. You don&apos;t need an answer to every one.</p>
          <ol className="mt-6 divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
            {questions.map(({ question, originalIndex }) => (
              <li key={`${originalIndex}-${question.question}`} className="grid gap-2 py-5 sm:grid-cols-[2.5rem_1fr]">
                <span className="riyp-tabular-label text-xs font-semibold text-brand">{String(originalIndex + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-base font-medium leading-7 text-foreground">{question.question}</p>
                  {question.why && <p className="mt-2 text-base text-muted-foreground">{question.why}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
