# Head-to-head: one resume through every tool, November 5, 2026

The compare pages say we have not run the other tools and ours on the same resume. On November 5 Matt did, through Codex, following [head-to-head-protocol.md](head-to-head-protocol.md). One three-page resume for a senior technical recruiter, contact details replaced, and one real posting for a Technical Recruiter role at an AI lab, through the free tiers of Jobscan, Resume Worded, Teal, Rezi and Kickresume, and through our own product on production. The evidence packet (every screenshot, every recommendation transcribed and tagged, the timings and the errors checked against the input) is [PR 63](https://github.com/matsha05/recruiter-in-your-pocket/pull/63). This file is the comparison written from it. No winner is declared; it says what each tool said.

**The headline finding is about us.** Every competitor returned something. Recruiter in Your Pocket returned nothing, twice: signed out, the free-report gate said the report "on this device or network has been used"; signed in to the founder's own account, the free report had already been spent. The head-to-head is therefore five columns and an empty sixth, and it stays that way until our run exists. The way to get it is the one the launch program already requires: a real $29 purchase on production, then the report.

## The inputs

- One resume, unchanged, the same bytes for every upload. Mid-career, three pages, tech recruiting leadership across several well-known employers, numbers in most bullets, no summary section, education and certification in one combined section. Phone and email replaced by placeholders, which every tool then flagged as missing; those flags are not counted as errors.
- One posting, pasted in full including the company boilerplate, which matters below.
- Where a tool scores, it was run with and without the posting. Teal, Rezi and Kickresume rebuild the resume into their own template before scoring, so their numbers describe their imported copy, not the file.

The packet is kept out of this folder on purpose: the resume carries the founder's name and employers, and the site is anonymous by design. The quotes below are chosen so that nothing identifies the person.

## The table

| | Recruiter in Your Pocket | Jobscan | Resume Worded | Teal | Rezi | Kickresume |
| --- | --- | --- | --- | --- | --- | --- |
| **Headline** | No report. "Your free report needs an account" (signed out); "Another report needs a Job Search Pass" (signed in) | Match Rate 35% against the posting; 21 "issues to fix" across five categories | 74 / 100, "Potential: 92"; with the posting, Relevancy 53, "Needs improvement" | Overall Score 45%, 16 issues; Match Score 18% | 56 "Needs improvement" without the posting; 96 "Excellent" with it, same resume | ATS Score 80 / 100 on its rebuilt template; "Its weakest link is Content" |
| **First three fixes** | none | No address found; no "Education" section found (wrong, see errors); the exact job title is not in the resume | Three line-level comments: one bullet praised for scope, one "reads like a job description," one "not a single number in this line" | Category labels only ("Resume Structure, 10 issues"); every fix locked | Two experiences "with weak bullet points"; the next two items locked | None readable; ATS details and "Recruiter Feedback" blurred behind Premium |
| **Recommendations, by kind** | none | 18 specific, 23 generic, 13 keyword, 1 locked | 10 specific, 78 generic, 9 keyword, 13 locked | 1 specific, 1 generic, 7 keyword, 3 locked (plus 16 locked analyzer items, 21 locked keywords) | 9 specific, 36 generic, 29 keyword | 1 specific, 1 generic, 1 keyword, 2 locked |
| **Errors about the resume** | not assessable | Missed the "Education and Certifications" section; invented a summary section ("Good job!"); counted a soft skill the resume never uses; put paraphrases in quotation marks | A suggested rewrite added an applicant-tracking system, intake work and "bar calibration" the resume never claims, with the rationale that the person's employer "makes them believable"; missing-keyword list included "URL" and "Banking" from the posting's boilerplate | Rebuilt the resume with the account email and a target title the file doesn't have; "Full Lifecycle Recruiting" marked not found beside a line that says "Full-cycle recruiting" | Parsed a company name and an acronym wrong (an I read as an l), turned a level range into a number, dropped a certification's expiry, added a summary and a skills section, flagged a correctly punctuated bullet, and printed "Your resume is page long" | Dropped "present" from the current role's dates |
| **Time to the first usable recommendation** | none | 0.6 min from the scanner upload (1.7 min including onboarding) | 1.6 min signed in; 17 min from the first attempt, which hit a human-verification loop | Not reached on the analyzer; 10.4 min to the first keyword finding | 6.9 min including sign-up and email confirmation | Not reached on the free plan; 3.9 min to the score |
| **First price asked** | $29 once, five reports, 90 days, no renewal (shown at the gate) | "Get 7 days free" before the scan; then $29.98 a month billed quarterly, or $49.95 monthly | $49 a month with $75 crossed out; $19 a month on a year | $13 a week first; $29 a month selected by default | $29 a month on the homepage; $19 a month quarterly or $149 once in the app | $18 a month billed quarterly, on the homepage before upload |
| **After you leave** | nothing observed | not observed | A sales email 77 minutes after upload, from a named "Senior Resume Expert and Ex-Hiring Manager," with the candidate's employers in the subject line, the score, a Pro pitch, and a P.S. that named companies are "actively seeking leaders with your experience" | not observed | not observed | not observed |

## What each tool gave in the first five minutes

**Jobscan** gave the most, fastest: a match rate against the posting in under a minute, with specific findings (the posting's exact title is absent, which is true and useful) mixed with generic ATS folklore (an address to "validate your location"). It also got the resume wrong in two places a recruiter never would: it could not find the education section because the heading has three words in it, and it congratulated the person on a summary that doesn't exist. Its best material is keyword matching, which is what it sells. Without a posting it refuses to run at all.

**Resume Worded** came closest to a recruiter's read: its first three comments quote lines from the resume and say what's missing from each ("there isn't a single number in this line"). That is the shape of our Critical Miss. Around those three sit 78 generic items and a tour. Its serious miss is in the rewrite: offered one Magic Target suggestion, it wrote experience the person never claimed and justified it by the employer's reputation. That is the exact thing "only from your facts" exists to prevent. Then the email.

**Teal** scored the resume 45% and locked all sixteen reasons. With the posting it listed five missing phrases, one of which the resume contains in different words. On the free tier it is a score and a lock.

**Rezi** moved the same resume from 56 to 96 by adding the posting, after rebuilding it, adding a summary and skills the person didn't write, and misreading a company name. Its readable advice is format and verb rules. The number is not a read of the resume.

**Kickresume** rebuilt the resume into its template, scored the rebuild 80, and locked everything else. The protocol calls it "builder only," and that held.

## What this says about us, which is the point

1. **Our gate blocked the one person most likely to try it.** The anonymous free-report ledger blocks by device or network, and the signed-in account had used its free report. Both are working as designed, and both mean the head-to-head could not include us. The fix is not a product change; it is a purchase. The launch program (`docs/launch-readiness/80-go-no-go-program.md`) already requires a real purchase and refund by the founder before charging strangers. Do that, then run the report and fill the column.
2. **The competitors' errors are our argument, if we don't make the same ones.** A missed section, an invented summary, a rewrite that adds experience: those are the failures the research articles and the compare pages warn about. The live-judgment run ([2026-11-live-judgment.md](../audits/2026-11-live-judgment.md)) found our validator refuses the model's honest answer too often and that one detector mistakes a long line for a summary. Different failure, same category. We can say "we don't invent" only while the fidelity gates hold; the compare pages should keep saying it as a design rule, not as a tested result, until our column exists.
3. **Specific beats generic, and nobody is mostly specific.** The best competitor was 10 specific items in 110. Resume Worded's three line-level comments are the nearest thing to our report's first screen. The gap we can own is that every line of ours is specific; the gap we have to close first is that ours didn't run.
4. **The follow-up email is a trust choice.** A named expert, your employers in the subject, "companies are actively seeking leaders with your experience": that is the register the brand system calls hype. We send nothing after a report but the report. That is worth one sentence on the Resume Worded compare page, dated, once we have run ours.

## What the compare pages can say now

Nothing new about ours. Each competitor page could carry a dated line about what it said to one resume, but a one-sided comparison reads as a hit piece, and "How we compare" promises the opposite. Hold the compare-page edits until our column is filled, then add one dated paragraph per page from this table.

## Next

- Matt: buy the pass on production, run the same resume and posting signed in, capture it per the protocol into the packet, and (separately) rehearse the refund. That closes the empty column and the launch program's open item in one afternoon.
- Then: fill the table, write the dated paragraphs onto the seven compare pages, and move the compare hub's "we haven't run them on the same resume" to "we have, once, on one resume, in November 2026; here is what each said."
- Not from this run: how any tool treats a weak resume, a student's, or a nurse's. One resume, one role, one day.
