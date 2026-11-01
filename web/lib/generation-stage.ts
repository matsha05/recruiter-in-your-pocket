// Real phases of a resume report, reported by the stream as they happen. The wait
// screen shows the current one; nothing advances on a timer.
export const GENERATION_STAGES = ["sending", "reading", "retrying", "writing", "checking"] as const;

export type GenerationStage = (typeof GENERATION_STAGES)[number];

export function isGenerationStage(value: unknown): value is GenerationStage {
  return typeof value === "string" && (GENERATION_STAGES as readonly string[]).includes(value);
}
