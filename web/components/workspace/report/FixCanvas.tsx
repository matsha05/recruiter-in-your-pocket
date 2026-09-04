"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BracketsAngle,
  Check,
  Copy,
  LockKey,
  MinusCircle,
  PencilSimple,
} from "@phosphor-icons/react";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveUniqueSourceLine, type VerifiedFact } from "@/lib/llm/source-fidelity";
import {
  bracketPlaceholderKeys,
  normalizeCompatibilityBrackets,
  replaceBracketPlaceholders,
} from "@/lib/llm/report-placeholder-policy";
import { resolveRewriteCopyPolicy } from "@/lib/reports/report-presentation";
import { RewriteEnhancementNote } from "@/lib/reports/rewrite-enhancement-note";
import type { ReportData } from "./ReportTypes";

type Fix = NonNullable<ReportData["top_fixes"]>[number];
type Rewrite = NonNullable<ReportData["rewrites"]>[number];

const fixTrace = [
  { label: "Original" },
  { label: "What's missing" },
  { label: "Your details" },
  { label: "Revised wording" },
];

export function evidenceFor(fix?: Fix) {
  if (!fix?.evidence) return undefined;
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt;
}

function sectionFor(fix?: Fix) {
  if (!fix?.evidence) return fix?.section_ref;
  return typeof fix.evidence === "string" ? fix.section_ref : fix.evidence.section || fix.section_ref;
}

function placeholderLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function copyGuidance(reason: ReturnType<typeof resolveRewriteCopyPolicy>["reason"]) {
  if (reason === "source_unavailable") {
    return "The original resume is not available in this view, so copying is disabled.";
  }
  if (reason === "unresolved_placeholders") {
    return "The brackets mark missing details. Add only what you can verify before copying.";
  }
  if (reason === "unsafe") {
    return "This draft changes or leaves out a detail from your resume. Check it against the original before copying.";
  }
  return "Check the wording, then make it sound like you.";
}

