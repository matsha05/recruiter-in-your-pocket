import assert from "node:assert/strict";
import {
  extractSeniority,
  extractSkillsFromText,
  quickMatch,
} from "../lib/matching/skill-engine";

function assertBoundedScore(value: number, label: string) {
  assert.ok(Number.isFinite(value), `${label} must be finite`);
  assert.ok(value >= 0 && value <= 100, `${label} must stay between 0 and 100`);
}

const normalizedSkills = extractSkillsFromText(
  "Built React.js and TypeScript services on AWS, deployed through Kubernetes."
);
assert.ok(normalizedSkills.has("React"), "React variants should normalize to the canonical skill");
assert.ok(normalizedSkills.has("TypeScript"), "TypeScript should be extracted");
assert.ok(normalizedSkills.has("AWS"), "AWS should be extracted");
assert.ok(normalizedSkills.has("Kubernetes"), "Kubernetes should be extracted");

const seniority = extractSeniority("Senior engineer with 7+ years of experience leading platform work.");
assert.equal(seniority.yearsEstimate, 7);
assert.ok(seniority.levelHints.includes("senior"));

const targeted = quickMatch(
  "Software engineer with 2 years of experience building React and TypeScript applications.",
  "Required: 7+ years of experience, TypeScript, React, and Kubernetes. Preferred: AWS."
);
assertBoundedScore(targeted.score, "targeted score");
assertBoundedScore(targeted.requiredCoverage, "required coverage");
assertBoundedScore(targeted.preferredCoverage, "preferred coverage");
assertBoundedScore(targeted.keywordScore, "keyword score");
assert.ok(targeted.seniorityPenalty > 0, "a material years mismatch should reduce the score");
assert.ok(targeted.missingSkills.includes("Kubernetes"), "an absent required skill should remain a gap");
assert.ok(targeted.score <= targeted.keywordScore, "seniority mismatch must not improve the result");

const exact = quickMatch(
  "Senior platform engineer with 8 years of experience using TypeScript, React, Kubernetes, and AWS.",
  "Required: 7+ years of experience, TypeScript, React, and Kubernetes. Preferred: AWS.",
  [1, 0, 0],
  [1, 0, 0]
);
assertBoundedScore(exact.score, "exact score");
assert.equal(exact.semanticScore, 100);
assert.equal(exact.seniorityPenalty, 0);
assert.ok(exact.score >= targeted.score, "more matching evidence should not score below the thinner resume");

const mismatchedEmbeddings = quickMatch("TypeScript", "TypeScript", [1, 0], [1]);
assert.equal(mismatchedEmbeddings.semanticScore, 0, "invalid embedding dimensions must not inflate fit");
assertBoundedScore(mismatchedEmbeddings.score, "mismatched embedding score");

const noRequirements = quickMatch("React and TypeScript", "A thoughtful teammate who communicates well.");
assertBoundedScore(noRequirements.score, "no-requirements score");
assert.equal(noRequirements.matchedSkills.length, 0);

console.log("matching engine tests passed");
