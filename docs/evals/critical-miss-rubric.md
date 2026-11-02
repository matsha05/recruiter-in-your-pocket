# Critical Miss rubric

Version: 4 (2026-11-01), matching judge prompt `critical-miss-judge-v4`. The automated judge in `web/lib/evals/judge/` applies this rubric. Its criterion IDs match the judge prompt (`web/lib/evals/judge/prompt.ts`).

## What is being judged

The Critical Miss is the thing a resume should fix first, as an experienced recruiter sees it on a first read. A report shows it beside the Verdict (the first impression) and cites the resume line it comes from. Since Matt's count decision, a report flags every problem that would cost an interview on its own, up to three, most important first; the first is still the thing to fix first.

- Product definition: "the one thing to fix first" (`web/lib/billing/pricing.ts:40`, `web/app/(marketing)/page.tsx:9`). The methodology page describes the choice: "Of everything that could be clearer, the report picks one thing to fix first. Often it's a strong example that stops short of its result, or a responsibility that hides how much you owned" (`web/app/(editorial)/methodology/page.tsx:98`).
- Matt's decisions after the November 1 blind pick: a report may carry **up to three** Critical Misses, and **every report names a top fix**; there is no "Nothing critical" state (relayed by the coordinating session; see [Conflicts](#conflicts)).
- Matt's count decision, later on November 1: "some resumes are truly horrible. i dont want to lie to people and say they have one critical miss if there are more." He approved this definition: a Critical Miss is any problem that would cost an interview on its own; every one is flagged, up to three, in priority order, with a "more than three" signal when true; and there is no padding on strong resumes (relayed by the coordinating session; see [C8](#c8-every-critical-miss-up-to-three)).
- The judge doesn't grade the rest of the report, its tone, or its formatting. It asks one question first: is the first Critical Miss the right thing to fix first, and is the fix real help? When a report flags more than one, it also asks whether the others belong (C8).

## Sources, in order of authority

