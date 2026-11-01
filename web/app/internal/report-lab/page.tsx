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
  // Constructed case: no saved output has the ranking prompt's "Nothing critical" yet, so this marks the
  // strongest real output's Critical Miss low impact, the way that prompt does (decision D2).
  const strongest = fixtures.find((item) => item.id === "synth_data_scientist_senior_elite_1");
  if (strongest) {
    const [first, ...rest] = strongest.report.top_fixes || [];
    fixtures.push({
      ...strongest,
      id: "nothing-critical",
      label: `nothing critical (constructed from data scientist) · ${strongest.report.score}`,
      report: { ...strongest.report, top_fixes: first ? [{ ...first, impact_level: "low" }, ...rest] : [] },
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
