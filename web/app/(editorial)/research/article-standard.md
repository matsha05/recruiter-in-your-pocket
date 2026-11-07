# Research Article Standard

Reference for building research articles with the `AnswerArticle` component (`web/components/research/AnswerArticle.tsx`).
Every article lives in `/app/(editorial)/research/[slug]/page.tsx`. The reasoning is in `docs/research-library-strategy.md`.

An article opens the way its row on the Research hub does: the reader's question, then the straight answer in the recruiter's voice with its study linked. The rest of the page is the article, with one turn to the report where the advice is, then the sources and the next questions.

---

## Visual hierarchy (top to bottom)

1. **All research**: the back link
2. **The question**: the H1, in the words people search. It comes from the hub (`ResearchHubData.ts`); the page doesn't set it.
3. **The answer**: the hub row's verdict, verbatim, then at most two plain sentences, 35 words in all, in Literata, in ink (Nov 6, 2026: the pen is the recruiter's words; an answer from a study is ours). A reader who stops here leaves with the truth. `tests/search-foundation.test.ts` fails if the opening drifts from the row, and `tests/ui/research-surface.spec.ts` checks the rendered page. Where a study came from (who ran it, on what, how many) goes in the body or its evidence entry, not here.
4. **The source line**: the study behind the answer, named, with how big it was, and a link to it
5. **The pain line** (optional): one margin note beside the answer
6. **Meta line**: pillar, "Updated Month Year", and a link to "How we write these"
7. **Lead figure** (optional), full width
8. **Body**: 18px/30px prose on the reading rail, h2 sections, figures inline, with the **bridge** placed where the advice is
9. **Sources**: every source, numbered, with its full title and a link
10. **Next questions**: hub rows (the question, the answer with its verdict in bold, what it rests on)
11. **How we write these**: the short method note
12. **Close**: "What would they think of yours?" and one dark pill

---

## Rules

- **One question, three places.** The hub question, the H1, and the search title (`pageMetadata({ title })`) are the same string, 60 characters or fewer. `tests/search-foundation.test.ts` fails if they drift. Write it the way a worried job seeker would type it, and vary the openings across the library so the hub doesn't read like a FAQ farm.
- **The answer** says what the evidence found, in the reader's terms, from claims the article already sources. No new claims in the answer.
- **The pain line** names why the question hurts, in the recruiter's margin voice. It is specific to the article's finding, never carries a number we can't source, and never uses a phrase from the voice guide's avoid list. If it doesn't earn its place, leave it out: not every article has one.
- **One bridge** (`<ArticleBridge question=…>`), inside the body, right after the advice. It asks the article's question of the reader's own resume and names the report part that answers it (the Verdict, the score, or the Critical Miss), including what that part can't do. It is the only report action in the body. Since Nov 4, 2026 it is a note in the margin, the pen's question with the arrow and a text link, not a card with a button; the button belongs to the close.
- **No FAQ block.** A follow-up question that repeats the body is cut; one that adds something becomes body content. Questions a reader asks next go in `nextQuestions`, as hub ids.
- Every article is listed in `web/lib/seo/public-pages.ts` with its published and updated dates. Bump `updated` when the content changes (a corrected claim, a new section), never for styling.
- The search description says what the article found and its limit, from the article's own text, in 70 to 160 characters.
- Say a limit once: in the source line, the evidence, or Limitations, not in every figure and caption. Describe a study once below the opening: where an article has an `EvidenceList`, its entries are the one place for what a study found, how it was done and what it can't tell you, and no body paragraph restates one. The Sources list stays (its anchors serve the citations and the JSON-LD).
- Figures carry the number and source in the caption only. Draw published numbers; never invent defaults or example rates. When the finding is about the resume, draw the resume (`SectionFindingsFigure`).
- Label anything that is ours: "Our advice", "Our take".
- Uppercase labels are reserved for Verdict and Critical Miss (`.riyp-verdict-label`).

## Props

```tsx
const PATH = "/research/how-recruiters-read";

export const metadata = pageMetadata({
    path: PATH,
    title: "Do recruiters only spend six seconds on a resume?", // the hub question, exactly
    description: "What peer-reviewed eye-tracking studies found about where recruiters look on a resume, and why the six-second figure isn't a rule.",
    type: "article",
});

<AnswerArticle
    path={PATH}                       // the question and dates come from here
    answer={<>No study shows a fixed timer. …</>}
    answerSource={{
        text: <>From a peer-reviewed study of 2,043 resume reviews by recruiters in one US state (Pina et al., 2023).</>,
        href: "https://doi.org/10.3390/make5030038",
        linkLabel: "Read the study",  // default; say "Read the report" or "Read the documentation" when that's what it is
    }}
    painNote="Six seconds is the kind of number that sticks when nobody writes back."
    visualization={<SectionFindingsFigure figureNumber={1} />}
    sources={[{ id: "source-1", title: "…", publisher: "…", year: "2023", href: "…" }]}
    nextQuestions={["resume-length-myths", "spelling-errors-impact", "how-we-score"]}
>
    {/* Body: h2 sections with className="research-h2", p with "research-body", and one ArticleBridge */}
    <ArticleBridge question="What does your Experience section say first?">
        Your report opens with a Verdict: …
    </ArticleBridge>
</AnswerArticle>
```

`AdviceList` (numbered moves, labeled as our advice) and `EvidenceList` (each source once: what it found, how it was done, what it can't tell you) are available for articles written in the full answer-first shape, as `how-recruiters-read` is.

---

## Don'ts

- **Don't** set a separate headline. The question is the headline.
- **Don't** add a key-finding card, a product glossary box, or a second report action in the body.
- **Don't** add labels before values in the meta line ("READ TIME").
- **Don't** add a fourth font, an iris/teal-first or aqua palette, atmospheric gradients, glass, or an article-specific card language. Literata is for the answer, quoted lines, and margin notes, not long prose.
- **Don't** use legacy palette utilities; use shared Highlighter semantic tokens.
- **Don't** ship a figure without a claim, readable encoding, caption, source context, and plain-language limit or takeaway.

---

## Reference fidelity

Research belongs to the Highlighter product system. The article shares the hub's container and left edge, so a hub row and the article it opens line up. Match the shared header, Schibsted Grotesk / Literata tokens, neutral ground with pen and highlighter, subtle rules, paper sheets, dark pill actions, and footer.

Validate every article at 320, 390, 1024, and 1440 pixels, at 200% zoom, and in dark mode. Also check actual figure-label size, keyboard focus, 44px control targets, and contrast. `docs/design-system.md` governs the full behavior and accessibility contract.
