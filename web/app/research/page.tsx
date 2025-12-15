import type { Metadata } from "next";
import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Hiring Research | Recruiter in Your Pocket",
    description: "Recruiter In Your Pocket is built on how recruiters actually read resumes, not on myths about bots and secret scores.",
};

const studies = [
    {
        id: "offer-negotiation",
        number: "01",
        category: "Offer & Negotiation",
        title: "Offer Negotiation Strategy: The Recruiter’s Playbook",
        thesis: "Negotiation is coordination, not combat. Treating it like a taboo reduces your leverage.",
        methods: ["Field experiment", "N=2,500"],
        readTime: "12 min",
        href: "/guides/offer-negotiation", // Linking to the guide
        type: "Guide"
    },
    {
        id: "how-recruiters-read",
        number: "02",
        category: "Eye-tracking research",
        title: "How Recruiters Skim Resumes in 6 Seconds",
        thesis: "Recruiters make fit/no-fit decisions in seconds, focusing on titles, companies, and dates.",
        methods: ["Eye-tracking", "Heat mapping"],
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        type: "Study"
    },
    {
        id: "how-people-scan",
        number: "03",
        category: "Usability research",
        title: "How People Scan Text and Bullets",
        thesis: "People scan pages in F-patterns, latching onto headings, numbers, and the start of lines.",
        methods: ["Usability testing", "Pattern analysis"],
        readTime: "5 min",
        href: "/research/how-people-scan",
        type: "Study"
    },
    {
        id: "ats-myths",
        number: "04",
        category: "Industry analysis",
        title: "ATS: How Applicant Tracking Systems Actually Work",
        thesis: "ATS systems rank and filter candidates. Human review, not algorithms, is the primary bottleneck.",
        methods: ["Peer-reviewed research", "Vendor documentation"],
        readTime: "4 min",
        href: "/research/ats-myths",
        type: "Study"
    },
    {
        id: "human-vs-algorithm",
        number: "05",
        category: "Algorithmic aversion",
        title: "Recruiters trust humans more than algorithms",
        thesis: "Recruiters punish algorithmic errors but forgive human inconsistency. Trust relies on human judgment.",
        methods: ["Experimental study", "N=694"],
        readTime: "5 min",
        href: "/research/human-vs-algorithm",
        type: "Study"
    },
    {
        id: "spelling-errors-impact",
        number: "06",
        category: "Screening heuristics",
        title: "Spelling errors carry real weight in judgment",
        thesis: "For many recruiters, 'form' is a gateway. Bad spelling can override strong experience.",
        methods: ["Experimental study"],
        readTime: "3 min",
        href: "/research/spelling-errors-impact",
        type: "Study"
    },
    {
        id: "hiring-discrimination-meta-analysis",
        number: "07",
        category: "Industry Analysis",
        title: "Discrimination in hiring has not disappeared",
        thesis: "A 25-year meta-analysis shows no decline in hiring discrimination. Resumes are necessary but not sufficient.",
        methods: ["Meta-analysis", "Field experiments"],
        readTime: "6 min",
        href: "/research/hiring-discrimination-meta-analysis",
        type: "Study"
    },
    {
        id: "automation-and-bias",
        number: "08",
        category: "ATS & Automation",
        title: "Hiring algorithms: Where automation enters the funnel",
        thesis: "Bias isn't just one step. It compounds across ad delivery, screening, and ranking algorithms.",
        methods: ["Policy analysis", "Technical audit"],
        readTime: "5 min",
        href: "/research/automation-and-bias",
        type: "Study"
    },
    {
        id: "salary-history-bans",
        number: "09",
        category: "Negotiation",
        title: "Salary history bans: Why 'just being honest' is a trap",
        thesis: "Revealing salary history anchors offers to your past, not the market. Bans shift leverage back to you.",
        methods: ["Econometric analysis"],
        readTime: "4 min",
        href: "/research/salary-history-bans",
        type: "Study"
    }
];

export default function ResearchPage() {
    return (
        <StudioShell showSidebar={true} className="max-w-3xl mx-auto py-24">

            {/* Editorial Header */}
            <header className="mb-24">
                <h1 className="font-serif text-5xl font-medium text-foreground tracking-tight mb-6">
                    Hiring Research.
                </h1>
                <p className="text-xl text-muted-foreground font-sans leading-relaxed max-w-xl">
                    Our product is built on how recruiters actually read resumes, not on myths about bots and secret scores.
                </p>
            </header>

            {/* The Stack (Editorial List) */}
            <div className="space-y-16 mb-24">
                {studies.map((study) => (
                    <div key={study.id} className="group">
                        <Link href={study.href} className="block">
                            <div className="flex items-baseline gap-4 mb-2">
                                <span className="font-mono text-xs text-muted-foreground/50">
                                    {study.number}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {study.category}
                                </span>
                            </div>

                            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-3 decoration-1 decoration-muted-foreground/30 group-hover:underline underline-offset-4 transition-all">
                                {study.title}
                            </h2>

                            <p className="text-muted-foreground text-lg leading-relaxed mb-4 max-w-2xl">
                                {study.thesis}
                            </p>

                            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground/60 font-mono">
                                <span>{study.readTime}</span>
                                <span className="opacity-30">/</span>
                                <span>{study.type}</span>
                                <span className="opacity-30">/</span>
                                <span>{study.methods.join(", ")}</span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <hr className="border-border/50 mb-16" />

            {/* Principles Section (Plain List) */}
            <div className="mb-24">
                <h3 className="font-serif text-2xl font-medium mb-8">How this shapes the product</h3>
                <ul className="space-y-6">
                    <li className="flex gap-6">
                        <span className="font-mono text-xs text-muted-foreground/50 mt-1">01</span>
                        <div>
                            <strong className="block text-foreground mb-1">First Impressions Matter</strong>
                            <p className="text-muted-foreground">Recruiter First Impression (the header feature) models the first 6 seconds where fit decisions happen.</p>
                        </div>
                    </li>
                    <li className="flex gap-6">
                        <span className="font-mono text-xs text-muted-foreground/50 mt-1">02</span>
                        <div>
                            <strong className="block text-foreground mb-1">Clarity over Keywords</strong>
                            <p className="text-muted-foreground">Our main scoring engine rewards clarity, scope, and story, penalizing keyword stuffing.</p>
                        </div>
                    </li>
                    <li className="flex gap-6">
                        <span className="font-mono text-xs text-muted-foreground/50 mt-1">03</span>
                        <div>
                            <strong className="block text-foreground mb-1">Eye-Flow Optimization</strong>
                            <p className="text-muted-foreground">Bullet Upgrades are specifically designed to catch the eye's F-pattern scan.</p>
                        </div>
                    </li>
                    <li className="flex gap-6">
                        <span className="font-mono text-xs text-muted-foreground/50 mt-1">04</span>
                        <div>
                            <strong className="block text-foreground mb-1">Honest ATS Education</strong>
                            <p className="text-muted-foreground">We educate you on how parsers actually work (they are dumb databases) instead of selling 'beat the bot' fear.</p>
                        </div>
                    </li>
                </ul>
            </div>

            <Footer />

        </StudioShell>
    );
}

// Removed the old Principle component as it used icons
