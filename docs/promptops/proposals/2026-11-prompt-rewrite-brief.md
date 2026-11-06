# Brief: the resume prompt, rewritten from first principles

Status: brief, November 5, 2026. Nothing in this file changes a prompt. It records Matt's twenty answers, the research behind the questions, and the work they set up: a recalibrated judge first, then the prompt, each through the gate in `../shipping-gate.md`.

## Why

The live prompt (`web/prompts/resume_v2.txt`, `83b2a2d1`, 363 lines) grew by accretion: 26 grounding rules, about 30 banned phrases, six score bands, and an 11-field schema of which several fields no surface shows. Two prompt attempts since November 1 passed their automated counts and lost the judge or Matt's pick. The judgment wave (PR 69) fixed the validator and the severity merge in code, and the live run showed the model prizing figures over named deliverables, varying its Critical Miss set run to run (22 of 41 repeats), and refusing honest answers it should have shipped.

Matt asked for a first-principles look: research, then twenty questions. This is the result.

## What the research said

Read before the questions; cited where a decision leans on it.

- **Prompt structure.** Anthropic's guidance: the role and the standing rules in the system prompt, the task in the user turn; general principles over prescriptive lists; say what to do, not what to avoid; every added instruction lowers adherence to the rest. OpenAI's: conflicting instructions degrade output, and each section should carry one job. The live prompt has rules that pull against each other (rule 9 "surface buried evidence" against the judge's "a concrete fact beats a move"; rule 22 "no number required" against the severity check's "no scale or result" bar).
- **Judging.** Anchored scales beat bare numbers; judge in both side orders; calibrate against expert labels, and re-check when the expert's rules change. The judge is in-sample on ten items from November 1, and its rubric decided the November 5 eval against a rule Matt now wants.
- **How recruiters read.** Pina et al. 2023 (221 recruiters, eye tracking): time on Experience went with advancing a resume; Education mattered less. The six-second figure is vendor data. The report should spend its attention where the recruiter does.
- **Numbers versus named work.** No controlled study isolates a quantified bullet against a duty bullet. Practitioner guidance (Bock's X-Y-Z) and correlational studies (Tsai 2011, Cole 2009) support "show the result"; nothing supports "every line needs a figure". NACE 2025: employers say they look for evidence of problem-solving and teamwork, which a named deliverable supplies.
- **Employer prestige.** No controlled study of a prestige halo on resume screening was found. What exists is recruiter self-report and audit studies of school prestige (mixed, field-dependent). Matt's own fifteen years say it matters a lot. The decision below is his, labeled as judgment, not research.
- **Gaps.** Eriksson and Rooth 2014: an old closed gap made no difference; current unemployment did. Kristal 2023: an explanation line did not help callbacks; showing years per job did. The rubric's C4 already encodes this.

## The twenty decisions

Round 1 was answered on November 5 before the founder-mark swap; rounds 2 to 5 after it. Where the answer was "idk" the recommendation stands provisionally and is flagged.

| # | Question | Matt's decision | What it changes |
| --- | --- | --- | --- |
| 1 | What question does the report answer? | Whether a recruiter would move them forward to the next stage or reject them. | The Verdict is that call, in those words. Every other field serves it. |
| 2 | What is the Verdict? | "Your read, written down." | The Verdict is the recruiter's first-pass read as prose, not a score caption. |
| 3 | What should drive the score? | Evidence tiers, and company tier "matters a lot" (Anthropic, OpenAI, Google, Meta). | A tiered evidence model replaces the bullet-count bands. Employer tier becomes an input (see 5). |
| 4 | Does a bullet without a number fail? | Exempt when a deliverable is named. | The severity check's `no_evidence_latest_role` and rule 22 align: a named deliverable, decision, resolved problem or counterpart is evidence. The number is asked for where the role's defining measure is missing. |
| 5 | How does a recognizable employer count? | **Raises the band outright.** A top-tier recent employer moves the score up a rung even when the lines are vague. | The live line "Score the evidence on the page, not ... employer prestige" goes. See the design note below: the lift is bounded, declared to the reader, and never above the rung the evidence plus one allows. |
| 6 | Structural gap or concrete fact gap first? | Whatever ends the read first. | Fix 1 is the thing the recruiter trips on soonest. The severity check's leading kinds (no recent work, title mismatch) stay first when present; otherwise the latest role's core line. The rubric's C2 ("fact beats move") stops deciding order on its own. |
| 7 | How many Critical Misses? | **All that qualify, up to eight.** | Code cap 3 becomes 8 in the validator, the severity merge and the headings. The "more than three" signal becomes "more than eight". Rubric C8 and the count checks follow. |
| 8 | The Critical Miss bar? | Costs the interview on its own. | Unchanged. The label stays rare on strong resumes. |
| 9 | Honest mismatch in the Verdict? | "idk". Provisional: say the mismatch, then the fix; score the fit, not the candor. | Flagged for Matt when he reads the first candidate reports. |
| 10 | Keep the 0 to 99 score? | Keep the number, show the rung. | The prompt gets the four product rungs as anchors with 0 to 99 inside each; `score-band.ts` and the prompt can no longer disagree. Re-check deltas keep working. |
| 11 | Worked examples? | One short anchor per rung. | Four three-line excerpts with score, rung and the one-sentence why. About 400 tokens a call. |
| 12 | Cut the unused schema fields? | Cut every unused field. | See the cut list below. The validator, `ReportTypes.ts`, the integrity pass and the PDF export change with it. |
| 13 | Rewrites or questions? | Both, rewrite shown first, the question under it. | The rewrite stays per Critical Miss; ask-first's question sits under it and composes the answer into the line. The prompt keeps rules 14 to 16 for rewrites. |
| 14 | The banned-phrase list? | Positive voice in the prompt, bans in the validator. | VOICE becomes a short description plus two sample sentences. The phrase list moves to `checks.ts` (`E_BANNED_PHRASE` already exists) and triggers the repair pass. |
| 15 | Where does grounding live? | Few prompt principles, strict validator. | Five principles with the why in the prompt. Mechanical checks for every number, name and quoted excerpt in the validator. The 26 rules are triaged: each becomes a principle, a validator check, or is dropped with its original failure case recorded. |
| 16 | One call or two? | One call, judgment first in the output. | The schema is reordered: verdict, rung, score, misses as facts, then prose. No added latency. |
| 17 | Variance? | List all, then pick, in the output. | The schema asks for every candidate miss with a one-line reason, then the ranked pick. Measured as first-fix-line agreement across repeats on the replay set (25 of 41 today). |
| 18 | The judge? | Recalibrate against Matt's blind picks. | A fresh blind pick on about twelve items built from the decisions that changed; rubric v5; calibration until it reproduces him. About $5. |
| 19 | Definition of done? | Beats live on the gate, plus Matt's sign-off. | `GATE: PASS` under judge v5 (preferred 80% or more, zero vetoes, count checks), and Matt reads five reports and says yes. |
| 20 | Order? | Judge recalibration, then the prompt. | Two PRs. The second is measured by the first. |

## Design notes on the hard ones

### Employer tier (decision 5)

The risk is the model guessing prestige for names it half-knows, and the reader not knowing the brand carried the score. Three constraints keep it honest:

- **Declared.** When tier lifts the rung, the Verdict says so in the reader's terms: "The Google line will get you read. The bullets under it don't yet say what you did there." The lift is visible and the gap is still named.
- **Bounded.** One rung at most, never into "Ready", and only for a role within the recruiter's reading window (current or latest relevant role). An old logo does not lift a thin recent role.
- **Criterion, not a list.** "An employer whose hiring bar is widely known in this field" with a handful of examples. A name the model cannot place earns nothing. The validator cannot check this; the judge rubric gets a criterion for it, and Matt's blind pick includes two items that isolate it.

This is Matt's expert judgment against no controlled evidence. The methodology page and the "only from your facts" line need a sentence about it before it ships, since the score would no longer be "the evidence on the page" alone. That copy is Matt's call.

### Up to eight (decision 7)

The homepage meta description, pricing and the FAQ say "up to three changes" and "the one thing to fix first". The rubric already lists that conflict (row 2). At eight it is a copy decision Matt has to make before the prompt ships: the count stays honest on the page, and the public line changes to match ("every Critical Miss, and the one to fix first" is already on the homepage).

The page handles long lists; the heading function `criticalCountHeading` and the "more than" signal need the new cap, and the count-check key's bad resumes carry three labeled problems each, which still works as a floor (at least two of three addressed).

### The schema cut (decision 12)

Checked on November 5 against every surface and the PDF:

- Rendered nowhere: `section_review`, `job_alignment.jd_keywords` (matched, missing, match_count, total_count). Cut.
- PDF only: `subscores`, `next_steps`, `biggest_gap_example`. The PDF is the report's print form, so these go only if the PDF drops them too. Recommendation: drop `subscores` and `biggest_gap_example` from both; keep `next_steps` for the PDF or fold it into the ranked misses.
- Shown: `score_plain`, `score_comment_long` (the score caption), `first_impression_takeaway`, `rewrites`, `role_fit`, `job_alignment` (the rest). Keep.
- `ideas.questions` comes from a separate route and prompt. Out of scope.

## The work

### PR A: judge v5

1. **Blind-pick items, about twelve.** Built from resumes outside the in-sample ten: the live-judgment set (`docs/audits/2026-11-live-judgment/resumes/`, 19 synthetic resumes with saved production outputs) and the count-check resumes. Each item isolates one changed decision, with the two sides drawn from saved production outputs where a real pair exists and hand-written otherwise: two on tier, two on "what ends the read first", two on the deliverable exemption, two on the count past three, two on honest mismatch, two on variance (same resume, two production runs). The format is the existing `tests/fixtures/results/blind-pick/` trio (items, key, result).
2. **Matt picks blind**, with a note per item, through the question UI. His bar is set before he sees the items: the rubric must reproduce at least 10 of 12 and reverse none.
3. **Rubric v5** (`docs/evals/critical-miss-rubric.md`): C2 becomes "whatever ends the read first", C8 goes to eight, a new criterion for the deliverable exemption and one for employer tier, honest mismatch under C4 or its own. The November 1 picks stay as sources where not superseded, and each supersession is listed under Conflicts.
4. **Calibrate** with `npm run eval:judge -- calibrate --set all` until the new picks and the surviving old ones hold, plus the contrast pairs rewritten for the changed rules. Record the summary under `tests/fixtures/results/`.
5. Spend: about $5 (calibration runs are about $0.19 each; the pairs are judged in both orders).

### PR B: resume prompt v3

1. **The prompt.** System prompt: role, the question it answers, voice (positive, two samples), five grounding principles, the evidence tiers, the tier rule, the four anchored rungs with excerpts, the Critical Miss bar and count. User turn: the resume, the source catalog, the posting, today's date. Schema reordered judgment-first with the list-then-pick block. Target: under 180 lines.
2. **The validator** takes the banned phrases, the number-and-name grounding checks, and the cap of eight.
3. **The severity check** aligns its `no_evidence_latest_role` with the deliverable exemption, or is folded into the main call if the judgment-first schema makes it redundant. Measured both ways.
4. **Schema and surfaces**: the cut list, the heading cap, the PDF.
5. **Copy**: the "up to three" lines and the methodology sentence on tier, as Matt decides them.
6. **Gate.** Production versus candidate on the 10 synthetic golden fixtures, the 12 count-check resumes and the 19 live-judgment resumes, two runs each, judged by v5. Plus the replay counts: intern-scale asks (6 of 6 today, target 0), "Led a team of 40" kept (3 of 3, target 0 with the question present), first-fix-line agreement across repeats (25 of 41, target higher, measured not promised), refusals, never-shipped.
7. **Matt's read**: five reports, chosen by me to cover a bad, a thin, a strong, a mismatch and a tier case.
8. Spend: about $10 for the runs at $0.011 to $0.019 a shipped report, under $1 for the compare. Stop line $15.

Total for both: about $16 of the $43.71 left in the November 5 cap. `RIYP_ALLOW_PAID_EVALS=true` per command, the OpenAI key alone, synthetic resumes only.

## Open for Matt

- Decision 9, honest mismatch: confirm or change when the first candidate reports come back.
- Public copy at eight: the meta description, pricing, FAQ and methodology lines.
- The methodology sentence on employer tier.
- Whether `next_steps` stays in the PDF.

## The direction after the blind pick, November 5 (evening)

The blind pick ran the same day: `tests/fixtures/results/blind-pick-v5/` (PR 74). Six of the eight decided items matched the brief. The finding that overrides the plan above: four times, unprompted, Matt said he is not sold on the Critical Miss framing. His words on bp5-09: "i do not agree that there is ONE critical miss or line that fucks someone up. i think we have bad resumes and good resumes. bad resumes get looked over. we want to make sure we're giving candidates the best possble shot of telling their story to get that interview." On a strong resume (bp5-05) nothing is a miss: "these are ways to make it even better." On weak ones he wants every vague line called out: scale, numbers, examples, story, who they worked with, and example rewrites ("managed newsletter xyz for weekly distribution to 10,000 members").

He then set the shape, after reacting to two sketches on Sam's resume (`docs/design/2026-11-worklist-report/`):

- **The write-up first.** The recruiter's own words, up to three paragraphs, "not a forced 3 sentence summary". Score and rung stay above it.
- **Then the lines, one card each**, in the order a recruiter hits them, "at least the lines that need obvious work". Each card carries three things: the line as written, what a recruiter can't tell from it, an example of the line with the detail in (blanks the person fills, nothing invented as fact), and the question that fills the blank. Structural items (section order, dates, a gap) are cards too. Lines that are fine are not listed, or get a single "keep as is" card when one line should be the model for the rest.
- **No Critical Miss label.** Strong resumes get fewer cards and a shorter write-up, never a manufactured problem. "The read" is not a name for anything either: he called it AI slop.
- **The bar:** "the same UI polish a top product designer or engineer would appreciate. we can't get this wrong. and the copy/tone has to be great. some wit, human warmth, the stuff we defined before."
- Three smaller rules from his notes: Experience above Education as a rule; gaps get a dated-line example and honest phrasings (sabbatical, family, travel, real consulting), with a resource on how to phrase them; an unknown employer's size or kind is worth a line.

What this changes in the plan above: decisions 6, 7 and 8 (what leads, the count, the bar) become the card order and the choice of which lines get a card; rubric v5 as a Critical Miss rubric is not written. The judge's question becomes whether the write-up and the cards are the recruiter's read of this resume, which needs its own calibration set. Decisions 1 to 5 and 10 to 17 stand. The public copy ("Every Critical Miss, and the one to fix first", "up to three changes", pricing, methodology) changes with the product, and that copy is Matt's call before launch.
