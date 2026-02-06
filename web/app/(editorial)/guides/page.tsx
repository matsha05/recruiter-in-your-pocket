"use client";

import Link from "next/link";
import { motion } from "framer-motion";
// SiteHeader removed — layout handles navigation
import Footer from "@/components/landing/Footer";
import { ArrowRight, BookOpen, Building2, Briefcase } from "lucide-react";

/**
 * Guides Landing Page
 * 
 * Separate section for actionable playbooks (vs research which is evidence-based)
 */

const guides = [
    {
        id: "tech-offer-negotiation",
        title: "Tech Salary Negotiation",
        subtitle: "The playbook insiders already use",
        description: "Equity, levels, RSUs, and the full comp stack. Everything you need to negotiate a tech offer with confidence.",
        readTime: "15 min",
        href: "/guides/tech-offer-negotiation",
        badge: "Most Popular",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        )
    },
    {
        id: "offer-negotiation",
        title: "Offer Negotiation",
        subtitle: "The universal playbook",
        description: "Negotiation principles that work across industries — from healthcare to hospitality. The psychology is the same.",
        readTime: "12 min",
        href: "/guides/offer-negotiation",
        badge: "All Industries",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    }
];

export default function GuidesPage() {
    return (
        <>
            <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
                {/* Hero */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16 max-w-2xl mx-auto"
                >
                    <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-foreground bg-muted px-3 py-1.5 rounded-full mb-6">
                        Actionable Playbooks
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight leading-tight mb-4">
                        Resources
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Step-by-step playbooks for the moments that matter. Written from the recruiter&apos;s side of the table.
                    </p>
                </motion.header>

                {/* Guide Cards */}
                <div className="space-y-6">
                    {guides.map((guide, i) => (
                        <motion.div
                            key={guide.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Link href={guide.href} className="group block">
                                <div className="rounded-2xl border border-border/40 bg-white dark:bg-card p-8 transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5">
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-300 shrink-0">
                                            {guide.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                    {guide.badge}
                                                </span>
                                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                                    {guide.readTime}
                                                </span>
                                            </div>
                                            <h2 className="font-display text-2xl font-medium text-foreground group-hover:text-brand transition-colors mb-1">
                                                {guide.title}
                                            </h2>
                                            <p className="text-base text-muted-foreground mb-3">
                                                {guide.subtitle}
                                            </p>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {guide.description}
                                            </p>
                                        </div>
                                        <div className="md:self-center">
                                            <div className="w-10 h-10 rounded-full bg-muted/50 group-hover:bg-brand/10 flex items-center justify-center transition-colors">
                                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Tools Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="mt-12"
                >
                    <h2 className="font-display text-lg font-medium text-foreground mb-4">Tools</h2>
                    <Link href="/guides/tools/comp-calculator" className="group block">
                        <div className="rounded-xl border border-border/40 bg-muted/20 p-6 transition-all duration-300 hover:border-brand/40 hover:bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="4" y="2" width="16" height="20" rx="2" />
                                        <line x1="8" y1="6" x2="16" y2="6" />
                                        <line x1="8" y1="10" x2="16" y2="10" />
                                        <line x1="8" y1="14" x2="12" y2="14" />
                                        <line x1="8" y1="18" x2="12" y2="18" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-foreground group-hover:text-brand transition-colors">
                                        Comp Comparison Calculator
                                    </h3>
                                    <p className="text-sm text-foreground/80">
                                        Compare two offers side-by-side. See Year 1 and 4-year totals.
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Research Cross-link */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-16 text-center"
                >
                    <p className="text-sm text-foreground mb-4">
                        Looking for the evidence behind the advice?
                    </p>
                    <Link href="/research" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline underline-offset-4">
                        <BookOpen className="w-4 h-4" />
                        Browse the Research Library
                    </Link>
                </motion.div>
            </main>

            <Footer />
        </>
    );
}
