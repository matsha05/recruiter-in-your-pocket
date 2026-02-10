# Research Article Standard

Reference for building research articles using the `ResearchArticle` component.
Every article lives in `/app/(editorial)/research/[slug]/page.tsx`.

---

## Visual Hierarchy (top → bottom)

1. **← Research** — subtle back link
2. **Meta line** — `TAG · read time · date` (no labels, compressed date)
3. **Title** — largest element, serif, clear #1
4. **Description** — one sentence, explains the article's angle
5. **Key finding callout** — subordinate to title, warm background box
6. **Body** — prose sections, h2 headings, visualizations inline
7. **FAQ** — optional, full sentences
8. **Product tie-in** — white card with numbered items
9. **Further reading** — related articles + sources merged
10. **CTA strip** — dark band, single CTA

---

## Required Props

```tsx
<ResearchArticle
  header={{
    tag: "EYE-TRACKING RESEARCH",   // category — uppercase, teal
    title: "How Recruiters Actually Read Resumes",
    description: "Eye tracking research on how recruiters review resumes in real time.",
    readTime: "4 min read",
    lastUpdated: "December 2025",
  }}
  keyFinding={{
    subtitle: "The Key Finding",     // NOT rendered visually — kept for data
    stat: "7.4 Seconds",             // 2-4 words, the hook
    statDescription: <>The 2018 update reports an average 7.4 second initial screen.</>,
    source: { text: "TheLadders Eye-Tracking Update (2018 PDF)", href: "..." },
    sampleSize: <>30 professional recruiters reviewing 300+ resumes</>,
  }}
  productTieIn={{
    title: "How RIYP uses this",
    items: [
      { title: "Signal Detection", description: "We flag the same zones recruiters fixate on." },
    ],
  }}
  sources={[
    { id: "source-1", title: "Study Title", publisher: "Publisher", year: 2018, href: "..." },
  ]}
  relatedArticles={[
    { title: "How People Scan Text", href: "/research/how-people-scan", tag: "RESEARCH" },
  ]}
  faq={[
    { question: "Is 7.4 seconds real?", answer: "Yes, updated from the 2012 6-second figure." },
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
