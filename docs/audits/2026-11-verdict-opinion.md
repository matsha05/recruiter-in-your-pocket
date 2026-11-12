# The verdict as an opinion: November 12, 2026

## Why

A live customer test on November 12 returned two verdicts on a recruiter's resume with three widely known employers on it: one restated a single bullet's numbers, the other read "A senior recruiter with substantial hiring results and a few claims that need context or correction." Matt's reaction: "That verdict says nothing about the pedigree." He preferred a three-sentence draft that named the employers, said the results backed them up, and asked which seat the person wanted next.

The prompt asked for exactly what it got: "the write-up in one sentence, under twenty words", with label-style examples.

## The change

One paragraph of `web/prompts/resume_v3.txt`. The verdict is now two or three short sentences, under forty-five words: what a recruiter notices first, by name; whether the work backs it up; and the question still open, only when there is a real one. It may say "I'd want to talk to you" from Mostly clear up, as a reaction and never a prediction. The score is set first and the verdict never moves it. The two rules that come first in a verdict (text written to screening software, a posting on a different track) are unchanged, and so is everything else in the prompt.

In the report the first sentence is the heading and the rest reads on under it; My reports shows the first sentence; the PDF follows the report. The schema's limit on the verdict went from 240 to 420 characters.

## What was run

All on gpt-6.1-terra, the production model, through the production path (`docs/audits/2026-11-worklist-run/tools/run-worklist.cjs`).

