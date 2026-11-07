# The first read (November 7, 2026)

Matt asked to build the top five changes from the recruiter-voices research "from first principles". The research is the report in the session's worktree, `reports/Recruiter voices like Peditto.md`, untracked. It covers working recruiters and hiring writers (Peditto, Dilber, Hrivnak, Sharghi, Green, Corcodilos, Orosz) and interviewing.io's recruiter study.

Their shared finding is that a recruiter's first read happens in two passes:

1. **A sort.** Which job is this for, at what level, and does it fit the posting?
2. **A hunt for proof** of what the person actually did.

RIYP's report already did the second pass well; it is the cards. It hid the first. The score rested on a job the report never named, and that job appeared only as a grey label in the header and a list of past titles after the cards. A posting's fit came after every card, and a line written to AI screeners went unmentioned. The detector found it, logged it and redacted it before the model saw it.

## What changed

| Research finding | Was | Now |
| --- | --- | --- |
| The target decides the read (Hrivnak, Peditto, Karpiak, Orosz) | The score's job was implicit; `fit.roles` listed past titles; `fit.level` was a generic phrase such as "Experienced individual contributor" | **The first pass**, under the verdict, shows which job the resume was read for and why, and what level and why. The prompt makes `fit.roles[0]` the job the score was judged for and adds `fit.why`. `fit.level` names the fact that sets it ("Senior, leads migrations and mentors two mid-level engineers") |
| With a posting, fit comes first | The fit note and missing list came after every card | With a posting, the first pass shows a third cell (the posting), then the fit note and the missing list, and the section after the cards is gone |
| A number needs a reference point (Sharghi, Kosik) | No rule beyond "a bare figure gets a card" | Sales only, through its first check: "132% of quota" with no quota or territory gets the question. A general rule was tested and cut, because the shipped prompt already cards bare figures and the rule padded strong resumes (see the audit) |
| Each field has its own first check (Kosik, ExecuNet) | One generic list of defining measures | First checks for sales (what the number was against) and senior roles (remit in team and budget), the two that won Matt's blind picks. Nursing, early career, software, customer success and teaching were tried and held back (see the audit) |
| A skill only in a list carries little weight (Peditto, Dilber, Sharghi) | No rule | Held back: tested, and it tied the shipped prompt in Matt's pick, because the shipped prompt already asks about tools on the lines that need them |
| Hidden text gets you dropped (Peditto, Sharghi, Altman) | `lib/security/inputSanitization` redacted it and logged a warning; the person never heard | `lib/reports/screener-text.ts` finds lines written to screening software in the text as sent. It looks for instructions to an AI, a score object, the posting pasted in, and a repeated keyword block. The route attaches them to the report, and the first pass opens with "This line ends the first pass." and the line struck through. Saved reports and the PDF keep it |
| The missing list reads as keywords to paste (Dilber, Hrivnak) | A bare list of the posting's words | Followed by "If you've done it, say where. If you haven't, leave it out." |

"Read it against a posting" keeps the resume, opens the posting field and focuses it. It used to send people back to an empty input.

## How it was decided

Following `/new-surface`, I sketched three directions (`2026-11-first-read/sketches/`):

- **A**, the premise line: one sentence under the score.
- **B**, two passes: the recruiter's sort as a row, then the second pass.
- **C**, the job pinned beside the report as a slip of paper.

Matt asked first whether we account for people who attach no posting. They are the main case. With no posting, the report already guesses the job, and the first pass is what makes that guess visible and correctable. B was redrawn with the no-posting report as its main state, and Matt chose B.

## The prompt change and its gate

The record is `docs/audits/2026-11-first-read.md`. In short: nine candidate prompts, each run on the targeted cases and the full live set, plus two runs of the shipped prompt to measure the noise floor and three blind picks by Matt. The card-changing rules came to 4 wins, 5 losses and 2 ties against the shipped prompt, so only the two that won their own picks ship: sales attainment's base and the senior remit. The fit changes (the job the score was judged for, why, and the level with its fact) change no card, and they are what the first pass shows. The UI renders reports saved before this one (no `why`) with the job and level and no reason.

## Not done here

- An optional "What job is this for?" field at upload, which would set the target without a posting. It is the strongest version of the first pass. It changes the first five minutes, so it is a separate decision.
- White text in a PDF can only be found once it is extracted. The detector reads the text, not its color, so a line written to a person in white goes unflagged; that would be fair, but it is also untested.
- Knockout requirements first, short unlabeled stints, insider names, spelling patterns, and the score note's sentence that recruiters disagree (research items 6 to 10).
