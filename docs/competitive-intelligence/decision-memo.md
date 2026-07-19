# Decision Memo: RIYP Competitive Strategy

**Date:** July 9, 2026
**Status:** Active product direction
**Decision:** Controlled paid beta, web first

## Executive Call

Do not build another all-in-one AI job-search suite.

RIYP should own one clear job: show a candidate what a strong recruiter is likely to notice, believe, question, and skip on the first read, then show them what to fix first.

The category is crowded with builders, ATS match scores, keyword scanners, trackers, cover letters, extensions, and automated rewriting. Matching that breadth would make RIYP less distinctive and harder to trust. The opening is a focused, editorial first-read brief that treats ATS compatibility as a basic constraint, not a fictional prediction of hiring outcomes.

## What Changed Since the 2025 Strategy

- Product Hunt is no longer the launch plan. Start with a small founder-led cohort.
- The Chrome extension is not a launch requirement. Keep it private until the web product proves repeat use.
- Lifetime pricing is not part of the beta. It creates support and cost obligations before unit economics are known.
- The product now has an eval harness, but dry runs validate fixtures only. Live quality proof requires separately authorized API spend.
- One non-renewing Job Search Pass is the only paid offer in the beta.
- The score must be described as a recruiter-style clarity signal, never an ATS score, callback probability, or hiring prediction.

## Current Market Read

| Product | Current position | Current price signal | Strategic implication |
|:--|:--|:--|:--|
| Jobscan | ATS-specific matching, keywords, formatting, builder, auto-apply | Free scans, paid plans from roughly $30 per month | Do not compete on ATS mythology or feature count |
| Teal | All-in-one resume builder and job-search operating system | $13 weekly or $29 monthly | Teal wins breadth; RIYP should win judgment and focus |
| Resume Worded | Resume, ATS, and LinkedIn scoring | Limited free review, paid subscription | Recruiter framing is validated but report quality must feel more human |
| Rezi | AI resume builder, score, keyword targeting, writer, interview tools | $29 monthly or $149 lifetime | Avoid builder sprawl and lifetime economics |
| Kickresume | Resume creation, design, AI writing, and checker | About $24 monthly or $8 monthly when annual | Visual polish is table stakes, not the wedge |
| Careerflow human review | Human expert first impression and detailed feedback | Roughly $79 to $249 per review | RIYP can sit between cheap scanners and expensive human review |

Sources: [Jobscan](https://www.jobscan.co/), [Teal pricing](https://www.tealhq.com/pricing), [Resume Worded](https://www.resumeworded.com/), [Rezi pricing](https://www.rezi.ai/pricing), [Kickresume checker](https://www.kickresume.com/en/resume-checker/), [Careerflow review](https://www.careerflow.ai/resume-review).

## User Signal

Recent public discussions repeat four frustrations:

1. The same resume can receive very different match scores across products or runs.
2. Users become trapped in keyword optimization that makes the resume worse for humans.
3. Generic AI rewrites erase specificity and voice.
4. A score feels precise without proving whether the resume will earn a real second read.

This signal is directional, not market-size proof. It is strong enough to shape positioning and beta questions. It is not strong enough to support outcome claims.

Examples: [inconsistent scanner results](https://www.reddit.com/r/jobsearchhacks/comments/1li07kk/are_those_website_really_worth_jobscan_teal_etc/), [ATS score skepticism](https://www.reddit.com/r/jobs/comments/1nd5plu/ats_resume_experiment/), [false confidence from AI scores](https://www.reddit.com/r/Resume/comments/1u2zzwt/is_an_ai_resume_checker_accurate_or_just_giving/).

## Positioning

### Category

Private recruiter first-read brief.

### Promise

See what lands, what gets skipped, what sounds unproven, and the exact lines to fix before you send the resume.

### What RIYP is not

- Not an ATS pass predictor
- Not a resume builder
- Not an auto-apply tool
- Not a guarantee of interviews or offers
- Not a generic chat window wrapped around a prompt

### Proof hierarchy

1. Show the actual report before asking for payment.
2. Tie every important recommendation to evidence from the resume.
3. Separate observed evidence from model inference.
4. Show confidence, impact, and effort for important fixes.
5. Explain the scoring method and its limits.
6. Let users delete saved work and leave without a retention trap.

## Product Direction

### Keep building

- The first-read verdict
- Evidence ledger
- Highest-leverage rewrites
- Missing-win prompts that help the user recover real facts
- Optional job context and role-fit judgment
- Version history for signed-in users
- Export for reports worth keeping
- Calm, editorial, mobile-first UI

### Hold

- Resume builder and template marketplace
- Cover-letter generation
- Auto-apply
- Broad job tracking
- Public share links
- Chrome extension promotion
- Lifetime pricing
- Vanity AI features that do not improve the first-read decision

### Product challenge

The score creates useful orientation but also carries the category's biggest trust risk. Keep it only if beta users can accurately explain what it means after one session. If they describe it as an ATS score or interview probability, reduce its visual dominance or replace the number with a banded editorial verdict.

## Pricing Direction

Keep one $29 Job Search Pass for the first cohort: five additional reports, one payment, 30-day expiration, and no automatic renewal. The first complete report remains included.

Revisit the offer after 25 paid users or enough usage to calculate real report cost, whichever comes first. Do not add subscriptions or lifetime pricing until model cost, support load, repeat use, and refund behavior are known.

## Launch Motion

Invite 10 to 25 people who are actively revising a resume or applying to a specific role. Avoid a broad launch until the core journey works without live explanation.

For every beta user, capture:

- What did the report notice that other tools missed?
- Which recommendation felt most credible?
- What felt generic or wrong?
- Did the score mean what we intended?
- What action did they take after reading the report?
- Would they run it again for another role or revision?

The first growth loop should be a user sharing a before-and-after insight, not an affiliate funnel or automated content factory.

## Beta Success Criteria

The cohort is strong enough to expand when:

- At least 80% complete the first report without help.
- At least 70% can name one specific change they trust enough to make.
- Fewer than 10% describe the output as generic.
- At least 30% return with a revision or a second role within 30 days.
- Paid users understand the pass terms, expiration, and refund behavior without support.
- No severe privacy, billing, deletion, or identity defect occurs.

These are decision thresholds for a small beta, not public performance claims.

## Final Recommendation

Ship the focused web beta only after the release gates pass. Win by being the most credible first read, not the biggest toolbox.
