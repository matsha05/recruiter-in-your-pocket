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
        <StudioShell showSidebar={true} className="max-w-4xl mx-auto py-24 px-6 md:px-0">

            {/* Editorial Header */}
            <header className="mb-24">
                <span className="text-label text-muted-foreground/60 mb-4 block">The Hiring Playbook</span>
                <h1 className="text-hero text-6xl md:text-7xl mb-8">
                    The rules they <br /> don't teach you.
                </h1>
                <p className="text-reading text-xl text-muted-foreground max-w-2xl">
                    The biases, the shortcuts, the patterns. Learn what recruiters actually see—and why.
                </p>
            </header>

            {/* The Stack (Editorial List) */}
            <div className="space-y-4 mb-24">
                {studies.map((study) => (
                    <div key={study.id} className="group">
                        <Link href={study.href} className="block group-hover:bg-secondary/20 -mx-6 px-6 py-6 rounded-md transition-colors">
                            <div className="grid md:grid-cols-[100px_1fr_200px] items-start gap-6">
                                {/* Number */}
                                <div className="text-label text-muted-foreground/30 mt-1.5">
                                    {study.number}
                                </div>

                                {/* Content */}
                                <div>
                                    <h2 className="text-title text-2xl md:text-3xl text-foreground mb-3 group-hover:text-brand transition-colors">
                                        {study.title}
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed max-w-xl">
                                        {study.thesis}
                                    </p>
                                </div>

                                {/* Meta */}
                                <div className="hidden md:flex flex-col items-end gap-1 text-xs font-medium text-muted-foreground/50 font-mono mt-2">
                                    <span>{study.readTime}</span>
                                    <span>{study.category}</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <hr className="border-black/5 dark:border-white/5 mb-24" />

            {/* Principles Section */}
            <div className="mb-24">
                <h3 className="text-title text-3xl mb-12">How this shapes the product</h3>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="flex gap-6">
                        <span className="text-label text-muted-foreground/30 mt-1">01</span>
                        <div>
                            <strong className="block text-foreground font-medium mb-1 font-display text-lg">First Impressions Matter</strong>
                            <p className="text-muted-foreground text-sm leading-relaxed">Recruiter First Impression (the header feature) models the first 6 seconds where fit decisions happen.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <span className="text-label text-muted-foreground/30 mt-1">02</span>
                        <div>
                            <strong className="block text-foreground font-medium mb-1 font-display text-lg">Clarity over Keywords</strong>
                            <p className="text-muted-foreground text-sm leading-relaxed">Our main scoring engine rewards clarity, scope, and story, penalizing keyword stuffing.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <span className="text-label text-muted-foreground/30 mt-1">03</span>
                        <div>
                            <strong className="block text-foreground font-medium mb-1 font-display text-lg">Eye-Flow Optimization</strong>
                            <p className="text-muted-foreground text-sm leading-relaxed">Bullet Upgrades are specifically designed to catch the eye's F-pattern scan.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <span className="text-label text-muted-foreground/30 mt-1">04</span>
                        <div>
                            <strong className="block text-foreground font-medium mb-1 font-display text-lg">Honest ATS Education</strong>
                            <p className="text-muted-foreground text-sm leading-relaxed">We educate you on how parsers actually work (they are dumb databases) instead of selling 'beat the bot' fear.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

        </StudioShell>
    );
}

// Removed the old Principle component as it used icons
