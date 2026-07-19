# Research Article Standard

Reference for building research articles using the `ResearchArticle` component.
Every article lives in `/app/(editorial)/research/[slug]/page.tsx`.

---

## Visual Hierarchy (top → bottom)

1. **← Research** — subtle back link
2. **Meta line** — topic and evidence summary only. Keep internal review dates in structured metadata, not visible article chrome.
3. **Title** — largest element, Newsreader display typography, clear #1
4. **Description** — one sentence, explains the article's angle
5. **Key finding callout** — subordinate to title, pale-sky teaching surface
6. **Body** — prose sections, h2 headings, visualizations inline
7. **FAQ** — optional, full sentences
8. **Product tie-in** — pale-sky application rail with numbered items
9. **Further reading** — related articles + sources merged
10. **CTA strip** — pale-sky band with one Iris action

---

## Required Props

```tsx
<ResearchArticle
  header={{
    tag: "EYE-TRACKING RESEARCH",   // topic — uppercase, Iris
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
