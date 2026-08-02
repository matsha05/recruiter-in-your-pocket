import { canonicalJsonSha256 } from "../integrity";
import type { RequiredJourney } from "../types";
import { validateGauntletDefinition } from "./definition";
import { loadEvidence } from "./evidence";
import { summarizeGauntletProgress } from "./summary";

export async function loadValidatedGauntletEvidence(
  explicitWebRoot?: string,
  requestedIterationId?: string,
) {
  const definition = await validateGauntletDefinition(explicitWebRoot, requestedIterationId);
  const evidence = await loadEvidence(definition);
  return { definition, evidence };
}

export async function getGauntletProgress(
  explicitWebRoot?: string,
  requestedIterationId?: string,
) {
  const { definition, evidence } = await loadValidatedGauntletEvidence(
    explicitWebRoot,
    requestedIterationId,
  );
  return summarizeGauntletProgress(definition.manifest, definition.iteration, evidence, {
    iterationLedgerSha256: definition.iterationLedgerSha256,
    ledgers: definition.ledgers,
  });
}

export function journeyDefinitionSha256(journey: RequiredJourney) {
  return canonicalJsonSha256(journey);
}
