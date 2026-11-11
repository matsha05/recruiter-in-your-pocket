# Copy system

The working system for every word a reader sees: the site, the app, the report's shell, the PDF, the emails and the extension. [`voice-and-tone.md`](./voice-and-tone.md) holds the personality and the reasons behind it. This file is what you use while writing.

- Where the methods come from: [`docs/copy/sources.md`](./copy/sources.md).
- Every string on the site today, by route: [`docs/copy/inventory/`](./copy/inventory/README.md) (`npm run copy:inventory` from `web/`).
- The evidence for the voice: Matt's own answers ([`matt-voice-2026-11-06.md`](./copy/calibration/matt-voice-2026-11-06.md)) and what ChatGPT found in his past conversations ([`chatgpt-style-read-2026-11-06.md`](./copy/calibration/chatgpt-style-read-2026-11-06.md)).

Last updated: 2026-11-11. Matt decides brand calls: the voice, the dial, names, founder facts. Everything else follows this file. Where two rules disagree, Matt's newest dated decision wins.

How to use it: find the moment in §2, check the names in §5, write the string, then run §7. The tics in §4 are what the voice judge checks. Marketing headings, the paywall heading and search titles open with a hook (§8).

The report's model-written words (the verdict, the write-up, the notes, the questions, the examples) come from `web/prompts/`. They follow this voice too, but they change only through a gated prompt update, never through a copy edit.

## 1. The voice

Matt across the table: a recruiter with fifteen years in hiring and thousands of people hired, on your side, telling you what they actually see and helping you fix it. Warm and a little bit coach. High EQ, high IQ, very friendly, and cool about it (Matt, November 6, 2026).

### We are, we are not

Each trait has Matt's own words, from his answers on November 6, and a line already on the site that shows it.

| We are | We are not | Matt said | On the site |
| --- | --- | --- | --- |
| A recruiter who coaches | a cheerleader | "That's like table stakes. How many per month?" / "Let's make the content as good as possible." | "Lines not listed are fine as written." |
| Plain verdicts | slogans | "That is just so generic and vague. It tells me nothing." | "'Results-driven professional' is on every resume. Show the result instead." |
| The recruiter's real questions | rhetorical questions | "Responsible, what does that even mean?" | "How many new hires did you help onboard?" (voice guide, September 4) |
| Specific | vague | "Was the workbook in Google Sheets, Excel?" | "That's 412 characters. We need at least 800 to review it, so add the whole resume, including your experience." |
| On your side: "we" is you and us | the company talking about itself | "We'll make sure all the other bullets are good." | "Every fact in it is from your resume or your answers." |
| Excited when it's earned | gushing, or praise with no reason | "From a resume standpoint, this is killer." | "You're in. Five more reads." |
| Honest about what a resume can't fix | selling another report | "I cannot imagine the resume is going to be the reason you don't get called back." | "Neither predicts interviews or offers." |
| Warm and casual | slangy, or a costume | "That's fine. You don't need perfect bullets across the board." | "Sign in and it'll be in My reports." |
| Dry, in bursts | jokey | "That's fair, but aren't you applying to a stranger's job?" | "Pop it in and you're back on the other side of the desk." |
| Quick to own our mistakes | defensive or vague | "That's our bad. Let's try again." | "Something broke on our end, not yours. Saved reports aren't affected." |

### What the voice means for the words

The rows follow Torrey Podmajersky's voice chart, so each trait turns into rules for vocabulary, length, grammar and punctuation.

| Row | The rule |
| --- | --- |
| Vocabulary | Recruiter verbs: move forward, pass, shortlist, call back, read. Name the thing itself: your resume, the line, the job, the posting, the report, the pass. "A read" is fine when it means one review ("five more reads"). Never a word from the coined list in §4. |
| Length | Verdict, then the reason, then the next move. One idea a sentence. A reason that explains something earns its sentence; a sentence that only sounds good gets cut. |
| Grammar | Contractions. "You" for the candidate. "We" for the candidate and us, working on it. "I" only in the founder note. Active voice. A question only when the reader can answer it. |
| Punctuation | Periods by default. One exclamation point on a screen when something good really happened: a score that went up, a strong resume, a purchase that went through, a line filled in. Never two in a row, and never in an error, a price, legal or privacy copy, or a critique. No em dashes. "…" only for something in progress. Straight facts in parentheses are fine; asides in parentheses are not. |
| Capitalization | Sentence case everywhere: buttons, tabs, headings, labels. Proper nouns keep their capitals: Job Search Pass, Recruiter in Your Pocket, LinkedIn, Stripe. |
| Feelings | Acknowledge, don't diagnose (Matt, November 6). Name what's hard about the situation: "Not hearing back is rough, and it doesn't mean you're not qualified." Never claim to know how they feel: no "You're probably discouraged", no "Don't worry". Matt hates having a feeling invented for him. Saying what happened to them is not naming a feeling: "You matched the keywords and still heard nothing." is a hook (§8, November 11). |
| Praise | Big when it's earned, and always with the reason: "This is killer! You say what you did and what it changed." Praise with no reason ("Great job!") is a cheerleader's. |
| Coaching | Show the way out and walk it with them: "Let's start with the most recent one." "Every strong resume started somewhere like this." Encouragement points at real work on the resume, never at the person's potential. |
| Facts about Matt | Allowed: fifteen years in hiring, thousands of people hired. Never: his name, an employer, a profile link, a photograph. |
| Facts about hiring | Only what the research library sources. No "recruiters spend six seconds". |

