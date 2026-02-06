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
  low: "bg-warning/10 text-warning"
};

const impactStyles: Record<NonNullable<LedgerItem["impact"]>, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-premium/15 text-premium",
  low: "bg-muted/50 text-muted-foreground"
};

const effortStyles: Record<NonNullable<LedgerItem["effort"]>, string> = {
  quick: "bg-success/10 text-success",
  moderate: "bg-muted/50 text-muted-foreground",
  high: "bg-warning/10 text-warning"
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
  if (!value) return "medium";
  const lowered = value.toLowerCase();
  if (lowered.includes("high")) return "high";
  if (lowered.includes("low")) return "low";
  return "medium";
}

function normalizeImpact(value?: string): LedgerItem["impact"] {
  if (!value) return "medium";
  const lowered = value.toLowerCase();
  if (lowered.includes("high")) return "high";
  if (lowered.includes("low")) return "low";
  return "medium";
}

function normalizeEffort(value?: string): LedgerItem["effort"] {
  if (!value) return "moderate";
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
        action: fix.fix || "Add a clear, evidence-backed edit.",
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
      action: rewrite.better || "Upgrade the line with specific outcomes.",
      rationale: rewrite.enhancement_note || undefined,
      confidence: "medium" as const,
      impact: "medium" as const,
      effort: "moderate" as const
    }));

    return [...fromTopFixes, ...fallbackRewrites].slice(0, 6);
  }, [data.top_fixes, data.rewrites]);

  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <ReportSectionHeader
          icon={<InsightSparkleIcon className="w-4 h-4 text-brand" />}
          number="03"
          title="Evidence Ledger"
          subtitle="Every recommendation tied to the exact line that triggered it."
        />
        <div className="rounded border border-border/60 bg-secondary/10 p-5 text-sm text-muted-foreground">
          Evidence ledger unavailable for this run. Try again or add more detail for stronger evidence extraction.
        </div>
      </section>
    );
  }

  const visibleCount = isGated ? Math.min(2, items.length) : items.length;
  const hiddenCount = Math.max(0, items.length - visibleCount);

  return (
    <section className="space-y-8">
      <ReportSectionHeader
        icon={<InsightSparkleIcon className="w-4 h-4 text-brand" />}
        number="03"
        title="Evidence Ledger"
        subtitle="Every recommendation tied to the exact line that triggered it."
      />

      <div className="space-y-6">
        {items.slice(0, visibleCount).map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border border-border/60 bg-card p-5 md:p-6"
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Evidence</span>
                  {item.evidenceSection && (
                    <>
                      <span>•</span>
                      <span>{item.evidenceSection}</span>
                    </>
                  )}
                </div>
                <div className="rounded border border-border/50 bg-secondary/10 p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    “{item.evidence}”
                  </p>
                </div>
                {item.rationale && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground/70">Why it matters:</span> {item.rationale}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Action
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.confidence && (
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", confidenceStyles[item.confidence])}>
                        Confidence {item.confidence}
                      </span>
                    )}
                    {item.impact && (
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", impactStyles[item.impact])}>
                        Impact {item.impact}
                      </span>
                    )}
                    {item.effort && (
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", effortStyles[item.effort])}>
                        Effort {item.effort}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded border border-brand/20 bg-brand/5 p-4">
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
          <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/70 to-card" />
            <div className="relative z-10 flex items-center gap-3 text-muted-foreground">
              <Lock className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {hiddenCount} more evidence-linked actions
                </p>
                <p className="text-xs text-muted-foreground">
                  Unlock to see the remaining evidence and rewrite guidance.
                </p>
              </div>
            </div>
            <UnlockValueList
              items={[
                "Confidence + impact tags on every action",
                "Rewrite guidance tied to your lines",
                "Save and export the full ledger"
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
                <InsightSparkleIcon className="w-4 h-4 mr-2" />
                Unlock the Evidence Ledger
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
