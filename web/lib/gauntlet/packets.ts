import { randomInt } from "node:crypto";
import { constants } from "node:fs";
import { access, copyFile, mkdir, mkdtemp, readFile, rename, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  BlindArtifactBinding,
  BlindLabel,
  BlindMapping,
  BlindMappingEntry,
  BlindPacket,
  BlindPresentation,
  GauntletCase,
  PresentationReceipt,
} from "./types";
import { readGitBlob, resolveContainedExistingPath, sha256 } from "./integrity";
import {
  blindArtifactBinding,
  hasCompleteBinding,
  loadValidatedGauntletEvidence,
  type LoadedArtifact,
} from "./progress";

type PreparedPacket = {
  packet: BlindPacket;
  mapping: BlindMappingEntry;
};

function serialize(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function pathExists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function buildBlindPacket(input: {
  iterationId: string;
  testCase: GauntletCase;
  resumeText: string;
  candidatePresentation: BlindPresentation;
  productionPresentation: BlindPresentation;
  candidateArtifact: BlindArtifactBinding;
  productionArtifact: BlindArtifactBinding;
  candidateLabel: BlindLabel;
}): PreparedPacket {
  const productionLabel: BlindLabel = input.candidateLabel === "A" ? "B" : "A";
  const packet: BlindPacket = {
    schemaVersion: "2",
    iterationId: input.iterationId,
    caseId: input.testCase.id,
    resume: {
      sha256: sha256(input.resumeText),
      text: input.resumeText,
    },
    variants: {
      A: input.candidateLabel === "A" ? input.candidatePresentation : input.productionPresentation,
      B: input.candidateLabel === "B" ? input.candidatePresentation : input.productionPresentation,
    },
  };
  return {
    packet,
    mapping: {
      packetSha256: sha256(serialize(packet)),
      labels: {
        [input.candidateLabel]: "candidate",
        [productionLabel]: "production",
      } as Record<BlindLabel, "candidate" | "production">,
      artifacts: {
        candidate: input.candidateArtifact,
        production: input.productionArtifact,
      },
    },
  };
}

function blindPresentation(presentation: PresentationReceipt, screenshotPath: string): BlindPresentation {
  return {
    kind: "rendered_report",
    route: presentation.route,
    viewport: presentation.viewport,
    visibleText: presentation.visibleText,
    visibleTextSha256: presentation.visibleTextSha256,
    screenshot: {
      path: screenshotPath,
      sha256: presentation.screenshot.sha256,
    },
  };
}

async function presentationAsset(artifactRoot: string, loaded: LoadedArtifact) {
  return resolveContainedExistingPath(artifactRoot, loaded.artifact.presentation.screenshot.path);
}

export async function prepareBlindPackets(explicitWebRoot?: string, requestedIterationId?: string) {
  const { definition, evidence } = await loadValidatedGauntletEvidence(explicitWebRoot, requestedIterationId);
  if (definition.issues.length > 0 || evidence.dataIssues.length > 0) {
    throw new Error(`Gauntlet evidence is invalid:\n- ${[...definition.issues, ...evidence.dataIssues].join("\n- ")}`);
  }
  const { webRoot, manifest, iteration, repositoryRoot } = definition;
  if (!hasCompleteBinding(iteration.candidate) || !hasCompleteBinding(iteration.production)) {
    throw new Error("Both production and candidate must have complete repository bindings before packet preparation");
  }
  if (evidence.candidateOutputs.size !== manifest.target.caseCount
    || evidence.productionOutputs.size !== manifest.target.caseCount) {
    throw new Error("All twelve validated production/candidate output pairs are required before packet preparation");
  }

  const artifactRoot = await resolveContainedExistingPath(
    webRoot,
    `gauntlet/artifacts/${iteration.id}`,
  );
  const finalTargets = ["packets", "reference-packets", "operator"];
  for (const target of finalTargets) {
    if (await pathExists(path.join(artifactRoot, target))) {
      throw new Error(`Refusing to replace existing prepared evidence: ${path.join(artifactRoot, target)}`);
    }
  }

  const stagingRoot = await mkdtemp(path.join(artifactRoot, ".packet-stage-"));
  const packetsDirectory = path.join(stagingRoot, "packets");
  const packetAssetsDirectory = path.join(packetsDirectory, "assets");
  const referencePacketsDirectory = path.join(stagingRoot, "reference-packets");
  const operatorDirectory = path.join(stagingRoot, "operator");
  await Promise.all([
    mkdir(packetAssetsDirectory, { recursive: true }),
    mkdir(referencePacketsDirectory, { recursive: true }),
    mkdir(operatorDirectory, { recursive: true }),
  ]);

  const mapping: BlindMapping = {
    schemaVersion: "2",
    iterationId: iteration.id,
    createdAt: new Date().toISOString(),
    cases: {},
  };

  for (const testCase of manifest.cases) {
    const candidate = evidence.candidateOutputs.get(testCase.id)!;
    const production = evidence.productionOutputs.get(testCase.id)!;
    const [candidateScreenshot, productionScreenshot, resumeBuffer] = await Promise.all([
      presentationAsset(artifactRoot, candidate),
      presentationAsset(artifactRoot, production),
      readGitBlob(
        repositoryRoot,
        candidate.artifact.generation.sourceCommit,
        `tests/resumes/${testCase.resumePath}`,
      ),
    ]);
    const prepared = buildBlindPacket({
      iterationId: iteration.id,
      testCase,
      resumeText: resumeBuffer.toString("utf8"),
      candidatePresentation: blindPresentation(candidate.artifact.presentation, ""),
      productionPresentation: blindPresentation(production.artifact.presentation, ""),
      candidateArtifact: blindArtifactBinding(candidate),
      productionArtifact: blindArtifactBinding(production),
      candidateLabel: randomInt(2) === 0 ? "A" : "B",
    });
    const candidateLabel = prepared.mapping.labels.A === "candidate" ? "A" : "B";
    const productionLabel = candidateLabel === "A" ? "B" : "A";
    const candidateExtension = path.extname(candidateScreenshot).toLowerCase() || ".png";
    const productionExtension = path.extname(productionScreenshot).toLowerCase() || ".png";
    const candidateBlindPath = `assets/${testCase.id}-${candidateLabel}${candidateExtension}`;
    const productionBlindPath = `assets/${testCase.id}-${productionLabel}${productionExtension}`;
    prepared.packet.variants[candidateLabel].screenshot.path = candidateBlindPath;
    prepared.packet.variants[productionLabel].screenshot.path = productionBlindPath;
    prepared.mapping.packetSha256 = sha256(serialize(prepared.packet));
    mapping.cases[testCase.id] = prepared.mapping;

    await Promise.all([
      copyFile(candidateScreenshot, path.join(packetsDirectory, candidateBlindPath), constants.COPYFILE_EXCL),
      copyFile(productionScreenshot, path.join(packetsDirectory, productionBlindPath), constants.COPYFILE_EXCL),
    ]);
    await writeFile(path.join(packetsDirectory, `${testCase.id}.json`), serialize(prepared.packet), { flag: "wx" });
    await writeFile(
      path.join(referencePacketsDirectory, `${testCase.id}.json`),
      serialize({
        schemaVersion: "2",
        iterationId: iteration.id,
        caseId: testCase.id,
        candidateArtifactSha256: candidate.sha256,
        candidateEvidence: blindArtifactBinding(candidate),
        resume: prepared.packet.resume,
        candidatePresentation: candidate.artifact.presentation,
        references: manifest.competitorReferences,
        rubric: {
          trust: "Does the candidate make a more credible, source-grounded case than the public reference bar, without overstating what the resume proves?",
          specificity: "Does the candidate identify exact resume evidence, recruiter interpretation, and missing context more precisely than the public reference bar?",
          actionability: "Does the candidate prioritize a concrete next move that is easier to execute than the public reference bar?",
        },
      }),
      { flag: "wx" },
    );
  }

  await writeFile(path.join(operatorDirectory, "mapping.json"), serialize(mapping), { flag: "wx" });
  await rename(packetsDirectory, path.join(artifactRoot, "packets"));
  await rename(referencePacketsDirectory, path.join(artifactRoot, "reference-packets"));
  await rename(operatorDirectory, path.join(artifactRoot, "operator"));
  await rmdir(stagingRoot);
  return {
    iterationId: iteration.id,
    preparedCases: Object.keys(mapping.cases).length,
    artifactRoot,
  };
}