Where sources conflict, the earlier one wins. Every conflict is listed under [Conflicts](#conflicts).

| Key | Source | Strength |
| --- | --- | --- |
| **M** | Matt's blind pick, November 1, 2026: [result.json](../../tests/fixtures/results/blind-pick/result.json), with [items](../../tests/fixtures/results/blind-pick/items.json) and [key](../../tests/fixtures/results/blind-pick/key.json). Production prompt preferred 5, new prompt 1, no difference 4. His notes are quoted verbatim in [shipping-gate.md](../promptops/shipping-gate.md#critical-miss-prompt-attempt--november-1-not-shipped) | The founder's recorded expert judgment (14 years recruiting). Ten synthetic resumes, one judge, and 4 of 10 items without a note |
| **MD** | Matt's decisions that followed the pick: up to three Critical Misses; always a top fix; and the count decision (every problem that would cost an interview on its own is flagged, up to three, with a "more than three" signal; no padding on strong resumes) | Product decisions, relayed by the coordinator on November 1 |
| **P** | Production prompt `web/prompts/resume_v2.txt` (`83b2a2d1`), whose review criteria Matt wrote | Product policy |
| **S** | Prompt-ops and eval specs: [40-promptops-quality-spec.md](../launch-readiness/40-promptops-quality-spec.md), [50-evals-regression-plan.md](../launch-readiness/50-evals-regression-plan.md), [shipping-gate.md](../promptops/shipping-gate.md), plan rows 1.1–1.9 in [70-audit-remediation-plan.md](../launch-readiness/70-audit-remediation-plan.md) | Product policy and audit findings |
| **R** | The research library, `web/app/(editorial)/research/*`, as fact-checked in #35. Claims are used only as the pages now source them | Labeled per claim below |
| **X** | Published external evidence not cited in the library | Labeled per claim below |
| **E** | Methodology, copy and voice docs: `methodology/page.tsx`, [voice-and-tone.md](../voice-and-tone.md), [copy-system.md](../copy-system.md) | Product policy |

## The criteria

The judge applies the veto first, then C1–C8. When two Critical Misses differ on several criteria, the order below is the order of importance, with one exception that comes from Matt's pick: C2 (a concrete missing fact beats a structural move) decides between two issues of similar stakes before C1's finer distinctions do.

### V. Grounded: a veto

Every statement a Critical Miss makes about the resume must be true of the resume. A report that fails this loses, however good its advice would otherwise be.

Unsupported claims include:

- saying a detail is missing when the resume states it anywhere, or asking the person to add it (P rules 8, 25, and "IMPORTANT": "Never ask the candidate to add evidence that is already present");
- inventing a number, scope, tool, employer, outcome or credential, or quoting a line that isn't there (P rules 1, 2, 6);
- misreading dates, for example calling a current role ended, or claiming nothing is listed after a date when something is (P rule 1);
- turning "helped", "supported" or "contributed" into "led" or "owned", or the reverse (P rule 10);
- asserting that an action caused a result the resume doesn't connect (P rules 11, 12).

Sources: P grounding rules 1–26; Matt's blind-pick bar, which carried "a veto for any new pick that cites an unsupported fact" (M, `result.json` "threshold"); S: 40-spec "Hallucinated claims", 50-plan §2.4. R: the library has no study of fabrication; every honesty rule is product policy (agent audit of all research pages, finding 12). Strength: policy, not research.

Not unsupported:

- hedged or conditional advice ("if you can verify it");
- what a reviewer may want;
- a characterization such as "your clearest result" or "a large project", unless the resume contradicts it;
- the production contract's missing-section markers ("No skills section present"), when the resume has no section with that heading.

The judge must quote the exact report text it calls unsupported. A quote that doesn't appear in the report is discarded by code, so the judge can't veto a side on a claim the side never made.

### C1. First-read stakes

The fix should change what a recruiter takes away from the first pass. Rank higher a fix that:

- sits in recent, relevant Experience: the current or latest role, its title, and its main work;
- addresses a pattern that affects the whole read (a title the bullets don't support, a role with no visible scale), not one minor line;
- matters for the role the resume is aimed at.

Rank lower a fix on an old, minor or unrelated line, or on an optional Summary, Skills or Education section.

Sources:
- P: `first_impression` is "what stands out fast and what makes the story harder to follow"; `top_fixes` are the "highest-leverage edits"; "Do not spend a top-three fix on an optional Summary, Skills, or Education section when improving a weak experience bullet would create more hiring signal"; scoring weighs "important recent bullets".
- E: the score's "main driver is how many of your important recent lines show the scope of the work or what changed" (methodology FAQ, `methodology/page.tsx:64`).
- R: Pina et al. 2023, *Machine Learning and Knowledge Extraction* (peer-reviewed eye-tracking study; 221 recruiters, one US state, simulated screen, no time limit, associational): total review time and time on Experience went with advancing a resume; Education mattered less; no comparable result for Skills or summary sections (`research/how-recruiters-read/page.tsx:117,127`). Strength: one peer-reviewed observational study; an association, not proof that an edit causes attention.
- R: the six-second figure is vendor data that "cannot support a universal claim" (TheLadders 2012, 30 recruiters; `how-recruiters-read/page.tsx:99,113,170`). X: TheLadders' 2018 update reported 7.4 seconds and said recruiters scan job titles and subheads ([HR Dive summary](https://www.hrdive.com/news/recruiters-spend-74-seconds-looking-at-your-resume/541582/)). Strength: vendor report, methodology not published. Use: directional only. A Critical Miss must not rest on a reading-time deadline.

### C2. A concrete missing fact beats a structural move

A fix that asks for a tangible fact the page lacks beats a fix that rearranges facts already on the page, when the two concern work of similar importance. Tangible facts include budget or revenue size, team size, scale (users, sites, accounts), a named product, component, report or project, the person's part, and what changed.

"Move this result up" or "lead with this bullet" loses to a concrete fact, because a reader who reaches the buried line still sees it, while a missing fact is invisible at any depth.

Sources:
- M, UX design manager: "Budget size is a tangible thing to grasp onto, it helps the recruiter understand the scale." The budget-size fix beat "Move the 15% retention result above the broader management bullets."
- M, software engineer: "name the component or migration task you contributed to" beat a gap fix (no note).
- M, project manager: both sides were concrete asks; Matt preferred one but wrote "Both are good though". That is a slight preference, not a rule.
- E: "A recruiter should be able to tell what kind of work you do, what you owned, how big it was, and what changed because of it" (`methodology/page.tsx:89`).
- P rule 22: a number isn't required in every bullet; "a decision, deliverable, resolved problem, or clearly described responsibility can be useful detail". R agrees: "Scope without a metric… That's evidence too" and "You do not need a number in every bullet" (`research/quantifying-impact/page.tsx:108,172`).
- R: the "add the result" advice rests on practitioner guidance (Laszlo Bock's X-Y-Z formula, "experienced practitioner guidance, not a controlled trial") and correlational recruiter studies (Tsai et al. 2011: rated accomplishments predicted hiring recommendations through perceived fit; Cole et al. 2009). "No study we know of isolates a quantified bullet against a duty-style one" (`quantifying-impact/page.tsx:122,125,197-199`). Strength: weak to moderate; correlational and practitioner.
- X: NACE *Job Outlook 2025* (employer survey, 237 respondents, August–September 2024, new-graduate hiring): nearly 90% of employers look for evidence of problem-solving and nearly 80% for teamwork on resumes ([NACE](https://naceweb.org/talent-acquisition/candidate-selection/what-employers-seek-on-a-resume)). Strength: self-report survey, small sample, early-career hiring only. Use: employers say they look for *evidence* of work, which a concrete fact supplies.

Conflict: P rule 9 tells the model to recommend moving buried evidence. That stays a valid fix; under M it ranks below a concrete missing fact of similar stakes.

### C3. A specific ask, not a vague one

The fix names the exact line or section and the exact detail to add, in ordinary language, so the person knows what to write. Vague asks lose: "add more detail", "clarify your impact", "describe the part you handled", "say what you've done since".

Sources:
- P `top_fixes`: "fix must identify the exact bullet or section to change and the exact missing detail to add"; "Never write generic fixes such as 'Add specific metrics', 'Include more context', 'Clarify outcomes', or 'Highlight achievements'"; good pattern: "name the problems you handled and the decisions you could make without a manager".
- M, finance analyst: "Same critical miss it looks like. Both are critical. Vague stuff". Vague asks on the right issue still disappoint.
- S: 40-spec Failure 2 ("Add more specifics to your bullets" fails: "which bullets? what specifics?"); 50-plan §2.3 ("No generic advice"); plan row 1.9 (headings should scan; location and conditions in the body).
- R: advice must be checkable and point to a specific line (`research/human-vs-algorithm/page.tsx:91,131`, editorial).

Specificity is about *what to add*, not word count. A short heading that names the fact can be specific; a long one that only says "describe it" is not.

### C4. Gaps: critical only when open, and the fix must help

Weigh a gap by whether the page already answers it, and weigh a gap fix by how much it helps.

- **Answered on the page.** A break that is dated and explained (caregiving, study, relocation, health), or a return the summary states ("recently returned after a caregiving break"), is answered even if nothing is listed after it. A gap between two past roles that is followed by relevant work is closed. Either ranks below a concrete missing fact in the person's real work.
- **Open.** The latest role ends with nothing after it, no explanation, and no recent relevant work at the review date. That is a critical issue. How strong a Critical Miss about it is depends on the help its fix gives:
  1. Real help: point to real, dated activity that fills the period (a role, contract, project, course or certification, including anything already on the page that only needs dates), or say how to present the period briefly and truthfully. This beats a line edit unless the line edit is of exceptional stakes.
  2. No help: "say what you've done since [date]" or "add relevant activity since [date]" with nothing more names the issue but tells the person nothing they didn't know. It still beats a narrow line edit: a secondary bullet, or a request for one example. It loses, slightly, to a concrete, specific fix on the core work of the latest role, or to one that addresses a pattern across the whole resume, such as a senior title whose bullets read as support work.
- Never tell the person to invent a role or title to cover a gap.

Sources:
- M, HR manager (the only item where the new prompt won): "It's critical for sure if there is no more relevant work… if there isn't recent work we really need to give them advice about how to talk about that, or how to fill in worthy projects there." The gap fix there gave no help ("Add relevant work or activity since August 2023."), and it beat a request for "one example of a performance or conflict matter" on the fourth bullet.
- M, sales executive: "Say what you've done since August 2023." lost to "specify which account tasks you handled and what you contributed to proposals or presentations" on the lead bullet of a Sales Executive role whose bullets all describe support work. No note. This item and the HR item are the basis for the "no help" sub-rule, which Matt confirmed on November 1, 2026; see [Conflicts](#conflicts), row 7.
- M, software engineer: the latest dated entry is "Career Break for Family Caregiving", and the summary says "Recently returned to the workforce". "Add your activities after the caregiving break ended" lost to naming the AWS migration component. No note. This is the basis for "answered on the page", which Matt confirmed on November 1, 2026.
- M, product manager and operations assistant: both sides on the same gap, or a gap fix that gives no help against a line edit on a generic bullet, came out "no difference".
- P: "Never tell a candidate to invent a post-break role. Ask for a real course, project, artifact, or current activity instead" (`next_steps`); "Preserve the candidate's actual level of ownership".
- S: plan row 1.4 (structural gaps belong in the opening read); shipping gate "Next attempt: a gap needs advice on what to say or which real projects to add, not only 'say what you've done since'".
- R (all audit studies: fictitious resumes and callbacks, not hires; results differ by field and skill level; `research/gaps-and-pivots/page.tsx:190-192`):
  - Eriksson & Rooth 2014, *AER* (Sweden, 8,466 applications): an old, closed gap made no measurable difference; current unemployment mattered more, mainly for lower-skilled jobs (`gaps-and-pivots/page.tsx:138-140`). Strength: peer-reviewed field experiment. Supports "critical only when there is no recent work".
  - Kroft, Lange & Notowidigdo 2013, *QJE* (about 12,000 resumes): callbacks at eight months out were about 45% lower than at one month (`:47`). Strength: peer-reviewed field experiment.
  - Ghayad 2013 (unpublished job-market paper): past six months out, even matching experience stopped helping (`:42,191`). Strength: weak; small cells.
  - Kristal et al. 2023, *Nature Human Behaviour* (preregistered, UK, 9,022 employers, caregiving gaps for mothers): a line explaining the gap did no better than no explanation; showing years in each job instead of dates did better (`:29,145,193`). Strength: strong for its setting, which is narrow.
- X: LinkedIn's 2022 global survey of hirers: "51% of hirers say they are more likely to contact a candidate that provides context about their career break" ([LinkedIn News, March 2022](https://news.linkedin.com/2022/march/new-way-to-represent-career-breaks-on-linkedin)). Strength: vendor self-report survey released with a product feature; sample size not stated on the page.

Conflict: Kristal found an explanation line didn't help; LinkedIn's survey says hirers want context; Matt wants advice on "how to talk about that". Matt wins, so a truthful framing line counts as help. The behavioral evidence favors real dated activity, so the judge ranks that help first.

### C5. Always a top fix, including on strong resumes

A strong resume still has a thing to fix first: the missing detail on its most important line. "Nothing critical" loses to a real, grounded Critical Miss. It isn't wrong when no grounded issue exists, but the judge should look hard first.

Sources:
- M, marketing executive: the production Critical Miss beat the new prompt's "Nothing critical": "Both critical and missing details."
- MD: always name a top fix; no "Nothing critical" state.
- M, data scientist: a Critical Miss against "Nothing critical" plus an optional edit came out "no difference" (no note). Read with MD, the label no longer exists; the item tells us the two fixes themselves were of similar weight.
- P: `top_fixes` must return "one to three distinct, highest-leverage edits".

### C6. A recruiter consequence for this role

The *why* says what a recruiter or hiring manager for this kind of role would conclude, or couldn't conclude, in plain language and in the role's terms (a sales leader's book, a PM's shipped product, a manager's team and budget). A why that only restates the fix, or describes "evidence quality", is weaker.

Sources:
- P: "why must explain the recruiter consequence in natural language. Sound like a person pointing at the page, not a rubric describing evidence quality"; "Prefer the concrete fact over evaluator language".
- M, UX manager: budget size "helps the recruiter understand the scale".
- S: 40-spec §2.4 requires evidence, the gap, and why it matters to recruiters.
- E: voice-and-tone line 69: use the candidate's subject matter, not a stock vocabulary about writing.

This criterion breaks ties between different fixes of similar stakes; it rarely outweighs C1–C4. It doesn't separate two reports that ask for the same fix on the same line: that is no real difference, however the why is worded (M, finance analyst: "Same critical miss it looks like", where the two whys differed).

### C7. An honest ask

The fix asks only for facts the person can verify, keeps their real level of ownership, and doesn't push them to estimate, round up or invent. Conditional phrasing such as "if you can verify it" is fine.

Sources: P rules 10, 23, and `next_steps` ("Ask only for facts they can verify"; "Never tell a candidate to invent a post-break role"); R: "Neither source justifies inventing a metric" (`quantifying-impact/page.tsx:200`) and "no claims you cannot defend" (`human-vs-algorithm/page.tsx:91`, editorial). A fix that tells the person to inflate or invent is close to a veto; the judge treats it as a clear loss.

### C8. Every Critical Miss, up to three

C8 applies only to the Critical Misses after the first. The first is ranked by V and C1–C7, exactly as before. The first v4 draft let the count test reach the first pick and moved Matt's blind-pick items, so the judge prompt now says so outright. Its examples stay in C8: a draft without them stopped counting a real third Critical Miss (see the calibration summary).

A Critical Miss is any problem that would cost an interview on its own: a recruiter screening for this kind of role would pass on the resume because of it, even if the rest were fine. Extra Critical Misses that usually qualify:

- an open gap, as C4 describes it;
- the main work of the latest relevant role with no scale or result anywhere on the page;
- a title or headline the bullets don't support;
- roles so scattered that a reader can't tell what job the resume is for (the evidence is indirect; see [below](#things-that-are-not-a-critical-miss));
- missing or contradictory dates on the latest or most relevant work, so its recency or length can't be told. R: "Familiar headings, visible dates, and a predictable order let a reader find your roles without hunting for them" (`research/how-recruiters-read/page.tsx:69`, editorial guidance); P uses "Check the conflicting graduation dates" as a model heading. Not from Matt's picks: an inference, not yet confirmed by him.

- **Flag every one, up to three, most important first.** On a resume with several, a report that also flags a real second or third one is better than one that stops at the first. Stopping tells the person they have one problem when they have more. When the first Critical Misses are comparable, leaving out a problem that plainly costs an interview is a clear loss.
- **Say so when there are more than three.** A report that signals more than three, on a resume that really has more, beats one that doesn't.
- **The test is the interview, not the first one.** A real second or third Critical Miss isn't padding just because it matters less than the first. Judge v3 read "the same bar" as "as important as the first", and prompt v3.3 learned to flag exactly one Critical Miss on every report (40 of 40 judge resumes).
- **Padding is worse than stopping.** Padding is a Critical Miss that would not cost an interview on its own: a supporting duty or an older role missing a detail, an optional section, wording or formatting, a reversed or missing date on an old or minor role (it reads as a typo; see "a single typo" below), a second ask on a line another Critical Miss covers, or a duplicate. A strong resume usually has only the first thing to fix, so extra Critical Misses there, or a "more than three" signal, are padding.

Sources: MD, Matt's count decision: "some resumes are truly horrible. i dont want to lie to people and say they have one critical miss if there are more," with the definition above; M, marketing executive: "I think we should have multiple critical misses if they exist"; P: "Never pad the list when fewer fixes are genuinely supported"; "Do not return two fixes that cite the same source bullet".

The gate also checks the count directly, on fictional resumes labeled in advance; see [critical-miss-judge.md](critical-miss-judge.md#count-checks). The production report shows one Critical Miss, so in a comparison it shows only its first fix.

## Things that are not a Critical Miss

Each of these is unsupported as the thing to fix first unless the resume makes it severe:

- **Length or page count.** One peer-reviewed but narrow, dated study (Blackburn-Brockman & Belanger 2001, CPA recruiters) favored two pages for strong entry-level accounting candidates; use it to reject a rigid one-page rule (`research/resume-length-myths/page.tsx:29,117-119`).
- **"The ATS will reject this", keyword density, layout.** Parsing extracts fields; auto-reject runs on knockout answers, "not on resume formatting" (Greenhouse and Lever documentation, `research/ats-myths/page.tsx:30,116,161,168`). The report reads text, not layout (methodology).
- **A single typo.** Two errors cost 0.73 and five cost 1.85 points on a 0–10 interview rating in one vignette study of 445 Flemish recruiters; a single typo wasn't tested (Sterkens et al. 2023, *PLOS ONE*; `research/spelling-errors-impact/page.tsx:30,43`). A pervasive pattern of errors can be critical.
- **Referrals.** They change who reads the resume, not the first read (`research/referral-advantage/page.tsx:133,150`; methodology).
- **A missing optional credential, degree, GPA or section** unless a supplied job description requires it (P rule 17; R: a missing *required* qualification can matter, `research/skills-first-promise-reality/page.tsx:128`).

An unclear professional identity or direction can be a structural Critical Miss, but the evidence is indirect: an interview study, a freelance marketplace, and analogy (`research/who-you-are/page.tsx:120-150`).

## Deciding a pairwise comparison

1. Check both reports against the resume (V). A vetoed report loses clearly. If both are vetoed, there is no real difference.
2. A report that names a real grounded issue beats "Nothing critical" (C5).
3. Find what each report asks the person to fix. If both target the same issue or line with comparably useful asks, the result is **no real difference** (M: "Same critical miss it looks like", "Same issue"). A better-worded why doesn't change that.
4. If they target different issues, decide which issue matters more on a first read for this role (C1), applying C2 (fact over move) and C4 (gaps) as the tests of "matters more".
5. Then compare how well each fix helps (C3, C7), and finally the stated consequence (C6).
6. If the reports flag different Critical Misses after the first, compare the sets (C8): flagging another problem that would cost an interview on its own beats leaving it out, and padding loses to stopping. On a resume with several such problems, leaving one out weighs as much as the choice of the first Critical Miss.
7. Strength: **clear** when a named rule decides it (a veto, fact over move, vague against specific, an open gap with no recent work against a minor line, a set that leaves out a problem that plainly costs an interview against one that flags it, padding on an optional section, wording or formatting against stopping). **Slight** when both are reasonable first fixes, or reasonable sets, and the preference is a judgment call (M: "Both are good though"). Otherwise, no real difference.

## Conflicts

| # | Conflict | Resolution |
| --- | --- | --- |
| 1 | Plan decision D2 (`70-audit-remediation-plan.md`) allows "Nothing critical", and plan row 1.3 says "allow 'Nothing critical'". Matt's later decision (MD) removes it. | MD wins: always a top fix (C5). The 70 plan should be updated when prompt v3 lands. |
| 2 | D2 and every product page say "the one thing to fix first"; MD allows up to three. | MD wins for judging (C8). The public definition is a copy decision for Matt. |
| 3 | P rule 9 says to recommend moving buried evidence; M prefers a concrete missing fact over "move the result up". | M wins on ranking (C2). Moving buried evidence stays a valid, lower-ranked fix. |
| 4 | Plan row 1.3 and the reverted prompt ranked structural issues (gaps, buried results) above line edits; M rejected that ordering 5–1. | M wins. Structural issues rank first only under C4's conditions. |
| 5 | Kristal 2023 found a gap explanation line didn't help; LinkedIn's 2022 survey says hirers want context; M asks for advice "about how to talk about that". | M wins: a truthful framing line is real help. Real dated activity ranks above it, following the behavioral evidence (C4). |
| 6 | The 40-spec rubric ties readability to "Scannable in 7.4 seconds". The research library treats reading-time figures as vendor data, not a rule. | R wins over an old spec line that isn't Matt's recorded judgment: no Critical Miss rests on a reading-time deadline (C1). |
| 7 | M's sales executive and HR manager items look alike: the latest role ends in August 2023 with nothing later, the bullets are support work, and a gap fix that gives no help faces a line edit on the recent role. Matt picked the line edit in one and the gap in the other, with no note on the difference. | **Confirmed by Matt on November 1, 2026.** C4's "no help" sub-rule fits both picks: the sales line edit asks for the core of the role on its lead bullet, while the HR line edit asks for one example on a secondary bullet. A gap fix that gives no help ranks below a concrete fix on the latest role's core work and above a narrow line edit. Judge v1 lacked the sub-rule and missed the sales item clearly. |
| 8 | Kristal 2023 (an explanation line did no better than none) suggests an explained break still costs callbacks. M's software engineer pick treats a dated, explained caregiving break as answered on the page. | M wins (C4, "answered on the page"). Inferred from one pick with no note; **confirmed by Matt on November 1, 2026**. |
| 9 | P asks every why to state the recruiter consequence, so a better why could seem to break a tie. M called two reports with the same fix and different whys "Same critical miss". | M wins: identical fixes are no real difference (C6). Contrast pair cp-26 was written the other way and relabeled after both judges disagreed with it; see the calibration summary. |
| 10 | Rubric v3's C8 said extra Critical Misses "must meet the same bar", which the judge read as "as important as the first". Prompt v3.3 followed it ("Extra Critical Misses must be as important as the first") and flagged one Critical Miss on every report. Matt's count decision sets the bar at "would cost an interview on its own". | MD wins (C8, v4). A real second or third Critical Miss isn't padding because it matters less than the first. Padding stays worse than stopping, and strong resumes stay at one. |

## Known limits

- **In-sample.** The rubric was written from the same ten blind-pick items the judge is calibrated on. Agreement there shows the judge can apply Matt's stated rules, not that it predicts his next pick. Since November 1, 2026 the judge gates prompt changes without a blind pick from Matt, so no held-out human check is scheduled.
- **One expert, ten items.** Four items have no note. Several rules rest on one or two picks.
- **The research is mostly about callbacks and attention, not about which fix to make first.** It supports C1 and C4 directly and C2 only weakly. Honesty rules (V, C7) are policy.
- **The count rules are newer than the picks.** Matt's count decision has no blind pick of its own behind it. The C8 contrast pairs and the count calibration set were written from his definition, so they show that the judge applies it, not that it matches his next call. The date examples in C8 are an inference from the research library and the production prompt; Matt hasn't ruled on them.
- **Same model family.** The judge runs on `gpt-6.1-sol`; production reports come from `gpt-6.1-terra`: a different model, but the same family and vendor. Measured self-preference was +0.00: Sol favored Critical Misses it wrote itself exactly as often as `gpt-6-astra` did. In normal use both sides come from the same generator, so a family preference can't favor one prompt over the other.
