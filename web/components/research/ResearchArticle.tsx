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
            <div className="max-w-3xl mx-auto space-y-12 pb-20">

                {/* 1. Header & Breadcrumb */}
                <header>
                    <Link href="/research" className="inline-block mb-6">
                        <Button variant="ghost" size="sm" className="-ml-3 gap-2 text-muted-foreground">
                            ← Back to Library
                        </Button>
                    </Link>
                    <div className="space-y-4">
                        <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                            {header.tag}
                        </span>
                        <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-foreground">
                            {header.title}
                        </h1>
                        <p className="text-xl text-muted-foreground font-sans leading-relaxed">
                            {header.description}
                        </p>
                    </div>
                </header>

                {/* 2. Key Finding Card */}
                <Card className="bg-secondary/30 border-primary/10">
                    <CardContent className="p-8 md:p-10 space-y-6">
                        <div className="flex items-center gap-2 text-amber-600 font-medium text-sm uppercase tracking-wider">
                            {/* Render the passed node directly */}
                            {keyFinding.icon}
                            <span>{keyFinding.subtitle}</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-3xl font-medium">{keyFinding.stat}</h2>
                            <p className="text-muted-foreground text-lg">
                                {keyFinding.statDescription}
                            </p>
                        </div>
                        <div className="pt-6 border-t border-border/50 text-sm text-muted-foreground space-y-2">
                            <p className="flex items-center gap-2">
                                <strong>Source:</strong>
                                {keyFinding.source.href ? (
                                    <a href={keyFinding.source.href} target="_blank" className="inline-flex items-center gap-1 underline hover:text-foreground">
                                        {keyFinding.source.text} <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : (
                                    <span>{keyFinding.source.text}</span>
                                )}
                            </p>
                            {keyFinding.sampleSize && (
                                <p><strong>Sample:</strong> {keyFinding.sampleSize}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Visualization Section (Optional) */}
                {visualization && (
                    <section>
                        {visualization}
                    </section>
                )}

                {/* 4. Main Prose Content */}
                <article className="prose prose-neutral dark:prose-invert max-w-none font-sans">
                    {children}
                </article>

                {/* 5. Product Tie-In */}
                <div className="border-t border-border pt-12 mt-12">
                    <h3 className="font-serif text-2xl font-medium mb-6">{productTieIn.title}</h3>
                    <div className="grid gap-4">
                        {productTieIn.items.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="mt-1 h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Standard CTA */}
                <div className="flex flex-col items-center justify-center gap-4 py-12 bg-muted/20 rounded-2xl">
                    <h3 className="font-serif text-xl font-medium">{cta.title}</h3>
                    <Link href={cta.href}>
                        <Button size="lg" variant="studio">{cta.buttonText}</Button>
                    </Link>
                </div>

            </div>
        </StudioShell>
    );
}

// Re-export common insights for use inside the article body

export function ArticleInsight({ icon, title, desc }: { icon: ReactNode, title: string, desc: string }) {
    return (
        <div className="p-4 border rounded-lg bg-card hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                {icon}
                <span>{title}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    )
}