export function FixCanvas({
  fix,
  rewrite,
  index,
  locked,
  onUnlock,
  resumeText,
  isSample = false,
}: {
  fix: Fix;
  rewrite?: Rewrite;
  index: number;
  locked?: boolean;
  onUnlock?: () => void;
  resumeText?: string;
  isSample?: boolean;
}) {
  const evidence = evidenceFor(fix);
  const sourceLocator = rewrite?.original || evidence || "";
  const resolvedSource = useMemo(
    () => resolveUniqueSourceLine(sourceLocator, resumeText),
    [resumeText, sourceLocator],
  );
  const draftSource = resolvedSource.status === "resolved" ? resolvedSource.line : sourceLocator;
  const suggestedLine = normalizeCompatibilityBrackets(rewrite?.better?.trim() || "");
  const hasSuggestedLine = suggestedLine.length > 0;
  const [draft, setDraft] = useState(suggestedLine);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [factValues, setFactValues] = useState<Record<string, string>>({});
  const [factsApplied, setFactsApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const action = fix.fix || fix.text || "Make this part of the resume more specific";
  const placeholderKeys = useMemo(() => bracketPlaceholderKeys(suggestedLine), [suggestedLine]);
  const allRequiredFactsProvided = placeholderKeys.length > 0
    && placeholderKeys.every((key) => factValues[key]?.trim());
  const verifiedFacts = useMemo<VerifiedFact[]>(
    () => placeholderKeys
      .filter((key) => Boolean(factValues[key]?.trim()))
      .map((key) => ({ key, value: factValues[key].trim() })),
    [factValues, placeholderKeys],
  );
  const copyPolicy = useMemo(() => resolveRewriteCopyPolicy({
    sourceText: resumeText,
    original: sourceLocator,
    draft,
    verifiedFacts: factsApplied ? verifiedFacts : [],
  }), [draft, factsApplied, resumeText, sourceLocator, verifiedFacts]);
  const traceProgress = copyPolicy.copyable ? 100 : factsApplied ? 82 : allRequiredFactsProvided ? 68 : 50;

  useEffect(() => {
    setDraft(suggestedLine);
    setFactValues({});
    setFactsApplied(false);
  }, [suggestedLine]);

  const handleCopy = async () => {
    if (!copyPolicy.copyable) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleUseFacts = () => {
    if (!allRequiredFactsProvided) return;
    setDraft(replaceBracketPlaceholders(suggestedLine, (key, match) => (
      factValues[key]?.trim() || match
    )));
    setFactsApplied(true);
    setEditing(true);
  };

  const handleFactChange = (key: string, value: string) => {
    setFactValues((current) => ({ ...current, [key]: value }));
    setFactsApplied(false);
    setDraft(suggestedLine);
  };

  if (locked) {
    return (
      <article className="relative overflow-hidden border-y border-[hsl(var(--paper-line))] py-8">
        <div className="pointer-events-none select-none opacity-20 blur-[3px]">
          <p className="text-xs font-semibold uppercase riyp-track-015 text-brand">Fix {index + 1}</p>
          <div className="mt-4 h-8 w-4/5 bg-foreground/30" />
          <div className="mt-6 h-24 bg-brand/15" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Button variant="premium" onClick={onUnlock}>
            <LockKey className="mr-2 size-4" /> See the full edit plan
          </Button>
        </div>
      </article>
    );
  }

  if (dismissed) {
    return (
      <article className="riyp-border-paper-line border-t py-7 first:border-t-0">
        <div className="flex flex-col gap-4 bg-paper-muted px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MinusCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" weight="duotone" />
            <div>
              <p className="text-sm font-semibold text-foreground">Fix {String(index + 1).padStart(2, "0")} marked not relevant.</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">You can bring this suggestion back at any time.</p>
            </div>
          </div>
          <button type="button" onClick={() => setDismissed(false)} className="min-h-11 self-start px-3 text-xs font-semibold text-brand hover:text-brand/75 sm:self-auto">
            Bring it back
          </button>
        </div>
      </article>
    );
  }

  return (
    <article id={`section-fix-${index + 1}`} className="scroll-mt-36 border-t border-[hsl(var(--paper-line))] py-5 first:border-t-0 sm:py-12">
      <div className="grid gap-3 sm:gap-7 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10">
        <div className="flex items-baseline gap-3 sm:block">
          <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Fix {String(index + 1).padStart(2, "0")}</p>
          <p className="text-xs leading-5 text-muted-foreground sm:mt-2">{index === 0 ? "Start here" : index === 1 ? "Next" : "Then"}</p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h3 className="font-display text-xl riyp-weight-520 leading-[1.2] tracking-[-0.025em] text-foreground sm:max-w-[28ch] sm:text-[clamp(1.85rem,4vw,3rem)] sm:leading-[1.02]">{action}</h3>
            {!isSample && (
              <button type="button" onClick={() => setDismissed(true)} className="min-h-11 shrink-0 self-start px-2 text-xs font-semibold text-muted-foreground hover:text-foreground">Not relevant</button>
            )}
          </div>

          <div className="mt-7 hidden bg-paper-muted/55 px-4 py-4 sm:block sm:px-5">
            <LiftedTrace items={fixTrace} progress={traceProgress} ariaLabel={`How fix ${index + 1} moves from resume evidence to clearer wording`} compact />
          </div>

          {draftSource && (
            <div className="riyp-border-annotation mt-4 border-l-2 pl-4 sm:mt-7 sm:pl-5">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-muted-foreground">
                {sectionFor(fix) ? `Original · ${sectionFor(fix)}` : "Original"}
              </p>
              <p className="mt-2 font-display text-lg leading-[1.625rem] text-foreground/85 sm:text-2xl sm:leading-8">“{draftSource}”</p>
            </div>
          )}

          <div className="mt-5 grid gap-px bg-[hsl(var(--paper-line))] sm:mt-7 sm:grid-cols-2">
            <div className="bg-accent-apricot/20 p-4 sm:p-6">
              <p className="riyp-text-annotation text-[11px] font-semibold uppercase riyp-track-015">What is missing</p>
              <p className="riyp-type-095 mt-2 leading-6 text-foreground/80 sm:mt-3">{fix.why || "This example needs more detail about what you did and what changed."}</p>
            </div>
            <div className="bg-accent-butter/20 p-4 sm:p-6">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-foreground/60">{isSample ? "Details missing from the original" : "Details you can add"}</p>
              {isSample ? (
                placeholderKeys.length > 0 ? (
                  <ul className="riyp-type-095 mt-3 grid list-disc gap-2 pl-5 font-medium leading-6 text-foreground/80">
                    {placeholderKeys.map((key) => <li key={key}>{placeholderLabel(key)}</li>)}
                  </ul>
                ) : (
                  <p className="riyp-type-095 mt-3 font-medium leading-6 text-foreground">This example uses only the details in the original line.</p>
                )
              ) : placeholderKeys.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {placeholderKeys.map((key) => (
                    <label key={key} className="grid gap-1.5 text-xs font-semibold text-foreground/75">
                      <span>{placeholderLabel(key)}</span>
                      <Input
                        type="text"
                        value={factValues[key] || ""}
                        onChange={(event) => handleFactChange(key, event.target.value)}
                        className="min-h-11 w-full border border-foreground/15 bg-paper/80 px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                        placeholder={`Enter ${key}`}
                        aria-label={`Fact for ${key} in fix ${index + 1}`}
                      />
                    </label>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-1 min-h-11 justify-self-start border-brand/30 bg-paper px-4" onClick={handleUseFacts} disabled={!allRequiredFactsProvided}>Keep these facts</Button>
                </div>
              ) : (
                <p className="riyp-type-095 mt-3 font-medium leading-6 text-foreground">Check that the suggestion still describes the work you did.</p>
              )}
            </div>
          </div>

          {hasSuggestedLine ? (
            <div className="mt-px bg-brand/[0.065] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">{placeholderKeys.length > 0 && !factsApplied ? "Draft to complete with your facts" : isSample ? "Example wording" : "Suggested wording"}</p>
                  <p className="mt-1 max-w-xl text-xs text-muted-foreground">{isSample ? (placeholderKeys.length > 0 ? "The brackets mark details missing from the original. Add only what you can verify." : "This example uses only the details in the original line.") : copyGuidance(copyPolicy.reason)}</p>
                </div>
                {!isSample && (
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditing((current) => !current)} className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground">
                      <PencilSimple className="size-4" /> {editing ? "Done" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!copyPolicy.copyable}
                      aria-disabled={!copyPolicy.copyable}
                      title={!copyPolicy.copyable ? copyGuidance(copyPolicy.reason) : undefined}
                      className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold text-brand hover:text-brand/75 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-70"
                    >
                      {!copyPolicy.copyable ? <BracketsAngle className="size-4" /> : copied ? <Check className="size-4" weight="bold" /> : <Copy className="size-4" />}
                      {!copyPolicy.copyable ? (copyPolicy.reason === "source_unavailable" ? "Original resume needed" : "Verify facts to copy") : copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
              {editing && !isSample ? (
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-5 min-h-[8rem] w-full resize-y border border-brand/25 bg-paper px-4 py-3 font-display text-xl leading-8 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20" aria-label={`Edit suggested line ${index + 1}`} />
              ) : (
                <p className="mt-5 max-w-[42rem] font-display text-[1.45rem] riyp-weight-520 leading-[1.35] text-foreground sm:text-[1.7rem]">{draft}</p>
              )}
              <RewriteEnhancementNote note={rewrite?.enhancement_note} className="mt-5" />
            </div>
          ) : (
            <div className="mt-px bg-brand/[0.065] p-5 sm:p-7">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Question to answer</p>
              <p className="mt-3 max-w-[42rem] font-display text-[1.35rem] riyp-weight-520 leading-[1.4] text-foreground sm:text-[1.55rem]">
                What did you do, and what changed as a result?
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                There isn&apos;t enough detail here to suggest a rewrite. Add what you know about the project, your part in it, and the result.
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
