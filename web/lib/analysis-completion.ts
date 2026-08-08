export function publishAuthoritativeAnalysis(input: {
  showReport: () => void;
  finishOwner: () => boolean;
  clearLoading: () => void;
  refresh: () => Promise<unknown>;
}) {
  input.showReport();
  const finished = input.finishOwner();
  if (finished) input.clearLoading();
  void input.refresh().catch(() => undefined);
  return finished;
}
