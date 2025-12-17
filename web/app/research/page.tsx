import type { Metadata } from "next";
import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Hiring Research | Recruiter in Your Pocket",
    description: "Evidence-based research on how recruiters actually read resumes, make decisions, and what you can do about it.",
};

/**
 * RESEARCH PAGE INFORMATION ARCHITECTURE (v2)
 * 
 * Design rationale:
 * - 15 articles is too many for a flat list — cognitive load is high
 * - Categories should map to USER INTENT, not topic taxonomy
 * - Three user intents: "Understand the system" → "Improve my resume" → "Win the job"
 * - Each category is a stage in the job seeker's journey
 * - Featured articles surface the highest-impact content
 */

// Reorganized by user intent/journey stage
const categories = [
    {
        id: "understand",
        title: "Understand the System",
        subtitle: "How recruiters actually think and decide",
        articles: [
            {
                id: "how-recruiters-read",
                title: "How Recruiters Skim Resumes in 6 Seconds",
                thesis: "Recruiters make fit/no-fit decisions in seconds, focusing on titles, companies, and dates.",
                readTime: "4 min",
                href: "/research/how-recruiters-read",
                featured: true
            },
            {
                id: "how-people-scan",
                title: "How People Scan Text and Bullets",
                thesis: "People scan pages in F-patterns, latching onto headings, numbers, and the start of lines.",
                readTime: "5 min",
                href: "/research/how-people-scan"
            },
            {
                id: "ats-myths",
                title: "ATS: How Applicant Tracking Systems Actually Work",
                thesis: "ATS systems rank and filter candidates. Human review, not algorithms, is the primary bottleneck.",
                readTime: "4 min",
                href: "/research/ats-myths"
            },
            {
                id: "human-vs-algorithm",
                title: "Recruiters trust humans more than algorithms",
                thesis: "Recruiters punish algorithmic errors but forgive human inconsistency.",
                readTime: "5 min",
                href: "/research/human-vs-algorithm"
            }
        ]
    },
    {
        id: "craft",
        title: "Craft Your Resume",
        subtitle: "Evidence-based writing and formatting",
        articles: [
            {
                id: "quantifying-impact",
                title: "Quantifying Impact: The Laszlo Bock Formula",
                thesis: "Google's former HR head on why numbers matter—and how to find them.",
                readTime: "5 min",
                href: "/research/quantifying-impact",
                featured: true
            },
            {
                id: "star-method",
                title: "The STAR Method: Structure That Works",
                thesis: "The Situation-Task-Action-Result framework for interviews and resume bullets.",
                readTime: "4 min",
                href: "/research/star-method"
            },
            {
                id: "resume-length-myths",
                title: "Resume Length: What Research Actually Says",
                thesis: "The one-page rule is outdated. Two pages often score higher for experienced candidates.",
                readTime: "4 min",
                href: "/research/resume-length-myths"
            },
            {
                id: "spelling-errors-impact",
                title: "Spelling Errors Carry Real Weight",
                thesis: "For many recruiters, 'form' is a gateway. Bad spelling can override strong experience.",
                readTime: "3 min",
                href: "/research/spelling-errors-impact"
            }
        ]
    },
    {
        id: "strategy",
        title: "Win the Job",
        subtitle: "Job search, networking, and negotiation",
        articles: [
            {
                id: "referral-advantage",
                title: "The Referral Advantage",
                thesis: "Referred candidates are 5-10x more likely to be hired.",
                readTime: "4 min",
                href: "/research/referral-advantage",
                featured: true
            },
            {
                id: "linkedin-vs-resume",
                title: "LinkedIn vs. Resume: What Gets Seen",
                thesis: "Recruiters use LinkedIn to find candidates and resumes to evaluate them.",
                readTime: "4 min",
                href: "/research/linkedin-vs-resume"
            },
            {
                id: "skills-based-hiring",
                title: "The Skills-Based Hiring Shift",
                thesis: "Major employers are dropping degree requirements. Skills demonstration matters more.",
                readTime: "5 min",
                href: "/research/skills-based-hiring"
            },
            {
                id: "offer-negotiation",
                title: "Offer Negotiation Strategy",
                thesis: "Negotiation is coordination, not combat. Treating it like a taboo reduces your leverage.",
                readTime: "12 min",
                href: "/guides/offer-negotiation"
            },
            {
                id: "salary-history-bans",
                title: "Salary History Bans: Why 'Just Being Honest' is a Trap",
                thesis: "Revealing salary history anchors offers to your past, not the market.",
                readTime: "4 min",
                href: "/research/salary-history-bans"
            }
        ]
    }
];

export default function ResearchPage() {
    return (
        <StudioShell showSidebar={true} className="max-w-4xl mx-auto py-24 px-6 md:px-0">

            {/* Editorial Header */}
            <header className="mb-20">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-4 block">
                    The Hiring Playbook
                </span>
                <h1 className="font-serif text-5xl md:text-6xl font-medium text-foreground mb-6 tracking-tight">
                    The rules they<br />don't teach you.
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                    Evidence-based research on how recruiters think, what they see, and how to present yourself.
                </p>
            </header>

            {/* Category Sections */}
            <div className="space-y-20 mb-24">
                {categories.map((category, catIndex) => (
                    <section key={category.id}>
                        {/* Category Header */}
                        <div className="flex items-baseline gap-4 mb-8 border-b border-border/20 pb-4">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
                                {String(catIndex + 1).padStart(2, '0')}
                            </span>
                            <div>
                                <h2 className="font-serif text-2xl font-medium text-foreground">
                                    {category.title}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {category.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Articles Grid */}
                        <div className="space-y-1">
                            {category.articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={article.href}
                                    className="group block -mx-4 px-4 py-4 rounded-md hover:bg-secondary/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`text-base font-medium group-hover:text-brand transition-colors ${article.featured ? 'text-foreground' : 'text-foreground/90'}`}>
                                                    {article.title}
                                                </h3>
                                                {article.featured && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-brand bg-brand/10 rounded">
                                                        Essential
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
                                                {article.thesis}
                                            </p>
                                        </div>
                                        <span className="font-mono text-[10px] text-muted-foreground/50 shrink-0 mt-1">
                                            {article.readTime}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <hr className="border-border/10 mb-20" />

            {/* How This Shapes the Product */}
            <section className="mb-24">
                <h3 className="font-serif text-2xl font-medium text-foreground mb-10">
                    How this shapes the product
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        {
                            title: "First Impressions Matter",
                            desc: "Recruiter First Impression models the first 6 seconds where fit decisions happen."
                        },
                        {
                            title: "Clarity over Keywords",
                            desc: "Our scoring engine rewards clarity, scope, and story—penalizing keyword stuffing."
                        },
                        {
                            title: "Eye-Flow Optimization",
                            desc: "Bullet Upgrades are designed to catch the eye's F-pattern scan."
                        },
                        {
                            title: "Honest ATS Education",
                            desc: "We teach how parsers actually work instead of selling 'beat the bot' fear."
                        }
                    ].map((principle, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="font-mono text-[10px] text-muted-foreground/30 mt-1">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div>
                                <strong className="block text-foreground font-medium mb-1">
                                    {principle.title}
                                </strong>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {principle.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />

        </StudioShell>
    );
}
