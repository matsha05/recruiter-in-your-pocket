import type { Metadata } from "next";
import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/landing/Footer";
import { ArrowRight, BookOpen, Activity, Target, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Hiring Research | Recruiter in Your Pocket",
    description: "Recruiter In Your Pocket is built on how recruiters actually read resumes, not on myths about bots and secret scores.",
};

const studies = [
    {
        id: "how-recruiters-read",
        number: "01",
        category: "Eye-tracking research",
        title: "How Recruiters Skim Resumes in 6 Seconds",
        thesis: "Recruiters make fit/no-fit decisions in seconds, focusing on titles, companies, and dates.",
        methods: ["Eye-tracking", "Heat mapping"],
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        productTie: "Recruiter First Impression",
        icon: Activity,
        color: "text-rose"
    },
    {
        id: "how-people-scan",
        number: "02",
        category: "Usability research",
        title: "How People Scan Text and Bullets",
        thesis: "People scan pages in F-patterns, latching onto headings, numbers, and the start of lines.",
        methods: ["Usability testing", "Pattern analysis"],
        readTime: "5 min",
        href: "/research/how-people-scan",
        productTie: "Bullet Upgrades",
        icon: Target,
        color: "text-gold"
    },
    {
        id: "ats-myths",
        number: "03",
        category: "Industry analysis",
        title: "ATS: How Applicant Tracking Systems Actually Work",
        thesis: "ATS systems rank and filter candidates. Human review, not algorithms, is the primary bottleneck.",
        methods: ["Peer-reviewed research", "Vendor documentation"],
        readTime: "4 min",
        href: "/research/ats-myths",
        productTie: "Human clarity focus",
        icon: BookOpen,
        color: "text-moss"
    },
];

export default function ResearchPage() {
    return (
        <StudioShell showSidebar={true} className="max-w-4xl mx-auto py-20">
            {/* Hero */}
            <header className="mb-24 text-center max-w-2xl mx-auto">
                <span className="text-xs font-semibold uppercase tracking-wider text-moss bg-moss/10 px-3 py-1 rounded-full mb-6 inline-block">
                    The Research Library
                </span>
                <h1 className="font-serif text-5xl md:text-6xl font-medium text-foreground mb-6 tracking-tight">
                    Built on Evidence.
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Most resume tools lean on myths about bots. We build on how humans actually make hiring decisions.
                </p>
            </header>

            {/* Research Grid */}
            <div className="grid gap-6 mb-24">
                {studies.map((study) => (
                    <Link key={study.id} href={study.href} className="group block">
                        <Card className="hover:border-primary/20 transition-all duration-300 hover:bg-muted/30 border-border/50 bg-card/50">
                            <CardContent className="p-8 flex items-start gap-6">
                                {/* Icon */}
                                <div className={`hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface border border-border/50 ${study.color} group-hover:scale-110 transition-transform`}>
                                    <study.icon className="h-6 w-6" strokeWidth={1.5} />
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <span className="text-foreground/80">{study.category}</span>
                                        <span className="opacity-30">•</span>
                                        <span>{study.readTime} read</span>
                                    </div>
                                    <h3 className="font-serif text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                                        {study.title}
                                    </h3>
                                    <p className="text-muted-foreground max-w-2xl leading-relaxed">
                                        {study.thesis}
                                    </p>

                                    <div className="flex items-center gap-2 mt-4 text-xs font-medium text-muted-foreground/60 pt-2">
                                        <span className="px-2 py-1 rounded-md bg-secondary/50 border border-border/50 truncate max-w-[200px] md:max-w-none">
                                            Methods: {study.methods.join(", ")}
                                        </span>
                                    </div>
                                </div>

                                <div className="self-center hidden md:block opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Principles Section */}
            <div className="bg-surface border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl font-medium mb-4">How this shapes the product</h2>
                    <p className="text-muted-foreground">Every feature in the Studio maps to a research finding.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                    <Principle
                        title="First Impressions Matter"
                        desc="Recruiter First Impression (the header feature) models the first 6 seconds where fit decisions happen."
                    />
                    <Principle
                        title="Clarity over Keywords"
                        desc="Our main scoring engine rewards clarity, scope, and story, penalizing keyword stuffing."
                    />
                    <Principle
                        title="Eye-Flow Optimization"
                        desc="Bullet Upgrades are specifically designed to catch the eye's F-pattern scan."
                    />
                    <Principle
                        title="Honest ATS Education"
                        desc="We educate you on how parsers actually work (they are dumb databases) instead of selling 'beat the bot' fear."
                    />
                </div>
            </div>

            <div className="mt-20">
                <Footer />
            </div>

        </StudioShell>
    );
}

function Principle({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <CheckCircle2 className="w-5 h-5 text-moss flex-shrink-0 mt-1" strokeWidth={2} />
            <div>
                <h3 className="font-medium text-foreground text-lg mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
