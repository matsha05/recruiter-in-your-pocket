import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReportLab, { type LabFixture } from "@/components/internal/report-lab/ReportLab";
import { MOCK_WORKLIST_REPORT } from "@/lib/backend/mock-worklist-report";
import { withScreenerText } from "@/lib/reports/screener-text";

export const dynamic = "force-dynamic";

const internalPagesEnabled = () => process.env.NODE_ENV !== "production" || process.env.ALLOW_INTERNAL_PAGES === "true";

export function generateMetadata(): Metadata {
  if (!internalPagesEnabled()) return {};
  return { title: "Report Lab", robots: { index: false, follow: false } };
}

// The worklist report (Nov 6, 2026): the five reports Matt reads, as the live-set runner saved them, plus the mock.
function loadWorklistFixtures(root: string): LabFixture[] {
  const auditDir = path.join(root, "..", "docs/audits/2026-11-worklist-run");
  const cases: Array<{ id: string; label: string; resume: string }> = [
    { id: "worklist-bad", label: "worklist · the bad resume (Mike)", resume: "../2026-11-live-judgment/resumes/h1_bad_resume.txt" },
    { id: "worklist-thin", label: "worklist · the thin resume (Priya)", resume: "../2026-11-live-judgment/resumes/h2_thin_resume.txt" },
    { id: "worklist-strong", label: "worklist · the strong resume (Elena)", resume: "../2026-11-live-judgment/resumes/h3_strong_resume.txt" },
    { id: "worklist-mismatch", label: "worklist · the mismatched posting (data analyst, nursing role)", resume: "../2026-11-live-judgment/resumes/h5_data_analyst.txt" },
    { id: "worklist-tier", label: "worklist · the Google engineer (Maya)", resume: "resumes/t1_google_engineer_maya.txt" },
    { id: "worklist-ready", label: "worklist · the FP&A analyst (synthetic)", resume: "../2026-11-live-judgment/../../../tests/resumes/countcheck/synth_cc_fpa_analyst_strong_1.txt" },
  ];
  const stems: Record<string, string> = { "worklist-bad": "h1_bad_resume", "worklist-thin": "h2_thin_resume", "worklist-strong": "h3_strong_resume", "worklist-mismatch": "h5_mismatched_posting", "worklist-ready": "b25_fpa_analyst_strong", "worklist-tier": "t1_google_engineer_maya" };
  // Each case as the shipped prompt writes it, then as the previous prompt wrote it (the voice update, Nov 6:
  // `-before` is prompt 70e795a1), so a prompt change can be read side by side.
  const passes = [
    { dir: "outputs", idSuffix: "", labelSuffix: "" },
    { dir: "outputs/pass5-70e795a1", idSuffix: "-before", labelSuffix: " · before (70e795a1)" },
  ];
  const fixtures: LabFixture[] = [];
  for (const item of cases) {
    for (const pass of passes) {
      const file = path.join(auditDir, pass.dir, `${stems[item.id]}__run1.json`);
      if (!fs.existsSync(file)) continue;
      const record = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!record.shipped_report) continue;
      const resumePath = path.resolve(auditDir, item.resume);
      fixtures.push({
        id: `${item.id}${pass.idSuffix}`,
        label: `${item.label} · ${record.shipped_report.score}${pass.labelSuffix}`,
        report: record.shipped_report,
        resumeText: fs.existsSync(resumePath) ? fs.readFileSync(resumePath, "utf8") : undefined,
      });
    }
  }
  fixtures.push(...loadStrongFixtures(root));
  fixtures.push(...loadFirstReadFixtures(root));
  fixtures.push({ id: "worklist-mock", label: "worklist · the mock (Alex Rivera) · 66", report: structuredClone(MOCK_WORKLIST_REPORT) as unknown as LabFixture["report"], resumeText: "Alex Rivera\nCustomer Operations\nExperience\nBuilt customer workflows in HubSpot for 120 customers.\nDocumented the workflow and trained the support team on customer onboarding.\nRan weekly onboarding reviews with account managers and kept the checklist current." });
  return fixtures;
}

