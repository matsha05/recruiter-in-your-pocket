# Homepage visual brief

November 3, 2026. The bar Matt set: the homepage should sit beside Linear, Apple Notes and OpenAI. Those three share one thing: nothing on the page competes with the product. This brief is what that means for RIYP, and it governs the homepage build in this branch. The story (the call you didn't get, the recruiter's screen, the note worked through, the silence, what we look for, the re-check) is Matt's October 31 direction and does not change. Its execution does.

## What is in the way today

- Seven modules with seven treatments: a rotated resume collage, a boxed sheet with numbered chips, a centered narrow list, open rows, cards inside cards, a left-rule quote, a dark band. Each is fine alone; together they read as a page assembled from parts.
- Four voices of color on one screen: pen green, highlighter yellow, red strike-through, brass uppercase. Plus blue-ink rules. The brand has two tools, the pen and the highlighter; the rest is noise.
- Three alignments (left, centered, left) and five section paddings (5, 6, 6.5, 3.5, 4 rem). The eye never settles.
- Frames that mean nothing: the worked example is boxed, then subdivided, then labelled; the re-check puts cards in a panel in a section.

## Tokens

Color (the existing palette, used less):

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#f3f3ee` (`--background`) | the page |
| Sheet | `#ffffff` (`--card`) | the recruiter's screen only |
| Ink | `#111614` (`--text-strong`) | type, the primary action |
| Muted | `#585d5c` (`--text-muted`) | second-level copy |
| Pen | `#1f5a46` (`--pen`) | the recruiter's handwriting: notes, questions |
| Highlighter | `#ffe14d` (`--highlight`) | the Critical Miss, and nothing else |
| Hairline | `#dedfd9` (`--line`) | section rules, the screen's edge |

Red strike-through, brass labels and blue-ink rules do not appear on the homepage.

Type (the existing families):

- Schibsted Grotesk 800 for the hero (4.5rem desktop, 2.75rem phone, tracking -0.045em) and section headlines (2.5rem / 2rem, tracking -0.04em). Nothing in between.
- Schibsted Grotesk 400 for the lead (1.25rem / 1.125rem) and body (1rem). Labels at 0.875rem, 600, sentence case; no uppercase, no tracking.
- Literata for the recruiter's voice only: quoted resume lines (upright) and the recruiter's notes and questions (italic, pen green). 1.25rem on desktop.

Layout:

- One column, 68rem, left-aligned, 1.25rem gutters on phones and clamp(1.5rem, 4vw, 2.5rem) above. Nothing is centered except the closing band.
- Sections are separated by one hairline and one space: 7rem on desktop, 4.5rem on phones. Inside a section: headline, 1.5rem, content.
- The only framed element is the recruiter's screen. Everything else is open: text, hairlines, and white space.

```
+---------------------------------------------------------------+
| wordmark                        nav        Sign in  [Get report]|
|                                                                 |
| They called someone back.                                       |
| It wasn't you.                                                  |
| See what a recruiter sees on your resume, and the one thing     |
| to fix first.           [Get your free report]  See Jordan's    |
|                                                                 |
| +-----------------------------------------------------------+   |
| | JORDAN A. MILLER            |  Customer Success Manager   |   |
| | Objective ...               |  Req 4471 · Applied 9 days  |   |
| | Experience ...              |  Stage   Not moving forward |   |
| |  • Introduced monthly ...   |  Reviewer note (hiring team)|   |
| |  • Ran quarterly ...        |  Solid book of business ... |   |
| +-----------------------------------------------------------+   |
|---------------------------------------------------------------- |
| Here's the note Jordan never saw.                               |
| "Your account portfolio and review cadence are specific,        |
|  but [results remain unclear]."                                 |
| Introduced monthly renewal-risk     Solid book of business,     |
| reviews across the portfolio        but the renewal-risk ...    |
|                                     What factors did you ...    |
|                                     What changed in your ...    |
|---------------------------------------------------------------- |
| Not even a reply.                                               |
| (five applications, five "No response")                         |
|---------------------------------------------------------------- |
| What we look for, line by line.   (three open rows)             |
|---------------------------------------------------------------- |
| Fix it. Then check it again.      (last time | now, open)       |
|---------------------------------------------------------------- |
| After 14 years in recruiting ...                                |
+---------------------------------------------------------------+
| Good work deserves a good read.          [Get your free report] |
+---------------------------------------------------------------+
```

## Principles

1. The screen is the hero. The recruiter's screen is one flat sheet, straight, at full content width under the headline: the resume on the left, the review pane on the right, the note blurred until the visitor scrolls. It is the only thing on the page with an edge and a shadow, so it reads as the product, not as an illustration.
2. Two tools. Pen green is the recruiter writing; the highlighter marks the Critical Miss. No third color carries meaning.
3. One column, one rhythm. Every section starts at the same left edge, after the same hairline and the same space.
4. Frames encode meaning. A box says "this is a screen". Nothing else is boxed, so the worked example, the re-check and the founder note are set as text with white space between the parts.
5. Motion answers the reader. The note clears once, when they scroll into it. Nothing else moves on its own.

## Not changed by this brief

The report, the workspace and the rest of the product keep the November 2 design; this brief is the homepage. If it holds, the same tokens apply to pricing and the sample report next.

## Superseded, November 4, 2026

The page this brief describes (the recruiter's screen as the hero, the worked example with labels, the silence list, the dark close) was replaced on November 4, 2026 by the first-principles rebuild recorded in `2026-11-homepage-research.md` and specified in `docs/design-system.md` §10. The rhythm rules here (one column, one hairline and one space between sections) carried over; the rest did not.
