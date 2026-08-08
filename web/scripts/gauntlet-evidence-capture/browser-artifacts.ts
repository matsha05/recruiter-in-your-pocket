import type { Browser } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  GAUNTLET_FINALIZER_PATH,
  type CandidateBinding,
  type JourneyRun,
  type OutputGenerationReceipt,
  type ReportFinalizationReceipt,
  type Variant,
} from "../../lib/gauntlet/types";
import type {
  GauntletFinalizerInput,
  GauntletFinalizerOutput,
} from "../gauntlet-report-finalizer";
import {
  buildJourneyReceipt,
  buildOutputArtifact,
  canonicalJsonSha256,
  serialize,
  sha256,
} from "./contracts";
import {
  assertRenderedReportReceipt,
  type ArchiveServerIdentity,
} from "./browser-identity";
import {
  captureJourney,
  captureReport,
  type CapturePresentationWithReceipt,
} from "./browser-page";
import type { CapturePlan } from "./repository-plan";
import { runProcess } from "./repository-runtime";

export type MaterializedVariantReport = {
  caseId: string;
  fixtureId: string;
  rawReport: Record<string, unknown>;
  effectiveReport: Record<string, unknown>;
  finalization: ReportFinalizationReceipt;
};

function rawVariantReports(plan: CapturePlan) {
  return new Map(plan.source.results.map((selected) => {
    const rawReportSha256 = canonicalJsonSha256(selected.report);
    const materialized: MaterializedVariantReport = {
      caseId: selected.caseId,
      fixtureId: selected.fixtureId,
      rawReport: selected.report,
      effectiveReport: selected.report,
      finalization: {
        status: "unfinalized_raw",
        forceGrounding: false,
        rawReportSha256,
        effectiveReportSha256: rawReportSha256,
        validator: null,
      },
    };
    return [selected.caseId, materialized] as const;
  }));
}
export function validatedCandidateReports(input: {
  plan: CapturePlan;
  output: GauntletFinalizerOutput;
}) {
  if (input.output.schemaVersion !== "1"
    || input.output.strategy !== "validateResumeModelPayload(forceGrounding=true)"
    || !Array.isArray(input.output.cases)
    || input.output.cases.length !== input.plan.manifest.cases.length) {
    throw new Error("archived candidate finalizer returned an invalid envelope");
  }
  const outputByCase = new Map(input.output.cases.map((entry) => [entry.caseId, entry]));
  if (outputByCase.size !== input.output.cases.length) {
    throw new Error("archived candidate finalizer returned duplicate cases");
  }
  const rawByCase = new Map(input.plan.source.results.map((entry) => [entry.caseId, entry]));
  const materialized = new Map<string, MaterializedVariantReport>();
  for (const testCase of input.plan.manifest.cases) {
    const raw = rawByCase.get(testCase.id);
    const finalized = outputByCase.get(testCase.id);
    if (!raw
      || !finalized
      || finalized.fixtureId !== testCase.fixtureId
      || !finalized.report
      || typeof finalized.report !== "object"
      || Array.isArray(finalized.report)) {
      throw new Error(`archived candidate finalizer omitted or malformed ${testCase.id}`);
    }
    const rawReportSha256 = canonicalJsonSha256(raw.report);
    const effectiveReportSha256 = canonicalJsonSha256(finalized.report);
    if (finalized.rawReportSha256 !== rawReportSha256
      || finalized.effectiveReportSha256 !== effectiveReportSha256) {
      throw new Error(`archived candidate finalizer receipt mismatch for ${testCase.id}`);
    }
    materialized.set(testCase.id, {
      caseId: testCase.id,
      fixtureId: testCase.fixtureId,
      rawReport: raw.report,
      effectiveReport: finalized.report,
      finalization: {
        status: "finalized",
        forceGrounding: true,
        rawReportSha256,
        effectiveReportSha256,
        validator: input.plan.candidateValidator,
      },
    });
  }
  if (outputByCase.size !== materialized.size) {
    throw new Error("archived candidate finalizer returned an unknown case");
  }
  return materialized;
}

