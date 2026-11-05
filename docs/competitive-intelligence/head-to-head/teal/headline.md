# Teal captures

- Date: November 5, 2026 (America/Denver).
- Product: https://app.tealhq.com/
- Input: the unchanged shared `input/resume.pdf`, SHA-256 `3c3069d9061b8bffa264ab94da08c76557bb4596469d53f6149f44ceb97e8640`.
- Method: a separate clean account imported the PDF into Teal's builder under the user's revised authorization. No existing account work history was merged. Teal automatically populated contact email from the new account and “Technical Recruiter” as Target Title from required onboarding. No manual edit in the resume editor or AI rewrite was accepted. The reported score is for this imported and automatically augmented representation, not the original PDF layout. See `errors.md`.

## Without the posting

First observed at 2026-11-05 13:23:07.365 MST (20:23:07.365 UTC). The text capture was saved at 13:23:25.745 MST.

> 45%
>
> Overall Score

The first three issue categories, in displayed order, were:

1. “Resume Structure” — “10 issues”
2. “Measurable Results” — “4 issues”
3. “Keyword Usage” — “2 issues”

These are category labels, not three actionable fixes. All 16 detailed recommendations were locked:

> 16 Issues
>
> Make your resume stand out by unlocking 16 recommendations
>
> Upgrade to Teal+

The blurred/scrambled content behind the lock was not transcribed or inferred. See `result-without-posting.png`, `result-without-posting.txt`, and `recommendations.md`.

## With the posting: Job Matcher

The shared Anthropic Technical Recruiter posting was attached to the same imported resume. The saved posting wording was checked against `input/posting.txt` after normalizing whitespace and Teal's automatic list markers. No resume content was tailored.

First observed at 2026-11-05 13:31:51.210 MST (20:31:51.210 UTC):

> 18%
>
> Match Score

The first three missing keywords, in displayed order, were:

1. “Full Lifecycle Recruiting” — “Not Found in Resume”; “From: Requirements”
2. “Greenhouse” — “Not Found in Resume”; “From: Requirements”
3. “Applicant Tracking System” — “Not Found in Resume”; “From: Requirements”

Each keyword's detail offered “Write Bullet” and “Add to Skills”. Neither action was accepted. Five keyword entries were visible in total; the other two and all five detail popovers are transcribed in `recommendations.md`.

> 21 More Keywords and Unlimited AI with Teal+
>
> Upgrade to Teal+

Those 21 additional entries were locked and were not inferred. After the posting was attached, the general Analyzer still showed “45%” / “Overall Score”, with “10 issues”, “4 issues”, and “2 issues” in the same categories; all 16 detailed Analyzer recommendations remained locked. Job Match Score and Overall Score are distinct labels, not a before/after change to one score.

Evidence: `result-with-posting.png`, `result-with-posting.txt`, `keyword-details.txt`, `keyword-1.png` through `keyword-5.png`, and `analyzer-with-posting.png`. The post-save loading state is `posting-saved.png`.

## First upsell and price

`upsell.png` records the locked Analyzer screen above, encountered with the score. Opening its upgrade control displayed the first price screen at 2026-11-05 13:23:41.092 MST (20:23:41.092 UTC).

The prices appeared in this order:

1. “$13” — “Every week”
2. “$29” — “Every month” (visually selected by default)
3. “$79” — “Every 3 months”
4. “$179” — “Every year”

The first listed price was $13 every week. No checkout was continued, no payment was made, and no card was entered. Exact upsell text and screen: `upsell-price.txt` and `upsell-price.png`.

## Capture history

Earlier Cloudflare blocks and the original account's merge/overwrite import gate are preliminary evidence. They were superseded by the user-authorized clean-account run above. See `capture-history.md`; those preliminary screens are not substituted for the successful upload or its score.
