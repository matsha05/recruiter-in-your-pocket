import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ScanPattern } from "@/components/research/diagrams/ScanPattern";

export const metadata: Metadata = {
    title: "How People Scan Resumes | Hiring Research",
    description: "Eye tracking research on scan patterns and resume readability.",
};

export default function HowPeopleScanPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Usability research",
                title: "How People Scan Resumes",
                description: "How readers scan resumes for structure, signal, and proof that it is worth their time to look closer.",
                lastUpdated: "December 2025",
                readTime: "3 min read"
            }}
            keyFinding={{
                subtitle: "The Known Pattern",
                stat: "The F-Pattern",
                statDescription: (
                    <>
                        Eyes scan horizontally at the top, then shorter horizontal movements below, then scan the left margin.
                        <Citation id="source-1">1</Citation>
                        Resume-specific eye tracking shows attention clustering around headers and recent-role anchors.
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Nielsen Norman Group (2006-2020)",
                    href: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/"
                },
                sampleSize: (
                    <>
                        Observed across multiple usability studies
                        <Citation id="source-1">1</Citation>
                    </>
                )
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">The Scan Pattern Transfer</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        General web reading patterns transfer when resumes are structured with clear left-edge anchors.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                    <ScanPattern />
                </>
            }
            productTieIn={{
                title: "Optimizing for the Scan",
                items: [
                    {
                        title: "Readability Score",
                        description: "We calculate formatting consistency and density to give you a 'Scan Score'."
                    },
                    {
                        title: "Report Structure",
                        description: "Our report itself is designed to be scanned, modeling the behavior we teach."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Spelling Errors Impact", href: "/research/spelling-errors-impact", tag: "Heuristics" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Structure" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "F-Shaped Pattern for Reading Web Content",
                    publisher: "Nielsen Norman Group",
                    year: "2006-2020",
                    href: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/"
                },
                {
                    id: "source-2",
                    title: "TheLadders Eye-Tracking Study",
                    publisher: "TheLadders",
                    year: "2012",
                    href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                },
                {
                    id: "source-3",
                    title: "TheLadders Eye-Tracking Study (2018 Update)",
                    publisher: "TheLadders",
                    year: "2018",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is the F-pattern proven on resumes?",
                    answer: "The F-pattern is a general web reading pattern. Resume eye-tracking shows attention clustering around headers and recent roles, which aligns with the left-edge scan behavior."
                },
                {
                    question: "Do two-column resumes hurt scanning?",
                    answer: "Two-column layouts can work but are easier to misread by both humans and parsers. The safest path is a single column with strong left-edge anchors."
                },
                {
                    question: "What is the fastest way to improve scanability?",
                    answer: "Use consistent headings, front-load role titles and companies, and keep bullets to one idea each."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Scanning vs Reading</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Readers skim under pressure. They look for anchors: headers, numbers, company names.
                Dense paragraphs often fail the scan test.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Structure Wins"
                    desc={
                        <>
                            Predictable layouts let eyes move faster with more confidence.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="One Idea Per Bullet"
                    desc={
                        <>
                            Recruiter lens: single-idea bullets are easier to scan than multi-idea paragraphs.
                        </>
                    }
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: scan anchors</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Scan anchors are the small pieces of text that let a reader orient quickly: role titles, company names,
                dates, and measurable outcomes. Without anchors, the page reads as a blur.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">What this means for bullet writing</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Make each bullet scannable. Lead with the result or the action, then add context.
                If the first three words are vague, the rest will not be read.
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Eye-tracking is a proxy for attention, not for final decisions.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Different roles create different scanning priorities.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Resumes are not web pages, so the pattern is directional, not exact.</li>
            </ul>
        </ResearchArticle>
    );
}
