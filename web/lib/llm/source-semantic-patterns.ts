const commonCapitalizedWords = new Set([
  "A", "Across", "Add", "After", "All", "An", "And", "Annual", "At", "Before", "Built", "Candidate",
  "Company", "Coordinated", "Created", "Details", "Did", "Do", "Education", "Experience", "For",
  "From", "Generated", "How", "If", "In", "Keep", "Led", "Maintained", "Managed", "Marketing", "No", "Of",
  "On", "Operations", "Product", "Ran", "Recorded", "Recruiter", "Resume", "Role", "Sales", "Scaled", "Senior",
  "Skills", "Strong", "Summary", "Supported", "The", "This", "To", "Use", "What",
  "When", "Where", "Which", "Who", "Why", "With", "Work", "Your",
]);

const ownershipPatterns: Array<[string, RegExp]> = [
  ["agency:lead", /\b(?:lead|leads|leading|led)\b/giu],
  ["agency:own", /\b(?:own|owns|owned|owning)\b/giu],
  ["agency:drive", /\b(?:drive|drives|driving|drove|driven)\b/giu],
  ["agency:manage", /\b(?:manage|manages|managed|managing)\b/giu],
  ["agency:direct", /\b(?:direct|directs|directed|directing|spearhead|spearheaded|head|headed)\b/giu],
  ["agency:build", /\b(?:build|builds|built|building|architect|architected|design|designed|implement|implemented|create|created)\b/giu],
  ["agency:support", /\b(?:support|supports|supported|supporting|assist|assisted|help|helped|contribute|contributed|participate|participated|collaborate|collaborated|coordinate|coordinated|partner|partnered)\b/giu],
];

const outcomePatterns: Array<[string, RegExp]> = [
  ["outcome:improve", /\b(?:improved|increased|enhanced|boosted|raised)\b/giu],
  ["outcome:reduce", /\b(?:reduced|lowered|cut|decreased)\b/giu],
  ["outcome:growth", /\b(?:grew|grown|scaled|doubled|tripled)\b/giu],
  ["outcome:financial", /\b(?:generated|saved|earned)\b/giu],
  ["outcome:delivery", /\b(?:delivered|achieved|shipped|launched|accelerated)\b/giu],
  ["outcome:promotion", /\b(?:promoted|promotion|promotions)\b/giu],
  ["outcome:expansion", /\b(?:expanded|expansion|implemented|implementation)\b/giu],
];

const qualifierPatterns: Array<[string, RegExp]> = [
  ["qualifier:global", /\b(?:global|globally|company-wide|organization-wide|enterprise-wide)\b/giu],
  ["qualifier:end-to-end", /\bend[- ]to[- ]end\b/giu],
  ["qualifier:cross-functional", /\bcross[- ]functional\b/giu],
  ["qualifier:multiple", /\b(?:multiple|several|numerous)\b/giu],
  ["qualifier:major", /\b(?:major|significant|material|mission-critical|high-stakes)\b/giu],
  ["causal:through", /\bthrough\b/giu],
  ["causal:resulting", /\b(?:resulting in|leading to|led to|because of|thereby)\b/giu],
];

export const trackedSemanticPatterns = [...ownershipPatterns, ...outcomePatterns, ...qualifierPatterns];

export function isCommonCapitalizedWord(value: string) {
  if (commonCapitalizedWords.has(value)) return true;
  return trackedSemanticPatterns.some(([, pattern]) => {
    pattern.lastIndex = 0;
    const match = pattern.exec(value);
    pattern.lastIndex = 0;
    return match?.index === 0 && match[0].length === value.length;
  });
}
