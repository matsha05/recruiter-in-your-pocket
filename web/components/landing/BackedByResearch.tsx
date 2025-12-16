import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FileText } from "lucide-react";

const studies = [
    {
        title: "How Recruiters Skim Resumes in 7.4 Seconds",
        source: "The Ladders / Eye-Tracking Study",
        description: "Eye-tracking data reveals the F-shaped scanning pattern used to filter 80% of candidates instantly.",
        href: "/research"
    },
    {
        title: "The Offer Negotiation 'Anchor Zone'",
        source: "Harvard PON / Internal Data",
        description: "Why the first number sets the ceiling, and how to counter without breaking rapport.",
        href: "/guides/offer-negotiation"
    },
    {
        title: "ATS Reality: Keyword Stuffing vs. Context",
        source: "Jobscan / Recruiter Survey",
        description: "Why 'invisible text' fails and how semantic matching actually ranks your profile.",
        href: "/research"
    }
];

export function BackedByResearch() {
    return (
        <section className="w-full py-24 border-t border-black/5 dark:border-white/5 bg-background">
            <div className="max-w-5xl mx-auto px-6">

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-2 text-gold">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">The Hiring Playbook</span>
                        </div>
                        <h2 className="font-display text-4xl text-primary leading-[1.1] tracking-tight">
                            The rules they <br /> don't teach you.
                        </h2>
                        <p className="text-memo font-sans text-muted-foreground">
                            Everything in this tool is based on how recruiters actually make decisions. Not myths. Not ATS hacks.
                        </p>
                    </div>

                    <Link href="/research">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold transition-colors group">
                            See the Research <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {studies.map((study, i) => (
                        <Link key={i} href={study.href} className="group block">
                            <article className="h-full p-8 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all duration-300 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                                        <FileText className="w-3 h-3" />
                                        {study.source}
                                    </div>
                                    <h3 className="font-display text-xl leading-snug text-foreground group-hover:underline decoration-1 underline-offset-4 decoration-border">
                                        {study.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {study.description}
                                    </p>
                                </div>
                                <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> 5 min read
                                    </span>
                                    <span className="group-hover:translate-x-1 transition-transform text-gold">Read</span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}
