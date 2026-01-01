"use client";

import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";
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
                q: "What exactly does the review analyze?",
                a: "We analyze your resume through multiple lenses: recruiter first impression (what they see in 7.4 seconds), quantification density (are you using numbers?), action verb strength, bullet clarity, and overall structure. Each dimension is scored and explained with specific improvement suggestions."
            },
            {
                q: "How is this different from other resume tools?",
                a: "Most tools optimize for ATS keywords or generic rules. We focus on what actually matters: how a human recruiter evaluates your resume in seconds. Our methodology is grounded in eye-tracking research and recruiting best practices, not keyword stuffing."
            },
            {
                q: "What file formats do you accept?",
                a: "We accept PDF and Word documents (.doc, .docx). For best results, use a clean PDF exported from your word processor."
            },
            {
                q: "Can I use this for any industry or role?",
                a: "Yes. The principles of strong resume writing—quantified impact, clear structure, compelling bullets—apply universally. However, we're especially tuned for knowledge worker roles in tech, consulting, finance, and similar fields."
            },
        ]
    },
    {
        category: "Privacy & Security",
        questions: [
            {
                q: "What happens to my resume after I upload it?",
                a: "Your resume is analyzed by our AI, then automatically deleted within 24 hours. We don't store resumes long-term, and we never share or sell your personal data."
            },
            {
                q: "Is my data used to train AI models?",
                a: "No. We use OpenAI's API for analysis, which means your data is not used to train their public models. Your resume is processed and forgotten."
            },
            {
                q: "How is my data encrypted?",
                a: "All data is encrypted in transit (TLS 1.3) and at rest on our database. Payment processing is handled by Stripe—we never see your credit card numbers."
            },
            {
                q: "Can I delete my account and data?",
                a: "Yes, at any time. Go to Settings and click 'Delete Account.' This permanently removes all your data from our systems."
            },
        ]
    },
    {
        category: "Pricing & Credits",
        questions: [
            {
                q: "Is the first review really free?",
                a: "Yes. Your first full review is completely free, no credit card required. We want you to see the value before you commit."
            },
            {
                q: "What's the difference between Quick Check and Active Job Search?",
                a: "Quick Check ($9) is best if you're just getting started—one review to diagnose what's not working. Active Job Search ($29) gives you 5 reviews so you can iterate across versions and tailor for different roles."
            },
            {
                q: "Do credits expire?",
                a: "No. Once you purchase credits, they're yours to use whenever you need them."
            },
            {
                q: "Can I get a refund?",
                a: "Yes. If you're not satisfied with your first review, email us within 24 hours for a full refund. No questions asked."
            },
        ]
    },
    {
        category: "Technical",
        questions: [
            {
                q: "Why did my PDF fail to upload?",
                a: "Some PDFs use image-based text (scanned documents) that we can't parse. If your resume was created in Word or Google Docs, try exporting a fresh PDF. If issues persist, paste your resume text directly."
            },
            {
                q: "How long does the analysis take?",
                a: "Typically 30-60 seconds. The AI analysis runs in real-time, and you'll see results stream in as they're generated."
            },
            {
                q: "Do you support mobile?",
                a: "Yes. The workspace is fully responsive. However, for the best experience editing your resume based on feedback, we recommend using a desktop browser."
            },
        ]
    }
];

export default function FAQClient() {
    // Generate FAQ Schema.org structured data
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.flatMap(section =>
            section.questions.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.a
                }
            }))
        )
    };

    return (
        <StudioShell showSidebar={false} className="max-w-3xl mx-auto py-12">
            {/* FAQ Schema.org for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <LegalNav />

            {/* Hero */}
            <header className="mb-12 text-center max-w-2xl mx-auto">
                <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-4 tracking-tight">
                    Questions & Answers
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Everything you need to know about how we work.
                </p>
            </header>

            {/* FAQ Sections */}
            <div className="space-y-12">
                {faqData.map((section) => (
                    <section key={section.category}>
                        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                            {section.category}
                        </h2>
                        <Accordion type="single" collapsible className="space-y-3">
                            {section.questions.map((item, idx) => (
                                <AccordionItem
                                    key={idx}
                                    value={`${section.category}-${idx}`}
                                    className="border border-border/60 rounded bg-card px-6 data-[state=open]:ring-1 data-[state=open]:ring-brand/20 transition-all hover:border-border/80"
                                >
                                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5 text-base">
                                        {item.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>
                ))}
            </div>

            {/* CTA */}
            <div className="mt-24 text-center">
                <p className="text-muted-foreground mb-6">Still have questions?</p>
                <Link
                    href="mailto:support@recruiterinyourpocket.com"
                    className="text-brand hover:text-brand/80 font-medium underline underline-offset-4 transition-colors"
                >
                    Email us at support@recruiterinyourpocket.com
                </Link>
            </div>

            <div className="mt-32">
                <Footer />
            </div>
        </StudioShell>
    );
}
