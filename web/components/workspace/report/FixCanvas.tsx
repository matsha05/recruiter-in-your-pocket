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
import { resolveRewriteCopyPolicy } from "@/lib/reports/report-presentation";
import type { ReportData } from "./ReportTypes";

type Fix = NonNullable<ReportData["top_fixes"]>[number];
type Rewrite = NonNullable<ReportData["rewrites"]>[number];

const fixTrace = [
  { label: "On the page" },
  { label: "Open question" },
  { label: "Your fact" },
  { label: "Clearer wording" },
];

export function evidenceFor(fix?: Fix) {
  if (!fix?.evidence) return undefined;
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt;
}

function sectionFor(fix?: Fix) {
  if (!fix?.evidence) return fix?.section_ref;
  return typeof fix.evidence === "string" ? fix.section_ref : fix.evidence.section || fix.section_ref;
}

function placeholderKeysFor(value: string) {
  return Array.from(new Set(Array.from(value.matchAll(/\[([^\]]+)\]/gu), (match) => match[1].trim())));
}

function placeholderLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function copyGuidance(reason: ReturnType<typeof resolveRewriteCopyPolicy>["reason"]) {
  if (reason === "source_unavailable") {
    return "Copy is unavailable because this view does not include the source resume. This rewrite stays read-only.";
  }
  if (reason === "unresolved_placeholders") {
    return "Add every bracketed fact from your actual work before copying.";
  }
  if (reason === "unsafe") {
    return "This draft changes or drops source facts. Keep it as guidance until the wording matches the resume evidence.";
  }
  return "Source facts are preserved. Edit the sentence until it sounds like you.";
}

export function FixCanvas({
  fix,
  rewrite,
  index,
  locked,
  onUnlock,
  resumeText,
}: {
  fix: Fix;
  rewrite?: Rewrite;
  index: number;
  locked?: boolean;
  onUnlock?: () => void;
  resumeText?: string;
}) {
  const evidence = evidenceFor(fix);
  const sourceLocator = rewrite?.original || evidence || "";
  const resolvedSource = useMemo(
    () => resolveUniqueSourceLine(sourceLocator, resumeText),
    [resumeText, sourceLocator],
  );
  const draftSource = resolvedSource.status === "resolved" ? resolvedSource.line : sourceLocator;
  const suggestedLine = rewrite?.better?.trim() || "";
  const hasSuggestedLine = suggestedLine.length > 0;
  const [draft, setDraft] = useState(suggestedLine);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [factValues, setFactValues] = useState<Record<string, string>>({});
  const [factsApplied, setFactsApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const action = fix.fix || fix.text || "Make this part of the resume more specific";
  const placeholderKeys = useMemo(() => placeholderKeysFor(suggestedLine), [suggestedLine]);
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
    setDraft(suggestedLine.replace(/\[([^\]]+)\]/gu, (match, rawKey: string) => {
      return factValues[rawKey.trim()]?.trim() || match;
    }));
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
              <p className="mt-1 text-xs leading-5 text-muted-foreground">The report is advice, not an instruction. Keep the call that matches your actual work.</p>
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
    <article id={`section-fix-${index + 1}`} className="scroll-mt-36 border-t border-[hsl(var(--paper-line))] py-9 first:border-t-0 sm:py-12">
      <div className="grid gap-7 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Fix {String(index + 1).padStart(2, "0")}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{index === 0 ? "Start here" : index === 1 ? "Then this" : "One more pass"}</p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="max-w-[28ch] font-display text-[clamp(1.85rem,4vw,3rem)] riyp-weight-520 leading-[1.02] tracking-[-0.025em] text-foreground">{action}</h3>
            <button type="button" onClick={() => setDismissed(true)} className="min-h-11 shrink-0 self-start px-2 text-xs font-semibold text-muted-foreground hover:text-foreground">Not relevant</button>
          </div>

          <div className="mt-7 bg-paper-muted/55 px-4 py-4 sm:px-5">
            <LiftedTrace items={fixTrace} progress={traceProgress} ariaLabel={`How fix ${index + 1} moves from resume evidence to clearer wording`} compact />
          </div>

          {draftSource && (
            <div className="riyp-border-annotation mt-7 border-l-2 pl-4 sm:pl-5">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-muted-foreground">
                {sectionFor(fix) ? `On the page · ${sectionFor(fix)}` : "On the page"}
              </p>
              <p className="mt-2 font-display text-xl leading-7 text-foreground/85 sm:text-2xl sm:leading-8">“{draftSource}”</p>
            </div>
          )}

          <div className="mt-7 grid gap-px bg-[hsl(var(--paper-line))] sm:grid-cols-2">
            <div className="bg-accent-apricot/20 p-5 sm:p-6">
              <p className="riyp-text-annotation text-[11px] font-semibold uppercase riyp-track-015">What is missing</p>
              <p className="mt-3 text-[0.95rem] leading-6 text-foreground/80">{fix.why || "The resume asks the reader to guess at the scope, the decision, or the result."}</p>
            </div>
            <div className="bg-accent-butter/20 p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-foreground/60">Facts to verify</p>
              {placeholderKeys.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {placeholderKeys.map((key) => (
                    <label key={key} className="grid gap-1.5 text-xs font-semibold text-foreground/75">
                      <span>{placeholderLabel(key)}</span>
                      <Input
                        type="text"
                        value={factValues[key] || ""}
                        onChange={(event) => handleFactChange(key, event.target.value)}
                        className="min-h-11 w-full border border-foreground/15 bg-paper/80 px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                        placeholder={`Add the ${key} from your actual work`}
                        aria-label={`Fact for ${key} in fix ${index + 1}`}
                      />
                    </label>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-1 min-h-11 justify-self-start border-brand/30 bg-paper px-4" onClick={handleUseFacts} disabled={!allRequiredFactsProvided}>Keep these facts</Button>
                </div>
              ) : (
                <p className="mt-3 text-[0.95rem] font-medium leading-6 text-foreground">This suggestion should use only the facts in the source line.</p>
              )}
            </div>
          </div>

          {hasSuggestedLine ? (
            <div className="mt-px bg-brand/[0.065] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Try this</p>
                  <p className="mt-1 max-w-xl text-xs text-muted-foreground">{copyGuidance(copyPolicy.reason)}</p>
                </div>
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
                    {!copyPolicy.copyable ? (copyPolicy.reason === "source_unavailable" ? "Source needed to copy" : "Verify facts to copy") : copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              {editing ? (
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-5 min-h-[8rem] w-full resize-y border border-brand/25 bg-paper px-4 py-3 font-display text-xl leading-8 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20" aria-label={`Edit suggested line ${index + 1}`} />
              ) : (
                <p className="mt-5 max-w-[42rem] font-display text-[1.45rem] riyp-weight-520 leading-[1.35] text-foreground sm:text-[1.7rem]">{draft}</p>
              )}
            </div>
          ) : (
            <div className="mt-px bg-brand/[0.065] p-5 sm:p-7">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Question to answer</p>
              <p className="mt-3 max-w-[42rem] font-display text-[1.35rem] riyp-weight-520 leading-[1.4] text-foreground sm:text-[1.55rem]">
                What result or scope can you verify for this work?
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                No source-safe rewrite is attached to this fix. Keep the quoted line as your boundary and add only facts you can verify.
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
