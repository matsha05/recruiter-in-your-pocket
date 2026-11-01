"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/layout/ReportLayout";
import { ReportStream } from "@/components/workspace/report/ReportStream";
import type { ReportData } from "@/components/workspace/report/ReportTypes";

type ReportVariant = "fresh" | "recovered" | "saved" | "sample";

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
];

/** Prototype harness for the signature report (spec 71). Internal only. */
export default function ReportLab({ fixtures, initialId, initialAs }: { fixtures: LabFixture[]; initialId?: string; initialAs?: string }) {
  const [id, setId] = useState(initialId && fixtures.some((item) => item.id === initialId) ? initialId : fixtures[0].id);
  const [as, setAs] = useState<ReportVariant>(initialAs === "saved" || initialAs === "recovered" ? initialAs : "fresh");
  const fixture = fixtures.find((item) => item.id === id) || fixtures[0];
  const variant: ReportVariant = fixture.sample ? "sample" : as;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-line bg-card" data-lab-toolbar>
        <div className="mx-auto flex max-w-[75rem] flex-wrap items-center gap-3 px-4 py-2 text-sm">
          <span className="font-semibold">Report Lab</span>
          <label className="flex items-center gap-2">
            <span className="sr-only">Fixture</span>
            <select className="min-h-11 rounded-md border border-control-line bg-card px-2" value={id} onChange={(event) => setId(event.target.value)}>
              {fixtures.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          {!fixture.sample && (
            <label className="flex items-center gap-2">
              <span className="sr-only">State</span>
              <select className="min-h-11 rounded-md border border-control-line bg-card px-2" value={as} onChange={(event) => setAs(event.target.value as ReportVariant)}>
                {variants.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>
      <ReportLayout mobileReading>
        <ReportStream
          key={`${fixture.id}-${variant}`}
          report={fixture.report}
          resumeText={variant === "fresh" ? fixture.resumeText : undefined}
          resumeSource={variant === "fresh" ? "attached" : variant}
          isSample={variant === "sample"}
          onStartReport={() => undefined}
          onStartRevision={() => undefined}
        />
      </ReportLayout>
    </div>
  );
}
