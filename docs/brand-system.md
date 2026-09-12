# Recruiter in Your Pocket — Brand System

Last updated: 2026-09-12

Owner: Product + Design

Status: Current brand source of truth

Authority: This document owns brand identity, promise, emotional target, voice posture, and the signature Lifted Line grammar. [`design-system.md`](./design-system.md) owns cross-surface visual application and the production implementation contract. [`voice-and-tone.md`](./voice-and-tone.md) owns the writing voice.

## The direction: Alpine

Recruiter in Your Pocket is the sharp, generous friend who knows hiring from the inside. We show people what their resume already proves, where the proof gets lost, and the smallest honest change that makes it easier to see.

The approved editorial instrument now anchors the homepage: a tactile teal case, warm brass controls, and a useful resume example in a warm ivory setting. Its Story, Impact, and Fit keys choose a focus; the dial moves from the original wording to a recruiter's read and the next move. The craft attracts attention, and the feedback explains the service. Instrument Sans, strong typographic anchors, and dark pill actions extend across the whole product. The Alpine palette remains the shared system; the pocket lion and granite landscape are retained as earlier explorations, not the current homepage direction. The Lifted Line evidence grammar remains useful product logic: vague language becomes specific and hidden scope becomes visible. The work does not get inflated; it gets easier to recognize.

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

- “You did the work. Let’s dial in your story.”
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

The visual world is warm ivory, light paper surfaces, dark neutral ink, and restrained aqua. Canvas #f6f3ef, sheet #fbfaf8, inset #f0efeb, ink #12191b, muted #5f6667, aqua #00738f, aqua surface #e6f3f2, divider #dcdedb, and control boundary #7e888a form one shared system. Quiet warm headers, dark pill primary actions, 10px fields, and 24px desktop/16px mobile sheets replace the old ink-header, neon-CTA, and rectilinear rules.

A darker aqua supports hover and emphasis. Citron #c8f238 remains an explicitly permitted compatibility token, not a general action or header color.

Typography carries the authority:

- **Instrument Sans** for wordmark, headlines, prices, navigation, controls, labels, metadata, and body copy
- **Source Serif 4** for selected short verdicts through the shared editorial token

Matt approved the September 5 6 Pro recommendations across the product, followed by the bold-granite refinement: Instrument Sans uses 700 for the hero and wordmark, 650 for major marketing headings, 600 for workspace/report headings, controls and labels, and 400 for body. Saturated aqua, green, and amber assessment graphics sharpen the hierarchy while labels retain dark readable text. Source Serif 4 remains 400 for short assessments rather than long reading passages. The intermediate Satoshi/Georgia pairing is retired. PDF, Open Graph, icons, and email have separate rendering pipelines; their September 5 local migration was independently rendered and inspected, with evidence and external-client limits in `output/competitive-visuals-20260905/output-identity/README.md`. The later bold-granite refinement applies to browser surfaces; separate outputs retain that earlier verified treatment.

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

Preserve the approved instrument's original materials, camera, and lighting, the three-line desktop headline, warm environment, dark pill actions, and original company marks. The exact artwork is delivered as a lossless WebP with live controls; it is not a freely rotating 3D model. The initial screen shows a concise before-and-after example. Keys and dial reveal one useful observation at a time, with larger feedback available through “Read at full size.” Interaction remains optional: the primary action, trust row, report preview, and founder introduction explain and support the working product. Animate the physical controls only in response to interaction, respect reduced motion, and provide readable fallback controls if the artwork cannot initialize.

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
- a third branded font family or a route-specific type system outside the shared Instrument Sans/Source Serif 4 tokens
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
