# RIYP revamp takeaways after the completed reports

November 5, 2026. Prepared for Matt and Claude from the captured competitor runs and two completed RIYP Job Search Pass reports: the same resume with the Anthropic Technical Recruiter posting, then without it.

**Keep the core report concept. Put the next revamp effort into consistent priorities, complete evidence, and a short path from a finding to an honest edit.** The completed reports show that RIYP already delivers specific recruiter-oriented observations, useful strengths, and sensible questions. The remaining problems are often how those judgments are ranked, explained, and presented.

This updates the earlier product advice. The [earlier answer][previous] remains verbatim; the raw captures remain unchanged. These are recommendations for the revamp, not implementation claims or a winner declaration.

## What the full reports changed

| Earlier recommendation or uncertainty | What we now observed | Updated call |
| --- | --- | --- |
| Catch questionable claims before rewarding numerical detail. | Both RIYP reports questioned the “300% reduction in time to hire.” Neither made it the opening Critical Miss. | Preserve the detection; improve priority and agreement between sections. |
| Make missing-fact questions central to editing. | Both reports opened the first fix at “Your answers.” No revised line was shown before an answer. | Preserve the factual safeguard, but make the question feel like a small next step rather than an assignment to complete the report. |
| Give specific Keep advice. | RIYP identified the Google referral results, Meta management scope, and other concrete strengths. | This is already a useful part of the product. Make it help the user decide what to leave alone. |
| Separate resume quality from job relevance. | With posting: “Mostly clear,” plus a separate “Job match: 75/100” deep in the expanded notes. Without posting: “Clear and specific.” | Explain what each assessment measures and make role fit easy to find. Investigate consistency; do not infer the cause of the band change from two runs. |
| Verify the paid path. | Both reports completed; the pass moved 5 → 4 → 3. The submit button still said “Get your free report.” | Consumption worked in these runs. Fix the misleading action label and make credit use visible before submission. |

Sources: [with-posting report][with], [without-posting report][without], [pass evidence][counter].

## What I would keep and strengthen

**The written Verdict before the assessment band.** “Your current role pairs global security hiring with 200 offer accepts and a 94% accept rate” immediately establishes that the product read this person's experience. Keep that specificity and the quiet, readable report layout. A larger score dashboard would not explain more.

**The original passage beside the recruiter note.** Showing the evidence and concern together is the right interaction. Its presentation needs repair, described below; the underlying idea is worth protecting.

**Questions that respect the limits of the resume.** RIYP asked what the person actually did instead of treating a plausible career history as permission to add experience. Its posting report distinguished Rippling as an HRIS from an applicant tracking or sourcing tool. The visible reports did not add a new achievement or assign a line to the wrong employer in our source checks. This supports confidence in the initial analysis, not a claim that the untested rewrite flow is reliable. [Source checks][errors-with], [source checks without posting][errors-without].

**Specific, explanatory Keep advice.** The Google referral example explains why 112 offer accepts and nearly 5,000 referrals are useful. The no-posting report also recognized X-Team's performance review and rising stars programs, so the positive feedback was not limited to numerical accomplishments. Preserve that breadth.

**A complete useful report, with deeper explanation available.** The paid reports had visible, actionable advice without another upsell. Preserve the same useful first-report promise for the free experience; these paid runs do not establish that the free experience currently delivers it. The earlier free attempts were blocked by exhausted allowances.

## Changes I would prioritize

### 1. Make every “fix first” surface agree

The clearest issue is in the no-posting report. Its opening Critical Miss asks the user to name their contribution to Meta funnel initiatives. Later, “Questions still open” calls the X-Team time-to-hire percentage “not credible as written,” and “What to do next” puts verification of that figure first. The opening summary also says one figure needs checking. These sections are directing attention differently. [No-posting notes][without].

