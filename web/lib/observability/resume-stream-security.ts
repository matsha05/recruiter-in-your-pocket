import { logWarn } from "./logger";

export function logDetectedPromptInjection(input: {
  request_id: string;
  route: string;
  resume: { injectionDetected: boolean; detectedPatterns: string[]; hadJsonInjection: boolean };
  jobDescription?: { injectionDetected: boolean; detectedPatterns: string[]; hadJsonInjection: boolean } | null;
}) {
  if (!input.resume.injectionDetected && !input.jobDescription?.injectionDetected) return;
  logWarn({
    msg: "prompt_injection.detected",
    request_id: input.request_id,
    route: input.route,
    security: {
      injection_detected: true,
      patterns_matched: [
        ...input.resume.detectedPatterns,
        ...(input.jobDescription?.detectedPatterns || []),
      ],
      json_injection: input.resume.hadJsonInjection || Boolean(input.jobDescription?.hadJsonInjection),
    },
  });
}
