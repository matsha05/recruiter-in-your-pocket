# "The candidate" on a recruiter's resume

November 17, 2026.

## What was seen

A live posting read of a recruiter's resume took 2 min 24 s against the usual 45 s or so. Its first draft was refused, and a second model call rewrote it. The production log:

> failed the worklist contract at cards[5].cannot_tell: uses the retired phrase "the candidate"

## Why

"The candidate" is on the validator's list of retired phrases (`WORKLIST_BANNED_PHRASES` in `web/lib/llm/worklist-grounding.ts`). The report talks to the person as "you", and the prompt says so. The check was a plain text match, so it also refused:

- the plural ("the candidates you placed");
- the word used as a noun in front of another ("the candidate pool", "the candidate experience").

Neither of those is about the person.

On a recruiter's resume, those uses are the job's own words. This resume says "underrepresented candidates" and "Cloud candidate referrals". Seven of the fifteen reports saved on it use the word that way: "which candidate pool", "the number or share of candidates", "which candidates were counted".

The log did not say which sentence was refused, so whether this refusal was one of those uses or the report calling the person "the candidate" is not known.

## How often

| Where | Reads | Refused for "the candidate" |
| --- | --- | --- |
| Saved synthetic reads with a record of their first draft (several prompt versions) | 337 | 0 |
| Of those, refused for any reason | 111 | 0 |
| Synthetic recruiter resume against two postings, November 17 | 24 | 0 |
| Live reads of the recruiter's resume, logs kept (an hour on Hobby) | 1 | 1 |

The synthetic recruiter resume has one line with "candidate" in it. Only 2 of its 24 reads used the word in their own text, against 7 of 15 reports on the real resume. So synthetic reads would not show this; they rarely use the word at all.

On the current prompt, 8 of about 230 synthetic reads were repaired for any reason. Six of the eight were one software engineer resume, refused for turning a support verb into an ownership verb.

## The change

- **What passes:** the plural, and "the candidate" followed by one of a list of recruiting nouns ("pool", "pipeline", "experience", "referrals", "funnel", "slate", "screening", "interviews" and others; `RECRUITING_COMPOUNDS`).
- **What stays refused:** "The candidate" on its own and "the candidate's".
- **The log:** a refusal for a retired phrase now quotes the sentence it sits in, capped at 200 characters. The next one can be read from the log, and the repair call sees the sentence too. Other refusals already quote resume lines in the log, so this adds no new kind of text there.

## Checked

- Unit tests for each form in `web/tests/worklist-validator.test.ts`.
- Three saved runs replay through the changed validator with the same counts as before: the 23-fixture golden run 21 pass, 2 warnings, 0 failures; the repeat run 38, 2, 0; the new prompt's repeat run 26, 4, 0.
- No model call was made.

## What this does not show

- Whether the refused sentence was recruiting vocabulary. The next refusal will say.
- How often recruiters' reads hit this. One case does not give a rate. Production will show each one, now with its sentence, but only for an hour after it happens.
- The list of recruiting nouns is written from the resume's and the reports' own words, not measured. A use with a noun not on it is still refused, and costs a repair, as before.
