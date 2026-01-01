import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ResumeHeatmap } from "@/components/research/diagrams/ResumeHeatmap";

export const metadata: Metadata = {
    title: "How Recruiters Actually Read Resumes | Hiring Research",
    description: "Eye tracking research on recruiter scanning behavior and first impressions.",
};

export default function HowRecruitersReadPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Eye-tracking research",
                title: "How Recruiters Actually Read Resumes",
                description: "Eye tracking research on how recruiters review resumes in real time.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Key Finding",
                stat: "7.4 Seconds",
                statDescription: (
                    <>
                        The 2018 update reports an average 7.4 second initial screen for fit or no fit.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "TheLadders Eye-Tracking Update (2018 PDF)",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                },
                sampleSize: (
                    <>
                        2012 study: 30 professional recruiters reviewing 300+ resumes
                        <Citation id="source-2">2</Citation>
                    </>
                )
            }}
            visualization={
                <>
                    <h2 className="research-h2">Visualizing the 7.4 Seconds</h2>
                    <p className="research-body mb-6">
                        The composite view below blends the 2012 heatmap detail with the 2018 timing update. The red zones show the most intense fixation.
                        <Citation id="source-2">2</Citation>
                    </p>
                    <ResumeHeatmap />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this research",
                items: [
                    {
                        title: "Recruiter First Impression",
                        description: "We explicitly model the first-impression window to show you what stands out."
                    },
                    {
                        title: "Bullet Upgrades",
                        description: "We push numbers to the front because that is where the eye naturally falls."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How People Scan Resumes", href: "/research/how-people-scan", tag: "Psychology" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Research" },
                { title: "The STAR Method", href: "/research/star-method", tag: "Format" }
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
                },
                {
                    id: "source-3",
                    title: "Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume",
                    publisher: "MDPI Applied Sciences",
                    year: "2023",
                    href: "https://www.mdpi.com/2504-4990/5/3/38"
                }
            ]}
            faq={[
                {
                    question: "What does the 7.4-second screen actually mean?",
                    answer: "It is the average initial screen duration reported in the 2018 update. It is not the final decision, but it often determines whether deeper review happens."
                },
                {
                    question: "Do recruiters really ignore the bottom half of the page?",
                    answer: "Eye-tracking shows attention concentrates on the header and most recent role. Lower sections still matter, but they are less likely to be seen in the first pass."
                },
                {
                    question: "Is this true for every industry?",
                    answer: "No. The cited studies are helpful but limited in sample and context. Use them to guide structure, not as universal rules."
                }
            ]}
        >
            <p className="research-body mb-6">
                TheLadders published its original eye tracking study in 2012 and reported roughly 6 seconds for the initial screen.
                The 2018 update reported 7.4 seconds. We use the 7.4-second figure for timing and keep the 2012 report as the best source for heatmap detail.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                Read the{" "}
                <a
                    href="https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 decoration-border hover:text-foreground"
                >
                    2018 update
                </a>{" "}
                and the{" "}
                <a
                    href="https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 decoration-border hover:text-foreground"
                >
                    2012 report
                </a>
                .
            </p>
            <h2 className="research-h2">The skim pattern</h2>
            <p className="research-body mb-6">
                Recruiters are not reading every bullet point. They are scanning for fast answers:
                Who is this person now? Where do they work? What is their title? How long have they been doing it?
                <Citation id="source-2">2</Citation>
            </p>
            <p className="research-body mb-6">
                More recent research shows that time spent on specific sections can predict approval outcomes in controlled settings.
                <Citation id="source-3">3</Citation>
            </p>

            <h2 className="research-h2">Where eyes actually look</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="1. Name & Title"
                    desc={
                        <>
                            The name/title area receives the longest fixation time during the initial scan.
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="2. Current Role"
                    desc={
                        <>
                            After the header, eyes move to the most recent job, title, company, and dates.
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="3. Layout Quality"
                    desc={
                        <>
                            Resumes with clear headings and consistent formatting got more focused attention.
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="4. Dense Text"
                    desc={
                        <>
                            Recruiter lens: dense paragraphs often receive less attention during the initial skim.
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">Definition: the initial screen</h2>
            <p className="research-body mb-6">
                The initial screen is the first pass where a recruiter decides whether a resume is worth deeper time.
                It is a fast filter, not a final verdict. The goal is to make the right signals visible in the first moments.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What this means for resume design</h2>
            <p className="research-body mb-6">
                Put the most important evidence where the eye naturally goes: the header and the first role block.
                Make role titles, companies, and measurable outcomes easy to pick up without reading full sentences.
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Eye-tracking samples are limited and do not represent every industry.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Scanning behavior varies by role, seniority, and volume of applicants.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>This describes first-pass behavior, not the later deep review.</li>
            </ul>
        </ResearchArticle>
    );
}
