# Live judgment run: the hole resumes and a breadth set through the real model

Date: November 5, 2026. Branch `claude/live-judgment-run-cf8066`, cut from `main` at `d15fc69c`. Evidence only: no product code, prompt, validator or fixture under `web/tests/fixtures/` changed. Companion to [the report and signed-in review](2026-11-report-and-signed-in-review.md) (PR 60), whose judgment calls were read from saved outputs and code because the mock model answers nothing about judgment. This file replaces that inference with runs.

Everything is under [`2026-11-live-judgment/`](2026-11-live-judgment/): the runner (`tools/run-live-judgment.ts`, which calls the production modules in the same order as `/api/resume-feedback`: request validation, provider messages, `callOpenAIChat`, the validator, the one repair pass, the severity check and its merge), the manifest, the synthetic resumes written for this run (`resumes/`), every saved output as JSON and text (`outputs/<case>__run<n>.json|txt`), the per-run table (`results.md`), and the recruiter leads written blind before the outputs were read (`recruiter-leads.md`). Model `gpt-6.1-terra`, reasoning effort medium, resume prompt `83b2a2d1`, severity prompt `f1bb4571`, today sent as 2026-11-05.

## The short version

- **The validator, not the model, is the largest hole.** 39 of 101 first drafts were refused and 11 runs (11%) never shipped a report. The thin student resume failed 3 of 3 and the academic CV 3 of 3 on one detector that calls a long coursework line or a Ph.D. line a "summary" and then refuses the model for saying there is none. The review ranked the thin resume eighth; in production that person gets "We couldn't finish this report on our side."
- **The gap sat behind a line edit every time it was found** (8 of 8 cases), as the review inferred. The bad resume's gap since June 2023 became a Critical Miss in 1 run of 3, and that run dated it from November 2021.
- **The honest answer to a mismatched posting gets refused.** The model wrote "The nursing job calls for a different set of qualifications that aren't here" and the validator rejected it as unsupported facts, because the Verdict is audited against the resume alone. What ships: a line edit on the analyst resume under "most likely to cost you the interview", and the fit sentence two screens down with its missing-requirements list stripped to one item or none.
- **The count lead overclaims on 11 of 40 breadth resumes** that a recruiter would call ready, plus the strong hole resume, exactly as the review said.
- **The bottom band is 57 to 68 in practice.** Nothing scored below 57. The band's "40 and 68 read the same" problem does not occur; the real problem is that every weak resume lands within eleven points and two badly shaped resumes (an inflated director title, a barista's design resume) scored 80, "Mostly clear".
- **The first Critical Miss was the recruiter's lead on 10 of 40 breadth resumes** (17 of 40 if the Verdict's opening counts). Run to run, the first fix stayed on the same line in 25 of 41 repeated cases and the Critical Miss set changed in 22.
- **Spend: $2.29 token-priced** (the runner's conservative ledgers say $2.55) against an estimate of $3.49 and a ceiling of $12.

## 1. The verdict per hole

Each hole ran three times unless noted. Quotes are from the saved outputs; run numbers refer to `outputs/<case>__run<n>.txt`.

### H1. The bad resume (`h1_bad_resume`, 3 runs, scores 58, 58, 57, "Needs more context")

Ten things wrong: a "Hard-working team player" objective aimed at Marketing Manager over store, warehouse and delivery jobs; five jobs in four years; two undated; typos ("employes", "saftey", "manor"); nothing since June 2023; a soft-skill skills list; "References available upon request."

What the live model did:

- **The Verdict led with the right tension in 3 of 3**: "The Marketing Manager objective points in a different direction from the experience that follows." (run 1); run 3 added "The employment dates are incomplete." That is better than the review expected from the saved outputs.
- **The Critical Miss was the phone-sales line in 3 of 3**: "In the wireless sales bullet, explain how you helped customers choose phones or accessories, using a specific example you can verify." over "- Sold phones and accessories to customers". No recruiter leads with that.
- **The gap was a Critical Miss in 1 of 3.** Run 1's severity check added "Add one dated line covering November 2021 to today, and include recent marketing work or study if true." as CM2, reading the wireless job as the last marketing-relevant role; the resume's last dated job ends June 2023. Runs 2 and 3 returned only a promotion of the missing-dates fix, so the heading read "Two Critical Misses" and the gap was nowhere on the page.
- **Undated roles were a Critical Miss in 3 of 3** (CM2 or CM3), the one structural problem the check found reliably.
- **Typos surfaced in next steps in 3 of 3**, framed by the prompt's extraction rule: "Compare the extracted phrases "employes", "saftey procedures" and "timely manor" with your original file, then correct the resume if needed." The resume is pasted text; the typos are the person's.
- **Never said**: five jobs in four years (0 of 3), "References available upon request" (0 of 3), cut the objective (it appears as a gap in run 2 and as "Revisit the Marketing Manager objective" in next steps, never as a fix). "Keep this one" chose a duty bullet each time ("Training new employees shows that your Shift Lead work included helping others learn the job.").
- Run 3's first draft was refused ("score_plain unsupported narrative facts: retail, customerfacing") and repaired.

Against the review: inference 1 (gap second to a line edit) **right where it fires and worse than feared**: it fired once in three. "The other seven problems are silent" **right** for job-hopping, the references line and the cut; **slightly wrong** for the wrong-role read, which the Verdict carries. Band bottom **confirmed**: 57 to 58 reads "Needs more context: The jobs are easy to follow. What you did in them mostly isn't."

### H2. The thin resume (`h2_thin_resume`, 3 runs, no report shipped)

One internship, coursework, a club. **Every run failed after the repair pass**, three times on the same validator line:

> The model response failed the evidence grounding contract at section_review.Summary: the source contains this section; review its existing content; do not report it absent.

The resume has no summary. `hasSummarySection` (`web/lib/llm/evidence-canonicalizer.ts:35-53`) finds no named heading, then takes the lines before "EXPERIENCE" and calls any non-contact line of 90 or more characters and 15 or more words a summary (`line.length >= 90 && wordCount >= 15`). Here that line is "Relevant coursework: Introduction to Data Analysis, Database Systems, User Experience Research, Programming for Information Science, Statistics". The model, correctly, wrote `"missing": "Section not present."`; lines 531 to 537 refuse that as a contradiction, the repair prompt repeats the instruction, the model repeats the truth, and the run dies. Cost per failed run $0.03 to $0.045; what the person sees is "We couldn't finish this report on our side. Your resume wasn't the problem."

The refused drafts themselves were fair: score 64 to 65, Verdict "Your credit union internship puts Excel, SQL and Tableau in a work setting. The dashboard for marketing is worth keeping because it names an audience for something you built." and the first fix on the dashboard line in 3 of 3, which is the recruiter's lead. No intern-scale ask appeared in the drafts. The severity check never ran, so whether it would have asked an intern for team size is unknown here; on the two other student resumes in the breadth set it did (below).

Against the review: inference 8 ("thin resumes are read like senior ones") **cannot be judged on this resume because no report exists**; the failure is **worse than feared** and is the validator's. Any student whose Education section sits above Experience and carries a long coursework line hits it.

### H3. The strong resume (`h3_strong_resume`, 3 runs, scores 89, 89, 89, "Clear and specific")

A senior product manager with results on every line. The model scored it 94, 93, 94 ("Top Tier"); the calibrator (`web/lib/llm/resume-score-calibration.ts`, 5 outcome bullets of 11 at 20% density or more, cap 89) shipped 89 each time. The same line was the Critical Miss in 3 of 3: "In the payments roadmap bullet, add an example of competing priorities you weighed and the choice you made." over "Own the payments platform roadmap for 4 product teams (22 engineers) serving 11,000 business customers", under "One Critical Miss. Fix it first. It's the one most likely to cost you the interview." The severity check added nothing. The Verdict is good ("The results are easy to find; the priorities behind that roadmap are less visible."), the keep is right (the tokenization bullet).

Against the review: inference 3 **confirmed exactly**: a fair question presented as the thing that costs the interview. Stability was perfect across three runs.

### H4. The wrong-shaped input

**H4a, a fifteen-page academic CV (38,071 characters), 1 run.** Refused before any model call: "Something in your request needs a quick tweak before I can give you feedback." with the field error "Your resume text is very long. Try trimming extra content." The 30,000-character cap is never named. Cost $0. Through the upload route a `.txt` is "Choose a PDF or DOCX file." (`outputs/parse-path-check.json`). **Confirms** the review's H5.

**H4b, the same CV trimmed under the cap (23,674 characters), 3 runs, no report shipped.** First drafts refused on the same summary detector (the CV has no "EXPERIENCE" heading, so the first five lines are checked and the Ph.D. line qualifies): "contradicted positive source evidence at section_review.Summary.missing." Repairs then failed on "ambiguous source evidence: top_fixes[0].evidence.excerpt", because the model made the fix "Check the repeated Drp1 publication entries against the original records" and cited a title that appears more than once. The repeated titles are an artifact of the generator that wrote this CV; the model caught them, which a careful reader also would. The drafts scored 82 to 83 and opened "You're a tenured molecular biology professor with NIH funding and an extensive academic CV." No draft asked what job the CV is for.

**H4c, a resume pasted as one paragraph, 3 runs, 2 shipped (82, 83, "Mostly clear").** All three first drafts were refused, each for a different reason (an unsupported "direction binding" in the summary; a fix "not actionable"; a question that "does not establish conflicting inputs"); two repairs succeeded, one failed on the word "picture". Run 1's Verdict named the problem in its second sentence: "The supplied text runs together, making those responsibilities less easy to scan." Run 3 never mentioned the format. Both shipped Critical Misses asked for the work behind "improved on-time rate from 91% to 96% in 2024", a line that already has its result. The content under the formatting scored 25 points above the bad resume.

Against the review: H5 **confirmed** (cap message; "the one-paragraph resume ... likely a repair") and **extended**: the paragraph makes the validator flaky (3 of 3 refusals) and the format is named in 1 of 2 shipped reports.

### H5. The mismatched posting (`h5_mismatched_posting`, 3 runs, scores 84, 84, 83, "Mostly clear")

A data analyst against a night-shift medical-surgical RN posting. **All three first drafts said the honest thing and were refused for it.** Run 1's Verdict ended "The nursing job calls for a different set of qualifications that aren't here" and was refused as "first_impression unsupported narrative facts: nursing, call, different, set, qualification, aren't, here." Runs 2 and 3 wrote the gap "The resume does not list an RN license or BLS certification, both required for the posted role." and were refused for "RN, BLS". The narrative audit (`web/lib/llm/source-fidelity.ts:468-473`, `auditNarrativeClaim(auditableValue, resumeText, ...)`) checks the Verdict and the gaps against the resume text only; the posting is consulted for `jd_keywords` and role titles, not for prose.

After repair the mismatch survives in the Verdict's second sentence in 2 of 3 ("The supplied role is a medical-surgical nursing position, but the resume does not describe clinical work."), not at all in run 1. The fit sentence is honest and buried: match score 5 of 100 in 3 of 3, "The resume describes analytics work rather than direct clinical care. It does not document the license, certification, clinical training, or care-documentation experience specified in the posting." in the Role fit section. The missing-requirements list the model wrote was stripped by `canonicalizeOptionalReportMetadata` (`web/lib/llm/optional-report-metadata.ts:33-39`, which keeps an item only when the matcher finds it in the posting): 7 items to 1 in run 1, 6 to 6 in run 2, 7 to 0 in run 3. The Critical Miss in 3 of 3 was a line edit on the analyst resume ("add an example of a business question you investigated") under "It's the one most likely to cost you the interview." Band "Mostly clear" for a resume that cannot get this job.

Against the review: H6 ("untested") **now tested**: the model is honest about fit; the product buries it and the validator fights it.

### H6. The unverifiable claim (`h6_unverifiable_claim`, 3 runs, scores 64, 64, 64, "Needs more context")

"Led a team of 40" over duty bullets. In 3 of 3 the Verdict endorsed it: "Leading a team of 40 is worth keeping near the top because it shows the size of your management responsibility." The Critical Miss was "Improved processes across the department" each time; Role fit read "responsibility for a team of 40 indicate a management-level role." A recruiter would question the 40; the report builds on it. The prompt asks for exactly this (rule 10, "respect the ownership the resume does state"; "react once to a fact the resume has earned"), and nothing in the validators distinguishes a bare claim from a supported one.

Against the review: H7 ("stated correctly, nothing to fix") **wrong in degree**: the claim is not just stated, it is praised, and it anchors the level read.

## 2. The breadth picture

Forty synthetic resumes, two runs each, 80 runs, 76 shipped (4 died in the validator: the welder run 1, the COO run 1, the career-changer Maria run 1, the customer-success-with-posting run 1). Marks against the blind leads are per run in `results.md`; the tallies below use the case's shipped runs.

**How often the first Critical Miss was the thing a recruiter would lead with.** 10 of 40 as the first fix itself (the staff accountant's duty bullets, the inflated "marketing manager" headline on a recent graduate's resume, the CSM's renewal result with and without the posting, the Arlo design line, the nonprofit's student count, James's thin freelance line, Daniel's internship feature, the retail manager's unbacked second turnaround, the social worker's caseload in one run, the pharmacy table in one run). 7 more carried the lead in the Verdict's opening or the keep but not as a fix (the military translation, the barista's design gap, the inflated director title, the table resume, the quota line). On 8 the recruiter's lead sat second or third: both gap resumes, the dispatcher's driver count, the kitchen's and warehouse's measures, the career changer's missing headline, the welder's certifications, Maria's filler summary. On 4 it never appeared: the executive assistant's twenty months between June 2023 and February 2025 (the freelance line since counts as current), the non-native English resume's grammar, the paragraph resume's format, the teacher-to-designer positioning. On 11 the recruiter would have said "ready" and the report still printed "One Critical Miss. Fix it first. It's the one most likely to cost you the interview." (nurse, paralegal, COO, CMO, physical therapist, FP&A, construction PM, backend engineer, security analyst, staff engineer, and the teacher whose reading-growth result became the miss instead of the keep).

