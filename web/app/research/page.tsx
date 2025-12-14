import type { Metadata } from "next";
import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Clock, Activity, Target } from "lucide-react";

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
        icon: Activity
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
        icon: Target
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
        icon: BookOpen
    },
];

export default function ResearchPage() {
    return (
        <StudioShell showSidebar={true}>
            {/* Header / Breadcrumb */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">The Foundation</span>
                    <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground mt-2 tracking-tight">Hiring Research Library</h1>
                </div>
                <Link href="/workspace">
                    <Button variant="outline" size="sm">Back to Studio</Button>
                </Link>
            </div>

            {/* Intro */}
            <div className="max-w-2xl mb-12">
                <p className="text-lg text-muted-foreground font-sans leading-relaxed">
                    Most resume tools lean on myths about bots and secret filters. Recruiter in Your Pocket
                    is built on how recruiters actually read resumes and decide who moves forward.
                </p>
            </div>

            {/* Research Grid */}
            <div className="grid gap-6">
                {studies.map((study) => (
                    <Link key={study.id} href={study.href} className="group blcok">
                        <Card className="hover:border-primary/20 transition-all duration-300 hover:bg-muted/30">
                            <CardContent className="p-8 flex items-start gap-6">
                                {/* Number / Icon */}
                                <div className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <study.icon className="h-6 w-6" />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <span className="text-primary/80">{study.category}</span>
                                        <span>•</span>
                                        <span>{study.readTime} read</span>
                                    </div>
                                    <h3 className="font-serif text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                                        {study.title}
                                    </h3>
                                    <p className="text-muted-foreground max-w-2xl leading-relaxed">
                                        {study.thesis}
                                    </p>

                                    <div className="flex items-center gap-2 mt-4 text-xs font-medium text-muted-foreground/60">
                                        <span className="px-2 py-1 rounded-md bg-secondary/50 border border-border/50">
                                            Methods: {study.methods.join(", ")}
                                        </span>
                                        <span>→ Informs {study.productTie}</span>
                                    </div>
                                </div>

                                <div className="self-center hidden md:block opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Principles Section */}
            <div className="mt-16 pt-12 border-t border-border/40">
                <h2 className="font-serif text-2xl font-medium mb-6">How this shapes the product</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <Principle
                        title="First Impressions Matter"
                        desc="Recruiter First Impression models the first few seconds where a recruiter decides whether to move you forward."
                    />
                    <Principle
                        title="Clarity over Keywords"
                        desc="Our main score focuses on clarity, scope, and story, not keyword stuffing."
                    />
                    <Principle
                        title="Eye-Flow Optimization"
                        desc="Bullet Upgrades are designed to match how eyes actually scan impact, numbers, and verbs."
                    />
                    <Principle
                        title="Honest ATS Education"
                        desc="We keep your resume parser-friendly and recruiter-clear instead of selling 'beat the bot' tricks."
                    />
                </div>
            </div>

        </StudioShell>
    );
}

function Principle({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-2">
            <h3 className="font-medium text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    )
}
