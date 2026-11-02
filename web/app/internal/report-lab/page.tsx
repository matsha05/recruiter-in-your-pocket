import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReportLab, { type LabFixture } from "@/components/internal/report-lab/ReportLab";

export const dynamic = "force-dynamic";

const internalPagesEnabled = () => process.env.NODE_ENV !== "production" || process.env.ALLOW_INTERNAL_PAGES === "true";

export function generateMetadata(): Metadata {
  if (!internalPagesEnabled()) return {};
  return { title: "Report Lab", robots: { index: false, follow: false } };
}

// Real production-prompt outputs (synthetic golden resumes), as the eval harness saved them.
function loadFixtures(): LabFixture[] {
  const root = process.cwd();
  const outputs = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/report-integrity/live-outputs-83b2a2d1.json"), "utf8"));
  const golden = path.join(root, "..", "tests/resumes/golden");
  const files = fs.readdirSync(golden);
  const seen = new Map<string, number>();
  const fixtures: LabFixture[] = outputs.runs.map((run: { fixture_id: string; score: number; report: LabFixture["report"] }) => {
    const prefix = run.fixture_id.replace(/_1$/u, "_");
    const file = files.find((name) => name.startsWith(prefix));
    const count = (seen.get(run.fixture_id) || 0) + 1;
    seen.set(run.fixture_id, count);
    return {
      id: count > 1 ? `${run.fixture_id}~${count}` : run.fixture_id,
      label: `${run.fixture_id.replace(/^synth_/u, "").replace(/_1$/u, "").replace(/_/gu, " ")}${count > 1 ? ` (run ${count})` : ""} · ${run.score}`,
      report: run.report,
      resumeText: file ? fs.readFileSync(path.join(golden, file), "utf8") : undefined,
    };
  });
  // The severity check's flags, set by hand to lay out each count. They aren't a read of this resume.
  const weak = fixtures.find((item) => item.id === "synth_finance_analyst_senior_weak_1");
  if (weak) {
    const flagged = (count: number, more = false): LabFixture => ({
      ...weak,
      id: `${weak.id}~critical-${more ? "more" : count}`,
      label: `${weak.label} · ${more ? "more than three" : count} critical (layout only)`,
      report: { ...weak.report, top_fixes: (weak.report.top_fixes || []).map((fix, index) => ({ ...fix, critical: index < count })), more_critical: more },
    });
    const absent = flagged(2);
    fixtures.push(flagged(1), flagged(2), flagged(3), flagged(3, true), {
      ...absent,
      id: `${weak.id}~critical-absent`,
      label: `${weak.label} · 2 critical, the second a missing summary (layout only)`,
      report: {
        ...absent.report,
        top_fixes: (absent.report.top_fixes || []).map((fix, index) => (index === 1 ? { ...fix, evidence: { section: "Summary", excerpt: "No summary section present" } } : fix)),
      },
    });
  }
  const sample = JSON.parse(fs.readFileSync(path.join(root, "public/sample-report.json"), "utf8"));
  fixtures.push({ id: "sample", label: `sample report (fictional) · ${sample.score}`, report: sample, sample: true });
  return fixtures;
}

export default async function ReportLabPage({ searchParams }: { searchParams: Promise<{ fixture?: string; as?: string }> }) {
  if (!internalPagesEnabled()) notFound();
  const { fixture, as } = await searchParams;
  return <ReportLab fixtures={loadFixtures()} initialId={fixture} initialAs={as} />;
}