My recommendation is to surface the questionable calculation before optional elaboration of an already substantial achievement. A reduction in a positive duration cannot exceed 100%; the correct replacement is unknown until the starting and ending times are supplied. Do not guess a corrected percentage or reinterpret it as “three times faster.”

Use one ordered set of concerns throughout the Verdict, Critical Misses, questions, full notes, and later comparison. Role relevance can affect the order, but a different order should have a visible reason. This is a product judgment about this resume, not evidence that the same ranking is right for every candidate.

**Acceptance:** this fixture makes the questionable calculation easy to find without opening full notes. The first action and the later next-steps list agree, or explicitly explain their different purposes. A posting does not cause the credibility concern to disappear.

### 2. Define the band separately from role fit and application readiness

“Clear and specific” can summarize an otherwise strong document, but it currently sits above a report that later says a claim is not credible. The reader needs to understand whether the band measures clarity, overall quality, or readiness to submit. A broadly positive assessment should not obscure an unresolved factual concern.

The separate 75/100 match score is useful only if the requirements and evidence explain it. Bring the assessment into Role fit, with its supporting requirements, rather than leaving the actual score and detailed match findings deep inside “Full recruiter notes.” Make the target company and role explicit.

The two observed bands differed despite identical PDF bytes. That alone does **not** establish that the posting caused the change: generation variability and other run differences were not isolated. Run controlled consistency checks before changing scoring logic or promising stable scores.

**Acceptance:** a user can distinguish document assessment, unresolved concerns, and fit for a particular posting. Repeated evaluations are reviewed for unexplained changes in substantive findings; adding a posting does not silently redefine what the general band claims to measure.

### 3. Show a complete, attributable quotation

The no-posting Critical Miss highlighted only **“contributing to 1,000+ ML”**, leaving “Gen hires” in faded surrounding text. The faded line above came from the previous bullet. In the posting report, the next employer heading, “X-Team, Chief People Officer,” appeared beneath the highlighted OpenAI bullet. Neither was a proven factual misattribution, but both made the evidence harder to read and attribute. [No-posting screenshot][image-without], [with-posting screenshot][image-with].

Show the complete relevant sentence or bullet and the correct company/role label. Highlight the questioned phrase within that complete quotation. Optional document context can sit behind an expansion; unrelated adjacent headings should not be the main context.

Retain the evidence-to-note relationship within the current approved visual system. This is a legibility change, not a reason to revive an older visual direction or add more decorative annotation.

**Acceptance:** the Meta example includes “1,000+ ML Gen hires” and enough of the sentence to understand it; the OpenAI example is clearly labeled OpenAI. Quotes remain literal and readable on desktop and mobile. Partial quotations use explicit omission markers rather than relying on clipping or fading.

### 4. Make the clarification flow helpful before it asks for effort

The initial reports exposed five resume-information prompts with the posting and six without it, counting the first fix and the later questions. The individual questions were generally reasonable. Taken together, they can make the report feel like more work before the user sees what to do with the answer.

Keep the question-driven safeguard. Present the highest-priority question beside its concern, show why the answer matters, and let the user choose when to work on another line. Connect the separate questions to the same ordered concerns rather than maintaining a second apparent task list.

When existing facts support a useful wording edit, offer it without demanding new information. When a meaningful revision requires an unknown fact, say what is missing and wait. Do not fill the gap with a plausible invented detail, and do not present a placeholder as a finished resume line. “I don't know” and “I didn't do this” should lead to a sensible next step without penalizing honesty.

**Acceptance:** a user can understand and act on one concern independently. Any new claim in a proposed revision is traceable to the uploaded resume or an explicit answer. Test the decline/unknown paths and the actual generated wording; neither was exercised in this capture.

### 5. Put important findings in the main report and remove duplicated advice

Full notes contained valuable information: the explicit credibility warning, certification status, detailed role requirements, and job-match score. The initial report also repeated some concerns across its opening text, fixes, questions, and role-fit advice.