**How often a gap or title mismatch sat behind a line edit.** 8 of 8 cases where the severity check added a structural Critical Miss (`no_recent_work`, `no_target_role`, `title_level_mismatch`): the bank branch manager (gap since December 2024, CM2 behind "add the actions you took to grow deposits"), the marketing coordinator (gap since March 2024, CM2), the barista with a design background (CM2), the inflated director (gap CM2, title CM3 in one run, absent in the other), the IT graduate (gap CM2), the "marketing manager" graduate (gap CM2), the career changer with no headline (CM2 or CM3), the bad resume (run 1). In 0 did the structural miss lead. The one time a title mismatch led, the model itself made it the first fix ("Revise the opening to match the responsibilities shown", recent-grad case), not the check.

**How the band distributed.** 90 shipped reports: 34 "Needs more context" (all between 57 and 68), 35 "Mostly clear" (72 to 84), 21 "Clear and specific" (85 to 91). No run scored below 57 and no run reached 92 after calibration. Every weak resume by the count-check key landed in the bottom band, so the rung is doing its job at the floor; what it hides is the eleven-point spread between a resume with ten things wrong (57) and a career changer with a thin portfolio (68). Two badly shaped resumes escaped it: the "Director of Marketing" over Instagram posts scored 80 in both runs with two or three Critical Misses, and the barista's design resume scored 80. The calibrator moved strong resumes down, not weak ones up: the COO 94 to 89, the product manager 94 to 89, and the staff engineer 85 and 86 to 78, into "Mostly clear", because few of his bullets carry a percent or dollar sign (`resume-score-calibration.ts`, the "eight bullets, two qualitative outcomes" cap of 78).

