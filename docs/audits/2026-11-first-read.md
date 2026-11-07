# The first-read prompt, November 7, 2026

This is the measurement behind the report prompt change in the first-read wave (`docs/design/2026-11-first-read.md`). The recruiter-voices research proposed four prompt changes:

- **P1:** name the job the score was judged for, with a reason and a level.
- **P2:** ask where a skill that sits only in a list was used.
- **P3:** ask for a figure's frame.
- **P4:** a first check per field.

P1 ships. Of the rest, only two field checks ship: sales attainment's base and the senior remit. Everything else was tested and held back, for the reasons below.

Every resume and posting is synthetic. The model is `gpt-6.1-terra` (medium) through the production path (`docs/audits/2026-11-worklist-run/tools/run-worklist.ts`: provider messages, the worklist validator, one repair), run as of `--today 2026-11-07`.

## The cases

- **The targeted set** (`manifest.json`, `resumes/`). Ten runs on seven resumes and three postings, each isolating one proposal:
  - a senior backend IC with no posting, against a senior backend posting it fits, and against an engineering manager posting it doesn't;
  - a marketing coordinator whose tools sit only under Skills, with and without a posting that requires HubSpot;
  - an account executive at "132% of quota" with no quota or territory;
  - a financial analyst with bare figures;
  - a nurse whose roles never name a unit;
  - a senior director whose lines are duties;
  - a resume with an instruction to ChatGPT and a repeated keyword block.
- **The full live set.** The 49 cases of `docs/audits/2026-11-worklist-run/manifest.json` (holes, tier, breadth), which guard against regressions. The 15-page CV is refused before the call, as production refuses it.

## The noise floor

The shipped prompt (`0a19c3ee`, pass 8) was run on the full set a second time (`outputs/shipped-redraw/`). Against pass 8:

- the two runs carded the same number of lines on 24 of 49 cases;
- they differed by 0.71 cards a case on average;
- mean cards per report were 3.59 and 3.49, and mean score 76.0 and 75.4.

Any candidate within that spread is indistinguishable from the shipped prompt on the full set. One run per case can't separate small changes, and that matters for the blind picks below.

## What ran

| Run | What changed (cumulative unless noted) | Full set: cards per report, mean score | What it showed |
| --- | --- | --- | --- |
| 1 | P1–P4 first drafts: frame "what it counts, against what, over what time"; skills card when the job turns on them; seven field checks | targeted only | Level and quota questions worked. Skills cards on an AE's Salesforce and an analyst's Excel; four-blank frame questions; a frame card on a 2019 store job |
| 2 | Skills rule narrowed (posting or headline names it); frame limited to the latest two roles, one piece at a time | 3.82, 75.8 | The elite marketing VP went from 1 card to 9, all "over what period?"; the strong PM from 0 to 3, including "who do you report to?" |
| 3 | Frame becomes "what it counts and what you did to get it"; "never ask for a period it doesn't need"; senior check drops the reporting line | 3.00, 76.7 | Padding gone, but mid resumes under-carded: "Launched ABM program", "Managed content marketing" lost their cards |
| 4 | "Never ask" scoped to figures only | 3.24, 76.1 | Still below both shipped runs on 12 cases and above on 4 |
| 5 | Frame's "is a strength, don't ask" sentence cut; "these checks add questions, they never take a card away"; `fit.why` added | 3.94, 75.6 | Weak resumes got more cards; 7 strong resumes gained one, mostly "what approach did you use?" on lines that already said |
| 6 | General frame rule cut (the shipped prompt already cards bare figures: it carded all three in the finance case); employer size dropped from the senior check; stack "in the recent roles" | 4.02, 76.1 | **Blind pick round 1** |
| 7 | "Never take a card away" cut | 3.43, 76.4 | **Blind pick round 2** |
| 8 | Software, customer success and teaching checks cut | 3.63, 75.8 | **Blind pick round 3** |
| 9 (ships) | Skills rule, nursing and early-career checks cut: P1, plus the sales and senior checks | 3.67, 76.2 | Against the second shipped run: 0.63 cards a case, inside the noise floor. Four repairs, all existing validator rules (score floor, a retired phrase, a number outside a bracket, an empty example) |

## Matt's blind picks