export async function materializeVariantReports(input: {
  plan: CapturePlan;
  variant: Variant;
  webRoot: string;
  environment: NodeJS.ProcessEnv;
  temporaryRoot: string;
}) {
  if (input.variant === "production") return rawVariantReports(input.plan);
  const finalizerInput: GauntletFinalizerInput = {
    schemaVersion: "1",
    cases: input.plan.manifest.cases.map((testCase) => {
      const selected = input.plan.source.results.find((entry) => entry.caseId === testCase.id);
      const fixture = input.plan.fixtureBytes.get(testCase.id);
      if (!selected || !fixture) throw new Error(`candidate finalizer input is missing ${testCase.id}`);
      return {
        caseId: testCase.id,
        fixtureId: testCase.fixtureId,
        resumeText: fixture.toString("utf8"),
        report: selected.report,
      };
    }),
  };
  const inputPath = path.join(input.temporaryRoot, "candidate-finalizer-input.json");
  const outputPath = path.join(input.temporaryRoot, "candidate-finalizer-output.json");
  await writeFile(inputPath, serialize(finalizerInput), { flag: "wx" });
  const archivedFinalizerPath = GAUNTLET_FINALIZER_PATH.replace(/^web\//, "");
  await runProcess({
    command: process.execPath,
    args: [
      "scripts/run-ts-script.cjs",
      archivedFinalizerPath,
      `--input=${inputPath}`,
      `--output=${outputPath}`,
    ],
    cwd: input.webRoot,
    env: input.environment,
    label: "archived candidate report finalizer",
    timeoutMs: 120_000,
  });
  const output = JSON.parse(await readFile(outputPath, "utf8")) as GauntletFinalizerOutput;
  return validatedCandidateReports({ plan: input.plan, output });
}

export async function captureAndBuildOutputArtifact(input: {
  iterationId: string;
  caseId: string;
  variant: Variant;
  binding: CandidateBinding;
  generation: OutputGenerationReceipt;
  fixtureSha256: string;
  materialized: MaterializedVariantReport;
  archiveIdentity: ArchiveServerIdentity;
  screenshotPath: string;
  capture: (report: Record<string, unknown>) => Promise<CapturePresentationWithReceipt>;
}) {
  const browserReport = input.materialized.effectiveReport;
  const presentation = await input.capture(browserReport);
  if (canonicalJsonSha256(presentation.captureReceipt.archiveIdentity)
    !== canonicalJsonSha256(input.archiveIdentity)) {
    throw new Error(`${input.variant}/${input.caseId}: capture archive identity receipt mismatch`);
  }
  assertRenderedReportReceipt({
    receipt: presentation.captureReceipt.renderedReport,
    identity: input.archiveIdentity,
    caseId: input.caseId,
    effectiveReport: browserReport,
  });
  const artifact = buildOutputArtifact({
    iterationId: input.iterationId,
    caseId: input.caseId,
    variant: input.variant,
    binding: input.binding,
    generation: input.generation,
    finalization: input.materialized.finalization,
    fixtureSha256: input.fixtureSha256,
    rawReport: input.materialized.rawReport,
    effectiveReport: browserReport,
    presentation,
    screenshotPath: input.screenshotPath,
  });
  return { artifact, presentation, browserReport };
}

export async function writeVariantOutputs(input: {
  plan: CapturePlan;
  browser: Browser;
  origin: string;
  variant: Variant;
  archiveIdentity: ArchiveServerIdentity;
  artifactRoot: string;
  reports: Map<string, MaterializedVariantReport>;
}) {
  const binding = input.plan[input.variant];
  for (const testCase of input.plan.manifest.cases) {
    const selected = input.reports.get(testCase.id);
    const fixture = input.plan.fixtureBytes.get(testCase.id);
    if (!selected || !fixture) throw new Error(`capture inputs are missing for ${testCase.id}`);
    const resumeText = fixture.toString("utf8");
    const screenshotPath = `presentations/${input.variant}/${testCase.id}.jpg`;
    const rawReportSha256 = canonicalJsonSha256(selected.rawReport);
    const { artifact, presentation } = await captureAndBuildOutputArtifact({
      iterationId: input.plan.iterationId,
      caseId: testCase.id,
      variant: input.variant,
      binding,
      generation: {
        sourceCommit: input.plan.sourceCommit,
        sanitizedOutput: { path: input.plan.sourcePath, sha256: sha256(input.plan.sourceBytes) },
        runId: input.plan.source.sourceRun.runId,
        fixtureId: testCase.fixtureId,
        generatedAt: input.plan.source.sourceRun.generatedAt,
        model: input.plan.source.sourceRun.model,
        canonicalPromptSha256: input.plan.source.sourceRun.canonicalPromptSha256,
        reportSha256: rawReportSha256,
      },
      fixtureSha256: sha256(fixture),
      materialized: selected,
      archiveIdentity: input.archiveIdentity,
      screenshotPath,
      capture: (effectiveReport) => captureReport({
        browser: input.browser,
        origin: input.origin,
        archiveIdentity: input.archiveIdentity,
        testCase,
        report: effectiveReport,
        resumeText,
      }),
    });
    await mkdir(path.join(input.artifactRoot, `presentations/${input.variant}`), { recursive: true });
    await writeFile(path.join(input.artifactRoot, screenshotPath), presentation.screenshot);
    await mkdir(path.join(input.artifactRoot, `outputs/${input.variant}`), { recursive: true });
    await writeFile(path.join(input.artifactRoot, `outputs/${input.variant}/${testCase.id}.json`), serialize(artifact));
  }
}

export async function writeJourneys(input: {
  plan: CapturePlan;
  browser: Browser;
  origin: string;
  archiveIdentity: ArchiveServerIdentity;
  artifactRoot: string;
  reports: Map<string, MaterializedVariantReport>;
}) {
  const firstCase = input.plan.manifest.cases[0];
  const selected = input.reports.get(firstCase.id);
  if (!selected) throw new Error(`candidate journey report is missing for ${firstCase.id}`);
  const resumeText = input.plan.fixtureBytes.get(firstCase.id)!.toString("utf8");
  await mkdir(path.join(input.artifactRoot, "journeys/evidence"), { recursive: true });
  for (const journey of input.plan.manifest.requiredJourneys) {
    const capture = await captureJourney({
      browser: input.browser,
      origin: input.origin,
      archiveIdentity: input.archiveIdentity,
      caseId: firstCase.id,
      journey,
      report: selected.effectiveReport,
      resumeText,
    });
    const files = [
      { kind: "screenshot" as const, suffix: "screenshot.jpg", data: capture.screenshot },
      { kind: "dom" as const, suffix: "dom.txt", data: capture.dom },
      { kind: "console" as const, suffix: "console.log", data: capture.consoleLog },
      { kind: "interaction" as const, suffix: "interaction.json", data: capture.interactionLog },
    ];
    const evidence: JourneyRun["evidence"] = [];
    for (const file of files) {
      const relative = `journeys/evidence/${journey.id}-${file.suffix}`;
      await writeFile(path.join(input.artifactRoot, relative), file.data);
      evidence.push({ kind: file.kind, path: relative, sha256: sha256(file.data) });
    }
    const receipt = buildJourneyReceipt({ iterationId: input.plan.iterationId, candidateCommit: input.plan.candidateCommit, capture, evidence });
    await writeFile(path.join(input.artifactRoot, `journeys/${journey.id}.json`), serialize(receipt));
  }
}
