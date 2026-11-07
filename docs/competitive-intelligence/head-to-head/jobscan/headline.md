# Jobscan

## With the posting

- Result observed: November 5, 2026, 13:03:24 MST / 20:03:24 UTC.
- Displayed report title: “Anthropic - Technical Recruiter”.
- Headline: “Match Rate” — **35%**.
- Category counts: “Searchability — 3 issues to fix”; “Hard Skills — 9 issues to fix”; “Soft Skills — 6 issues to fix”; “Recruiter Tips — 2 issues to fix”; “Formatting — 1 issue to fix”.
- “ATS Detected” — “Greenhouse”.

The first three red-X fixes, in their displayed order:

1. “We did not find an address in your resume or the address is incomplete. Recruiters use your address to validate your location for job matches.”
2. “We couldn't find an \"Education\" section in your resume. Ensure your resume includes an education section labeled as \"Education\" to ensure ATS can accurately recognize your academic qualifications.”
3. “The job title 'Technical Recruiter' from the job description was not found in your resume. We recommend having the exact title of the job for which you're applying in your resume. This ensures you'll be found when a recruiter searches by job title. If you haven't held this position before, include it as part of your summary statement.”

The initial generic instruction above those fixes was: “Tip: Fix the red Xs to ensure your resume is easily searchable by recruiters and parsed correctly by the ATS.”

## First upsell and price

The earliest captured upgrade prompt appears on the scanner screen at 13:02:46 MST / 20:02:46 UTC, before the scan: “Get 7 days free” in the header and “Upgrade” beside “Available scans: 5”. `upsell.png` preserves that screen (the same unchanged capture as `first-screen-with-posting.png`). It quotes no price. The initial onboarding `first-screen.png` has no paid offer.

The first captured price screen was “Choose your plan”, observed at 13:04:56 MST / 20:04:56 UTC. It said: “You have 4 of 5 free match reports left this month. Upgrade for unlimited match reports, the full skills list and resume optimization.”

The first card was “Free” — “$0” — “forever”. The first paid card was “Quarterly” — “$29.98” — “per month” — “Billed as $89.95 every 3 months”, with “For 3 months after FREE trial Save 40%” and “Try 7 Days Free”. The next card was “Monthly” — “$49.95” — “per month” — “Billed as $49.95 every month”.

See `upsell-price.png` for those prices. No paid plan, trial, or card was used. The report itself also displayed “Get 7 days free”, “Unlock” controls, “Unlock all skills”, and blurred formatting findings.

## Without the posting

Attempted November 5, 2026, 13:08:48 MST / 20:08:48 UTC. The same PDF was selected in “Upload & rescan”, and the job-description field was cleared. The “Scan” button was disabled with the posting empty. “Available scans” remained 4. No no-posting score, verdict, or recommendations were generated.

See `first-screen-without-posting.png`. The 35% score visible behind the rescan form belongs to the earlier with-posting report; it is not a no-posting result. No dummy posting was supplied and the disabled control was not bypassed.
