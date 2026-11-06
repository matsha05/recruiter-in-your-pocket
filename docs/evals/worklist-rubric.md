# The worklist rubric (draft)

Version: draft 1, November 6, 2026. Not yet an automated judge; nothing in `web/lib/evals/judge/` applies it. The Critical Miss judge (`critical-miss-judge-v4`, [critical-miss-rubric.md](critical-miss-rubric.md)) compares one unit, the thing to fix first, and cannot score the worklist report, whose unit is the line. This draft is the question the next judge asks, written so that Matt's blind picks can calibrate it the way the November 1 and November 5 picks calibrated the last one.

## What is being judged

A worklist report (contract v3; `web/prompts/resume_v3.txt`) is the score and its rung, a one-sentence verdict, the recruiter's write-up (two or three paragraphs), and one card per line that needs work, in the order a recruiter hits them. A card is the line as written (or a structural statement: section order, dates, a gap), what a recruiter can't tell from it, an example of the line with the missing facts as bracketed blanks, and the question that fills the blanks. One keep card may name the line the rest should read like.

The judge sees the resume, the review date, and the report's verdict, write-up and cards. Never the prompt, the model, the score or the run.

The question, in Matt's words from the November 5 pick: "we have bad resumes and good resumes. bad resumes get looked over. we want to make sure we're giving candidates the best possible shot of telling their story to get that interview." So the judge asks three things, in order:

1. **Is the write-up this resume's read?** Would an experienced recruiter who had just read this page say this, about this page, to this person?
2. **Are the cards the lines a recruiter trips on, in that order?** Every line that would make a recruiter hesitate has a card, no line that wouldn't has one, and the order is the order of reading.
3. **Is every example grounded?** Nothing outside a bracket is new; the blanks are exactly the facts the page lacks.

## Sources, in order of authority

| Key | Source |
| --- | --- |
| **M5** | Matt's blind pick of November 5, 2026 (`tests/fixtures/results/blind-pick-v5/`): the framing finding and the per-item notes, verbatim. |
| **M1** | Matt's November 1 pick and decisions, where not superseded (concrete facts beat moves; a gap needs real help). |
| **B** | The brief's decisions 1 to 5 and 10 to 17 (`../promptops/proposals/2026-11-prompt-rewrite-brief.md`). |
| **P** | The worklist prompt as shipped (`web/prompts/resume_v3.txt`, `18e7e9ff`). |
| **R** | The research library, as the pages source it: Pina et al. 2023 on where attention goes; Eriksson and Rooth 2014 and Kristal 2023 on gaps. |

## The criteria

### V. Grounded (veto)

Every statement the write-up and the cards make about the resume is true of it. Unsupported: a quoted line not on the page; a number, name, tool, employer, date or outcome outside a bracket that the page doesn't have; a blank for a fact the page already states; "helped" or "supported" upgraded to "led"; a computed duration; a gap called open when the page accounts for the time. Hedged advice ("if true") and a reviewer's possible reading are not claims. The validator catches the mechanical cases before the judge sees a report; the judge catches the semantic ones (a blank for a fact stated elsewhere, a date misread).

### W1. The write-up is this page's read

Rank higher a write-up that names what a recruiter takes from the page first (the story after one pass and the first hesitation), points at the best-written line as the model, and says the structural things in plain words. Rank lower one that could sit on another resume, lists the cards, restates the score, or praises without a line to point at. (M5 bp5-01, bp5-04: "in general, A and B are catching my drift"; B decisions 1, 2.)

### W2. The right lines, and only those

On a weak page every vague line gets a card: scale, numbers, examples, who they worked with, what changed (M5 bp5-01, bp5-09, bp5-11: "HR Generalist and HR assistant both are super vague in the bullets. no sense of what software is used, the volume of requests, the types of issues handled"). On a strong page the cards are few and none is manufactured (M5 bp5-05: "these are ways to make it even better"). A line that names the work, the deliverable, the decision or the counterpart is not a card for lacking a number (B decision 4). A bare figure with nothing behind it is a card (the "Led a team of 40" case).

