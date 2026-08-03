export type AnalysisControllerRef = { current: AbortController | null };

export function ownsAnalysisRun(ref: AnalysisControllerRef, controller: AbortController) {
  return ref.current === controller;
}

export function finishOwnedAnalysisRun(ref: AnalysisControllerRef, controller: AbortController) {
  if (!ownsAnalysisRun(ref, controller)) return false;
  ref.current = null;
  return true;
}

export function cancelOwnedAnalysisRun(
  activeRef: AnalysisControllerRef,
  latestRef: AnalysisControllerRef,
  invalidate: boolean,
) {
  const controller = activeRef.current;
  controller?.abort();
  activeRef.current = null;
  if (invalidate) latestRef.current = null;
  return controller;
}
