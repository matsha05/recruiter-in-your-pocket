"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Clock, Calendar } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
    SCROLL_REVEAL_VARIANTS,
    STAGGER_CONTAINER,
    STAGGER_ITEM,
    DURATION,
    EASE_SNAP,
    SPRING_SUBTLE
} from "@/lib/animation";

interface ResearchArticleProps {
    header: {
        tag: string;
        title: string;
        description: string;
        lastUpdated?: string; // e.g. "December 2024"
        readTime?: string;    // e.g. "4 min read"
    };
    keyFinding: {
        icon: ReactNode;
        subtitle: string;
        stat: string;
        statDescription: string;
        source: {
            text: string;
            href?: string;
        };
        sampleSize?: string;
    };
    visualization?: ReactNode;
    children: ReactNode;
    productTieIn: {
        title: string;
        items: Array<{
            title: string;
            description: string;
        }>;
    };
    relatedArticles?: Array<{
        title: string;
        href: string;
        tag?: string;
    }>;
    cta?: {
        title: string;
        buttonText: string;
        href: string;
    }
}

// Animation variants for key finding card
const KEY_FINDING_VARIANTS = {
    hidden: {
        opacity: 0,
        scale: 0.96,
        y: 12
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            ...SPRING_SUBTLE,
            delay: 0.15
        }
    }
};

export function ResearchArticle({
    header,
    keyFinding,
    visualization,
    children,
    productTieIn,
    relatedArticles,
    cta = {
        title: "See what your resume looks like",
        buttonText: "Run Free Analysis",
        href: "/workspace"
    }
}: ResearchArticleProps) {
    const { ref: relatedRef, isVisible: relatedVisible } = useScrollReveal();
    const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <StudioShell showSidebar={true}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": header.title,
                        "description": header.description,
                        "author": {
                            "@type": "Organization",
                            "name": "Recruiter in Your Pocket"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Recruiter in Your Pocket"
                        },
                        "datePublished": header.lastUpdated ? new Date(header.lastUpdated).toISOString() : undefined,
                        "dateModified": header.lastUpdated ? new Date(header.lastUpdated).toISOString() : undefined,
                    })
                }}
            />
            <div className="max-w-3xl mx-auto space-y-12 pb-16 px-6 md:px-0 pt-8">

                {/* 1. Header & Breadcrumb - Animated entrance */}
                <motion.header
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.slow, ease: EASE_SNAP }}
                >
                    <Link href="/research" className="inline-flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-brand transition-colors group">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Research
                    </Link>
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest border border-border px-2 py-1 rounded bg-secondary/50 text-muted-foreground">
                                {header.tag}
                            </span>
                            {(header.readTime || header.lastUpdated) && (
                                <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
                                    {header.readTime && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {header.readTime}
                                        </span>
                                    )}
                                    {header.lastUpdated && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Updated {header.lastUpdated}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                            {header.title}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            {header.description}
                        </p>
                    </div>
                </motion.header>

                {/* 2. Key Finding Card - Scale-up entrance */}
                <motion.div
                    className="bg-card border border-border/60 shadow-sm rounded-lg p-6 md:p-8 space-y-6"
                    initial={prefersReducedMotion ? {} : "hidden"}
                    animate="visible"
                    variants={prefersReducedMotion ? {} : KEY_FINDING_VARIANTS}
                >
                    <div className="flex items-center gap-2 text-brand font-semibold text-xs uppercase tracking-widest">
                        {keyFinding.icon}
                        <span>{keyFinding.subtitle}</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground tracking-tight">{keyFinding.stat}</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {keyFinding.statDescription}
                        </p>
                    </div>
                    <div className="pt-6 border-t border-border/40 text-xs font-mono text-muted-foreground/70 space-y-2">
                        <p className="flex items-center gap-2">
                            <span className="text-muted-foreground uppercase">Source:</span>
                            {keyFinding.source.href ? (
                                <a href={keyFinding.source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground underline underline-offset-4 decoration-border">
                                    {keyFinding.source.text}
                                </a>
                            ) : (
                                <span>{keyFinding.source.text}</span>
                            )}
                        </p>
                        {keyFinding.sampleSize && (
                            <p><span className="text-muted-foreground uppercase">Sample:</span> {keyFinding.sampleSize}</p>
                        )}
                    </div>
                </motion.div>

                {/* 3. Visualization Section (Optional) */}
                {visualization && (
                    <section className="my-12">
                        {visualization}
                    </section>
                )}

                {/* 4. Main Prose Content */}
                <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-p:text-base prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:font-medium prose-strong:text-foreground prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4">
                    {children}
                </article>

                <hr className="border-border/40 my-12" />

                {/* 5. Product Tie-In */}
                <div className="bg-card border border-border/60 shadow-sm rounded-lg p-6 md:p-8 transition-all hover:border-brand/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-6 w-1 bg-brand rounded-full" />
                        <h3 className="font-display text-xl font-medium text-foreground">How this shapes the product</h3>
                    </div>
                    <div className="grid gap-6">
                        {productTieIn.items.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                                <span className="font-mono text-xs text-muted-foreground/30 mt-1 shrink-0 group-hover:text-brand/50 transition-colors">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h4 className="font-medium text-foreground mb-1 group-hover:text-brand transition-colors">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Related Articles - Staggered entrance on scroll */}
                {relatedArticles && relatedArticles.length > 0 && (
                    <motion.div
                        ref={relatedRef as React.RefObject<HTMLDivElement>}
                        className="space-y-6"
                        initial="hidden"
                        animate={relatedVisible ? "visible" : "hidden"}
                        variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    >
                        <h3 className="font-display text-xl font-medium text-foreground">Related Research</h3>
                        <motion.div
                            className="grid gap-4"
                            variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                            initial="hidden"
                            animate={relatedVisible ? "visible" : "hidden"}
                        >
                            {relatedArticles.map((article, i) => (
                                <motion.div
                                    key={article.href ?? `related-${i}`}
                                    variants={prefersReducedMotion ? {} : STAGGER_ITEM}
                                >
                                    <Link
                                        href={article.href}
                                        className="group flex items-center justify-between p-4 border border-border/60 rounded-lg hover:border-brand/40 hover:bg-secondary/20 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.span
                                                initial={{ x: 0 }}
                                                whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                                                transition={{ duration: DURATION.normal, ease: EASE_SNAP }}
                                            >
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors" />
                                            </motion.span>
                                            <span className="text-foreground group-hover:text-brand transition-colors">{article.title}</span>
                                        </div>
                                        {article.tag && (
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">{article.tag}</span>
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {/* 7. Standard CTA - Scroll reveal */}
                <motion.div
                    ref={ctaRef as React.RefObject<HTMLDivElement>}
                    className="flex flex-col items-center justify-center gap-6 py-20"
                    initial="hidden"
                    animate={ctaVisible ? "visible" : "hidden"}
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                >
                    <h3 className="font-display text-2xl font-medium text-center">{cta.title}</h3>
                    <Link href={cta.href}>
                        <Button variant="studio" size="lg" className="px-8 h-12 shadow-sm">
                            {cta.buttonText}
                        </Button>
                    </Link>
                </motion.div>

            </div>
        </StudioShell>
    );
}

// Re-export common insights for use inside the article body

export function ArticleInsight({ icon, title, desc }: { icon: ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 border border-border/60 rounded-lg bg-background hover:bg-secondary/10 transition-colors">
            <div className="flex items-center gap-2 mb-3 text-foreground font-medium">
                {icon}
                <span className="font-display text-lg tracking-tight">{title}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    )
}

