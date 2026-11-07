# The research hub, rebuilt as a reference page (November 6, 2026)

Matt: the hub at `/research` "looks great, but ... its just way too hard to interpret." The standard: "world class craft", inside the Highlighter system. This records what was found, what was sketched, what he chose and why.

## What was wrong

An outside reviewer ran Impeccable's critique (the pinned commit, house docs outranking it) on the live hub and scored it 16 of 28. The findings that mattered: the headline was a mood line with nothing under it saying what the page was; no row showed a source; only 8 of 21 answers opened with a verdict; questions, section titles and the close shared one type role; 385 of 677 words were in the pen, so green stopped meaning "the recruiter says"; five left edges at 1440; eight phone screens with no way to jump. A second session's critique of the articles found the body set in muted gray with ink links, an H2 the same size as its H3s, a 46-word opening answer against the hub's 20, and one study cited four times on one page.

## What was sketched

Round one, three directions on the real tokens: **A**, an answer key (a loud one-word verdict down one left edge); **B**, Jordan's resume with each question pinned to the part of the page it is about; **C**, five numbered stops from writing it to the offer. Then **D**, B with A's rows under the sheet, as the recommendation.

Matt on D: "the errors arent pointing to real things on the resume. its just a handwavy diagram. you need to reimagine this. its a research section, not a flashy landing page. i mean yes it should be beautiful and high craft but people would go there looking for information mostly." And: "do not include that racial thing, we are absolutely not going to start pushing race theories."

Round two, two sketches of a reference index: **E**, the index alone, and **F**, three real figures then the index. Every row: the question, a bold short answer and one sentence, the kind of source and the citation. Search, four plain topics with counts. He chose F, and chose to remove the hiring-discrimination article entirely rather than unlist it.

The sketches are published privately at https://claude.ai/artifact/H31S6oPFUZQ1dcJrwMoqTs.

## What shipped

- `components/research/ResearchHub.tsx`: the opening, `HubFindings`, `ResearchIndex`, the links to the guides and the methodology, the close.
- `HubFindings.tsx`: six seconds by section, the typo penalty on its ten-point ruler, referrals as two piles of 100. The data is imported from the article figures, so the hub cannot drift from the articles.
- `ResearchIndex.tsx`: the search filters as you type and announces the count; the groups and jump links come from `ResearchHubData.ts`.
- `ResearchAnswerRow.tsx`: one row, used by the hub, every article's next questions and the guides page.
- `ResearchHubData.ts`: `verdict`, `finding` and `evidence` per research entry, checked against each article's opening answer and source line; four topics named in plain words; guides and the methodology marked `indexed: false`.
- Articles: body and advice text in ink, H2 at the title role, the article on the site's 68rem column, the method note unboxed, the lead figure's caption at the small role on a 52ch measure.
- Removed: `/research/hiring-discrimination-meta-analysis` and its figure; the address and its old alias redirect to `/research`; the three articles that linked to it no longer do.

## The outside critique of the build

A fresh reviewer ran Impeccable's critique on the production build (31 of 40 on the heuristics; design specificity high; cognitive load low). What changed because of it: the search matches the start of a word, so "typos" and "referrals" find their rows, and each entry carries the words people type that its text doesn't (`keywords`); the search and the topic jumps sit under the deck at every width, so on a phone the tool for looking a question up is on the first screen instead of 2.5 screens down; tabular numerals came off the figures' values (they gapped "-0.73"); the concatenated spans got real spaces so screen readers hear "4 questions" and "40 in 100"; a topic jump hides while its group has no match; the six-seconds caption carries the article's footnote; "Read the answer" has a 44px target; the article's drawn resume is paper (sheet, edge, lift, square corners), not a card. Left as designed: the whole row is the link, so its text can't be selected; the referral units are in the pen like the article's own referral figures.

## The articles

The same day, after two outside critiques of the live articles (Impeccable again): the opening answer ran 30 to 50 words where the hub row said the same thing in 15 to 20 ("the hub row and the article opening are the same object; today they are two drafts"); below the bridge one study could be met four times (source line, figure caption, Evidence entry, Sources list); the lead figure on how-recruiters-read spent four rows on "No comparable result".

What changed:

- **Openings.** Every article's `answer` now starts with its hub row's `verdict`, verbatim, then at most two plain sentences, 35 words in all (the openings now run 23 to 35 words). Provenance moved down: the six-second figure's origin lives in the TheLadders evidence entry; the typo experiment's "hypothetical interview rating" is in the lead paragraph; the gap experiment's "by about 8%" is in the body paragraph on the UK fixes. The source lines are unchanged. One article (social-screening) had never carried the verdict at all.
- **The drift test.** `tests/search-foundation.test.ts` reads each article's `answer` prop, decodes it to text and fails if it doesn't start with the hub verdict, runs past 35 words or carries more than two sentences after the verdict. `tests/ui/research-surface.spec.ts` checks the same on the rendered page (`data-testid="article-answer"`).
- **One description per study.** Where a lead paragraph, a body paragraph, a card and a Limitations bullet described the same study, one stayed: spelling-errors (the lead paragraph; the restating body paragraph and "What recruiters inferred" card went, the inference finding is one sentence before its figure, whose caption carries the hedge), social-screening (the numbers paragraph moved up as the lead; the "observed / not tested" cards and two Limitations bullets went), resume-length ("What it does not settle" absorbed Limitations), ats-myths (the parser paragraph and the two filter cards went; the lead and the knockout-question section carry them), automation-and-bias (the "who gets seen" section folded into the first paragraph), human-vs-algorithm (the lead paragraph is the method; the restating body paragraph went; the two limit cards became a Limitations list), linkedin-visibility (the filters sentence is the lead; the Skills-filter paragraph and the "describes its own products" bullet went, since the opening and source line say both), writing-quality (the researchers' explanation is said once, in the lead, with the hedge in the figure caption; the "helped employers see" section is now the advice), skills-first (the 37/45/one-fifth split is the lead paragraph, under its figure; the later section went), salary-history (the first-offer experiments are the lead; the post-bridge section and two Limitations bullets went), star-method, who-you-are, quantifying-impact, referral-advantage (one Limitations bullet each that repeated the source line or the lead). Figure captions that hedged what a Limitations bullet already hedged say it once (`ReferralQuantifiedDiagram`).
- **The lead figure on how-recruiters-read.** `SectionFindingsFigure` draws Education and Experience on the sheet and names the other four sections in one muted line under it ("No comparable result for Address, Introduction, Projects or Skills."); the caption keeps its footnote. The data (`SECTION_FINDINGS`) is unchanged, so the hub's six-row figure still draws from it.
- `article-standard.md` records the 35-word rule, the tests, and the one-description rule. Every article's `updated` date is November 6, 2026.

Left as is: the quantifying-impact article still carries the Bertrand & Mullainathan callback result with its race split (the figure `ResumeQualityDiagram`). It is a sourced finding about resume strength, but it is race research on a site that publishes none; that is Matt's call, not this wave's.

## Still open

- The design-system guardrail was already red on main before this change (two raw font sizes in `Worklist.module.css`, an eighth corner radius there, and a raw input count of 14 against a budget of 13). This change adds none of those.