### The dial

Matt at coffee is casual, mostly serious, irreverent about bad work and practical, with bursts of real enthusiasm. ChatGPT rated him 5, 2, 4 and 3 on Nielsen Norman Group's four scales. The product sits one notch more composed on slang (Matt, November 6: "Warmth yes, slang no") and at least as warm as he is on encouragement (Matt, November 6: "warm and borderline coach… high EQ and high IQ, very friendly but also cool").

| Scale (1 to 5) | Matt | The product |
| --- | --- | --- |
| Formal to casual | 5 | 4: contractions, "that's fine", "it's common", "our bad"; no "dude", "man", "hell yeah" or swearing anywhere |
| Serious to funny | 2 | 2: at most one aside a screen, reacting to a real moment |
| Respectful to irreverent | 4 | 3 toward resume clichés and bad advice; 1 toward people, always |
| Matter-of-fact to enthusiastic | 3 | 4 on a win ("This is killer! You say what you did and what it changed."); 2 in a critique, where the warmth comes from the way out, not the volume |

## 2. Tone by moment

The voice never changes. What changes with the moment is how much we say, and whether an aside belongs. The reader's state comes first, as Mailchimp's guide does it. The lines are from the site at its best; where a moment has fewer than three good ones, the gap is the work.

| Moment | The reader is | We sound | Aside | Three lines from the site |
| --- | --- | --- | --- | --- |
| Marketing | deciding whether to bother | a hook on their situation (§8), then a true thing about hiring, then what we do about it | one a section, at most | "244 people applied for the job you wanted." / "Eighteen got called back. The other 226 have no idea why the recruiter passed." / "Nobody tells you why. We do, before you apply for the next one." |
| Upload | about to hand over a resume | calm and literal: what to add, what's optional, what happens to it | one, beside the privacy facts | "That's 412 characters. We need at least 800 to review it, so add the whole resume, including your experience." / "We could only read 300 characters. A scanned or image-only PDF often does this. Paste the text instead." / "OpenAI writes the report from your resume. We don't store the resume or opt it into model training." |
| Waiting | watching a clock | what's happening now and how long it usually takes; no faked progress | none | "Checking every quote against your resume" / "The first pass came back incomplete, so we started it again." / "If you retry and this one also finishes, both count as reports. Waiting is usually the better bet." |
| Report shell | reading a judgment about their own work | direct, then encouraging: the problem, then the way out, walked together; plain enough that the recruiter's words carry | one, on the strong or the clean ending; one exclamation point on a win | "Lines not listed are fine as written." / "Every fact in it is from your resume or your answers." / "Neither predicts interviews or offers." |
| Rewrite | about to copy a line into their resume | protective of facts: the original, the example, what's still theirs to fill | none | "This adds a detail that isn't in your line or your answers. Use the words you wrote, or add it as an answer if it's true." / "This draft changes a detail from your resume. Edit it back to what's true before copying." / "Every fact in it is from your resume or your answers." |
| Research | checking whether to believe us | the question, the finding, the source, the limit | one, in the figure's margin note | "That study was about interviews, not resumes." / "These are audit studies: fictitious resumes and callbacks, not hires." / "No study we know of isolates a quantified bullet against a duty-style one." |
| Pricing | deciding whether to pay | blunt and literal: the price, the term, the refund, what's included. The paywall's heading may be a hook about the next application (§8); nothing under it is | none before the purchase; one exclamation point on the confirmation | "Your first report is free. Five more are $29." / "Stripe handles your card. We never see or store the number." / "Checkout canceled. Nothing was charged." |
| Sign-in | trying to get back in | plain steps | one, in the email only | "No password. The code works once and expires soon." / "We sent an 8-digit code to {email}" / "That code didn't work. Check the email or request a new code." |
| Account | looking after their own things | quiet and exact; nothing sold; glad when a score goes up | one, in an empty state; one exclamation point when a version improved | "Run a report and save it. Your next version will have something honest to measure against." / "Scores compare versions of your own resume. They don't predict interviews or offers." / "Skip it, and this browser can still bring the report back for up to 24 hours." |
| Error | stuck | ours: own it in Matt's words, then what happened and what to do. Theirs: plain, no ownership | none | "Something broke on our end, not yours. Saved reports aren't affected." / "We gave that report back. Try again whenever you're ready." / "That email address doesn't look right. Check it and try again." |
| Email | glancing at a notification | the fact in the subject; one warm line; the security line plain | one | "{code} is your sign-in code" / "Your code's here. Pop it in and you're back on the other side of the desk." / "Didn't ask for this? Ignore it. No one gets in without the code, and we'll never ask you for it." |
| PDF | reading the report away from the site | the same names as the page, nothing new | none | (follows the report shell) |
| Extension | on someone else's job page | literal and brief; the button says what it saves | none | "Choose Save job on a posting to keep its description and link." / "The extension does not ask for access to every site you visit." / "Keep the jobs you want to revisit." |

## 3. This, not that

Real strings from the inventory, each with the house version and the tic it fixes (§4). Facts, prices, placeholders and legal terms are kept exactly. §7's rewrite pass applies these route by route; the before/after tables for each route are in `docs/copy/rewrites/`.

