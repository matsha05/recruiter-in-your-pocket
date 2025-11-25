# ChatGPT + Codex Workflow

This document explains how Matt, ChatGPT, and Codex work together to build Recruiter in Your Pocket. Matt is not a coder, and Codex should always handle the engineering details. ChatGPT supports by shaping ideas, cleaning up designs, and writing precise instructions.

## 1. Set the target
Matt defines the exact area to work on:
Examples: hero section, paywall, score block, summaries, spacing, Missing Wins, mode selector, or a behavior (metering, Stripe flow, devmode).

This keeps the work focused.

## 2. Share the current state
Matt uploads a screenshot or describes the current UI or behavior.
ChatGPT reviews what works, what breaks, and what needs to be improved based on:
- visual hierarchy
- tone
- spacing
- clarity
- design principles in this repo

## 3. ChatGPT proposes strong design or behavior options
ChatGPT provides 2–3 high-quality directions:
- Option A (recommended, most aligned)
- Option B (more minimal or alternative)
- Option C (structured or editorial)

Each option includes pros, cons, and fit with brand tone.

Matt picks the one he likes.

## 4. ChatGPT writes the Codex Surgical Prompt
This is the key step.

ChatGPT generates a prompt that:
- only touches the target area
- uses simple English
- never asks for full file output
- uses exact search-and-replace instructions
- tells Codex where to insert new code or copy
- references context.md, design-principles.md, and vision.md
- keeps the tone calm and clear

Codex handles the actual implementation.

## 5. Matt runs Codex and sends an updated screenshot
Codex applies the surgical edits in the repo.
Matt reloads the app locally and sends a screenshot of the updated version.

## 6. ChatGPT performs the polish pass
ChatGPT fine tunes:
- spacing
- copy
- alignment
- visual rhythm
- tone
- breathing room

Small changes that make the interface feel premium and intentional.

## 7. Repeat for the next component
Matt moves down the interface one piece at a time until the whole product feels cohesive and studio-grade.

## 8. Apply this loop to UX logic too
This workflow is also used for:
- free-run metering
- devmode bypass
- Stripe paid flows
- rewrite engine improvements
- summary calibration
- error states

Matt describes the behavior in plain English.
ChatGPT shapes it.
Codex implements it surgically.

## 9. Always follow the design system
At every step, Codex and ChatGPT must follow:
- design-principles.md
- vision.md
- context.md
- master-roadmap.md

The product must be calm, clear, minimal, honest, and helpful.

## 10. Final Rhythm Pass
When a section is finished, ChatGPT reviews vertical rhythm, spacing, contrast, breathing room, and tone. This creates a consistent, premium product.