**Roles the criteria were not written for.** The welder, pharmacy technician, nurse, teacher, social worker, kitchen manager, dispatcher and platoon sergeant all got reports that read the trade correctly (fit-up tolerance, USP 797, ventilated patients, 6G certification, "some military terms need translation for readers outside the service"). The misses are the measures: nobody asked the kitchen manager about food cost or labor, or the warehouse supervisor about orders per night; the social worker's caseload and the dispatcher's driver count were asked, through the severity check's `no_evidence_latest_role`, and so were the nonprofit's placements. Where the role has one defining number and the resume lacks it, the check asks about half the time and never first. The table resume was handled best of any format: one run made "Move each entry in Duties and Results beneath its matching job in Experience" the Critical Miss, the only structural first fix in 90 reports. The paragraph resume's format was never mentioned.

**The same resume with and without a posting** (customer success manager): identical Critical Miss ("what you contributed to the strategy and any renewal result you can verify"), identical score (80), identical keep. The posting changed only the Role fit block (match 65, "Fit is less certain on quantified retention and expansion, executive-sponsor reviews, and product usage"), and its missing list shipped empty; the run that failed did so because the validator refused "Looker", a tool named in the posting, in `job_alignment.missing`.

**Run-to-run variance, in one number and three examples.** Of 41 cases with two or more shipped runs, the first fix cited the same line in 25 (61%) and the set of flagged Critical Misses changed in 22 (54%). Scores stayed within two points in 39 of 41. Examples: the marketing coordinator with a gap scored 67 then 80, "Needs more context" then "Mostly clear", on identical text; the inflated director got a `title_level_mismatch` Critical Miss in run 1 and none in run 2; the bad resume's gap was a Critical Miss in 1 run of 3. Smaller: the social worker's caseload count was CM2 then CM1; the teacher sat at 84 then 85, across the band line.

