/**
 * The worklist report USE_MOCK_OPENAI returns for a resume (Playwright, the Report Lab, local journeys). It
 * quotes the lines of the "Alex Rivera" resume the UI specs paste, so the cards find their lines on the page.
 * Grounding is skipped under the mock, so it also renders for any other pasted resume.
 */
export const MOCK_WORKLIST_REPORT = {
  contract_version: "v3",
  score: 66,
  lifted_by_employer: false,
  verdict: "A recruiter sees onboarding work they can follow, and no way to tell how much of it was yours.",
  write_up: [
    "The page reads like someone who owns customer onboarding end to end: the workflow, the training, the weekly reviews. That's a real job and it's easy to follow. What a recruiter can't do after one pass is size it. How many customers came through that workflow, how big the support team you trained was, what the reviews changed. Without one of those, the three lines could belong to anyone who has ever sat near an onboarding process.",
    "The best line on the page is the weekly reviews one. It names who you met with and what you kept current, so a reader can picture the work. Write the other two like it: the thing, the people, the number if you have one. Then this is a page that gets a call.",
  ],
  cards: [
    {
      kind: "structure",
      where: "Structure",
      line: "The page has no headline naming the role you want.",
      cannot_tell: "Three onboarding lines point at customer operations, but a reader has to work that out. One line under your name saves them the guess.",
      example: "[Customer operations specialist] with [number] years in onboarding, looking for a [role title] role.",
      question: "What job are you going for? One title, the way a posting would write it.",
    },
    {
      kind: "line",
      where: "Customer Operations, line 2",
      line: "Documented the workflow and trained the support team on customer onboarding.",
      cannot_tell: "Trained how many people, and did the documentation stick? 'The support team' could be three people or thirty.",
      example: "Documented the onboarding workflow and trained the [number]-person support team on it; [what changed after the training, if you know it].",
      question: "How many people did you train, and what did the team do differently afterward?",
    },
    {
      kind: "keep",
      where: "Customer Operations, line 3",
      line: "Ran weekly onboarding reviews with account managers and kept the checklist current.",
      cannot_tell: "This is the clearest line on the page: who you met, how often, what you owned. The other two should read like it.",
      example: "",
      question: "",
    },
  ],
  fit: {
    roles: ["Customer Operations"],
    why: "Your headline and both roles are customer operations work.",
    level: "mid-level, runs onboarding reviews, no direct reports",
    note: "The page points at customer operations and onboarding roles, where the workflow, the training and the reviews are exactly what a hiring manager looks for. Size the work and it holds up against a specialist or lead posting.",
    posting: { summary: "", missing: [] },
  },
} as const;