Use disclosure for supporting detail. A uniquely important risk should not first appear in an appendix-like section. Each concern should have one clear home and one next action; other sections can refer to it without restating the same request.

The generic Summary and Skills recommendations both said, “Add this section if it helps explain why your experience fits the job.” That is cautious, but it leaves the decision to the user. Explain what such a section would clarify for this particular candidate, or omit the recommendation. Missing an optional section is not automatically a defect.

Keep research available next to a relevant explanation or in a compact methodology disclosure. The block of research links currently appears before later actionable questions. It should support a decision without interrupting the route to the next useful edit.

**Acceptance:** collapsing full notes does not conceal the only mention of a material concern. Expanding them adds evidence or explanation. The same missing fact does not appear as several separate assignments.

### 6. Make Role fit an evidence assessment, not a phrase checklist

RIYP already distinguishes “Relevant experience,” “Needs more detail,” and “Not shown in the resume.” That is worth keeping. It recognized the Google full-cycle recruiting work and the structured interview process, while asking for further detail about technical assessment and interview architecture. [Posting-specific findings][with].

Make each requirement inspectable: the posting's requirement, the resume evidence, what remains uncertain, and the smallest useful action. Clearly separate a missing exact phrase from experience that is not established. For example, a structured interview process is related evidence for interview-loop work; it does not prove that the candidate designed loops.

Keep role requirements separate from company background, benefits, application instructions and our posting provenance header. Resume Worded surfaced “URL” and “Banking” from non-qualification material. Teal marked “Full Lifecycle Recruiting” as not found, while the resume contained the closely related “Full-cycle recruiting” wording. The exact phrase was absent; the capture does not establish whether Teal recognized the related experience elsewhere. These are useful test cases for explaining phrase absence versus experience, not reasons to stuff terms into a resume. [Resume Worded evidence][rw-errors], [Teal evidence][teal-errors].

**Acceptance:** synonymous wording is considered, partial overlap is explained without exaggeration, and each suggested addition is conditional on actual experience. A missing phrase never automatically becomes a claim about the person's capabilities.

### 7. Use Keep advice and comparison to create a stopping point

The Keep sections now have enough substance to be part of the main value, not a courtesy after criticism. Tell the user what should survive an edit and why. Preserve qualitative responsibility and relevant programs as well as numerical results.

Comparison should then explain which previously raised concern changed, which remains open, and whether a revision introduced a new unsupported claim. A changed score or changed string is insufficient evidence of improvement. The source or answer supporting a resolved concern should remain available.

This is still an unverified opportunity: we did not answer questions, generate revisions, request a re-check, export, or test saved-report recovery. The existence of “Compare my revision” is not proof that the complete improvement loop works.

**Acceptance:** users can identify what to leave alone, what still needs work, and when no further change is justified for the reviewed purpose. A re-check connects its assessment to the earlier concern and the revised evidence.

### 8. Fix trust details without weakening the criticism

Two concrete changes deserve attention:

- **Credit use:** both pass-funded submissions said “Get your free report,” while the counter decreased correctly. Use the pass-specific action label and show the remaining balance where the decision happens. The observed issue is misleading wording, not evidence of incorrect billing. [Counter and capture notes][counter], [capture notes][capture-notes].
- **Outcome claims:** “It's the one most likely to cost you the interview” sits in a report whose scoring explanation says it does not predict interviews or offers. State the document problem directly. For this numerical claim, proposed wording such as “This calculation cannot be correct as written. Verify the starting and ending times before using it” is stronger and better supported than an interview prediction. Any change to Critical Miss severity or naming should be an explicit product decision and evaluation, not a casual prompt rewrite.

Keep the visible processing stages and actual elapsed time. The observed request-to-completed-report intervals were about 92 seconds and 36 seconds; upload-to-result included posting entry and capture work. These are two observations, not a speed benchmark or evidence of typical latency. Verify that stage labels correspond to actual work, and test interruption/recovery separately. [With-posting timing][time-with], [no-posting timing][time-without].

