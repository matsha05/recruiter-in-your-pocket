"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";

interface ResearchArticleProps {
    header: {
        tag: string;
        title: string;
        description: string;
    };
    keyFinding: {
        icon: ReactNode; // Serialized React Element, not a Component Function
        subtitle: string; // e.g. "The Key Finding"
        stat: string;     // e.g. "6 Seconds"
        statDescription: string;
        source: {
            text: string;
            href?: string;
        };
        sampleSize?: string;
    };
    visualization?: ReactNode;
    children: ReactNode; // The main article prose
    productTieIn: {
        title: string; // "How this shapes our tool"
        items: Array<{
            title: string;
            description: string;
        }>;
    };
    cta?: {
        title: string;
        buttonText: string;
        href: string;
    }
}

export function ResearchArticle({
    header,
    keyFinding,
    visualization,
    children,
    productTieIn,
    cta = {
        title: "See what your resume looks like",
        buttonText: "Run Free Analysis",
        href: "/workspace"
    }
}: ResearchArticleProps) {
    return (
        <StudioShell showSidebar={true}>
            <div className="max-w-3xl mx-auto space-y-16 pb-24 px-6 md:px-0 pt-12">

                {/* 1. Header & Breadcrumb */}
                <header>
                    <Link href="/research" className="inline-block mb-8 group">
                        <span className="text-label text-muted-foreground/50 group-hover:text-foreground transition-colors">
                            ← Back to Research
                        </span>
                    </Link>
                    <div className="space-y-6">
                        <span className="inline-block text-label text-gold uppercase tracking-widest font-semibold text-[10px] border border-gold/20 px-2 py-1 rounded-sm bg-gold/5">
                            {header.tag}
                        </span>
                        <h1 className="text-hero text-5xl md:text-6xl text-foreground">
                            {header.title}
                        </h1>
                        <p className="text-reading text-xl text-muted-foreground leading-relaxed">
                            {header.description}
                        </p>
                    </div>
                </header>

                {/* 2. Key Finding Card */}
                <div className="border border-gold/20 bg-gold/5 rounded-none border-l-4 border-l-gold p-8 md:p-10 space-y-6">
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest">
                        {/* Render the passed node directly */}
                        {keyFinding.icon}
                        <span>{keyFinding.subtitle}</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight">{keyFinding.stat}</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {keyFinding.statDescription}
                        </p>
                    </div>
                    <div className="pt-6 border-t border-gold/10 text-xs font-mono text-muted-foreground/70 space-y-2">
                        <p className="flex items-center gap-2">
                            <span className="text-gold/80 uppercase">Source:</span>
                            {keyFinding.source.href ? (
                                <a href={keyFinding.source.href} target="_blank" className="inline-flex items-center gap-1 hover:text-foreground underline underline-offset-4 decoration-border">
                                    {keyFinding.source.text}
                                </a>
                            ) : (
                                <span>{keyFinding.source.text}</span>
                            )}
                        </p>
                        {keyFinding.sampleSize && (
                            <p><span className="text-gold/80 uppercase">Sample:</span> {keyFinding.sampleSize}</p>
                        )}
                    </div>
                </div>

                {/* 3. Visualization Section (Optional) */}
                {visualization && (
                    <section className="my-16">
                        {visualization}
                    </section>
                )}

                {/* 4. Main Prose Content */}
                <article className="prose prose-neutral dark:prose-invert max-w-none font-sans prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:font-medium prose-strong:text-foreground">
                    {children}
                </article>

                <hr className="border-black/5 dark:border-white/5 my-16" />

                {/* 5. Product Tie-In */}
                <div className="bg-secondary/20 p-8 md:p-10 rounded-sm border border-black/5 dark:border-white/5">
                    <h3 className="font-serif text-2xl font-medium mb-8 text-foreground">How this shapes the product</h3>
                    <div className="grid gap-8">
                        {productTieIn.items.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                                <div className="mt-1 h-5 w-5 flex items-center justify-center text-gold shrink-0">
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Standard CTA */}
                <div className="flex flex-col items-center justify-center gap-6 py-20">
                    <h3 className="font-serif text-2xl font-medium text-center">{cta.title}</h3>
                    <Link href={cta.href}>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gold rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                            <Button size="lg" className="relative bg-foreground text-background hover:bg-foreground/90 font-medium px-8 h-12 rounded-lg border border-white/10">
                                {cta.buttonText}
                            </Button>
                        </div>
                    </Link>
                </div>

            </div>
        </StudioShell>
    );
}

// Re-export common insights for use inside the article body

export function ArticleInsight({ icon, title, desc }: { icon: ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 border border-black/5 dark:border-white/5 bg-background hover:bg-secondary/10 transition-colors">
            <div className="flex items-center gap-2 mb-3 text-foreground font-medium">
                {icon}
                <span className="font-serif text-lg tracking-tight">{title}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    )
}
