# Research Article Standard

Reference for building research articles using the `ResearchArticle` component.
Every article lives in `/app/(editorial)/research/[slug]/page.tsx`.

---

## Visual Hierarchy (top → bottom)

1. **← Research** — subtle back link
2. **Meta line** — topic and evidence summary only. Keep internal review dates in structured metadata, not visible article chrome.
3. **Title** — largest element, Instrument Sans at regular weight, clear #1
4. **Description** — one sentence, explains the article's angle
5. **Key finding callout** — subordinate to title, restrained aqua inset with a neutral boundary
6. **Body** — 18px/30px prose at about 66ch, h2 headings, visualizations inline
7. **FAQ** — optional, full sentences
8. **Product tie-in** — warm inset or restrained aqua application rail with numbered items
9. **Further reading** — related articles + sources merged
10. **CTA strip** — warm sheet with one dark pill action; no neon acquisition cue

---

## Required Props

```tsx
<ResearchArticle
  header={{
    tag: "EYE-TRACKING RESEARCH",   // topic — weight 600, restrained aqua
    title: "How Recruiters Actually Read Resumes",
    description: "Eye tracking research on how recruiters review resumes in real time.",
    readTime: "4 min read",
    lastUpdated: "December 2025",
  }}
  keyFinding={{
    subtitle: "The Key Finding",     // NOT rendered visually — kept for data
    stat: "2,043 resume reviews",    // 2-4 words, the hook
    statDescription: <>Review time and attention to Experience were associated with advancement decisions in this study.</>,
    source: { text: "Pina et al., peer-reviewed eye-tracking study (2023)", href: "..." },
    sampleSize: <>221 recruiters recruited; 24 incomplete sessions removed; 2,043 usable first-round reviews</>,
  }}
  productTieIn={{
    title: "How this shows up in your report",
    items: [
      { title: "First-pass clarity", description: "We flag important experience that may be hard to find quickly." },
    ],
  }}
  sources={[
    { id: "source-1", title: "Study Title", publisher: "Publisher", year: 2018, href: "..." },
  ]}
  relatedArticles={[
    { title: "What Recruiters Notice First", href: "/research/how-recruiters-read", tag: "RESEARCH" },
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
| `lastUpdated` | "Month Year" format |

---

## Don'ts

- **Don't** add labels before values ("READ TIME", "UPDATED") — the values are self-explanatory
- **Don't** make the key finding compete with the title — it's a supporting callout, not a headline
- **Don't** use generic subtitle text like "The Pattern" or "The Mechanism" — the stat speaks for itself
- **Don't** separate Related Research and Sources into two sections — use "Further reading"
- **Don't** add a third font, iris/teal-first palette, atmospheric gradients, glass, or an article-specific card language. Source Serif 4 is approved for selected short verdicts, not long prose.
- **Don't** use legacy palette utilities; use shared Alpine semantic tokens
- **Don't** ship a figure without a claim, readable encoding, caption, source context, and plain-language limit or takeaway

---

## Reference fidelity

Research belongs to the approved Alpine product system. Match the shared warm header, Instrument Sans/Source Serif 4 tokens, warm-neutral/aqua palette, subtle rules, softened sheets, dark pill actions, and footer. Use 24px desktop/16px mobile main-sheet radii, 12px insets, and 10px fields with recognizable boundaries. Do not carry the old ink-header, neon-CTA, or rectilinear policies forward.

Validate every article at 390, 1024, and 1440 pixels; do not approve only a representative route. Also check 320px overflow, 200% zoom, actual figure-label size, keyboard focus, 44px control targets, and contrast. Shared `docs/design-system.md` and `docs/research-ui-contract.md` govern the full behavior and accessibility contract.