| # | Where | Not this | This | Why |
| --- | --- | --- | --- | --- |
| 1 | Pricing | A writer, a keyword scanner, a builder, and a recruiter's read are different purchases, and the read is the one that decides: | A resume writer, a keyword scanner and a builder each sell something different. A recruiter is the one deciding whether you get the call: | coined_word, tricolon |
| 2 | Paywall heading | Want another read? | Five more reads for $29. | question_heading |
| 3 | Wait screen | Starting the read again | Starting over | coined_word |
| 4 | Progress page | What keeps tripping recruiters up, and what keeps landing. | What keeps coming up across your reports, and what keeps working. | coined_word |
| 5 | My reports, description | Your saved resume reports, with the Verdict, score, and fixes from each. | Every report you've saved, with its score and the lines that needed work. | retired_name |
| 6 | App manifest | See what a recruiter sees: your Verdict, where your resume stands, and what to fix first. | See what a recruiter sees in your resume, line by line. | retired_name, colon_fragment |
| 7 | Pricing, free plan | Your Verdict and where your resume stands | Where your resume stands, and why | retired_name |
| 8 | Methodology heading | The Verdict. | The write-up. | retired_name |
| 9 | Homepage | Not forty tips. Every line a recruiter trips on, in the order they hit it. | The lines a recruiter would stop on, in the order they'd read them. | not_x_but_y, coined_word |
| 10 | Homepage | No ATS score. No interview odds. Just what reads clearly and what doesn't. | We don't score you against an ATS or guess your interview odds. Nobody can. We tell you which lines are clear and which aren't. | punch_fragments, not_x_but_y |
| 11 | Command palette | Upload Resume | Upload a resume | title_case |
| 12 | LinkedIn report | Run Another | Run another | title_case |
| 13 | Settings | Change Resume | Change resume | title_case |
| 14 | Command palette | Keyboard Shortcuts | Keyboard shortcuts | title_case |
| 15 | Saved jobs | Delete Job | Delete job | title_case |
| 16 | Job match labels | Excellent Fit / Strong Match / Plausible Fit / Career Stretch | Excellent fit / Strong match / Plausible fit / A stretch | title_case |
| 17 | Settings, upload | Please upload a PDF, DOCX, or TXT file. | Upload a PDF, DOCX, or TXT file. | please |
| 18 | Settings, upload | File too large. Please use a file under 4 MB. | That file is over 4 MB. Choose a smaller one, or paste the text instead. | please |
| 19 | Settings, upload | Resume too short. Please upload your full resume. | That's not the whole resume. Upload the full file, including your experience. | please |
| 20 | Checkout | Please sign in first. | Sign in first. | please |
| 21 | Account deletion | We could not verify every subscription, so your account was not deleted. Please contact support. | We couldn't check every subscription, so your account wasn't deleted. Write to support and we'll sort it out. | please |
| 22 | Account deletion | Admin client not configured | Account deletion isn't available right now. Try again later, or write to support. | internal_term |
| 23 | Reports API | Invalid report ID. | We can't find that report. Open it from My reports. | internal_term |
| 24 | Several APIs | Not authenticated | Sign in to see this. | internal_term |
| 25 | Report save | Could not save this report. Check History before trying again. | We couldn't save this report. Check My reports before you try again. | two_names |
| 26 | Pricing | Could not open checkout. Try again. If this continues, contact support. | Checkout didn't open. Try again, and if it keeps happening, write to support. | stiff |
| 27 | Error page | Something broke on our end, not yours. Saved reports aren't affected. | Our bad. Something broke on our end. Your saved reports are fine. | Matt's error voice |
| 28 | Report stream | Connection hiccup. Try again in a moment. | The connection dropped. Try again in a moment. | joke_in_trust_moment |
| 29 | Checkout button | Opening checkout... | Opening checkout… | typography |
| 30 | Settings | Resume saved. 14 skills identified. | Resume saved. We found 14 skills in it. | stiff |
| 31 | My reports | Showing your latest 50 reports. Older reports remain stored and can be included in an account export. | These are your latest 50 reports. Older ones are still saved, and an account export includes them. | stiff |
| 32 | Methodology title | How the report works: the score, the write-up, the lines | How the resume report works | colon_fragment |
| 33 | Sign-in page | Sign in to access saved reports and role context you choose to keep. | Sign in to see your saved reports and the job postings you kept. | internal_term |
| 34 | Extension | Review my resume | Get your free report | retired_name |
| 35 | Saved jobs | Save job descriptions, compare them with your resume, and track your applications. | Save a job posting, then check your resume against it. | tricolon |
| 36 | Research | A referral gets you a hearing. It doesn't pass the read for you. | A referral gets your resume opened. It still has to make sense once it is. | coined_word |
| 37 | Research | Being relatable is part of the read | Recruiters ask whether they can picture you in the job | coined_word |
| 38 | Progress page | Same score as your first report. The written findings show what moved. | Same score as your first report. The write-up says what changed. | two_names |
| 39 | Report, a blank left | Left blank for now. A recruiter will have the same question, and they won't call to ask it. | Left blank, and that's fine. Not every line needs every detail. Let's make sure the rest of your resume gives a recruiter something to grab onto. | Matt's answer 10, coaching |
| 40 | Report, strong ending | Send it. Then read it against the posting you're going for. | This is killer! Your resume won't be the reason you don't get the call. Send it, and read it against the posting you're going for. | Matt's answer 5, praise with the reason |
| 41 | Re-check | Up 6 since last time. | Up 6 since last time. That's the right direction! | Matt's answer 11, without the promise |
| 42 | Purchase confirmed | You're in. Five more reads. | You're in! Five more reads. | a real win |

