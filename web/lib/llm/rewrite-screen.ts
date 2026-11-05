import { compareSourceBoundRewrite, type SourceFidelityIssue } from "./source-fidelity";

/** Drops every model rewrite whose "better" line adds, drops or changes a fact of the line it rewrites. */
export function removeUnsafeRewrites<T extends { rewrites?: unknown }>(report: T, resumeText: string) {
  const rewrites = Array.isArray(report.rewrites) ? report.rewrites : [];
  const removed: Array<{ index: number; issues: SourceFidelityIssue[] }> = [];
  const safeRewrites = rewrites.filter((rewrite: any, index: number) => {
    if (typeof rewrite?.original !== "string" || typeof rewrite?.better !== "string") return true;
    const comparison = compareSourceBoundRewrite({
      sourceText: resumeText,
      sourceLocator: rewrite.original,
      candidate: rewrite.better,
    });
    if (comparison.safe) return true;
    removed.push({ index, issues: comparison.issues });
    return false;
  });
  return { report: { ...report, rewrites: safeRewrites }, removed };
}