Padding loses: a card on a line that already says what it did and how much; a second card on a line another card covers; a card on an optional section the posting didn't ask for.

Missing loses more than padding on a weak page (M5 bp5-09: "we need more story and more detail"), and padding loses more than missing on a strong page.

### W3. Structural problems are cards, placed where a recruiter hits them

Time since the last dated work that nothing accounts for, a title or headline above the work, Education above a year or more of Experience, undated or conflicting dates, no job named when the roles point several ways: each is a card (B decision 6 and 7 as reframed on Nov 5; M5 bp5-02, bp5-03, bp5-07). A dates card gives a dated-line example with honest phrasings, never "add relevant activity" (M5 bp5-02; M1 the HR manager note). A gap the page answers (a dated, explained break; a return the summary states) is not a card (R: Eriksson and Rooth; Kristal). The headline card comes first when it overstates; the dates card follows it; cards on bullets follow in page order (P).

### W4. The example is the line with the detail in

The example reads as a finished bullet once the blanks are filled, keeps every fact the line has, keeps the person's level of ownership, and puts a blank exactly where the page is silent: a number where the role has a defining measure, a name where a deliverable, tool, event or counterpart is missing (B decisions 4 and 13; M5 bp5-12: "managed newsletter xyz for weekly distribution to 10,000 members"). An example that is only the line plus "[specific details]" loses to one that says what kind of detail. An example with a fact outside a bracket that the page doesn't have is a veto (V).

### W5. The question fills the blanks

One question a person can answer tonight, in plain words, asking only for facts they can verify; it asks for what the blanks need and nothing the page already states (M1 C3 and C7).

### W6. What a recruiter can't tell is in the recruiter's words

Direct, then kind; the resume's own subject matter; no evaluator words ("signal", "impact", "the read"); not the same sentence shape on every card (M5's bar: "some wit, human warmth... not robot ai slop"). This criterion breaks ties; it never outranks W2 or V.

### W7. The score and the rung

The rung is what a recruiter would do with the page after one pass; the number sits inside it (B decision 10). A recognisable recent employer may lift the page one rung, never into Clear and specific, and the write-up says so when it does (B decision 5). A page with time nobody accounts for, a title above the work, or no job named never reaches Clear and specific (P). The judge marks a rung it disagrees with by more than one step.

## Deciding, pairwise

1. Check both reports against the resume (V). A report with a real unsupported claim loses clearly.
2. Compare the card sets (W2, W3): on a weak page the set that leaves out a line a recruiter would trip on loses; on a strong page the set with a manufactured card loses. Same set, in a different order: the order of reading wins.
3. Then the write-ups (W1), then the examples and questions (W4, W5), then the voice (W6), then the rung (W7).
4. `clear` when a named rule decides it; `slight` when both are reasonable reads and the preference is a judgment call; `no_real_difference` otherwise. Position never matters.

## Calibration plan

About twelve items on resumes outside the in-sample sets, two sides each, drawn from saved worklist outputs where two runs differ and hand-edited otherwise, isolating one criterion each: two on W2 (a missing vague line; a manufactured card), two on W3 (a gap carded with a dated line versus "add activity"; headline first versus buried), two on W4 (a blank for a stated fact; an invented name outside a bracket), two on W1 (this page's read versus a generic one), two on W7 (the lift declared; the lift into Clear and specific), two on variance (the same resume, two runs). Matt picks blind with a note per item, through the question UI, before he sees any judge output; the bar is set before the items: the rubric must reproduce at least 10 of 12 and clearly reverse none. Then `eval:judge -- calibrate` once the judge prompt exists, both side orders, with the summary under `tests/fixtures/results/`. Spend: about $5.

## Until the judge exists

This wave is gated on the counts in [2026-11-worklist-run.md](../audits/2026-11-worklist-run.md) (0 FAIL on the synthetic golden and count-check sets; refusals, repairs and never-shipped on the live set) and on Matt reading five reports (a bad, a thin, a strong, a mismatch, a top-tier employer) and saying yes. A prompt change after this one needs the judge above, or a fresh blind pick, before it ships (`../promptops/shipping-gate.md`).