**What the severity check did.** It added a Critical Miss to 24 of 90 shipped reports (31 additions: 15 `no_evidence_latest_role`, 13 `no_recent_work`, 2 `no_target_role`, 1 `title_level_mismatch`) and promoted an existing fix in 6. The `no_evidence_latest_role` additions on the three student resumes read as the review feared: "add how many tickets or laptops you personally handled, if you can verify it" (IT intern), "add the size of the Agile team you worked on or a measurable result" (Daniel), "add the newsletter's audience size" (intern). It did not fire on the HR generalist whose dated caregiving break ended in June 2025 with nothing after it (the prompt's "a dated, explained break" rule covers the break, not the sixteen months since); the model's own `gaps` text caught it in one run and the integrity pass lifted it into the opening. It did not fire on the executive assistant's twenty months because a current freelance line exists.

**What never ships.** 0 of 90 reports carried a model rewrite; the "rewrites built only from your facts" are the answer flow alone, as the review said.

## 3. The prompt, the validators, the model

For each failure, the part that caused it and the line that does it.

| Failure | Cause | Where, quoted | Evidence in this run |
| --- | --- | --- | --- |
| A student resume or a CV never ships | **Validator.** A long opening line is called a summary; the model's truthful "Section not present." is refused as a contradiction, on the first draft and the repair. | `evidence-canonicalizer.ts:47-51`: `return !looksLikeContact && line.length >= 90 && wordCount >= 15;` and `:531-537`: `"the source contains this section; review its existing content"; ... do not report it absent` | h2 3 of 3, h4b 3 of 3, COO run 2 first draft (repaired), 12 refusals in all |
| 11% of runs end in "We couldn't finish this report" | **Validator.** 28 of 39 first-draft refusals and 5 of 11 repair failures are "unsupported narrative facts" on ordinary words. | `lib/validation/schemas.ts:159`: `${issue.path} unsupported narrative facts: ${issue.unsupportedFacts.join(", ")}`; the words refused: both (3), picture (3), leave (3), aren't (2), actual, choice, largely, out, view, help, more, stated, reduction, consulting, availability, moved, supervising | 39 of 101 first drafts refused; 11 runs lost |
| The honest fit sentence on a mismatched posting is refused; the missing list is stripped | **Validator.** The Verdict and gaps are audited against the resume only; posting words count as fabrication. Missing requirements survive only when the matcher finds them in the posting. | `source-fidelity.ts:468-473`: `auditNarrativeClaim(auditableValue, resumeText, {...})`; `optional-report-metadata.ts:35-37`: `const supported = inJob && (kind === "matched" ? inResume : !inResume);` | h5 3 of 3 first drafts refused ("nursing ... aren't, here"; "RN, BLS"); missing list 7 to 1 and 7 to 0; b21 run 1 refused "Looker" |
| The gap is second | **Product decision and prompt.** The first fix never moves; additions follow it. | `severity_check_v1.txt`: "Never change or question Fix 1."; `severity-check.ts` merge: Critical Misses are appended after the first fix | 8 of 8 structural additions in position 2 or 3 |
| The gap is found inconsistently | **Model, within the prompt's rule.** The check decides which role is "relevant" and when a break is "answered". | `severity_check_v1.txt`: "no_recent_work: the most recent role or activity related to the work this person wants ended well before today ... It does not count when ... a dated, explained break" | h1: 1 of 3, dated from the wireless job; b17: break ended June 2025, 0 of 2; b09: 0 of 2 (freelance line counts) |
| The count lead overclaims | **UI copy.** The heading does not bend to the band. | `report-presentation.ts:104`: `return { title: "One Critical Miss. Fix it first.", lead: "It's the one most likely to cost you the interview." };` | h3 3 of 3; 11 of 40 breadth resumes a recruiter would call ready |
| Strong resumes lose a band | **Validator (calibrator).** Outcome density is counted by digits, percent and dollar signs. | `resume-score-calibration.ts`: `hasOutcomeEvidence` regex `/\d+(?:\.\d+)?\s*%|\$\s*\d|.../`; caps of 89 and 78 | h3 94 to 89; b12 94 to 89; b40 85 to 78 ("Mostly clear") |
| An unverifiable claim is praised | **Prompt and model.** | `resume_v2.txt` rule 10: "respect the ownership the resume does state"; VOICE: "react once to a fact the resume has earned" | h6 3 of 3 |
| Typos are blamed on extraction | **Prompt.** | `resume_v2.txt` VOICE: "If text looks garbled, quote the unclear phrase and ask the user to compare it with their original file. Do not assume extraction damage is a spelling mistake" | h1 3 of 3; b19 grammar never mentioned (0 of 2) |
| Filler and the objective are never a fix | **Prompt.** No fix kind can say cut or replace. | `resume_v2.txt` top_fixes: "fix must identify the exact bullet or section to change and the exact missing detail to add" | 0 fixes in 11 runs across h1, b15, b38, b39, b13 ("I" bullets) |
| Intern-scale asks | **Prompt (severity).** The rule reads any latest role the same. | `severity_check_v1.txt`: "no_evidence_latest_role: the latest role in the field this person wants shows no size and no result anywhere" | b10, b11, b39: 6 of 6 runs |
| The paragraph resume's format goes unnamed | **Model.** Nothing in the prompt asks about shape; the table resume was still named. | none | h4c 1 of 2; b22 0 of 2; b23 2 of 2 |

**What this says to the concept session's likely directions.** (a) Letting a `no_recent_work` or `title_level_mismatch` addition lead when Fix 1 is a duty-line edit is the direction the evidence supports most: 8 of 8 structural finds sat second or third, and the model's own Verdict already names the problem in most of those runs, so the page would stop contradicting itself. It needs the judge gate, and the check's own inconsistency (1 of 3 on the bad resume) caps what reordering can deliver. (b) A fourth band rung under 55 would have caught nothing in 90 reports; the bottom rung's problem is compression at 57 to 68, and the honest bottom reads are already there in the Verdict ("most bullets list duties"). A copy change to the bottom anchor, or a band that reads the Critical Miss count, would do more than a rung. (c) The count lead bending to the band (the review's sketch 2) is confirmed cheap and right: on every "Clear and specific" report the Critical Miss was a method or example ask. (d) Before any prompt change, the two validator bugs above are the cheaper and larger win: the summary detector (two lines) and the narrative audit's blindness to the posting. A prompt change evaluated through a validator that kills 11% of runs will be measured on a biased sample.

## 4. Spend

| | Estimated (before the first call) | Measured |
| --- | --- | --- |
| Report calls | 101 | 101, plus 39 repair calls (28 shipped, 11 failed) |
| Typical total | $3.49 | **$2.29 token-priced** (sum of every priced call in `outputs/*.json`) |
| Worst case | $10.45 | $2.55 by the runner's ledgers (`outputs/_ledger_*.json`), which book a failed repair at its reserved worst case |
| This session's share of the cap | $12 | $2.55 used, $9.45 unused |
| The wave's cap | $50 | $47.45 remaining for judged evals of prompt changes, assuming no other session spent |

Per batch: pilots $0.06 (2 runs), holes $0.65 token-priced (ledger $0.73, 22 runs), breadth $1.57 token-priced (ledger $1.76, 80 runs). No batch exceeded twice its estimate (holes estimate about $0.77, breadth about $2.75). A shipped report with its severity check cost $0.011 to $0.019; a run with a repair $0.029 to $0.057; the three CV runs $0.047 to $0.067. The environment held only `OPENAI_API_KEY`; `RIYP_ALLOW_PAID_EVALS=true` was on each command and never in a file.

## 5. What this still cannot say

- **No real user.** Every resume is synthetic (eight written for this run, the rest reused from `tests/resumes/blindpick`, `countcheck`, two golden synthetics and the bar's four fictional personas); the recruiter leads are one reader's, written blind but not a panel's, and Matt has ruled out human panels.
- **The judge was not run** on these outputs. `eval:judge score` on the synthetic reports would cost about $0.50 to $1 and would turn the "overclaim" and "buried" marks into graded verdicts; the saved JSON has the fields it needs (`model_output`, `shipped_report`).
- **Two runs per breadth resume** measures agreement, not a distribution. The 61% same-line figure has wide error bars.
- **The CV's repair failure is partly an artifact**: the generated CV repeats publication titles, the model noticed, and the ambiguous-excerpt refusal followed. The summary-detector refusal that preceded it is real.
- **Production may differ in two settings not visible here**: `OPENAI_RESUME_REASONING_EFFORT` on Vercel (medium was used, the code's default) and the stream endpoint's path, which shares the validator and the check but not the timing.
- **The parse path was exercised without the model** (`outputs/parse-path-check.json`): the image-only PDF gets "Could not extract enough text from the file. Try pasting your resume text directly."; the cover letter passes the paste path's request validation and would spend the free report; the over-cap CV gets the generic length message. Whether the model would write a confident report about a cover letter is left as the review found it.

## The review's seventeen gaps, against the evidence

| # | Gap as ranked in the review | Verdict here |
| --- | --- | --- |
| 1 | Gap or title mismatch second to a line edit; other problems silent | **Confirmed**, 8 of 8; and the gap is found in 1 of 3 runs on the bad resume |
| 2 | Band bottom reads the same for 40 and 68 | **Reframed**: nothing scores below 57; the rung spans 57 to 68 and two misshapen resumes escaped it at 80 |
| 3 | Count lead claims interview cost over a method ask on strong resumes | **Confirmed**, 12 cases |
| 4 | Returning person's workspace | Not tested here (UI) |
| 5 | Nothing says the report was kept | Not tested here (UI) |
| 6 | Objective and filler never a fix | **Confirmed**, 0 of 11 runs |
| 7 | "Sent" cap, Stop copy | Not tested here (UI) |
| 8 | Thin resumes read like senior ones | **Confirmed** on interns (6 of 6 runs ask for intern scale); **worse** on the student: no report ships |
| 9 | A question moved onto the wrong fix | Open; `integrity.decisions` is saved per run for a replay |
| 10 | Not-a-resume and non-English inputs spend the report | **Confirmed** at the gate (cover letter passes request validation); grammar on the non-native resume never mentioned |
| 11 | Saved report opens on two header rows | Not tested here (UI) |
| 12 | Privacy table and export copy | Not tested here |
| 13 | `/dashboard` reachable | Not tested here |
| 14 | Run-to-run variance unstated | **Measured**: first fix same line 61%, Critical Miss set changed 54%, band flipped 2 of 41 |
| 15 | Mismatched posting untested | **Tested**: honest fit, buried; validator refuses the plain sentence and strips the missing list |
| 16 | PDF layout | Not tested here |
| 17 | Role's defining measure asked for rarely | **Partly overturned**: renewals, caseload, driver count and placements were asked (never first); food cost and shift throughput were not |

New, not in the seventeen: the summary detector that kills student resumes and CVs; the narrative audit's refusal of ordinary words (11% of runs lost); the calibrator moving strong resumes down a band; praise for an unverifiable claim; typos framed as extraction damage; the format of a paragraph resume never named.

## Appendix: what ran

From `web/`, with `RIYP_ALLOW_PAID_EVALS=true` on the command:

```
node ../docs/audits/2026-11-live-judgment/tools/run-live-judgment.cjs --manifest ../docs/audits/2026-11-live-judgment/manifest.json --batch holes --runs 3 --budget-usd 2.5
node ../docs/audits/2026-11-live-judgment/tools/run-live-judgment.cjs --manifest ../docs/audits/2026-11-live-judgment/manifest.json --batch breadth --runs 2 --budget-usd 4.5
NODE_PATH=$PWD/node_modules node scripts/run-ts-test.cjs ../docs/audits/2026-11-live-judgment/tools/parse-path-check.ts
python3 ../docs/audits/2026-11-live-judgment/tools/summarize.py
```

The two pilot runs (thin resume run 1, unverifiable claim run 1) ran first with `--only` and `--budget-usd 0.3`; the batches skipped them as existing files. `tests/fixtures/`, `web/tests/fixtures/`, prompts and product code are untouched; `git diff --stat main` shows only this file and its folder.
