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

## Still open

- The hub's answers and the articles' opening answers are two drafts of the same thing. The article standard now says the opening's first sentence is the row's verdict; the articles themselves were not rewritten this wave.
- The design-system guardrail was already red on main before this change (two raw font sizes in `Worklist.module.css`, an eighth corner radius there, and a raw input count of 14 against a budget of 13). This change adds none of those.