**Acceptance:** submission text accurately describes the entitlement being used; retry/recovery behavior is tested without duplicate consumption; no UI line makes a stronger outcome claim than the report can support.

## What to borrow from competitors, and what to avoid

| Product | Useful pattern to retain or borrow | Avoid copying from the captured experience |
| --- | --- | --- |
| Resume Worded | Concrete examples of what works; evidence close to the finding. | Suggested wording that adds unverified tools or responsibilities. Its visible Magic Target suggestion added Greenhouse, intake and bar-calibration experience not established by the resume. |
| Teal | A clearly separate general assessment and job-match view; requirements with nearby actions. | A missing-phrase display that leaves the relationship to similar experience unexplained in the visible detail; making all detailed Analyzer fixes inaccessible after showing 16 issues. |
| Jobscan | Inspectable findings and requirement lists. | Listing the 300% reduction among positive measurable results without a visible credibility warning; presenting paraphrases as literal source quotations. |
| Rezi | Asking whether a keyword relates to the person's actual experience. | Automatically adding sections or altering the imported source; contradictory labels and score changes whose cause is not explained. |
| Kickresume | A concise overview that makes broad categories easy to scan. | Requiring a rebuilt representation for the checker, or leaving the score's actionable explanation behind the next upsell. |

Sources: [Resume Worded][rw-errors], [Teal findings][teal], [Jobscan measurable results][jobscan-results] and [source checks][jobscan], [Rezi findings][rezi], [Kickresume findings][kickresume]. These were unequal visible/free experiences; locked recommendations and imported-document differences limit any broader comparison.

I would defer a full resume builder, template marketplace, auto-apply feature, or broad career dashboard for this revamp. The captures do not establish a need for those additions. The immediate opportunity is making the report's existing judgment easier to trust and use.

## Recommended handoff to Claude

Start with **priority agreement, complete quotations, and accurate assessment/credit language**. Then simplify the question flow and report structure, expose the role-fit evidence, and verify the full answer → revision → re-check experience.

Use the captured resume as a regression case: questionable 300% reduction; Meta contribution versus team total; similar recruiting phrases; combined Education and Certifications heading; expired date without renewal evidence; absent optional sections; an HRIS that is not established as an ATS; and the boundary between the final OpenAI bullet and the X-Team heading. Add other resume types before generalizing the product rules.

Preserve the tuned prompts and working behavior while identifying where each issue originates. These observations do not tell us whether a problem comes from extraction, judgment, ranking, or rendering. Prompt changes need a stated product reason and evaluation. Do not spend the remaining three live pass reports on implementation testing without a new instruction.

This memo is based on one resume, one posting, and one completed RIYP run per condition on November 5. It establishes observed report behavior, not comparative accuracy across users, conversion effects, or hiring outcomes. The signed-in paid reports were completed; free entitlement recovery, generated rewrites, re-checks, exports, persistence and mobile behavior remain outside this capture's verification.

[previous]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/revamp-takeaways-verbatim.md
[with]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/recommendations.md
[without]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/no-posting/recommendations.md
[counter]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/pass-counter.md
[errors-with]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/errors.md
[errors-without]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/no-posting/errors.md
[image-with]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/report-overview.png
[image-without]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/no-posting/report-overview.png
[rw-errors]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/resume-worded/errors.md
[teal-errors]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/teal/errors.md
[capture-notes]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/capture-notes.md
[time-with]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/time.md
[time-without]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/riyp/with-pass/no-posting/time.md
[teal]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/teal/headline.md
[jobscan]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/jobscan/errors.md
[jobscan-results]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/jobscan/measurable-results.txt
[rezi]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/rezi/errors.md
[kickresume]: https://github.com/matsha05/recruiter-in-your-pocket/blob/e55f9bafac8bdde434af3f81354e8bc5091ea2cb/docs/competitive-intelligence/head-to-head/kickresume/headline.md
