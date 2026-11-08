"use client";

import { useMemo, useState } from "react";
import { ReportLayout } from "@/components/layout/ReportLayout";
import { AskFirst } from "@/components/workspace/report/AskFirst";
import { ReportStream } from "@/components/workspace/report/ReportStream";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { askFirstOffered, buildAskFirstQuestions, composeAskFirstResume, type AskFirstAnswers } from "@/lib/reports/ask-first";

type ReportVariant = "fresh" | "recovered" | "saved" | "sample" | "ask-first";

export interface LabFixture {
  id: string;
  label: string;
  report: ReportData;
  resumeText?: string;
  sample?: boolean;
}

const variants: Array<{ id: ReportVariant; label: string }> = [
  { id: "fresh", label: "Fresh (resume in this visit)" },
  { id: "recovered", label: "Recovered (page reloaded)" },
  { id: "saved", label: "Saved (no resume kept)" },
  { id: "ask-first", label: "Ask first (the questions before the report)" },
];

/** Prototype harness for the signature report (spec 71). Internal only. */
export default function ReportLab({ fixtures, initialId, initialAs }: { fixtures: LabFixture[]; initialId?: string; initialAs?: string }) {
  const [id, setId] = useState(initialId && fixtures.some((item) => item.id === initialId) ? initialId : fixtures[0].id);
  const [as, setAs] = useState<ReportVariant>(initialAs === "saved" || initialAs === "recovered" || initialAs === "ask-first" ? initialAs : "fresh");
  const fixture = fixtures.find((item) => item.id === id) || fixtures[0];
  const variant: ReportVariant = fixture.sample ? "sample" : as;
  // The questions screen shows what the workspace would show for this output; "Write my report" only shows
  // the composed resume here, since the lab never calls the model.
  const questions = useMemo(() => (variant === "ask-first" ? buildAskFirstQuestions(fixture.report) : []), [fixture.report, variant]);
  const [composed, setComposed] = useState<string | null>(null);
  const write = (answers: AskFirstAnswers) => setComposed(composeAskFirstResume(fixture.resumeText || "", questions, answers).text);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-line bg-card" data-lab-toolbar>
        <div className="mx-auto flex max-w-[75rem] flex-wrap items-center gap-3 px-4 py-2 text-sm">
          <span className="font-semibold">Report Lab</span>
          <label className="flex min-w-0 max-w-full items-center gap-2">
            <span className="sr-only">Fixture</span>
            <select className="min-h-11 w-full min-w-0 rounded-md border border-control-line bg-card px-2" value={id} onChange={(event) => { setId(event.target.value); setComposed(null); }}>
              {fixtures.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          {!fixture.sample && (
            <label className="flex min-w-0 max-w-full items-center gap-2">
              <span className="sr-only">State</span>
              <select className="min-h-11 w-full min-w-0 rounded-md border border-control-line bg-card px-2" value={as} onChange={(event) => { setAs(event.target.value as ReportVariant); setComposed(null); }}>
                {variants.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          )}
          {variant === "ask-first" && (
            <span className="text-muted-foreground" data-testid="lab-ask-first-offered">
              {askFirstOffered(fixture.report) ? "The workspace would ask first for this output." : "The workspace would show the report straight away for this output; the questions are shown here for layout only."}
            </span>
          )}
        </div>
      </div>
      {variant === "ask-first" ? (
        composed === null ? (
          <ReportLayout mobileReading>
            <AskFirst key={fixture.id} report={fixture.report} questions={questions} resumeText={fixture.resumeText} onWrite={write} onSkip={() => setAs("fresh")} />
          </ReportLayout>
        ) : (
          <div className="mx-auto max-w-[48rem] px-4 py-8" data-testid="lab-composed-resume">
            <p className="text-small font-semibold">The resume the report would be written from.</p>
            <pre className="mt-4 whitespace-pre-wrap font-body text-body">{composed}</pre>
          </div>
        )
      ) : (
        <ReportLayout mobileReading>
          <ReportStream
            key={`${fixture.id}-${variant}`}
            report={fixture.report}
            resumeText={variant === "fresh" ? fixture.resumeText : undefined}
            resumeSource={variant === "fresh" ? "attached" : variant}
            isSample={variant === "sample"}
            onStartReport={() => undefined}
            onStartRevision={() => undefined}
            onReadAgainstPosting={() => undefined}
          />
        </ReportLayout>
      )}
    </div>
  );
}
