"use client";

import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";
import {
  legalContent,
  type LegalInline,
  type LegalPageKey,
  type LegalParagraph,
  type LegalSection,
} from "@/lib/legal/content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function renderInline(inline: LegalInline, index: number) {
  if (inline.type === "text") return <span key={`text-${index}-${inline.value}`}>{inline.value}</span>;
  return (
    <Link
      key={`link-${index}-${inline.href}-${inline.label}`}
      href={inline.href}
      className="text-foreground underline decoration-brand/45 underline-offset-4 transition-colors hover:text-brand"
    >
      {inline.label}
    </Link>
  );
}

function renderParagraph(paragraph: LegalParagraph, index: number) {
  const paragraphKey = paragraph.map((inline) => inline.type === "text" ? inline.value : inline.label).join(" ");
  return (
    <p key={`${index}-${paragraphKey}`} className="text-[1.0625rem] leading-8 text-muted-foreground">
      {paragraph.map(renderInline)}
    </p>
  );
}

function renderSection(section: LegalSection, index: number) {
  switch (section.type) {
    case "card":
      return (
        <section
          key={`${index}-${section.type}-${"title" in section ? section.title : index}`}
          className="border-t border-line bg-transparent py-7 md:py-9"
        >
          <h2 className="mb-4 font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground riyp-stretch-96">{section.title}</h2>
          <div className="gap-y-3">
            {section.paragraphs.map(renderParagraph)}
          </div>
        </section>
      );
    case "bullet_list":
      return (
        <section
          key={`${index}-${section.type}-${"title" in section ? section.title : index}`}
          className="border-t border-line bg-transparent py-7 md:py-9"
        >
          <h2 className="mb-4 font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground riyp-stretch-96">{section.title}</h2>
          <ul className="list-disc gap-y-2 pl-5 text-[1.0625rem] leading-8 text-muted-foreground marker:text-brand">
            {section.items.map((item, itemIndex) => (
              <li key={`${itemIndex}-${item}`}>{item}</li>
            ))}
          </ul>
        </section>
      );
    case "table":
      return (
        <section
          key={`${index}-${section.type}-${"title" in section ? section.title : index}`}
          className="border-y border-line bg-surface-sky/30 px-4 py-6 md:px-6 md:py-8"
          aria-labelledby={`legal-table-${index}`}
        >
          <h2 id={`legal-table-${index}`} className="mb-4 font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground riyp-stretch-96">{section.title}</h2>
          <div className="divide-y divide-line md:hidden">
            {section.rows.map((row, rowIndex) => (
              <article key={`${rowIndex}-${row.dataType}`} className="py-5 first:pt-2 last:pb-1">
                <h3 className="text-base font-semibold leading-6 text-foreground">{row.dataType}</h3>
                <dl className="mt-4 grid gap-4">
                  {[
                    [section.columns[1] || "Purpose", row.purpose],
                    [section.columns[2] || "Retention", row.retention],
                    [section.columns[3] || "Control", row.userControl],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1">
                      <dt className="text-[10px] font-semibold uppercase riyp-track-010 text-brand">{label}</dt>
                      <dd className="text-sm leading-6 text-muted-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <table className="hidden w-full table-fixed text-sm md:table">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase riyp-track-008 text-muted-foreground">
                {section.columns.map((col) => (
                  <th key={col} className="py-2 pr-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${row.dataType}`} className="border-b border-line/70 align-top">
                  <td className="py-3 pr-3 text-sm font-medium text-foreground">{row.dataType}</td>
                  <td className="py-3 pr-3 text-sm text-muted-foreground">{row.purpose}</td>
                  <td className="py-3 pr-3 text-sm text-muted-foreground">{row.retention}</td>
                  <td className="py-3 text-sm text-muted-foreground">{row.userControl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );
    case "card_grid": {
      const columnClass = section.columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : section.columns === 3
          ? "md:grid-cols-2 lg:grid-cols-3"
          : "md:grid-cols-2";
      return (
        <section key={`${index}-${section.type}-${section.items.map((item) => item.title).join("-")}`} className={`grid gap-4 ${columnClass}`}>
          {section.items.map((item, itemIndex) => (
            <div
              key={`${itemIndex}-${item.title}`}
              className="border-t border-line bg-transparent py-6"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <item.icon className="size-4" weight="bold" />
                </span>
                <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </section>
      );
    }
    case "checklist": {
      return (
        <section
          key={`${index}-${section.type}-${"title" in section ? section.title : index}`}
          className="border-t border-line bg-transparent py-7 md:py-9"
        >
          <h2 className="mb-4 font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground riyp-stretch-96">{section.title}</h2>
          <ul className="grid gap-x-8 gap-y-3 text-[1.0625rem] leading-8 text-muted-foreground md:grid-cols-2">
            {section.items.map((line, lineIndex) => (
              <li key={`${lineIndex}-${line}`} className="flex items-start gap-2">
                <section.icon className="mt-1 size-4 shrink-0 text-brand" weight="bold" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }
    case "callout": {
      return (
        <section
          key={`${index}-${section.type}-${"title" in section ? section.title : index}`}
          className={`border-y border-line bg-surface-sky/30 px-5 py-6 md:px-7 md:py-8 ${section.align === "center" ? "text-center" : ""}`}
        >
          <div className="gap-y-3">
            {section.paragraphs.map(renderParagraph)}
          </div>
        </section>
      );
    }
    case "faq":
      return (
        <div key={`${index}-${section.type}-${section.categories.map((category) => category.category).join("-")}`} className="gap-y-4">
          {section.categories.map((category, categoryIndex) => (
            <section
              key={`${categoryIndex}-${category.category}`}
              className="border-t border-line bg-transparent py-7 md:py-9"
            >
              <h2 className="mb-4 font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground riyp-stretch-96">{category.category}</h2>
              <Accordion type="single" collapsible className="gap-y-2">
                {category.questions.map((item, idx) => (
                  <AccordionItem
                    key={`${idx}-${item.q}`}
                    value={`${category.category}-${idx}`}
                    className="rounded-md border border-line px-4"
                  >
                    <AccordionTrigger className="py-3 text-left text-sm font-medium text-foreground hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 text-sm leading-7 text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function buildFaqSchema(sections: LegalSection[]) {
  const faqSection = sections.find((section) => section.type === "faq");
  if (!faqSection || faqSection.type !== "faq") return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSection.categories.flatMap((category) =>
      category.questions.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };
}

export default function LegalPageClient({ page }: { page: LegalPageKey }) {
  const content = legalContent[page];
  const faqSchema = buildFaqSchema(content.sections);

  return (
    <>
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <LegalShell
        pageKey={page}
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        lastUpdated={content.lastUpdated}
      >
        {content.sections.map(renderSection)}
      </LegalShell>
    </>
  );
}
