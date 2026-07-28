"use client";

import { useMemo } from "react";
import { Lock } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { ReportData } from "./ReportTypes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { UnlockValueList } from "@/components/shared/UnlockValueList";

type LedgerItem = {
  id: string;
  evidence: string;
  evidenceSection?: string;
  action: string;
  rationale?: string;
  confidence?: "high" | "medium" | "low";
  impact?: "high" | "medium" | "low";
  effort?: "quick" | "moderate" | "high";
};

const confidenceStyles: Record<NonNullable<LedgerItem["confidence"]>, string> = {
  high: "bg-brand/10 text-brand",
  medium: "bg-muted/50 text-muted-foreground",
  low: "bg-warning/10 text-warning-foreground"
};

const impactStyles: Record<NonNullable<LedgerItem["impact"]>, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-premium/15 text-premium",
  low: "bg-muted/50 text-muted-foreground"
};

const effortStyles: Record<NonNullable<LedgerItem["effort"]>, string> = {
  quick: "bg-success/10 text-success",
  moderate: "bg-muted/50 text-muted-foreground",
  high: "bg-warning/10 text-warning-foreground"
};

interface EvidenceLedgerSectionProps {
  data: ReportData;
  isGated?: boolean;
  onUpgrade?: () => void;
}

function normalizeEvidence(raw: LedgerItem["evidence"]) {
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Evidence not returned for this run.";
}

function normalizeConfidence(value?: string): LedgerItem["confidence"] {
  if (!value) return "low";
  const lowered = value.toLowerCase();
  if (lowered.includes("high")) return "high";
  if (lowered.includes("low")) return "low";
  return "medium";
}

function normalizeImpact(value?: string): LedgerItem["impact"] {
  if (!value) return "low";
  const lowered = value.toLowerCase();
  if (lowered.includes("high")) return "high";
  if (lowered.includes("low")) return "low";
  return "medium";
}

function normalizeEffort(value?: string): LedgerItem["effort"] {
  if (!value) return "high";
  const lowered = value.toLowerCase();
  if (lowered.includes("quick") || lowered.includes("low")) return "quick";
  if (lowered.includes("high") || lowered.includes("heavy")) return "high";
  return "moderate";
}

export function EvidenceLedgerSection({ data, isGated = false, onUpgrade }: EvidenceLedgerSectionProps) {
  const items = useMemo<LedgerItem[]>(() => {
    const fromTopFixes = (data.top_fixes || []).map((fix, index) => {
      const evidence = typeof fix.evidence === "string"
        ? fix.evidence
        : fix.evidence?.excerpt || "";

      return {
        id: `top-fix-${index}`,
        evidence: normalizeEvidence(evidence),
        evidenceSection: typeof fix.evidence === "string" ? fix.section_ref : fix.evidence?.section || fix.section_ref,
        action: fix.fix || "Make a clear, specific edit here.",
        rationale: fix.why || undefined,
        confidence: normalizeConfidence(fix.confidence),
        impact: normalizeImpact(fix.impact_level),
        effort: normalizeEffort(fix.effort)
      };
    });

    if (fromTopFixes.length >= 3) return fromTopFixes;

    const fallbackRewrites = (data.rewrites || []).slice(0, 4).map((rewrite, index) => ({
      id: `rewrite-${index}`,
      evidence: normalizeEvidence(rewrite.original || ""),
        evidenceSection: "Resume",
        action: rewrite.better || "Strengthen this line with specific outcomes.",
        rationale: rewrite.enhancement_note || undefined,
      confidence: "low" as const,
        impact: "medium" as const,
        effort: "moderate" as const
    }));

    return [...fromTopFixes, ...fallbackRewrites].slice(0, 6);
  }, [data.top_fixes, data.rewrites]);

  if (items.length === 0) {
    return (
      <section className="gap-y-6">
        <ReportSectionHeader
          icon={<InsightSparkleIcon className="size-4 text-brand" />}
          number="03"
          title="Evidence Behind the Review"
          subtitle="Each recommendation points back to the resume."
        />
        <div className="border-y border-line bg-paper-muted p-5 text-sm text-muted-foreground">
          The report could not find supporting evidence for this section. Add more detail, then run the review again.
        </div>
      </section>
    );
  }

  const visibleCount = isGated ? Math.min(2, items.length) : items.length;
  const hiddenCount = Math.max(0, items.length - visibleCount);

  return (
    <section className="gap-y-8">
      <ReportSectionHeader
        icon={<InsightSparkleIcon className="size-4 text-brand" />}
        number="03"
        title="Evidence Behind the Review"
        subtitle="Each recommendation points back to the resume."
      />

      <div className="gap-y-6">
        {items.slice(0, visibleCount).map((item, index) => (
          <div
            key={item.id}
            className="border-y border-line bg-background p-5 md:p-6"
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="gap-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Evidence</span>
                  {item.evidenceSection && (
                    <>
                      <span>•</span>
                      <span>{item.evidenceSection}</span>
                    </>
                  )}
                </div>
                <div className="border-l-2 border-line bg-paper-muted p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    “{item.evidence}”
                  </p>
                </div>
                {item.rationale && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground/70">Why it matters:</span> {item.rationale}
                  </p>
                )}
                {item.confidence === "low" && (
                  <p className="border-l-2 border-warning bg-paper-muted px-3 py-2 text-xs leading-relaxed text-warning-foreground">
                    What we need from you: add the missing number, scope, or context before treating this as final.
                  </p>
                )}
              </div>

              <div className="gap-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Action
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.confidence && (
                      <span className={cn("border-l-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider", confidenceStyles[item.confidence])}>
                        Confidence {item.confidence}
                      </span>
                    )}
                    {item.impact && (
                      <span className={cn("border-l-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider", impactStyles[item.impact])}>
                        Impact {item.impact}
                      </span>
                    )}
                    {item.effort && (
                      <span className={cn("border-l-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider", effortStyles[item.effort])}>
                        Effort {item.effort}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-l-2 border-cyan-bright bg-surface-sky p-4">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {item.action}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  Action {String(index + 1).padStart(2, "0")} of {items.length}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isGated && hiddenCount > 0 && (
          <div className="relative gap-y-4 overflow-hidden border-y border-line bg-paper-muted p-6">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-citron" />
            <div className="relative z-10 flex items-center gap-3 text-muted-foreground">
              <Lock className="size-5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {hiddenCount} more fixes waiting
                </p>
                <p className="text-xs text-muted-foreground">
                  The Job Search Pass adds five complete reports for revisions and role comparisons.
                </p>
              </div>
            </div>
            <UnlockValueList
              items={[
                "Confidence on each call",
                "The evidence behind each recommendation",
                "Save and export reports"
              ]}
              dense
              className="relative z-10"
            />
            {onUpgrade && (
              <Button
                variant="premium"
                size="sm"
                className="relative z-10 w-full"
                onClick={() => {
                  saveUnlockContext({ section: "evidence_ledger" });
                  Analytics.paywallCtaClicked("evidence_ledger");
                  onUpgrade();
                }}
              >
                <InsightSparkleIcon className="size-4 mr-2" />
                See all evidence and recommendations
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