## 4. The tics, and the fix for each

The habits this codebase keeps producing. Most come from how language models write by default; Wikipedia's field guide (*Signs of AI writing*) and PostHog's copy skill name the same patterns. Ids match the voice judge (`web/lib/evals/voice-judge/`).

| Id | What it looks like here | The fix |
| --- | --- | --- |
| coined_word | A product word standing in for the thing: "the read" (as an idea), "the page" (as the resume's content), "signal", "rung", "card" as a verb, "hits them", "lands", "landing" | Name the thing: the report, your resume, the line, the detail, the band. "A read" meaning one review is fine; "halfway down the page" meaning the sheet is fine |
| retired_name | A name Matt retired: Critical Miss, Verdict as a capitalized label, Nothing critical, Review my resume, Resources, Fix these first on new copy | The glossary's current name (§5) |
| rejected_phrase | Recruiter language Matt rejected as fake: "bucket you fast", "trajectory points up", "Strong Foundation" | The verbs recruiters use: move forward, pass, shortlist, call back |
| colon_fragment | A heading made of a label, a colon and a list: "How the report works: the score, the write-up, the lines" | One sentence that says what the thing is or does |
| tricolon | Three items for rhythm rather than content: "Save job descriptions, compare them with your resume, and track your applications." | The one or two things that are true and needed |
| not_x_but_y | "Not X, but Y" and its cousins: "Not forty tips.", "It's not a filter, it's a saved view" | Say Y |
| punch_fragments | Three or more short fragments in a row for effect: "No ATS score. No interview odds. Just…" | One or two full sentences |
| question_heading | A heading asked for effect, the reader can't really answer: "Want another read?", several on one screen ("Already paid?" "Used all five?") | A statement that names the thing. The recruiter's real questions are the voice ("How many per month?"); questions asked for effect are not |
| copula_avoidance | "serves as", "boasts", "features", "marks" where "is" or "has" would do | "is", "has" |
| ing_analysis | A trailing "-ing" clause that sounds like analysis: "…, highlighting your leadership", "…, reflecting real growth" | Say the thing, or cut it |
| invented_emotion | Telling the reader how they feel: "You're probably feeling discouraged", "Don't worry", "We know this is stressful". A hook that says what happened to them ("You matched the keywords and still heard nothing.") is not this | Acknowledge the situation: "Not hearing back is rough, and it doesn't mean you're not qualified." |
| please | "Please" in an instruction or error | Cut it; the instruction stands |
| title_case | Title Case on a button, tab or label: "Upload Resume", "Run Another" | Sentence case |
| generic_ai_word | unlock, elevate, transform, seamless, empower, journey, supercharge, streamline, effortless | Say what it does |
| slogan | A line any product could put on a billboard, or a signature line outside marketing | A sentence with a subject and a fact |
| hedge_stack | may, likely, suggests and could piled into one sentence | One hedge, or a plain statement of what the evidence shows |
| invented_number | A statistic the research library doesn't source: "recruiters spend six seconds". A hook gets no exemption: every figure in one is on the site with its source or its date | Drop it, or cite the page that sources it |
| exclamation | An exclamation point that isn't earned: two in a row, more than one on a screen, one on something that isn't a win ("Upload your resume!"), or one in an error, a price, legal or privacy copy, or a critique | A period. One earned exclamation point on a real win is the voice (Matt, November 6) |
| empty_praise | Praise with no reason: "Great job!", "Amazing work!", "You've got this!" | Name what earned it: "This is killer! You say what you did and what it changed." |
| fake_intimacy | "Trust me", "We've got you", "We know exactly how you feel" | A specific, useful sentence. Coaching that walks the next step ("Let's start with the most recent one") is the voice, not this |
| slang | "dude", "man", "hell yeah", swearing (Matt, November 6) | Matt's warmth without the slang: "That's fine." "It's common." "Our bad." |
| joke_in_trust_moment | Wit in a price, a refund, a privacy fact, a sign-in step or a cute word in an error ("Connection hiccup") | Plain words. Ownership in an error is not a joke and is fine |
| product_about_itself | The product narrating itself: "RIYP reads the posting and…" | What the reader gets or does |
| two_names | Two names for one thing: "History" and "My reports", "written findings" and "write-up" | The glossary name, once |
| repeats_heading | A line under a heading that restates it, or a hint under a button the button already says | Cut it; fix the heading if the screen needs more |
| internal_term | Code and server words in a message a reader sees: "Admin client not configured", "Invalid report ID.", "Not authenticated", "role context" | What happened and what to do, in the reader's words |

## 5. The glossary: one name per thing

Added November 6, 2026 (Matt, from the copy-system interview):

| Thing | Name | Retired |
| --- | --- | --- |
| The one-line sentence under the score | No label. In prose, "the verdict", lowercase | "Verdict" as a capitalized product name, on any page |
| One review of a resume | `report`. "A read" is fine as a countable word: "five more reads", "another read" | "the read" as an abstract idea ("the read moved", "pass the read") |
| Who speaks | "we" means the candidate and us, working on it; "you" is the candidate; "I" only in the founder note | "we" as the company narrating itself |
| Where saved reports live | `My reports` (navigation, page title); "your saved reports" in a sentence | History, Report history, Saved reports as a title |
| What a recruiter does with a resume | move it forward, pass, shortlist, call back | bucket, filter, reject (except the homepage's "Reject" choice, Matt's November 4 copy) |
| The founder's facts | fifteen years in hiring; thousands of people hired | his name, employers, profile links |

### The report and the product

User-facing noun:
- `report`

Supporting phrases:
- `recruiter report`
- `what a recruiter sees first`

Avoid mixing:
- `review`
- `analysis`
- `artifact`

If the user is looking at the generated output, call it a `report`.

#### One name each (Matt, November 1, 2026)

Each of these things has one name everywhere: marketing, the app, the report, the PDF and email. When a label and a heading sit together, the label is the short form of the heading. Retired names must not come back.

| Thing | Name | Retired |
| --- | --- | --- |
| The button that starts a report, signed out (header, hero, section closes, research, sample end, pricing) | `Get your free report` | Read mine, Start a report, Review my resume |
| The workspace submit button | `Get your free report` while the free report is available; `Get my report` for a pass report; `Compare my revision` for a revision | None |
| Starting a report from signed-in navigation | `New report` | None |
| Strengths to leave alone | Keep: `Keep these` (report tab, PDF), `Keep these. They're working.` (section heading), `Keep this one` (label in the opening read) | Leave these alone, Don't touch this one |
| What to change (v2 reports saved before November 6, 2026; the worklist's names are in the section below) | Fix: `Fix these first` (report tab, PDF); headings `Fix this first.`, `Fix these two first.`, `Fix these three first.` until the report knows its Critical Miss count, then the count heading below; cards `Critical Miss` (`Critical Miss 1`, `2`, `3` when there are several), then `Fix 2 of 3`, `Fix 3 of 3` by position (Nov 2, 2026: the count travels with the card, since phones hide the heading) | Start with these changes, Suggested change |
| A problem that could cost an interview on its own (v2 reports only; no public page names it since November 6, 2026) | `Critical Miss`. A report names one to three, in priority order; the first is the one to fix first. Never `Nothing critical` (Matt, November 1, 2026). On a clear page with one miss (Matt, November 5, 2026) the word never appears: the row is `The question they'd ask`, the heading `The question they'd ask.` with `Not a reason to pass on you. Worth a sentence before you send it.`, and the other rows `Worth tightening` (`Worth tightening · 1 of 2`) under `Worth tightening.`; the ending is `Send it. Then read it against the posting you're going for.` with `Read it against a posting` (a v2 page can be clear with one question open, so it keeps this ending; the worklist's clean page says `This is killer! Send it.`) | Nothing critical |
| Where the resume stands | The band: `Not ready yet`, `Needs more context`, `Mostly clear`, `Clear and specific`, each with its anchor sentence (`web/lib/reports/score-band.ts`). The bottom rung (Matt, November 5, 2026: "Band only") is the lowest band at 60 and below and reads `The jobs are listed. A reader can't tell what you did in them or what you've done since.` | None |
| The questions before the report (ask-first, November 5, 2026) | `{Count} questions before the report.` (`Six questions before the report.`), `A recruiter would ask these. They won't get to.`, `Only what's true. Every answer goes into your resume in your own words.`, the three honest states on a line question (Matt, November 5, 2026) `I did this`, `I did related work` (then `Say what the related work was. It goes on the page as its own line, not into this one.`), `I haven't done this` (then `Left out.`); `I don't know` on a general question (then `Answer it after all`); `Write my report`, `Skip the questions and read it as it is`. Every ask in a row is the model's words in the pen; where the note is the ask, the field says the shape of the answer (`What you've done since, with dates`, `The title you're applying for, as the posting writes it`, otherwise `Your answer`). The report written from the answers says `written from 6 answers` where the read time goes, and the wait says `Writing it up from your answers.` | Skip anything you don't know (as a line under the heading) |
| The negotiation section and its guides | `After the offer` | Resources, Career resources, All Resources |
| The example report | `Sample report` (navigation and page title). The homepage link names the candidate: `See Jordan's report` | See an example, Example report |
| A paid re-run of a revised resume | `Re-check`. Public copy: `see which lines came off the list`. The comparison says a line came `off the list`, is `still there` or is `new`, and the score as a change; on two v2 reports the Critical Miss `changed`, never `fixed` | None |
| Keeping a report in My reports | `Save this version` (the section row and the signed-in ending, Nov 2, 2026) | Save report |

#### The worklist report (Matt, November 5, 2026; built November 6)

The report's unit is the line, not the Critical Miss (`docs/design/2026-11-worklist-report/`). Its names, in the product and the PDF:

| Thing | Name |
| --- | --- |
| The one-sentence read under the score | The verdict (the model's sentence; no label above it) |
| The recruiter's paragraphs | The write-up (no heading; it follows the verdict in the pen) |
| The section of cards | `Lines that need work.` with the lead `Top to bottom, the way a recruiter reads.` (report tab `Lines`, the short form of the heading); on a page with no work: `Nothing here needs work.`, and the ending `This is killer! Send it.` with `Every line says what you did and what changed, so your resume won't be the reason you don't get the call. Read it against the posting you're going for, and look at whether anyone can bring you in.` (November 6, 2026, copy system §3, pair 40) |
| A card's label | The model's `where` (`Marketing Intern, line 1`, `Dates`, `Structure`); on the keep card `Don't touch this one` (the voice guide's reference line) with `Write the others like it.` |
| What a recruiter can't tell | The model's words in the pen; no label |
| The example | The line with the detail in, blanks in the candidate's blue; no label; once filled, `Filled in` on the card |
| The question and its fields | The model's question as the label; one field per blank, the blank's label as its name; `Copy the line`; `I don't know yet` then `Left blank, and that's fine. Not every line needs every detail. Let's make sure the rest of your resume gives a recruiter something to grab onto.` and `Fill it in after all`; under a filled line `Every fact in it is from your resume or your answers.`; kept answers say `Kept with this report.` |
| After the cards | `Lines not listed are fine as written.` |
| The first pass (November 7, 2026, direction B; revised the same day after three reviewers) | Under the verdict, no label ("pass" already names the Job Search Pass and a recruiter passing on you): the row `Which job is this for?` (the first fit role, with the model's one-sentence reason in the pen), `What level?` (the level, with the fact that sets it in the pen; hidden when it only repeats the job), and with a posting `Your posting` (its title only; the summary isn't repeated back). With no posting, `Going for something else? Read it against a posting`. With a posting, its fit note in the note face, saying only what the verdict doesn't, then `What the posting asks for that your resume doesn't show` (the must-haves first; a long list shows two and `Show 4 more`) and `If you've done it, say where. If you haven't, leave it out.` A line written to screening software leads: `Take this line out before you send it.` (`Take these lines out before you send it.`), the line struck through, then what each one is (`This is an instruction written to AI screening software.`) and `It may be set in white, where you won't see it; software still reads it as text, and a recruiter can see it too. Recruiters who find a line like this often stop reading there.` |
| Fit | Without a posting, after the cards: `Roles your experience points toward.` with the fit note and `Roles to consider`. With a posting, the fit is in the first pass and this section isn't shown. |
| The score note | `What the score means`: `The band is what a recruiter would do with your resume after one pass. The number says where in the band you sit. Neither predicts interviews or offers.` In the product they are bands, never rungs. The worklist has five: the four below plus `Ready to send` (93 and above; `Every line says what you did and what changed. There's nothing here a recruiter would stop on.`), which a page earns only when no line needs work (Matt, November 6, 2026) |
| The re-check | `N lines are off the list.` / `The same lines are on the list.` / `Every line you worked on is off the list.`; the score only as `Up N since last time. That's the right direction!` (one earned exclamation point) or `Down N since last time.`; a line off the list is never called fixed |

Retired with it in the product: `Critical Miss`, the count headings, `The question they'd ask`, `Worth tightening`, `Keep this one`, `Fix these first`, the questions-before-the-report screen (the worklist asks on each card) and the wait screen's fifth stage. The public pages that still name the old unit are listed with proposed replacements in `docs/promptops/proposals/2026-11-worklist-public-copy.md`, which is Matt's call; until he decides, the rows below stand for those pages and for reports saved before November 6, which keep the v2 shape.

### The report's structure (v2 reports saved before November 6, 2026)

The main report navigation uses these labels:
1. `Overview`
2. `Fix these first`
3. `Keep these`
4. `Role fit`

Section headings follow the same names: `Fix this first.` / `Fix these two first.` / `Fix these three first.` and `Keep these. They're working.`

#### Relabelled November 6, 2026: reports saved before the worklist

Matt retired the name "Critical Miss", so reopened v2 reports and their PDFs no longer print it. The counting rule below still holds; only the words changed: `One problem to fix first.`, `Two problems. Start with this one.`, `Three problems. Start with this one.`, `More than three problems. Here are the three that matter most.`, the card labels `Fix this first` (one) or `Problem 1`, `Problem 2` (several) then `Fix 3`, and in the v2 re-check `Same problem as last time.`, `Your top problem changed.`, `One problem changed.` and `The summary line is the same.` A changed problem is still "changed", never "fixed". The rows below are the history.

#### The Critical Miss count (v2 reports saved before November 6, 2026) (Matt, November 2, 2026: "i dont want to lie to people and say they have one critical miss if there are more")

Once the severity check has flagged the report's Critical Misses, the count leads the fix section on the web and in the PDF, phones included. The heading says how many and where to start; the line under it says what makes them critical.

| Count | Heading | Line under it |
| --- | --- | --- |
| 1 | `One Critical Miss. Fix it first.` | `It's the one most likely to cost you the interview.` A judgment, not a guarantee: say nothing about the rest of the report |
| 2 | `Two Critical Misses. Start with this one.` | `Either one could cost you the interview on its own.` |
| 3 | `Three Critical Misses. Start with this one.` | `Any one of them could cost you the interview on its own.` |
| More than 3 | `More than three Critical Misses. Here are the three that matter most.` | `Any one of them could cost you the interview on its own. Start with the first.` |

A report without the severity check's flags (every report saved before it) states no count: it keeps the fix heading above and `The one thing to fix first` under its Critical Miss. Code: `criticalCountHeading` in `web/lib/reports/report-presentation.ts`.

The count bends to the page (Matt, November 5, 2026). On `Clear and specific` with one miss, counted or not, the heading is `The question they'd ask.` and the line under it `Not a reason to pass on you. Worth a sentence before you send it.`; the interview-cost line is wrong there (the November 5 live run: every clear page's miss was a method or example ask). With two or more flagged misses on a clear page the severity check has earned the count, and the table above stands. On `Not ready yet` the count stands too; what changes there is that the questions come before the report (`docs/design/2026-11-weak-and-strong.md`). The full recruiter notes and the five interview-style questions after the fixes were cut on November 5, 2026 (Matt); the PDF keeps its `Next steps` checklist.

Within each recommendation, show the original quotation, what needs clarification, and a suggested revision with any missing facts marked.

These are UI labels. Internal schema and prompt field names may remain stable; do not rewrite Matt's tuned backend prompt merely to match display copy.

## 6. Rules by surface

### Copy budgets

Keep the product scanning clean.

Budgets:
- headline: 2 lines max
- subhead: 1 sentence, sometimes 2
- card description: 1 sentence
- CTA: 2-4 words
- error state: what happened + next step

These are layout guidelines, not a reason to force fragments or slogans. A natural sentence that explains the issue is better than a shorter sentence the reader has to decode.

No taglines, helper text, or secondary labels (November 3, 2026). A screen is its heading, its controls, and the facts the reader needs right there: a price, a term, a limit, a consent line, an error. No eyebrow above a heading, no sentence under it that restates it, no hint under a button that the button already says, no label on a pill that the title carries. If a screen stops making sense without one of those, fix the layout or the heading instead of adding the line back. Report findings, the Critical Miss count line, the pass terms, privacy facts, and errors are content, not helper text.

### Claims

Every strong claim needs nearby proof.

Good pattern:
- claim
- proof
- what to do with it

Bad pattern:
- claim
- louder claim
- CTA

Never promise interviews, jobs, or guaranteed outcomes.

### Buttons and links

Primary CTA:
- verb first
- clear outcome

Examples (sentence case):
- `Get your free report` (the one name for starting a report, signed out; see §1)
- `Get 5 more reports · $29`
- `Export PDF`

Secondary CTA:
- clarifies or supports

Examples:
- `See Jordan's report`
- `Restore access`
- `Copy link`

Avoid:
- `Get Started`
- `Learn More`
- `Submit`
- any name retired in §1

### Errors and recovery

Every error should answer:
1. what happened
2. what to do next
3. fallback if needed

When the error is ours, own it first, in Matt's words (November 6, 2026): "Our bad." Then the facts, literally: what happened, whether it used a report (the shared sentences in `web/lib/billing/generationFailureCopy.ts`), and the next step. When the problem is in what the reader typed or uploaded, say so plainly with no ownership line: "That email address doesn't look right. Check it and try again."

Example:
- `Our bad. The report didn't load. Refresh and try again.`
- `Still stuck? Restore access from Billing.`

Never use:
- `Something went wrong`
- blame language aimed at the reader
- internal system terms (§4, internal_term)
- a joke or a cute word ("hiccup"); ownership is not a joke

### Free and paid

Any pricing or paywall surface must make three things obvious:
1. what is free now
2. what paid unlocks
3. how much control the user has

Preferred phrasing:
- `Your first report is free.`
- `The Job Search Pass includes five additional reports for $29, valid for 90 days, with no automatic renewal.` (90 days since November 2, 2026)
- `PDF export and saved reports come with signing in, not with the pass.` The pass is for re-checks and other jobs; it is never sold as the way to get a PDF.

Do not imply the free report has shallower feedback. Saved history requires sign-in. Paid PDF exports remain available through the valid paid period even after all report credits are used.

### Trust and privacy

Trust pages and trust blocks should answer:
1. what we store
2. why we store it
3. how long it stays
4. how the user deletes it
5. who handles billing

Say it in plain English. If legal wording is required, put it after the summary.

## 7. The review procedure

Run this on any new or changed string before a PR. A banned-word scan can't do it alone: the September 4 correction ("Passing UI tests and checking factual accuracy do not establish writing quality") still stands.

1. **Read the whole screen aloud, in order.** Start at the heading and stop at the last button, including the line under it and the error states. Read the copy as the reader meets it, never as a list of strings. If you stumble, the reader will too.
2. **The swap test.** Could Jobscan, Teal or Resume Worded print this sentence unchanged? If yes, either add the fact only we'd say, or make it shorter and literal. A button or a price passes by being literal; an intro or an aside has to fail the swap.
3. **The cut test.** Take words away one at a time, and stop where the meaning starts to fall apart. Whatever you could cut without losing anything goes. (The brief called this the Jenga rule; it is our own test, not Shopify's.)
4. **The questions.** Answer each one; any "no" sends the string back.
   1. Would Matt say this sentence, across the table, to a candidate? Check against §1 and his answers, not against taste.
   2. Does it name the actual subject, with nothing the reader has to translate (§4, coined_word)?
   3. Does the reader know what happens next: what the button does, what to fix, what was charged?
   4. Does every judgment point to something visible on the resume, and is it no more certain than the source allows?
   5. Does it criticize the resume, never the person, and acknowledge the situation without diagnosing their feelings? When it praises or encourages, does it say why? If it is a hook, does it pass §8's four checks?
   6. Does it keep the candidate's facts and their control?
   7. Is there at most one aside and at most one exclamation point on the screen, and neither in a button, price, legal term, error fact or critique?
   8. Is every name the glossary's name (§5)?
   9. Does the heading, the line under it and the next block each do a different job, with nothing said twice?
   10. Does it say exactly what happened, including what didn't happen?
5. **The free check, then the voice judge.** `npm run copy:check` from `web/` confirms the inventory is current, that no string trips a pattern check outside the known baseline (`docs/copy/lint-baseline.json`), and that the judge's tests pass; it also runs in the launch gate. Then `npm run copy:judge -- file <strings.json>` (or `inventory --tables <names>`) from `web/` scores strings against §1 to §4 and proposes a rewrite for each. It is a paid local check (`RIYP_ALLOW_PAID_EVALS=true`, a spend ceiling on every run) and never runs in production; `--dry-run` runs the free pattern checks only. The judge is a second reader, not the decision: when it and the read-aloud disagree, the read-aloud wins, and the disagreement goes back into its examples.
6. **Brand-level lines go to Matt.** The dial, the homepage's lines, anything that states a founder fact, and any new aside on the homepage, pricing or the report's ending. Ask through the question UI, recommendation first, once per batch.

## 8. The hook (Matt, November 11, 2026)

Matt picked the boldest of three versions of the same surfaces and said the voice rules could change to allow it. The method is Hook, Spike, Payoff, from Ilias Ism's blitz-copy skill (github.com/Illyism/seo-skills, MIT), with the parts that aren't true here taken out.

### The three moves

| Move | What it does | On the site |
| --- | --- | --- |
| Hook | Says what happened to the reader, or takes their side, before the product is named | "You matched the keywords and still heard nothing." / "You're qualified. Your resume isn't saying so." |
| Spike | Opens the gap with a fact we can source: a number from the site, a dated test, a price read from the tool's own page | "On the resume we ran through both, Jobscan returned a 35% match and 55 items, 18 of them about that resume." |
| Payoff | One specific thing they get, said literally | "The first report is free, and it lists the lines a recruiter would question." |

### Which triggers we use

| Use | Because |
| --- | --- |
| Curiosity | Nobody tells a candidate why the recruiter passed. That gap is the product |
| Recognition | The reader has sent the applications and heard nothing. Saying so is true of the person the product is for |
| Relief | A first report that is complete and free is a real answer |
| Advantage | A recruiter's view of your own resume is one most candidates never get |
| The next application | A real deadline. "Don't send the next one blind." |

| Leave out | Because |
| --- | --- |
| A number we can't source | `AGENTS.md`: never invent numerical results. blitz-copy's own example ("We tested this on 1,324 people") would fail here |
| A promise of interviews, callbacks or offers | We can't keep it, and the score note says so |
| An invented deadline, a countdown, scarcity, "secret", "exclusive" | Nothing about the pass is scarce or secret |
| A feeling named for the reader | Matt, November 6. The situation is theirs to feel about |
| Emoji and hype words | §4, generic_ai_word |

### Where it applies

| Surface | The hook goes | What stays literal |
| --- | --- | --- |
| Homepage, compare pages, the sample report's page | The h1, and one line after it | The comparison's answer paragraph, the table, prices, sources, "How we compare" |
| Paywall | The dialog's heading | The pass list, the price, the term, the refund line, the buttons |
| Search titles and share cards | The title, within 60 characters | The description says what the page is |
| The report, the PDF, errors, sign-in, privacy, terms, research findings | Nowhere | Everything |

A compare page keeps "<Tool> vs Recruiter in Your Pocket" as its search title, its breadcrumb and its name in lists, because that is what people type. The hook is the h1.

### Four checks before a hook ships

1. Is every number in it on the site already, with its source or its date?
2. Is it true of the person the page is for, and fair to a reader it isn't true of? ("You matched the keywords and still heard nothing." is fine on a page someone reached by searching for a keyword scanner.)
3. Is the stake real? The next application is. A deadline we made up isn't.
4. Is the line after it a fact, and is there only one hook on the screen?

## Homepage copy, November 4, 2026

The homepage was rebuilt from first principles on November 4, 2026 (`docs/design/2026-11-homepage-research.md`). Its lines, in order, so that no surface drifts from them:

| Beat | Copy |
| --- | --- |
| The pile (h1) | `244 people applied for the job you wanted.` then `Eighteen got called back. The other 226 have no idea why the recruiter passed.` Source line: `Greenhouse, The Hire Standard, March 2026: 244 applications per role in 2025, 7.6% past the first screen.` |
| The read (h2) | `By the time you finish reading this sentence, a recruiter has finished reading your resume.` The choices `Move forward` and `Reject`. Then `Nobody tells you why.` / `We do, before you apply for the next one.` |
| The note | `Here’s the note Jordan never saw.` then the clipping (the line and the note from the sample report) and `See Jordan’s full report`. The report's verdict sentence and its questions stay on the sample report. |
| The re-check | `Fix it. Then check it again.` Captions `First report` and `Revision 1`; the note `Changed. Up 6.`; `Up 11 since the first report.` Changed, never fixed. |
| The founder | `I’ve passed on more people than I can count. A few seconds a resume, fifteen years, at companies you’ve heard of and small ones around the world. The reasons were almost always the same, and nobody told you. I wrote them down.` Signed with the wordmark. The AI disclosure lives on How the report works and in the legal content, not here. |
| The close | `Before you apply for the next one.` |

Facts: fifteen years (Matt, November 4, 2026; the methodology FAQ and the legal content say 15 too). No company names, no name, no photograph. The button is `Get your free report` on every beat that has one (§1).
