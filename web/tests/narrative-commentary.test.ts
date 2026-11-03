import assert from "node:assert/strict";
import { auditNarrativeClaim } from "../lib/llm/source-fidelity";

// Commentary on the previous sentence (plan row 1.10's open class, seen on a withheld production report):
// its descriptive words paraphrase a sentence already checked, but its concrete claims still have to be real.
const commentarySource = "Led a cross-departmental team of 25+ personnel, coordinating efforts across product, marketing, and engineering to launch three major software releases in two years.";
const commentary = (claim: string, source = commentarySource) =>
  auditNarrativeClaim(claim, source, { interpretationContext: "assessment", rejectPositiveSourceAbsence: true });
assert.deepEqual(commentary("That detail is worth keeping because it shows which groups you brought together."), [],
  "commentary that paraphrases the previous sentence is not a new factual claim");
assert.deepEqual(commentary("This line is worth noting because it shows how the releases came together."), []);
assert.deepEqual(commentary("That detail matters because it shows the coordination behind the releases."), []);
assert.ok(commentary("That detail is worth keeping because it shows the 40% you saved.").length > 0, "a number in commentary is still a number");
assert.ok(commentary("That detail is worth keeping because it shows the team you tripled.").length > 0, "an outcome claim in commentary is still a claim");
assert.ok(commentary("That detail is worth keeping because it shows the Acme account you brought in.").length > 0, "a name in commentary is still a name");
assert.ok(commentary("That detail is worth keeping because it shows the releases you owned.").length > 0, "an agency claim in commentary is still a claim");
assert.ok(commentary("The groups you brought together show your range.").length > 0, "without the anaphoric frame the sentence is an ordinary claim and needs an anchor");


// Seen on a shipped production report: the resume says "deliver", "launching" and "release", so a
// shipped feature in commentary is an outcome the resume states, in the forms a resume uses.
const productSource = [
  "Recently transitioned from a technical background with internship experience leading cross-functional teams to deliver impactful features for SaaS platforms.",
  "Owned the release cycle for BrightLeaf's resource management module, overseeing delivery timelines and cross-team dependencies for a feature used by 10,000+ customers.",
  "Assisted in launching a customer feedback portal, which increased actionable user feedback submissions by 35% within the first 2 months.",
].join("\n");
assert.deepEqual(commentary("That result is worth keeping near the top because it ties a shipped feature to a defined user behavior.", productSource), []);
assert.ok(commentary("That result is worth keeping near the top because it ties a shipped feature to a defined user behavior.", "Presented the quarterly forecast to leadership.").length > 0,
  "the same sentence against a resume with no delivery is a claim the resume does not make");

console.log("narrative commentary tests passed");
