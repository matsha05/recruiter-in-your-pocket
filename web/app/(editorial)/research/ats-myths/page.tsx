import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ATSFunnel } from "@/components/research/diagrams/ATSFunnel";

export const metadata: Metadata = {
    title: "ATS: How Applicant Tracking Systems Actually Work | Hiring Research",
    description: "What current Greenhouse and Lever documentation shows about resume parsing and what it does not prove.",
};

export default function ATSMythsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Platform documentation",
                title: "What applicant tracking systems do",
                description: "What current platform documentation says about parsing, extracted fields, and the formatting that can get lost.",
                lastUpdated: "July 2026",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The useful distinction",
                label: "What the documentation says",
                stat: "Parsing extracts information from your resume",
                statDescription: (
                    <>
                        Greenhouse and Lever document resume parsing as the extraction of readable information into candidate fields. Parsing trouble can lose or scramble information; it is not proof of one universal rejection score.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Greenhouse and Lever parser documentation",
                    href: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">From a file to a recruiter record</h2>
                    <p className="research-body mb-6">
                        The parser reads the file, extracts information such as contact details and work history, and places it into structured fields. Employer rules, searches, filters, and human review happen after that and vary by system and company.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                    <ATSFunnel />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Readable resume text",
                        description: "We extract text from uploaded files and review its structure. Check that the extracted text includes your sections in the right order."
                    },
                    {
                        title: "A resume score, not an ATS score",
                        description: "Our score summarizes the resume report. It does not reproduce an employer's screening settings or predict whether a filter will accept your application."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Human vs. Algorithm", href: "/research/human-vs-algorithm", tag: "AI" },
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Research" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Unsuccessful resume parse",
                    publisher: "Greenhouse Support",
                    year: "2026",
                    href: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse"
                },
                {
                    id: "source-2",
                    title: "Understanding Resume Parsing",
                    publisher: "Lever Help Center",
                    year: "2025",
                    href: "https://help.lever.co/hc/en-us/articles/20087345054749-Understanding-resume-parsing"
                },
                {
                    id: "source-3",
                    title: "Employment Tests and Selection Procedures",
                    publisher: "EEOC",
                    year: "2007",
                    href: "https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures"
                },
                {
                    id: "source-4",
                    title: "Candidate and prospect filters",
                    publisher: "Greenhouse Support",
                    year: "2026",
                    href: "https://support.greenhouse.io/hc/en-us/articles/360043184152-Candidate-and-prospect-filters"
                }
            ]}
            faq={[
                {
                    question: "Do ATS systems automatically reject resumes?",
                    answer: "Some employer workflows can filter or reject based on configured rules. The parser itself is the extraction step, and there is no single behavior shared by every ATS and employer."
                },
                {
                    question: "Is keyword stuffing useful?",
                    answer: "No. Use the language of the role where it truthfully describes your experience, but do not stuff hidden or repetitive keyword blocks into the file."
                },
                {
                    question: "What is the best ATS-safe format?",
                    answer: "A single-column layout with clear headings, consistent dates, and standard section names is the safest baseline."
                }
            ]}
        >
            <h2 className="research-h2">What the parser actually does</h2>
            <p className="research-body mb-6">
                Current Greenhouse and Lever documentation describes parsers that extract readable information from a resume and populate candidate fields such as contact information and work history.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Stored-data filters"
                    desc={
                        <>
                            Recruiters can filter stored applications by fields such as status, source, education, and custom application data. That is separate from whether the resume text parsed correctly.
                            <Citation id="source-4">4</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Search & Discovery"
                    desc={
                        <>
                            Once information is stored, recruiters may search, filter, and review it according to the employer&apos;s workflow.
                            <Citation id="source-4">4</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">What can actually break</h2>
            <p className="research-body">
                Greenhouse lists image-based resumes, graphics, word art, complex tables, headers, footers, text boxes, and columned layouts among formatting patterns that can produce unsuccessful or partial parsing. Lever notes that image files are not parseable and recommends checking whether the document text can be highlighted.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">Parsing is not the whole selection process</h2>
            <p className="research-body mb-6">
                ATS products can also expose search and filter tools, and employer workflows differ by configuration. When software influences employment decisions, EEOC guidance says employers still need to consider job-relatedness and adverse impact.
                <Citation id="source-4">4</Citation>
                <Citation id="source-3">3</Citation>
            </p>

            <h2 className="research-h2">Practical takeaways</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use standard section headers so both parsers and humans can navigate quickly.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Write role titles and core skills in plain language, not internal jargon.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Avoid graphics or tables that disrupt parsing and readability.</li>
            </ul>
        </ResearchArticle>
    );
}
