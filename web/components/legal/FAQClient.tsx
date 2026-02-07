"use client";

import Link from "next/link";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
    {
        category: "Product",
        questions: [
            {
                q: "What does the review analyze?",
                a: "First-pass recruiter signal, quantified impact, clarity/readability, and role fit. Output includes score context plus rewrite guidance.",
            },
            {
                q: "How is this different from ATS keyword tools?",
                a: "ATS tools focus on parser compliance. RIYP models human first-pass judgment and ties recommendations to evidence lines.",
            },
            {
                q: "What file formats are supported?",
                a: "PDF and Word documents (.doc, .docx). If parsing fails, paste text directly in Workspace.",
            },
        ],
    },
    {
        category: "Privacy & Security",
        questions: [
            {
                q: "What happens to uploaded resume data?",
                a: "Anonymous runs are not stored unless you choose save paths. Signed-in runs can store report history. You can delete reports or account data at any time.",
            },
            {
                q: "Is my data used to train public models?",
                a: "No. We use OpenAI API services that do not train public models on your content.",
            },
            {
                q: "How do I delete my data?",
                a: "Use Settings to delete reports, export account data, or delete your account.",
            },
        ],
    },
    {
        category: "Pricing & Billing",
        questions: [
            {
                q: "Is the first review really free?",
                a: "Yes. One full review is free and does not require a card.",
            },
            {
                q: "What is monthly vs lifetime?",
                a: "Monthly ($9) fits active search cycles and can be canceled anytime. Lifetime ($79 one-time) unlocks long-term access with no recurring charges.",
            },
            {
                q: "How do I restore access and get receipts?",
                a: "Open Settings > Billing or use Restore Access. Stripe provides invoices and receipts.",
            },
        ],
    },
];

export default function FAQClient() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqData.flatMap((section) =>
            section.questions.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: item.a,
                },
            }))
        ),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <LegalShell
                eyebrow="FAQ"
                title="Questions and answers"
                description="Practical details on product behavior, privacy, and billing controls."
                lastUpdated={LEGAL_LAST_UPDATED}
            >
                <div className="legal-flow">
                    {faqData.map((section) => (
                        <section key={section.category} className="landing-card landing-card-pad">
                            <h2 className="legal-section-title">{section.category}</h2>
                            <Accordion type="single" collapsible className="space-y-3">
                                {section.questions.map((item, idx) => (
                                    <AccordionItem
                                        key={item.q}
                                        value={`${section.category}-${idx}`}
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

                <section className="landing-card-soft landing-card-pad text-center">
                    <p className="landing-copy-muted">
                        Still need help?
                        {" "}
                        <Link
                            href="mailto:support@recruiterinyourpocket.com"
                            className="text-foreground underline underline-offset-4 hover:text-brand"
                        >
                            support@recruiterinyourpocket.com
                        </Link>
                    </p>
                </section>
            </LegalShell>
        </>
    );
}
