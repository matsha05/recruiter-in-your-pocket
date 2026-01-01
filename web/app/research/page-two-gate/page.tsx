import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ResumeLengthChart } from "@/components/research/diagrams/ResumeLengthChart";

export const metadata: Metadata = {
    title: "The Page-2 Gate | Hiring Research",
    description: "Why page 2 is earned by page 1, not by rules.",
};

export default function PageTwoGatePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume structure",
                title: "The page-2 gate",
                description: "Page 2 is not forbidden. It is earned by clarity on page 1.",
                lastUpdated: "December 2025",
                readTime: "3 min read"
            }}
            keyFinding={{
                subtitle: "The Gate",
                stat: "Page 1 Earns Page 2",
                statDescription: (
                    <>
                        TheLadders reports that attention on page 2 depends on how compelling page 1 is.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "TheLadders Eye-Tracking Study",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Signal density vs scan cost</h2>
                    <p className="research-body mb-6">
                        If the first page is dense but clear, the reader continues. If it is dense and noisy, they do not.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ResumeLengthChart />
                </>
            }
            productTieIn={{
                title: "How RIYP uses this",
                items: [
                    {
                        title: "Page-1 focus",
                        description: "We prioritize the first page because it governs everything that follows."
                    },
                    {
                        title: "Density warnings",
                        description: "We flag crowded sections that increase scan cost without adding signal."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Resume Length: What Research Says", href: "/research/resume-length-myths", tag: "Structure" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "How People Scan", href: "/research/how-people-scan", tag: "Behavior" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "TheLadders Eye-Tracking Study (2018 Update)",
                    publisher: "TheLadders",
                    year: "2018",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                },
                {
                    id: "source-2",
                    title: "TheLadders Eye-Tracking Study",
                    publisher: "TheLadders",
                    year: "2012",
                    href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is page 2 a red flag?",
                    answer: "Not if page 1 is clear and page 2 adds relevant evidence. The first page still decides whether the second is read."
                },
                {
                    question: "How should I decide what goes on page 1?",
                    answer: "Put your strongest, most relevant evidence on page 1. Make it easy to scan in seconds."
                },
                {
                    question: "Does this apply to technical resumes?",
                    answer: "Yes. Technical readers still scan quickly. Structure matters as much as content."
                }
            ]}
        >
            <h2 className="research-h2">When two pages make sense</h2>
            <p className="research-body mb-6">
                Recruiter lens: two pages is acceptable when the first page is clear and the second page continues a coherent signal.
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Signal > Length"
                    desc="Clear structure beats arbitrary page limits."
                />
                <ArticleInsight
                    title="Noisy pages fail"
                    desc="Dense, cluttered layouts raise scan cost and reduce attention." 
                />
            </div>

            <h2 className="research-h2">How to earn page 2</h2>
            <p className="research-body mb-6">
                Recruiter lens: page 2 is earned by strong signal density on page 1. The reader needs proof quickly.
                <Citation id="source-1">1</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Lead with your strongest, most relevant outcomes.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use tight headers to anchor scan paths.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Cut duplication before adding new sections.</li>
            </ul>

            <h2 className="research-h2">What to cut from page 1</h2>
            <p className="research-body mb-6">
                Recruiter lens: the gate fails when page 1 is crowded with low-signal content.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Generic summaries and filler sentences.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Redundant bullets that repeat the same outcome.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Long lists of tools without evidence of impact.</li>
            </ul>

            <h2 className="research-h2">Definition: page-1 gate</h2>
            <p className="research-body mb-6">
                The page-1 gate is the idea that page 2 is only read if page 1 proves the resume is worth more time.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Some roles require lists of publications, patents, or certifications.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Executive or academic resumes can legitimately run longer.</li>
            </ul>
        </ResearchArticle>
    );
}
