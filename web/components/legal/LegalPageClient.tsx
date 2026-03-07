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

const cardShadow = "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";
const cardShadowLight = "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)";

function renderInline(inline: LegalInline, index: number) {
  if (inline.type === "text") return <span key={`text-${index}`}>{inline.value}</span>;
  return (
    <Link
      key={`link-${index}`}
      href={inline.href}
      className="text-slate-700 underline underline-offset-4 hover:text-slate-900"
    >
      {inline.label}
    </Link>
  );
}

function renderParagraph(paragraph: LegalParagraph, index: number) {
  return (
    <p key={`para-${index}`} className="text-sm leading-7 text-slate-500">
      {paragraph.map(renderInline)}
    </p>
  );
}

function renderSection(section: LegalSection, index: number) {
  switch (section.type) {
    case "card":
      return (
        <section
          key={`section-${index}`}
          className="rounded-2xl bg-white p-6 md:p-8"
          style={{ boxShadow: cardShadow }}
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{section.title}</h2>
          <div className="space-y-3">
            {section.paragraphs.map(renderParagraph)}
          </div>
        </section>
      );
    case "bullet_list":
      return (
        <section
          key={`section-${index}`}
          className="rounded-2xl bg-white p-6 md:p-8"
          style={{ boxShadow: cardShadow }}
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{section.title}</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-500">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      );
    case "table":
      return (
        <section
          key={`section-${index}`}
          className="overflow-x-auto rounded-2xl bg-white p-6 md:p-8"
          style={{ boxShadow: cardShadow }}
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{section.title}</h2>
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="editorial-kicker border-b border-slate-100 text-left text-slate-300">
                {section.columns.map((col) => (
                  <th key={col} className="py-2 pr-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.dataType} className="border-b border-slate-50 align-top">
                  <td className="py-3 pr-3 text-sm font-medium text-slate-700">{row.dataType}</td>
                  <td className="py-3 pr-3 text-sm text-slate-500">{row.purpose}</td>
                  <td className="py-3 pr-3 text-sm text-slate-500">{row.retention}</td>
                  <td className="py-3 text-sm text-slate-500">{row.userControl}</td>
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
        <section key={`section-${index}`} className={`grid gap-4 ${columnClass}`}>
          {section.items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-5"
              style={{ boxShadow: cardShadowLight }}
            >
              <div className="mb-2 flex items-center gap-2">
                <item.icon className="h-4 w-4 text-teal-700" />
                <h2 className="text-sm font-semibold text-slate-700">{item.title}</h2>
              </div>
              <p className="text-sm leading-6 text-slate-500">{item.body}</p>
            </div>
          ))}
        </section>
      );
    }
    case "checklist": {
      return (
        <section
          key={`section-${index}`}
          className="rounded-2xl bg-white p-6 md:p-8"
          style={{ boxShadow: section.variant === "soft" ? cardShadowLight : cardShadow }}
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{section.title}</h2>
          <ul className="space-y-2.5 text-sm leading-7 text-slate-500">
            {section.items.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <section.icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
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
          key={`section-${index}`}
          className={`rounded-2xl bg-white p-6 md:p-8 ${section.align === "center" ? "text-center" : ""}`}
          style={{ boxShadow: section.variant === "soft" ? cardShadowLight : cardShadow }}
        >
          <div className="space-y-3">
            {section.paragraphs.map(renderParagraph)}
          </div>
        </section>
      );
    }
    case "faq":
      return (
        <div key={`section-${index}`} className="space-y-4">
          {section.categories.map((category) => (
            <section
              key={category.category}
              className="rounded-2xl bg-white p-6 md:p-8"
              style={{ boxShadow: cardShadow }}
            >
              <h2 className="mb-4 text-sm font-semibold text-slate-700">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`${category.category}-${idx}`}
                    className="rounded-lg border border-slate-100 px-4"
                  >
                    <AccordionTrigger className="py-3 text-left text-sm font-medium text-slate-700 hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 text-sm leading-7 text-slate-500">
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
