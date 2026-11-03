# Product brief: Recruiter in Your Pocket

Date: 2026-11-02. Status: proposal for Matt. One page, written to be the thing a builder reads before touching anything.

## Who it's for

Four people, all mid-search, all a few weeks into silence, all short on time and usually on a phone.

- **Daniel, new grad.** Just finished a CS degree, one internship, a resume that lists coursework and "responsible for". He has sent sixty applications and heard back from two. He suspects something is wrong with the resume but every piece of advice online contradicts the last one.
- **Maria, career changer.** Eight years teaching high-school math, a data bootcamp, two projects. Her resume still reads as a teacher's, and she can't tell which parts of her old life count.
- **James, back after a layoff.** Ten years in B2B marketing, laid off in a reduction, eighteen months of patchy freelance since. He knows the gap is the problem. What he doesn't know is what to say about it.
- **Wei, senior IC aiming at top tech.** Staff engineer at a payments company, strong work, a dense resume that assumes the reader already knows what the systems are. He gets calls, just not from the companies he wants.

They don't want to learn resume writing. They want someone from the other side of the table to look at the page for thirty seconds and tell them the truth.

## The job they hire us for

"Tell me why I'm not getting calls, and what to fix first." Said by someone who has actually sat on the other side. Not a score, not a rewrite, not a course. A read.

## The wedge

The Recruiter First Impression: a Verdict in a recruiter's words, a band that says where the resume stands, and the Critical Misses, each a problem that could cost the interview on its own, with the first one to fix named. Everything else in the product exists to make that first impression feel true, then to help the person act on it.

## The moments of truth

1. **The first screen**, wherever they land: homepage, a research article, a share card, the LinkedIn Page. In three seconds they must know it's a recruiter's read, that the first one is free, and that it's not another ATS score.
2. **The first paste.** The riskiest click on the site: handing a stranger the document. The privacy line and the "what we read" preview sit here, not later.
3. **The wait.** Forty to ninety seconds. The person is on a phone, half-expecting nothing. The screen has to prove the thing is alive and say what's being read, without faking progress.
4. **The first Critical Miss.** It must feel true and specific: a line from their resume, the question a recruiter would actually ask about it, in words that could not apply to anyone else's resume. If this moment is generic, nothing after it matters.
5. **Answering it and seeing their own line improve.** They type the missing fact, and their line, built only from their words, gets better in front of them. This is the moment the product stops being a judgment and becomes a tool.
6. **Deciding whether a second read is worth $29.** Five reports over 90 days (30 until the next wave ships), one payment, no renewal. The case is made by the first report, not by the pricing page.
7. **Coming back.** With the revised resume, with a specific job, or two weeks later when the next silence sets in.

## What RIYP refuses to be today, and why

- **An ATS keyword score.** The research library says keyword matching doesn't predict who gets read; the number would be false precision sold as confidence. A keyword scanner also makes the resume worse: it rewards stuffing.
- **An AI resume writer that invents.** A rewrite that invents scope is a lie the candidate has to defend in the interview. We do rewrite the line, but only from their facts: "We'll rewrite your line. Only from your facts." (Decided by Matt, Nov 2, 2026: the refusal is to invention, not to help.)
- **A template builder.** Layout is not the problem for these four people. Content is. Templates also pull the product toward "produce a document" and away from "see what they see".
- **A chatbot.** A chat window moves the work back to the person ("ask me anything") when the whole point is that the recruiter speaks first, about their page.
- **A consultancy.** The founder is anonymous, nobody reads individual reports, and the price is $29. A service promise would be false.

Where the evidence pushes back: people do want the rewrite, and the answer-to-revised-line flow is already most of one. The honest version of "AI resume writer" (every word traceable to the candidate's facts) is the one feature we should lean into, not away from. The refusal is to invention, not to help with wording.

## Trust without a face

The founder stays anonymous, so trust has to come from the work:

- the sample report, a real output on a fictional resume, with nothing hidden;
- the method, explained plainly, including that a recruiter wrote the criteria and AI applies them;
- research with its limits attached;
- a privacy line in plain words at the moment it matters (we don't store the resume; OpenAI processes it; here's how to delete everything);
- honesty about what the report can't know: it reads text, not layout; it doesn't predict interviews; it can be wrong, and says so.

## Proposed north star (a proposal, not a decision)

One path, counted per visitor, in order:

**report finished → first Critical Miss answered → revised line copied or used → second read (re-check or a job comparison)**

Each step is a real action the product already records or can record (Sentry `riyp.report.outcome`, the lift state reaching "addressed", Copy on the revised line, and a second generation on the same account or pass). The free report wins the first two. The $29 pass is justified only if the third happens. Everything in the next wave should move one of these four counts; anything that doesn't is subtraction.
