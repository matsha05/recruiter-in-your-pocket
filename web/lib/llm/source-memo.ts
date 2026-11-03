/**
 * Per-text memo for the validator's pure parsers of the resume.
 *
 * The grounded validator audits every narrative string in a report against the resume, and each
 * audit used to re-split, re-tokenize and re-parse the whole resume: dozens of times per report, and
 * again for the repair pass and the severity merge. The parsers are pure functions of their input
 * string, so their results are cached by that string. Nothing about a verdict changes; only the work
 * repeats less. Callers treat a cached value as read-only.
 *
 * The cache is small and bounded: a warm serverless function may see a handful of resumes, and a
 * resume is at most 30,000 characters.
 */
export function memoizeByText<T>(compute: (text: string) => T, maxEntries = 16): (text: string) => T {
  const cache = new Map<string, T>();
  return (text: string) => {
    const hit = cache.get(text);
    if (hit !== undefined) {
      // Move to the end: the map keeps insertion order, so the oldest entry is evicted first.
      cache.delete(text);
      cache.set(text, hit);
      return hit;
    }
    const value = compute(text);
    cache.set(text, value);
    if (cache.size > maxEntries) cache.delete(cache.keys().next().value as string);
    return value;
  };
}
