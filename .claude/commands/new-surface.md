---
description: Build a new surface or open-ended product change the RIYP way: interview, cheap sketches, build, outside critique, high-effort verification
---

# New surface: $ARGUMENTS

Run this loop for a new page, flow, or open-ended product change. It is Thariq Shihipar's effort loop (interview, build low, review, verify high) with Impeccable's critique as the outside reviewer. Matt chose it on Nov 3, 2026 because a polished first pass that guessed wrong costs more than a rough one that shows the direction. Do not skip step 2 because the shape looks obvious.

Ground every step in the house system: `docs/design-system.md`, `docs/brand-system.md`, `docs/voice-and-tone.md`, and `docs/copy-system.md`. Where any outside tool's taste disagrees with those, the system wins.

## 1. Interview, not a brief

Read the relevant code and docs first, then interview Matt one question at a time, through the question UI, about anything ambiguous. Ask the questions whose answers would change the shape before the ones that change the details. Stop when you could brief a stranger. Write the result as a short spec at the top of your working notes: who it is for, what it must say, what the person does next, what is out of scope, and how we will know it worked.

## 2. Sketches at low effort

Before touching the real app, make two or three single HTML files, each a different direction, with fake data, built on the real tokens, type roles, and Button from `web/app/globals.css` and `web/tailwind.config.js`. Keep them in the scratchpad, screenshot each at 1440 and 390, and show Matt the screenshots with one line per direction on what it bets on. Wait for his reaction. Prompt yourself with the literal words: "wildly different directions so he can react to them."

## 3. Build the chosen direction

Work in a worktree. Build against the spec and the system at ordinary effort. Register public pages in `web/lib/seo/public-pages.ts`, use `pageMetadata()`, and keep copy to the voice guide's review checklist. Keep an `implementation-notes.md` in the scratchpad: when an edge case forces a deviation from the spec, take the conservative option, log it under "Deviations", and keep going.

## 4. Outside critique

Run Impeccable's critique in a fresh subagent that has not seen this conversation. Give it the rendered screenshots at 390, 1024, and 1440, the spec, and the pinned prompt:

https://raw.githubusercontent.com/pbakaus/impeccable/24aa2547f1d80e8d0edd767d9b76bc0bb65a3b6b/.agent/skills/impeccable/reference/critique.md

Tell it that `docs/design-system.md` and `docs/brand-system.md` outrank the prompt's own taste, and to return ranked findings with the evidence for each. Verify each finding against the page before acting on it. Use Impeccable's `polish`, `typeset`, `simplify`, or `quieter` prompts (same repo, same commit, `reference/` folder) only as targeted follow-ups to a named finding. Do not use its create commands, its detector, or its hooks: the Nov 2, 2026 audit (`docs/audits/2026-11-impeccable-audit.md`) found 42 of its 45 detector warnings were false positives against our system.

## 5. Verify at high effort

From `web/`: `npm run test:search-foundation`, `npm run qa:design-system`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`, plus the focused tests for any behavior you touched. Render every new or changed route at 390, 1024, and 1440 and check horizontal overflow, keyboard focus, and dark mode. Show Matt the screenshots and the command output, not a summary. Open the PR for his read when the change names competitors, changes pricing or trust copy, or touches the report; otherwise merge on green.
