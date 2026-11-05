# Head-to-head: the same resume through every tool

November 5, 2026. The compare pages say, honestly, that we have not run the other tools and ours on the same resume. This is the protocol for doing it once, so the comparison is about what each tool says, not what each tool sells. Matt runs it (the competitors need accounts, which only he can make); the captures land in `docs/competitive-intelligence/head-to-head/`, and the comparison is written from them.

## What goes in

- **One resume, one file.** Matt's own, as a PDF, with phone, street address and email replaced by placeholders. The free tiers of Jobscan, Teal and Rezi keep what you upload. Save the exact file as `head-to-head/input/resume.pdf` and its text as `resume.txt`. Every tool gets this file, unchanged. Don't let a builder reformat it before scoring.
- **One job posting.** A real, current posting for the role the resume is written for, saved as `input/posting.txt` with its URL and the date copied. Tools that take a posting get this one; tools that don't are run without.
- **Two runs where a tool offers a score:** once with the posting, once without. Scores move with the posting; we want both.

## The tools and their free tiers

| Tool | Free tier (from the compare pages, read November 4) | Run |
| --- | --- | --- |
| Recruiter in Your Pocket | the first complete report | Production, signed out, with the posting. This is the real production report the launch program needs; note the date and time so the telemetry check can find it. |
| Jobscan | 5 scans a month | With and without the posting |
| Resume Worded | one free score | Resume score; LinkedIn is out of scope |
| Teal | free, with limits | Resume score and keyword match |
| Rezi | free for one resume | Score and suggestions; do not let it rewrite the file |
| Kickresume | free with four templates | Its checker, if it offers one without rebuilding; otherwise note "builder only" |

Sign up with the brand address, no card. If a tool asks for a card, stop and note it.

## What to capture, per tool

Save under `head-to-head/<tool>/`:

1. **The first screen after the upload**, full-page screenshot at desktop width, before any click. `first-screen.png`.
2. **The headline result**: the score or verdict as the tool words it, and the first three things it tells you to fix, copied as text in the tool's own words. `headline.md`.
3. **Every recommendation**, in the order shown, copied as text. Mark each one: specific to this resume (quotes a line), generic (would apply to any resume), or keyword (about the posting's words). `recommendations.md`.
4. **What it asked for money for**, and when: the first upsell screen as a screenshot, and the price it quoted. `upsell.png`, with the price in `headline.md`.
5. **Time**: minutes from upload to the first usable recommendation, by the clock.
6. **Anything it got wrong about the resume**: a fact it misread, a line it attributed to the wrong job, a claim it invented. `errors.md`. Empty is a finding.

Capture ours the same way, on production, signed out, as a stranger would.

## What not to do

- Don't tailor the resume between tools, and don't accept a tool's rewrite into the file.
- Don't use a tool's paid tier. If the free tier shows a locked recommendation, record that it was locked, not what you imagine was behind it.
- Don't link to RIYP, mention it, or use the founder's name anywhere on a competitor's site. The account is the brand's.

## How the comparison gets written

From the captures, one table, tools as columns: the headline, the first fix, how many recommendations quote a line of the resume versus how many are generic, the errors, the time, the first price ask. Then one paragraph per tool on what it gave in the first five minutes that we didn't, and one on the reverse. The result goes in `docs/competitive-intelligence/head-to-head.md` and feeds a line on each compare page's "How we compare": from "we haven't run them on the same resume" to what we found, dated. No winner is declared; the pages say what each tool said.

## What this cannot show

One resume, one role, one day. It shows what the tools say to a mid-career tech resume; it says nothing about a nurse's, a student's, or a weak one. The live-judgment run covers those for our side only. If the finding is interesting, the second pass is three resumes, not more tools.
