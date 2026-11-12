"use client";

import { ReportData } from "./report/ReportTypes";
import { ReadComparison } from "./report/ReadComparison";
import { WorklistComparison } from "./report/worklist/WorklistComparison";
import { isWorklistReport } from "@/lib/llm/worklist-schema";
import { reportDocumentKind } from "@/lib/reports/report-document";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface ComparisonReport {
    id: string;
    name?: string;
    score: number;
    scoreLabel?: string;
    createdAt: string;
    report: ReportData;
    jdPreview?: string | null;
    targetRole?: string;
    resumeVariant?: string;
}

interface VersionComparisonViewProps {
    reportA: ComparisonReport;
    reportB: ComparisonReport;
    onClose: () => void;
}

/** Compares two saved reports with the same view people see right after a revision. */
export function VersionComparisonView({ reportA, reportB, onClose }: VersionComparisonViewProps) {
    const older = new Date(reportA.createdAt) < new Date(reportB.createdAt) ? reportA : reportB;
    const newer = older === reportA ? reportB : reportA;
    const label = (report: ComparisonReport) =>
        report.name || new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0">
                <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 border-b border-line px-6 py-4 pr-16">
                    <DialogTitle className="text-base font-semibold text-foreground">Compare reports</DialogTitle>
                    <span className="whitespace-nowrap text-sm text-muted-foreground">{label(older)} → {label(newer)}</span>
                </div>
                <DialogDescription className="sr-only">
                    The lines, score and verdict from your earlier report beside the newer one.
                </DialogDescription>
                <div className="flex-1 overflow-y-auto px-6 pt-6">
                    {/* Two worklist reports of the same kind compare line by line; anything else, by what each led with. */}
                    {isWorklistReport(older.report) && isWorklistReport(newer.report) && reportDocumentKind(older.report) === reportDocumentKind(newer.report)
                        ? <WorklistComparison previous={older.report} current={newer.report} earlier={label(older)} />
                        : <ReadComparison previous={{ ...older.report, score: older.score }} current={{ ...newer.report, score: newer.score }} />}
                </div>
            </DialogContent>
        </Dialog>
    );
}
