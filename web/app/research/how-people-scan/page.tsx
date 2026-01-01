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
                    </>
                ),
                source: {
                    text: "Nielsen Norman Group (2006-2020)",
                    href: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/"
                },
                sampleSize: (
                    <>
                        ~80% of users scan rather than read
                        <Citation id="source-1">1</Citation>
                    </>
                )
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The F-Pattern Visualized</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Our gaze naturally hugs the left margin, looking for keywords and headers.
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
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Scanning vs Reading</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Readers skim under pressure. They look for anchors: headers, numbers, company names.
                If your resume is a wall of text, it fails the scan test.
                <Citation id="source-1">1</Citation>
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
                            Multi-idea bullets get partially scanned. Single-idea bullets get fully processed.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>
        </ResearchArticle>
    );
}
