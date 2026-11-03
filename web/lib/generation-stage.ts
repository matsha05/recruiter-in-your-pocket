// Real phases of a resume report, reported by the stream as they happen. The wait
// screen shows the current one; nothing advances on a timer. "severity" is the
// second model call (anything else that costs an interview?), after the report
// has validated; the client treats stages it does not know as "checking".
export const GENERATION_STAGES = ["sending", "reading", "retrying", "writing", "checking", "severity"] as const;

export type GenerationStage = (typeof GENERATION_STAGES)[number];

export function isGenerationStage(value: unknown): value is GenerationStage {
  return typeof value === "string" && (GENERATION_STAGES as readonly string[]).includes(value);
}
