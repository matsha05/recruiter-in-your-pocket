"use client";

import { useState } from "react";
import AnalysisScanning from "@/components/workspace/AnalysisScanning";
import { ReadComparison } from "@/components/workspace/report/ReadComparison";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import rhythm from "@/components/materials/Rhythm.module.css";
import sampleReport from "@/public/sample-report.json";

/** The wait screen as it stands, frozen at the writing stage, on Jordan's resume. */
export function WaitMock({ resumeText }: { resumeText: string }) {
    const [startedAt] = useState(() => Date.now() - 41_000);
    return (
        <div className={rhythm.page}>
            <AnalysisScanning stage="writing" startedAt={startedAt} resumeText={resumeText} onCancel={() => undefined} />
        </div>
    );
}

/** The re-check comparison as it stands: the sample report beside a revision with one Critical Miss changed and the score up. */
export function CompareMock() {
    const previous = sampleReport as unknown as ReportData;
    const topFixes = (previous.top_fixes || []).map((fix, index) => index === 0 ? { ...fix, fix: "Add what changed after the monthly renewal-risk reviews: the renewal rate before and after, or the accounts saved.", text: "Add what changed after the monthly renewal-risk reviews." } : fix);
    const current = { ...previous, score: 86, score_label: "Clear and specific", top_fixes: topFixes } as ReportData;
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <ReadComparison previous={previous} current={current} />
            </section>
        </div>
    );
}