Each item showed the resume, then two reports, Left and Right, shuffled by a seeded draw. Each report had its verdict, write-up, fit note and cards. The role and level line was hidden, because its format would have said which prompt wrote it. The pages and keys are in `blind-picks/`.

| Round | Candidate | Item | Matt | Unblinded |
| --- | --- | --- | --- | --- |
| 1 | 6 | Account executive at 132% of quota | Right | candidate |
| 1 | 6 | Nurse with no units | "not sure" | tie |
| 1 | 6 | Staff software engineer | Left | shipped |
| 1 | 6 | Retail store manager | Right | shipped |
| 2 | 7 | Staff software engineer | Left | shipped |
| 2 | 7 | Retail store manager | Right | candidate |
| 2 | 7 | Senior director with duty lines | Right | candidate |
| 2 | 7 | Marketing coordinator, HubSpot posting | Same | tie |
| 3 | 8 | Staff software engineer | Left | candidate |
| 3 | 8 | ICU nurse | Right | shipped |
| 3 | 8 | Elementary teacher | Right | shipped |

Card-changing candidates came to 4 wins, 5 losses and 2 ties. That passes no bar. The two wins that came from a rule, not a draw, were the account executive (the quota question, "What was your FY2025 quota, and what territory did it cover?") and the senior director (the remit question, "How many staff and how much budget were you responsible for?"). Those two checks ship.

The losses share a shape: a strong resume picked up a card on a line it didn't need. Examples are "What teaching approach did you use?" under a line that already says reading growth rose from 0.8 to 1.4 grade levels, and extra cards on older roles. The losses also fall on cases where two runs of the shipped prompt disagree with each other, so a single pick there says as much about the draw as the prompt.

Matt also caught a typo on the round-2 page: "1 lines that need work". That page was the comparison page, not the product, and the product's heading has no count.

## What shipped in the prompt (`web/prompts/resume_v3.txt`)

- **FIT:**
  - `roles[0]` is the job the score was judged for: the headline, or the latest role, or the direction the recent work supports. With a posting, the posting's title comes second.
  - The new `why` field is one sentence on why a recruiter would read the resume as that job.
  - `level` is the level with the fact on the resume that sets it.
  - `why` is in the structured-output schema and the validator's prose checks. It is optional in the stored schema, so reports saved before it parse to the same object and keep their signatures.
- **WHAT COUNTS AS DETAIL:** two first checks. Sales: what the number was against. Senior and executive roles: the remit in team size and budget or P&L.

Unchanged:

- the grounding principles;
- the bands and their anchors;
- the employer rule;
- the cards' rules;
- the voice.

## Held back, with the reason

| Proposal | Why it didn't ship |
| --- | --- |
| A figure's frame, generally | The shipped prompt already cards bare figures. Every wording either padded strong resumes ("over what period?") or starved weak ones |
| A skill only in a list | Tied in the pick; the shipped prompt already asks which tool on the lines that need it |
| Nursing (unit, license state) | Lost its pick on the ICU nurse and tied on the nurse with no units; the sources for it are vendors and a hiring platform |
| Early career, software, customer success, teaching | Untested in a pick, or lost (software); the shipped prompt reads these fields well |

## Spend

$5.00 of the November 5 cap, by the runner's ledgers:

- the shipped prompt's baseline and second run, $0.52;
- nine candidates, $4.48.

About $34.03 remains.

## How to rerun

From `web/`, with only the OpenAI key in `.env.local`:

```
RIYP_ALLOW_PAID_EVALS=true RIYP_WORKLIST_REPORT=1 USE_MOCK_OPENAI=false node ../docs/audits/2026-11-worklist-run/tools/run-worklist.cjs --manifest ../docs/audits/2026-11-first-read/manifest.json --batch targeted --runs 1 --budget-usd 1 --today 2026-11-07 --out ../docs/audits/2026-11-first-read/outputs/rerun
```

The full set is the same command with `--manifest ../docs/audits/2026-11-worklist-run/manifest.json` and `--batch holes`, `tier` and `breadth`.

Folders:

- `outputs/candidate9/` is the shipped prompt's run;
- `outputs/baseline-shipped/` and `outputs/shipped-redraw/` are the shipped prompt's;
- candidates 1 to 5 keep their text reports and ledgers only.

The Report Lab shows the targeted cases on candidate 9 beside the shipped prompt (`first read · …`).