| Run | What | Result | Spend |
| --- | --- | --- | --- |
| Before | The shipped prompt on the fourteen synthetic resumes in `manifest.json`, one run each | Saved in `outputs/before` | $0.16 |
| After | The changed prompt on the same fourteen, two runs each | Saved in `outputs/after`. Every verdict is 24 to 45 words | $0.29 |
| Two earlier drafts of the rule | The same fourteen, one run each | Not kept. The first draft opened nearly every verdict with "X stands out"; the rule now says the examples show the shape, not the words | $0.33 |
| The person's real resume | Two runs before, two after, with their permission. Kept out of the repository | Before: 80 and 81, "A senior recruiter with substantial hiring and leadership results…". After: 81 and 82; both runs name the three employers first, say the recruiting work backs them up, and ask a question about the latest role's hiring total | $0.15 |
| Smoke tier | `run-eval.ts --tier smoke`, before the score guard was added | 1 pass, 2 warnings (score drift), 0 failures | $0.09 |
| Golden tier, first | `run-eval.ts --tier golden` (23 fixtures), before the score guard was added | 19 pass, 3 warnings, 1 failure: `golden_sales_strong_foundation_mark_sherrod_1` scored 67 against an expected 80 to 88 | $0.34 |
| Control for that failure | The three flagged fixtures on the shipped prompt, two runs each | The same scores: 67 and 66, 78 and 79, 47 and 46. The failure and the score-drift warnings are on main without this change | $0.12 |
| Golden tier, final prompt | The same 23 fixtures on the prompt as merged | 19 pass, 4 warnings, 0 failures. Three warnings are the same score drift the control shows; one is `W_MECHANICAL_COPY` on a card | $0.33 |
| The ten synthetic golden fixtures, final prompt | Four runs of `--filter synth_`, for the bundled release evidence | 8 pass, 2 warnings, 0 failures; 8 pass, 1 warning, 1 failure; 7 pass, 2 warnings, 1 failure; then 10 pass, 0 warnings, 0 failures with nothing else running on the machine. Both failures are `API call failed: fetch failed` with no provider call made (the browser suite was running on the same machine). Every warning is `W_MECHANICAL_COPY` on a card's text | $0.55 |
| Control for those warnings | The same ten on the shipped prompt, one run | 7 pass, 2 warnings, 1 failure (a card's example failed the contract after repair). The shipped prompt does no better | $0.15 |

Total: about $2.80.

## The release evidence

`lib/launch/liveEvalBaseline.ts` binds the prompt's hash to one saved run of the ten synthetic fixtures with no failure and at least nine passes. The fourth run is the one bundled (10 pass). It was not the first, and that should be read plainly: the first three each had two cards flagged for a repeated three-word clause (`W_MECHANICAL_COPY`) or a network failure, and the shipped prompt's own control run did not meet the bar either. The warning is in the cards' text, which this change does not touch, and it turned up on one or two of ten fixtures in four of the five other runs of either prompt. A single run clearing this bar says less than the bar implies; the card warning's rate is worth its own look.

## What it shows, and what it doesn't

- Every "after" verdict names something specific to the person, where twelve of the fourteen "before" verdicts opened with a job-title category ("A senior physical therapist…", "A staff engineer…").
- Known employers are named when they are there (Google, Amazon, Microsoft, Stripe, Netflix, Airbnb, Dell), and not treated as enough: the two resumes with known names and vague lines get "I'd hesitate".
- A resume with no known employer leads with the work: the landscaping company that was built and sold, the rehab program, the payments platform.
- The mismatched posting still leads the verdict, as the rule requires.
- Scores: twelve of fourteen stayed within four points of "before" on both runs. `b24_physical_therapist_strong` went from 94 to 88 and 87, and `b13_marketing_vp_elite` from 89 to 95 and 95. One run per resume on the "before" side is too few to say whether either is the rule or run-to-run variation; the golden tier's twenty-three fixtures showed no drift the control didn't also show.
- The golden failure is not from this change, and it is still a failure: that fixture's expected range no longer matches what the shipped prompt scores. It needs its own look.
- No judge scored these. The comparison is the tables below, read by a person. That is a check that the verdict does what was asked, not a measurement that reports are better.

## Before and after

### t1_google_engineer_maya

Blind pick v5 bp5-04: a recognisable employer; decision 5 says the lift is one rung, bounded, declared.

| | Score | Verdict |
| --- | --- | --- |
| Before | 72 | Strong backend results at Harborview, but the Google role leaves a recruiter guessing about the work. |
| After, run 1 | 73 | Google catches my eye first, and your Harborview work shows substantial backend engineering. I’d want to talk with you, but I’d still want to know which features you worked on at Google. |
| After, run 2 | 72 | Google gets my attention, and your Harborview Analytics work backs up your backend experience with substantial results. I'd want to know what you built for Google's internal tool and who used it. |

### t2_logos_operations_robert

Blind pick v5 bp5-10: a recognisable employer; decision 5 says the lift is one rung, bounded, declared.

| | Score | Verdict |
| --- | --- | --- |
| Before | 64 | An operations manager with strong earlier results, but a current role that leaves too much to guess. |
| After, run 1 | 66 | Google and Dell Technologies anchor your program management work, and the results are there. Your current Brightline Freight Partners role doesn't show how much you manage or what you've changed, so I'd hesitate to move you forward. |
| After, run 2 | 68 | Google and Dell Technologies catch my eye, and the program results under both back up the names. I’d hesitate over the current Operations Manager role because I can’t tell how big the terminal operation or your team is. |

### h1_bad_resume

Ten things wrong: filler objective, wrong target role, duty bullets, no results, five jobs in four years, two undated roles, typos, gap since June 2023, soft-skill skills list, references line.

| | Score | Verdict |
| --- | --- | --- |
| Before | 39 | Your Marketing Manager objective isn't backed by marketing work, and the latest dated job is at QuickStop. |
| After, run 1 | 42 | Your resume points to a Marketing Manager job, but the work shown is in retail, warehouse operations and delivery. I'd pass for that marketing role as written. I'd also want to know whether either undated job accounts for the time after QuickStop. |
| After, run 2 | 42 | Your objective asks for a Marketing Manager job, but the work shown is in stores, a warehouse, sales and delivery. I'd pass on the resume as it stands. I'd want to know which job you're aiming for and when the undated roles happened. |

### h2_thin_resume

Student: one internship, coursework, a club.

| | Score | Verdict |
| --- | --- | --- |
| Before | 64 | A data analytics intern with relevant tools, but too little detail about the internship work. |
| After, run 1 | 64 | Your Great Lakes Credit Union internship points toward data analytics, and you’ve worked with the tools a recruiter would expect to see. I’d hesitate because the resume leaves too much of the reporting and findings unstated. |
| After, run 2 | 64 | Your Data Analytics Intern role at Great Lakes Credit Union points toward analytics, and the Tableau dashboard shows work for a marketing team. I’d hesitate because much of the internship leaves the work or findings unspecified. |

### h3_strong_resume

Senior product manager whose resume is already good.

| | Score | Verdict |
| --- | --- | --- |
| Before | 96 | A senior payments product manager with revenue, customer adoption, and product results attached to the work. |
| After, run 1 | 95 | Northwind Pay and your payments platform work are the first things I notice. You back up the launches with revenue, customer adoption and payment performance. I'd want to talk to you. |
| After, run 2 | 95 | Your payments and billing work at Northwind Software comes with launches, revenue growth and measurable improvements for customers. I'd want to talk with you. |

### h5_mismatched_posting

Data analyst against a registered nurse posting.

| | Score | Verdict |
| --- | --- | --- |
| Before | 86 | A strong data analyst resume, but the nursing posting calls for a different professional track. |
| After, run 1 | 85 | The Triangle Regional Medical Center nursing role is a different track from your data analyst work. Your reporting and SQL work are concrete, but your resume doesn't show the nursing qualifications this role requires. |
| After, run 2 | 90 | The medical-surgical nursing role is a different track from your data analyst work, and your resume doesn't show nursing credentials or clinical experience. For Data Analyst roles, your work is specific and persuasive; I'd want to talk with you. |

### b13_marketing_vp_elite

Executive, strong (golden).

| | Score | Verdict |
| --- | --- | --- |
| Before | 89 | An executive marketing resume with team budgets and business results attached to the work. |
| After, run 1 | 95 | Your Chief Marketing Officer role at Novara shows a substantial global organization and the marketing results to back it up. I’d move this resume forward. |
| After, run 2 | 95 | Your marketing leadership at Novara comes with both a substantial remit and results across demand generation, launches, and acquisition costs. I'd want to talk with you. |

### b24_physical_therapist_strong

| | Score | Verdict |
| --- | --- | --- |
| Before | 94 | A senior physical therapist with a clear caseload, a completed rehab program, and patient-reported results. |
| After, run 1 | 88 | Your outpatient sports and post-surgical rehab work is clear from North Loop through Lakes Regional. The patient load, return-to-run program and function scores back it up. I'd want to talk with you about the patient-reported measures. |
| After, run 2 | 87 | Your outpatient orthopedic and post-surgical rehab work is clear, and the patient load and program work back it up. I’d want to talk to you. I’d ask which function measures sit behind the discharge figures. |

### b34_bank_branch_manager_gap

Gap with nothing after it.

| | Score | Verdict |
| --- | --- | --- |
| Before | 76 | A branch manager with deposit growth and a team of 11, but no work dated after December 2024. |
| After, run 1 | 74 | Your branch management work ends in December 2024. Before that, you managed 11 employees and grew deposits at Magnolia Community Bank. I'd want to know what you've done since the branch role ended. |
| After, run 2 | 74 | Your progression to Branch Manager at Magnolia Community Bank is easy to follow, and the deposit growth and team management back it up. I’d move this forward for a branch manager role. I’d still want to know what you’ve been doing since December 2024. |

### b36_product_designer_unrelated

Current job outside the field.

| | Score | Verdict |
| --- | --- | --- |
| Before | 67 | A product designer with concrete app work, but little about the decisions or results behind it. |
| After, run 1 | 67 | Your Loop Fitness work includes a booking flow and the app's first design system, but I can't see what changed or whether you've done design work recently. I'd hesitate to move this forward for a product design role. What have you designed since February 2024? |
| After, run 2 | 65 | Your product design work at Loop Fitness includes a booking flow and a first design system, but I can't tell what changed or whether you've done design work since February 2024. I'd hesitate before moving this forward. |

### b40_senior_ic_wei

Senior IC (bar persona).

| | Score | Verdict |
| --- | --- | --- |
| Before | 80 | A staff engineer with substantial payments infrastructure work, but a lead role whose team size is unclear. |
| After, run 1 | 78 | Your payments infrastructure work at Brightline shows a move from building services to leading their architecture. I'd want to talk with you about it. How large is the ledger and settlement team, and how far does your technical leadership reach? |
| After, run 2 | 77 | Your payments infrastructure work has grown from fraud scoring and reconciliation into technical leadership of the ledger and settlement platform. I’d move this forward: the work backs up the Staff title. I’d want to know how big the team and platform are. |

### v1_known_names_vague_lines

Amazon, Microsoft, Zillow, and no line says what she did.

| | Score | Verdict |
| --- | --- | --- |
| Before | 65 | A senior product manager at Amazon whose resume names the products but leaves the work too vague. |
| After, run 1 | 65 | Amazon and Microsoft catch my eye, but the product work underneath doesn't yet show what you delivered. I'd hesitate and probably move on. What did you own and change for sellers at Amazon? |
| After, run 2 | 65 | Amazon and Microsoft get my attention, and your work points clearly toward product management. I’d hesitate because the resume rarely shows which product decisions were yours or what changed. What did you own in the seller tools roadmap? |

### v2_known_names_results_two_seats

Stripe, Netflix, Airbnb with results; leads a team and still recruits, so the next seat is open.

| | Score | Verdict |
| --- | --- | --- |
| Before | 95 | A recruiting lead with a strong record of engineering hires, team leadership, and faster hiring. |
| After, run 1 | 95 | Stripe, Netflix and Airbnb get my attention, and your hiring and team leadership work backs up the names. I’d want to talk to you. |
| After, run 2 | 95 | Stripe, Netflix and Airbnb get my attention, and your recruiting work backs up the names. You’ve hired engineers and leaders, built a team and improved the interview process. I’d want to talk to you. |

### v3_own_business_undersold

Built and sold a 31-person company; the resume calls it self-employed. No known employer.

| | Score | Verdict |
| --- | --- | --- |
| Before | 77 | A landscaping owner with substantial operating experience, but no account of work after 2024. |
| After, run 1 | 77 | You built and sold Bell Lawn & Landscape, and the revenue and customer contracts back up your operations experience. I’d want to talk with you. What have you done since 2024, and which operations role do you want next? |
| After, run 2 | 78 | You built and sold Bell Lawn & Landscape, and the contracts, revenue growth and team behind it are on your resume. I'd want to talk to you. I'd also want to know what you've been doing since 2024 and which job you want next. |

