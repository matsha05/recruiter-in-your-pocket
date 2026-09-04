"use client";

import { useState } from "react";
import { BracketsAngle, Check, Copy, Question } from "@phosphor-icons/react";
import {
  resolveRewriteCopyPolicy,
  type IndependentQuestion,
  type IndependentRewrite,
} from "@/lib/reports/report-presentation";
import { RewriteEnhancementNote } from "@/lib/reports/rewrite-enhancement-note";
import { hasBracketPlaceholders } from "@/lib/llm/report-placeholder-policy";

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
  const needsFacts = hasBracketPlaceholders(item.rewrite.better);
  const policy = resolveRewriteCopyPolicy({
    sourceText: resumeText,
    original: item.rewrite.original,
    draft: item.rewrite.better,
  });
  const guidance = isReadOnly
    ? needsFacts
      ? "The brackets mark details missing from the original. Add only what you can verify."
      : "This example uses only the details in the original line."
    : policy.reason === "source_unavailable"
    ? "The original resume is not available in this view, so copying is disabled."
    : policy.reason === "unresolved_placeholders"
      ? "The brackets mark missing details. Add only what you can verify before copying."
      : policy.reason === "unsafe"
        ? "This draft changes or leaves out a detail from your resume, so copying is disabled."
        : "Check the wording, then make it sound like you.";

  const handleCopy = async () => {
    if (!policy.copyable) return;
    await navigator.clipboard.writeText(item.rewrite.better);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <article className="border-t border-[hsl(var(--paper-line))] py-6 first:border-t-0">
      <p className="riyp-type-11px font-semibold uppercase riyp-track-015 text-muted-foreground">
        {item.rewrite.label || `Rewrite ${String(item.originalIndex + 1).padStart(2, "0")}`}
      </p>
      <div className="mt-4 grid gap-px bg-[hsl(var(--paper-line))] md:grid-cols-2">
        <div className="bg-paper-muted px-5 py-5">
          <p className="riyp-type-11px font-semibold uppercase riyp-track-015 text-muted-foreground">Original</p>
          <p className="mt-3 text-sm leading-6 text-foreground/80">{item.rewrite.original}</p>
        </div>
        <div className="bg-brand/[0.065] px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <p className="riyp-type-11px font-semibold uppercase riyp-track-015 text-brand">{needsFacts ? "Draft to complete with your facts" : isReadOnly ? "Example wording" : "Suggested wording"}</p>
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
          <p className="mt-3 font-display text-xl leading-7 text-foreground">{item.rewrite.better}</p>
          <RewriteEnhancementNote note={item.rewrite.enhancement_note} className="mt-4" />
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{guidance}</p>
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
    <section id="section-independent-advice" className="scroll-mt-36 border-t border-foreground/80 py-11 sm:py-14">
      {rewrites.length > 0 && (
        <div>
          <p className="riyp-type-11px font-semibold uppercase riyp-track-017 text-brand">Other suggestions</p>
          <h2 className="mt-3 max-w-[18ch] font-display text-3xl riyp-weight-520 leading-tight text-foreground">A few more lines to consider.</h2>
          <p className="mt-3 max-w-[42rem] text-sm leading-6 text-muted-foreground">
            Consider these suggestions alongside the edits above. Compare each one with its original line.
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
            <p className="riyp-type-11px font-semibold uppercase riyp-track-017">Details to add</p>
          </div>
          <h2 className="mt-3 max-w-[20ch] font-display text-3xl riyp-weight-520 leading-tight text-foreground">Questions only you can answer.</h2>
          <p className="mt-3 max-w-[42rem] text-sm leading-6 text-muted-foreground">Your answers may help fill the gaps. Add a detail only when you know it is accurate.</p>
          <ol className="mt-6 divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
            {questions.map(({ question, originalIndex }) => (
              <li key={`${originalIndex}-${question.question}`} className="grid gap-2 py-5 sm:grid-cols-[2.5rem_1fr]">
                <span className="riyp-tabular-label riyp-type-11px font-semibold text-brand">{String(originalIndex + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-base font-medium leading-7 text-foreground">{question.question}</p>
                  {question.why && <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.why}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
