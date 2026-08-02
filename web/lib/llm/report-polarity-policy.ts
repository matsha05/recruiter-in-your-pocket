function normalizedClaimText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\[[^\]]+\]/gu, " ")
    .replace(/\p{Cf}/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

const negativePresencePattern = /\b(?:absent|missing|unclear)\b(?:\s+(?:from|in|on|within))?|\bnot\s+(?:available|clear|explicit|found|included|listed|present|shown|stated|visible)\b/iu;

export function assertsNegativePresence(value: string) {
  return negativePresencePattern.test(normalizedClaimText(value));
}
