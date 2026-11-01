# Research Article Standard

Reference for building research articles using the `ResearchArticle` component.
Every article lives in `/app/(editorial)/research/[slug]/page.tsx`.

---

## Visual Hierarchy (top → bottom)

1. **← Research** — subtle back link
2. **Meta line** — topic and evidence summary only. Keep internal review dates in structured metadata, not visible article chrome.
3. **Title** — largest element, Schibsted Grotesk at 800, clear #1
4. **Description** — one sentence, explains the article's angle
5. **Key finding callout** — subordinate to title, pen-tint inset with a neutral boundary
6. **Body** — 18px/30px prose at about 66ch, h2 headings, visualizations inline
7. **FAQ** — optional, full sentences
8. **Product tie-in** — neutral inset or pen-tint application rail with numbered items
9. **Further reading** — related articles + sources merged
10. **CTA strip** — warm sheet with one dark pill action; no neon acquisition cue

---

## Rules

- One headline per article, in sentence case, shared by the hub card, H1, related links, and the Article structured data.
- The search title is different on purpose: the question the article answers, the way people search for it, in 60 characters or fewer ("Should a resume be one page? What the research says"). Set it with `pageMetadata()` in the page file; it adds the site name only when the whole title still fits. The description says what the article found and its limit, from the article's own text, in 70 to 160 characters.
- Every article is listed in `web/lib/seo/public-pages.ts` with its published and updated dates. Bump `updated` when the content changes (a corrected claim, a new section), never for styling. The sitemap, the Article data, and the "Last updated" line all read it.
- Say a limit once in the key finding or Limitations, not in every figure, caption and FAQ.
- Every product tie-in names the report part it shows up in: the Verdict, the First Impression score or the Critical Miss.
- Figures carry the number and source in the caption only. Draw published numbers; never invent defaults or example rates.
- Uppercase labels are reserved for Verdict and Critical Miss (`.riyp-verdict-label`).

## Required Props

```tsx
const PATH = "/research/how-recruiters-read";

export const metadata = pageMetadata({
  path: PATH,
  title: "Do recruiters only spend six seconds on a resume?",   // the searched question, ≤ 60 characters
  description: "What peer-reviewed eye-tracking studies found about where recruiters look on a resume, and why the six-second figure isn't a rule.",
  type: "article",
});

<ResearchArticle
  path={PATH}   // dates come from PUBLIC_PAGES
  header={{
    tag: "Eye-tracking",   // topic — weight 600, pen color
    title: "What recruiters notice in the first pass",   // sentence case; same string in the hub, H1 and metadata
    description: "Eye tracking research on how recruiters review resumes in real time.",
    readTime: "4 min read",
  }}
  keyFinding={{
    subtitle: "The key finding",     // NOT rendered visually — kept for data
    stat: "2,043 resume reviews",    // 2-4 words, set in the display face
    statDescription: <>Review time and attention to Experience were associated with advancement decisions in this study.</>,
    source: { text: "Pina et al., peer-reviewed eye-tracking study (2023)", href: "..." },
    sampleSize: <>221 recruiters recruited; 24 incomplete sessions removed; 2,043 usable first-round reviews</>,
  }}
  productTieIn={{
    title: "Where this shows up in your report",
    items: [
      { title: "The Verdict", description: "Your Verdict is our version of that first pass: what comes through, and what slips past." },
    ],
  }}
  sources={[
    { id: "source-1", title: "Study Title", publisher: "Publisher", year: 2018, href: "..." },
  ]}
  relatedArticles={[
    { title: "What recruiters notice in the first pass", href: "/research/how-recruiters-read", tag: "Research" },
  ]}
  faq={[
    { question: "Do recruiters spend six seconds on every resume?", answer: "No. A vendor report popularized that figure, but it is not a universal timer." },
  ]}
>
  {/* Article body — use h2 for sections, p for prose */}
</ResearchArticle>
```

---

## Sizing Constraints

| Element | Target |
|---------|--------|
| `stat` | 2–4 words (the hook) |
| `statDescription` | 1–2 sentences |
| `description` | 1 sentence |
| `tag` | 1–3 words, uppercase |
| `readTime` | e.g. "4 min read" |
| `path` | The article's URL; its dates live in `web/lib/seo/public-pages.ts` |

---

## Don'ts

- **Don't** add labels before values in the meta row ("READ TIME"); the values are self-explanatory. The date sits on its own line under the description as "Last updated Month Year", like the legal pages.
- **Don't** make the key finding compete with the title — it's a supporting callout, not a headline
- **Don't** use generic subtitle text like "The Pattern" or "The Mechanism" — the stat speaks for itself
- **Don't** separate Related Research and Sources into two sections — use "Further reading"
- **Don't** add a fourth font, iris/teal-first or aqua palette, atmospheric gradients, glass, or an article-specific card language. Literata is for quoted lines and verdicts, not long prose.
- **Don't** use legacy palette utilities; use shared Highlighter semantic tokens
- **Don't** ship a figure without a claim, readable encoding, caption, source context, and plain-language limit or takeaway

---

## Reference fidelity

Research belongs to the Highlighter product system. Match the shared header, Schibsted Grotesk / Literata tokens, neutral ground with pen and highlighter, subtle rules, paper sheets, dark pill actions, and footer. Use 18px desktop/16px mobile main-sheet radii, 12px insets, and 10px fields with recognizable boundaries. Do not carry the old ink-header, neon-CTA, or rectilinear policies forward.

Validate every article at 390, 1024, and 1440 pixels; do not approve only a representative route. Also check 320px overflow, 200% zoom, actual figure-label size, keyboard focus, 44px control targets, and contrast. Shared `docs/design-system.md` and `docs/research-ui-contract.md` govern the full behavior and accessibility contract.
