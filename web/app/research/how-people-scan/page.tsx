import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { ScanPattern } from "@/components/research/diagrams/ScanPattern";
import { Eye, Layout, AlignLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "How People Scan Resumes | Hiring Research",
    description: "Eyetracking research shows people scan resumes using F-shaped patterns.",
};

export default function HowPeopleScanPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Usability research",
                title: "How People Scan Resumes",
                description: "People don't read resumes line by line. They scan for structure, signal, and proof that it's worth their time to look closer."
            }}
            keyFinding={{
                icon: <Eye className="w-4 h-4" />,
                subtitle: "The Known Pattern",
                stat: "The F-Pattern",
                statDescription: "Eyes scan horizontally at the top, then shorter horizontal movements below, then scan the left margin.",
                source: {
                    text: "Nielsen Norman Group (2006-2020)",
                    href: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/"
                },
                sampleSize: "~80% of users scan rather than read"
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
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Scanning vs Reading</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiters are skimming under pressure. They look for anchors: Headers, Numbers, Company Names.
                If your resume is a wall of text, it fails the scan test.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    icon={<Layout className="w-4 h-4" />}
                    title="Structure Wins"
                    desc="Predictable layouts let eyes move faster with more confidence."
                />
                <ArticleInsight
                    icon={<AlignLeft className="w-4 h-4" />}
                    title="One Idea Per Bullet"
                    desc="Multi-idea bullets get partially scanned. Single-idea bullets get fully processed."
                />
            </div>
        </ResearchArticle>
    );
}
