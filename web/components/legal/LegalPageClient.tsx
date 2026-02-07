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
  if (inline.type === "text") return <span key={`text-${index}`}>{inline.value}</span>;
  return (
    <Link
      key={`link-${index}`}
      href={inline.href}
      className="text-foreground underline underline-offset-4 hover:text-brand"
    >
      {inline.label}
    </Link>
  );
}

function renderParagraph(paragraph: LegalParagraph, index: number) {
  return (
    <p key={`para-${index}`} className="landing-copy-muted">
      {paragraph.map(renderInline)}
    </p>
  );
}

function renderSection(section: LegalSection, index: number) {
  switch (section.type) {
    case "card":
      return (
        <section key={`section-${index}`} className="landing-card landing-card-pad">
          <h2 className="legal-section-title">{section.title}</h2>
          <div className="space-y-3">
            {section.paragraphs.map(renderParagraph)}
          </div>
        </section>
      );
    case "bullet_list":
      return (
        <section key={`section-${index}`} className="landing-card landing-card-pad">
          <h2 className="legal-section-title">{section.title}</h2>
          <ul className="list-disc space-y-2 pl-5 landing-copy-muted">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      );
    case "table":
      return (
        <section key={`section-${index}`} className="landing-card landing-card-pad overflow-x-auto">
          <h2 className="legal-section-title">{section.title}</h2>
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-label-mono text-muted-foreground">
                {section.columns.map((col) => (
                  <th key={col} className="py-2 pr-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.dataType} className="border-b border-border/20 align-top">
                  <td className="py-3 pr-3 font-medium text-foreground">{row.dataType}</td>
                  <td className="py-3 pr-3 landing-copy-muted">{row.purpose}</td>
                  <td className="py-3 pr-3 landing-copy-muted">{row.retention}</td>
                  <td className="py-3 landing-copy-muted">{row.userControl}</td>
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
        <section key={`section-${index}`} className={`grid gap-5 ${columnClass}`}>
          {section.items.map((item) => (
            <div key={item.title} className="landing-card landing-card-pad">
              <div className="mb-2 flex items-center gap-2">
                <item.icon className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
              </div>
              <p className="landing-copy-muted">{item.body}</p>
            </div>
          ))}
        </section>
      );
    }
    case "checklist": {
      const containerClass = section.variant === "soft"
        ? "landing-card-soft landing-card-pad"
        : "landing-card landing-card-pad";
      return (
        <section key={`section-${index}`} className={containerClass}>
          <h2 className="legal-section-title">{section.title}</h2>
          <ul className="space-y-2.5 landing-copy-muted">
            {section.items.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <section.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }
    case "callout": {
      const containerClass = section.variant === "soft"
        ? "landing-card-soft landing-card-pad"
        : "landing-card landing-card-pad";
      const alignClass = section.align === "center" ? "text-center" : "";
      return (
        <section key={`section-${index}`} className={`${containerClass} ${alignClass}`.trim()}>
          <div className="space-y-3">
            {section.paragraphs.map(renderParagraph)}
          </div>
        </section>
      );
    }
    case "faq":
      return (
        <div key={`section-${index}`} className="legal-flow">
          {section.categories.map((category) => (
            <section key={category.category} className="landing-card landing-card-pad">
              <h2 className="legal-section-title">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`${category.category}-${idx}`}
                    className="rounded-lg border border-border/60 bg-white/80 px-4 data-[state=open]:border-brand/25 dark:bg-slate-900/70"
                  >
                    <AccordionTrigger className="py-3.5 text-left text-base font-medium text-foreground hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 landing-copy-muted">
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
