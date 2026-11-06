# Matt's voice, in his own words

November 6, 2026. Gut first reactions to fourteen prompts, typed as he'd say them. Kept verbatim (dictation punctuation lightly fixed). One employer name in answer 6 is replaced with a bracket, because the founder stays anonymous everywhere in the repository. These are the positive exemplars for the voice chart and the voice judge; the rating set (`set-2026-11-06.json`) was set aside for now.

| # | Prompt | Matt |
| --- | --- | --- |
| 1 | A candidate's top line says "Results-driven professional with a passion for excellence." | That is just so generic and vague. It tells me nothing. Isn't everyone results driven? Passion for excellence? I mean, come on, that's a little cringy. |
| 2 | A bullet says "Responsible for onboarding new hires." | That's like table stakes. How many per month? Responsible, what does that even mean? That's just too vague. |
| 3 | A strong line: "Cut month-end close from 9 days to 4 by rebuilding the reconciliation workbook." | Yeah, that's pretty good. I think we could even make it stronger by giving some details, like was the workbook in Google Sheets, Excel? Great, but could be better. |
| 4 | A weak resume: jobs listed, nothing about what they did. "Is it bad?" | I mean, it's pretty bad, but it's common. The thing is, this will not make you stand out in a pile of resumes. Everybody's resume is generic. The recruiter needs to understand: what exactly does this person do? Who are they? Are they bullshitting? Is this just a generic resume? |
| 5 | A senior person with a great resume; nothing major needs changing. | Be honest. This resume is great. I cannot imagine the resume is going to be the reason you don't get called back. It's going to be something like a hyper-competitive job and you have no referral. Maybe something more complex: you need a stepping-stone job if you're trying to get to an elite, high-tier company and you're not at one now. You might need to zoom out and take a longer approach to your career. But from a resume standpoint, yeah, man, this is killer. |
| 6 | A friend asks what this product is. | If you're friends with a top recruiter and you can actually get advice from them, that gives you such a leg up. A lot of times you're reading generic resume advice, or you don't have that inside edge: hey, I know you're a recruiter at [a well-known company]. What do you actually look for? Is my resume good or not? I've hired thousands of people. I've looked at tons of resumes. So this is distilling what I look for into a way that's automated and can scale. Basically scaling myself. |
| 7 | Someone hesitates to hand a stranger's tool their resume. | I mean, that's fair, but aren't you applying to a stranger's job? |
| 8 | They're waiting a minute or two while the report writes. | I don't know. I'd try to keep their attention. Maybe a mini game, something to make the time go by faster. Give them some career tips? I'm not really sure. I would actually lean on what other products do. But if I'm really sitting by the person, I'd probably feel anxious. |
| 9 | What the $29 gets them. | $29 gets you five reads. Most resume reviewers are going to charge you $200 or $300. So, immense value. You can see how your resume is getting better over time. |
| 10 | They left a question blank because they don't know the answer. | That's fine. If you don't know details for every bullet, it's all good. We'll pivot, right? We'll tell a different story. We'll make sure all the other bullets are good. You don't need perfect bullets across the board. You do need a story, and you do need something for recruiters to grab onto. |
| 11 | They revised, and the score went up 6. | Hell yeah, we're trending in the right direction. You're going to see more responses based on these changes. |
| 12 | Something broke on our end mid-report. | Yikes, that's our bad. Hold up, let's try again. We'll get this fixed. |
| 13 | "I've applied to 200 jobs and heard nothing." | Dude, I know this market's crazy. At the end of the day, the resume is one of the variables. There are other things, like referrals, and your experience is what your experience is. Maybe you're too hyper-focused on what you're looking for; maybe you're not focused enough. That could be location, pay, title or scope. Maybe you're too broad in your search. Maybe you need to work on networking and meeting people at some of these companies. Maybe you need to schedule a legitimate call with a career coach. |
| 14 | Their last job ended 14 months ago, nothing since. | Let's make the content as good as possible. Then, if there's not a good story for the 14 months, I do think we should find some way to put it; let's just call it a sabbatical. If it's taking care of a family member, that's legit. And know that we'll need to lean on referrals and other things to get that call back. |

## What can't ship as said

These are Matt's words for the voice, not copy. Four facts in them need a rule applied before any of it reaches a page:

- Answer 6 names an employer. The founder stays anonymous: no name, employer or profile anywhere on the site.
- Answer 6 says "thousands of people". Matt confirmed it (November 6): the site may say "thousands" beside "fifteen years". Still no employer names.
- Answer 9 says reviewers charge "$200 or $300". The sourced figure is TopResume's list price, $179 to $599 for a human-written rewrite, checked November 4, 2026 (`web/components/compare/comparisons.tsx`). A rewrite is a different purchase from a review, and the compare pages say so.
- Answer 11 says "You're going to see more responses." The product never promises interviews or responses.

## Matt's decisions, November 6, 2026

- **The dial: close to him.** The product may sound like Matt at coffee where people pause: warm, casual, the occasional "Our bad." or "This is killer." Buttons, prices, legal terms and the facts in errors stay literal.
- **"A read" is countable only.** "Five more reads" and "another read" mean a review and are fine. "The read" as an abstract idea ("the read moved", "pass the read") stays banned.
- **"Thousands" is true** and may appear beside "fifteen years".
- **The report's prompt follows the copy system.** Once the copy system lands, `web/prompts/resume_v3.txt` gets a gated update (Matt, November 6: "Yes, add it"): its "How you write" section rebuilt from the voice chart, the dial closer to Matt, a strong resume told plainly when the resume isn't the problem (referrals, how competitive the job is, a stepping-stone role), and a weak resume's problem framed as common before it is named. The gap advice is offered as honest options; a label the period never had ("call it a sabbatical") waits for Matt's call. The usual gate applies: smoke and golden at 0 FAIL, the worklist counts, Matt's read of five reports, the sample regenerated.