// The first pass (Nov 7, 2026; docs/audits/2026-11-first-read.md): the proposed prompt's reports on the wave's own
// synthetic resumes, each beside the shipped prompt's (`-shipped`), with the screening-text check applied as the
// routes apply it, so the first pass shows every state: no posting, a posting that fits, one that doesn't, hidden text.
const FIRST_READ_PASS = "pr94fix";
function loadFirstReadFixtures(root: string): LabFixture[] {
  const dir = path.join(root, "..", "docs/audits/2026-11-first-read");
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8")) as { cases: Array<{ id: string; resume: string; job_description?: string }> };
  const passes = [
    { dir: `outputs/${FIRST_READ_PASS}/targeted`, idSuffix: "", labelSuffix: "" },
    { dir: "outputs/baseline-shipped", idSuffix: "-shipped", labelSuffix: " · shipped prompt" },
  ];
  const fixtures: LabFixture[] = [];
  for (const item of manifest.cases) {
    const resumeText = fs.readFileSync(path.join(dir, item.resume), "utf8");
    const posting = item.job_description ? fs.readFileSync(path.join(dir, item.job_description), "utf8") : null;
    for (const pass of passes) {
      const file = path.join(dir, pass.dir, `${item.id}__run1.json`);
      if (!fs.existsSync(file)) continue;
      const record = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!record.shipped_report) continue;
      fixtures.push({
        id: `first-read-${item.id}${pass.idSuffix}`,
        label: `first read · ${item.id.replace(/^fr\d+[a-z]?_/u, "").replace(/_/gu, " ")} · ${record.shipped_report.score}${pass.labelSuffix}`,
        report: withScreenerText(record.shipped_report, resumeText, posting),
        resumeText,
      });
    }
  }
  // The longest first pass (a reviewer's ask, Nov 7): a posting that doesn't fit and hidden text together. Layout only:
  // the mismatch report with the hidden-text resume's findings attached.
  const mismatch = fixtures.find((item) => item.id === "first-read-fr01c_backend_ic_manager_posting");
  const hidden = fixtures.find((item) => item.id === "first-read-fr07_hidden_text");
  const findings = (hidden?.report as { screener_text?: unknown } | undefined)?.screener_text;
  if (mismatch && findings) {
    fixtures.push({ ...mismatch, id: "first-read-posting-and-hidden-text", label: "first read · a posting and hidden text (layout only)", report: { ...mismatch.report, screener_text: findings } as LabFixture["report"] });
  }
  return fixtures;
}

// Strong resumes (Nov 7, 2026): the same report with optional upgrades, beside the shipped prompt's (`-shipped`).
const UPGRADES_PASS = "upgrades3";
const STRONG_CASES = ["h3_strong_resume", "b25_fpa_analyst_strong", "b27_backend_engineer_senior", "b02_teacher", "b24_physical_therapist_strong", "b04_retail_store_manager"];
function loadStrongFixtures(root: string): LabFixture[] {
  const runDir = path.join(root, "..", "docs/audits/2026-11-worklist-run");
  const outDir = path.join(root, "..", "docs/audits/2026-11-first-read/outputs");
  const manifest = JSON.parse(fs.readFileSync(path.join(runDir, "manifest.json"), "utf8")) as { cases: Array<{ id: string; resume: string }> };
  const fixtures: LabFixture[] = [];
  for (const id of STRONG_CASES) {
    const item = manifest.cases.find((entry) => entry.id === id);
    if (!item) continue;
    const resumePath = path.resolve(runDir, item.resume);
    const resumeText = fs.existsSync(resumePath) ? fs.readFileSync(resumePath, "utf8") : undefined;
    for (const pass of [{ dir: `${UPGRADES_PASS}/fullset`, suffix: "", label: "" }, { dir: "shipped-redraw/fullset", suffix: "-shipped", label: " · shipped prompt" }]) {
      const file = path.join(outDir, pass.dir, `${id}__run1.json`);
      if (!fs.existsSync(file)) continue;
      const record = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!record.shipped_report) continue;
      fixtures.push({ id: `strong-${id}${pass.suffix}`, label: `strong · ${id.replace(/^[a-z]\d+_/u, "").replace(/_/gu, " ")} · ${record.shipped_report.score}${pass.label}`, report: record.shipped_report, resumeText });
    }
  }
  return fixtures;
}

