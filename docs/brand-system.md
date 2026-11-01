# Recruiter in Your Pocket — Brand System

Last updated: 2026-09-12

Owner: Product + Design

Status: Current brand source of truth

Authority: This document owns brand identity, promise, emotional target, voice posture, and the signature Lifted Line grammar. [`design-system.md`](./design-system.md) owns cross-surface visual application and the production implementation contract. [`voice-and-tone.md`](./voice-and-tone.md) owns the writing voice.

## The direction: Highlighter

Recruiter in Your Pocket is the sharp, generous friend who knows hiring from the inside. We show people what their resume already proves, where the proof gets lost, and the smallest honest change that makes it easier to see.

Since October 31, 2026 the homepage opens on the job seeker's real pain, the silence after applying, and the sting of comparison: “They called someone back. It wasn’t you.” beside an ordinary resume with a recruiter's sticky note on it, unreadable. The story then names the silence (“Not even a reply.”), shows one real read in one sentence, and asks “What would they think of yours?” The promise behind it is unchanged: see what a recruiter sees. A recruiter's two tools are the visual system: a green pen writes the notes, and a yellow highlighter marks the Critical Miss. Schibsted Grotesk for headlines and interface, Literata for the recruiter's voice, and dark pill actions extend across the whole product. The October 30, 2026 hero replaced the earlier 3D instrument, which is retired along with the pocket lion and granite explorations. The Lifted Line evidence grammar remains useful product logic: vague language becomes specific and hidden scope becomes visible. The work does not get inflated; it gets easier to recognize.

## What we promise

We do not promise a job, an interview, an ATS score, or a prediction. We promise a private, useful first read:

- what landed
- what needs context
- what to fix first
- why that recommendation is credible

## How the brand should feel

- bright, not bubbly
- confident, not grandiose
- literate, not literary
- useful, not clinical
- charming, not cute
- precise, not mechanical
- premium through craft, not luxury theater

The emotional arc is: **I feel seen → I understand the problem → I know what to do next.**

## Voice

Write like the smartest, kindest recruiter a candidate could ask privately.

Good copy names the real thing quickly, then helps. It can smile, but it must earn the smile through truth and usefulness.

Prefer:

- “See what a recruiter sees.”
- “You did the work.”
- “The useful part, first.”
- “Advice with receipts.”
- “Nothing new was invented. The scope is simply easier to find.”
- “This line has a real result hiding inside it.”

Avoid:

- generic career encouragement
- corporate HR language
- clever labels that require decoding
- claims about a candidate’s future
- fake certainty, fake urgency, and unsupported social proof
- copy that talks about the product more than the user’s work

## Visual character

Paper on a desk. White sheets sit on a cool-neutral ground (#f4f4f1), with ink #111513 for text and every action, muted #5a605c, inset #e9eae6, and hairline dividers #dfe0dc. The green pen #1f5a46 leads: links, focus, and everything the recruiter says. Since October 31, 2026 the desk holds the recruiter's other pens too: blue ink #2448a8 for the candidate's own work and numbers, the red pen only for problems, and a validated chart order (blue, green, plum, orange) so comparisons actually look different. Color always carries a job; it is never decoration. The highlighter #ffe14d is used sparingly, only to mark the line a recruiter would miss; the Critical Miss block sits on #fff6c2 with deep olive #6b5400 ink. Dark pill primary actions, 18px sheets, no drop shadows.

Typography carries the authority:

- **Schibsted Grotesk** for the wordmark, headlines (800), navigation, controls, labels, metadata, and body copy
- **Literata** for the recruiter's voice: the Verdict, margin notes in italic, and quoted resume lines

Matt chose this Highlighter direction on October 30, 2026, replacing the Alpine system (Instrument Sans, Source Serif 4, aqua). PDF, Open Graph, icons, and email have separate rendering pipelines and were moved to the same fonts and palette in the same change; each needs its own render check after any later change.

The system is a recognizable grammar, not a template. Major surfaces may use bespoke illustration, image-making, motion, or unusual composition when the idea is specific to the product and the execution improves understanding or emotional impact. Custom craft is welcome. Generic decoration is not.

## Signature grammar

The Lifted Line system uses four evidence cues:

1. **Caught attention** — the action reads quickly.
2. **Needs context** — scope, ownership, or outcome is missing.
3. **Evidence present** — a claim has proof behind it.
4. **Strongest next wording** — the clearest honest version of the line.

Use these cues across the homepage, reports, workspace, and Research. Phosphor icons support the grammar, but they are not the full art direction. Do not create ornamental symbols, fake annotations, or decorative diagrams that carry no meaning.

### The Lifted Trace

The signature behavior is a structural line that carries a real claim through the product logic:

**what is on the page -> what remains open -> the candidate's fact -> clearer wording**

Each completed segment lifts slightly from the baseline. The movement is functional: it shows where the recommendation came from and which fact changed the read. It is not a loading gimmick, a decorative underline, or proof that unfinished work is complete.

Use the same behavior in the homepage proof, report edit flow, analysis work map, and Research process figures. Loading states may show the map, but must not fake completion percentages or backend milestones the product does not actually receive.

## Surface rules

### Homepage

Curiosity first, then recognition, then proof. Beat one: “They called someone back. It wasn’t you.” then “See what a recruiter sees on your resume, and the one thing to fix first.”, one primary action (“Read mine”), and a quiet route to the example; a fictional, ordinary resume carries a recruiter's note that is deliberately blurred. Beat two names the silence in job seekers' own plain words (“Not even a reply.”) and is honest that silence is not always the resume. Beat three shows one verdict on the same fictional resume and turns it into the question about yours. Never claim a person reads each resume: the read applies a recruiter's criteria, and the founder section says so plainly. The illustration is decorative for assistive technology and never gates the report action.

### Workspace and reports

Prioritize the likely takeaway, the exact evidence, and the next action. The interface can be denser than marketing, but it must remain calm and humane.

Report body is 16px/25px. Long Research prose is 18px/30px. Operational errors stay distinct from resume findings; never make report reading or recovery depend on decorative motion.

### Research

Research is the trust layer, not a blog. Start with a concrete recruiter claim, show the source, say what it supports, and state the limitation. Diagrams must teach something specific.

### Trust

Privacy language should be short and factual. No security theater. Never imply we store less, know more, or predict more than the product actually does.

## Hard noes

- teal, cobalt, royal blue, purple, or peach as primary brand colors
- navy-and-paper dossier theater
- gradients used as atmosphere
- neon acquisition actions or ornamental completion markers
- card farms with equal visual weight
- a fourth font family or a route-specific type system outside the shared Schibsted Grotesk / Literata tokens
- red-pen cosplay
- “AI magic” language
- dashboards that hide the most useful judgment behind scores
- novelty at the expense of comprehension

## Quality test

Before shipping a surface, ask:

1. Is the most useful thing obvious in three seconds?
2. Does this make the candidate’s real work clearer without inflating it?
3. Is the copy something a thoughtful human would actually say?
4. Does every diagram or visual teach a concrete idea?
5. Does this unmistakably belong to the same product as the homepage and report?

If any answer is no, it is not finished.