// The LinkedIn profile review (Nov 10, 2026; docs/audits/2026-11-linkedin-review/): linkedin_v3.txt's reviews of the
// made-up exports in tests/fixtures/linkedin, as scripts/run-linkedin-reviews.ts saved them from the live model.
function loadLinkedInFixtures(root: string): LabFixture[] {
  const outDir = path.join(root, "..", "docs/audits/2026-11-linkedin-review/outputs");
  if (!fs.existsSync(outDir)) return [];
  return fs.readdirSync(outDir).filter((name) => name.endsWith(".json") && !name.endsWith(".failed.json")).sort().map((name) => {
    const record = JSON.parse(fs.readFileSync(path.join(outDir, name), "utf8"));
    const stem = name.replace(/\.json$/u, "");
    const profilePath = path.join(root, "tests/fixtures/linkedin", `${stem}.txt`);
    return {
      id: `linkedin-${stem}`,
      label: `linkedin · ${stem.replace(/^\d+-/u, "").replace(/-/gu, " ")} · ${record.report.score}`,
      report: record.report,
      resumeText: fs.existsSync(profilePath) ? fs.readFileSync(profilePath, "utf8") : undefined,
    };
  });
}

// Tailoring to a posting (Nov 10, 2026; docs/audits/2026-11-posting-tailoring/): the resume prompt's reads of the
// first-read wave's synthetic resume-and-posting pairs, as scripts/run-posting-reads.ts saved them from the live model.
function loadTailoringFixtures(root: string): LabFixture[] {
  const outDir = path.join(root, "..", "docs/audits/2026-11-posting-tailoring/outputs");
  const inputs = path.join(root, "..", "docs/audits/2026-11-first-read/resumes");
  if (!fs.existsSync(outDir)) return [];
  return fs.readdirSync(outDir).filter((name) => name.endsWith(".json")).sort().map((name) => {
    const record = JSON.parse(fs.readFileSync(path.join(outDir, name), "utf8"));
    const resumePath = path.join(inputs, String(record.resume || ""));
    return {
      id: `tailor-${record.id}`,
      label: `tailor · ${String(record.id).replace(/-/gu, " ")} · ${record.report.score}`,
      report: record.report,
      resumeText: record.resume && fs.existsSync(resumePath) ? fs.readFileSync(resumePath, "utf8") : undefined,
    };
  });
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
  // Kevin as the live product reads him (Nov 2 golden severity run): the dated gap and the daily-tasks line
  // flagged after the first fix, which puts him on the bottom rung and gives the ask-first screen its
  // "since" question. Flags and the two added fixes are set by hand from that run, not a read of this resume.
  const kevin = fixtures.filter((item) => item.id.startsWith("synth_operations_manager_entry_weak_1")).sort((a, b) => (a.report.score ?? 0) - (b.report.score ?? 0))[0];
  if (kevin) {
    const first = kevin.report.top_fixes?.[0];
    fixtures.push({
      ...kevin,
      id: "synth_operations_manager_entry_weak_1~live",
      label: `${kevin.label} · as the live product reads it (gap flagged, layout only)`,
      report: {
        ...kevin.report,
        top_fixes: [
          { ...first, critical: true },
          {
            fix: "Add one dated line covering Jul 2023 to today.",
            why: "Operations hiring managers usually look first at what you've done recently. A dated line such as \"Career break\" or \"Job search and coursework\" is enough; list recent operations work or study only if true.",
            confidence: "high",
            evidence: { excerpt: "Feb 2023 - Jul 2023", section: "Experience" },
            impact_level: "high",
            effort: "quick",
            section_ref: "Experience",
            critical: true,
          },
          {
            fix: "In the Greenfield daily operational tasks bullet, add the number of transactions or orders you personally handled, if you can verify it.",
            why: "The Greenfield role shows no size and no result anywhere in its main work.",
            confidence: "high",
            evidence: { excerpt: "- Was responsible for assisting with daily operational tasks.", section: "Experience" },
            impact_level: "high",
            effort: "moderate",
            section_ref: "Experience",
            critical: true,
          },
        ],
      },
    });
  }
  const sample = JSON.parse(fs.readFileSync(path.join(root, "public/sample-report.json"), "utf8"));
  fixtures.push({ id: "sample", label: `sample report (fictional) · ${sample.score}`, report: sample, sample: true });
  // The worklist fixtures lead: they are the report the route writes now; the rest are the v2 shape saved reports keep.
  return [...loadWorklistFixtures(root), ...loadLinkedInFixtures(root), ...loadTailoringFixtures(root), ...fixtures];
}

export default async function ReportLabPage({ searchParams }: { searchParams: Promise<{ fixture?: string; as?: string }> }) {
  if (!internalPagesEnabled()) notFound();
  const { fixture, as } = await searchParams;
  return <ReportLab fixtures={loadFixtures()} initialId={fixture} initialAs={as} />;
}
