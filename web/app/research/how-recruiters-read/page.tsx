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
                        The 2018 update reported a 7.4 second initial fit or no fit decision.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "TheLadders Eye-Tracking Update (2018)",
                    href: "https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html"
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
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Visualizing the 7.4 Seconds</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        The &quot;Heatmap&quot; below allows us to see exactly where attention is focused. The red areas indicate intense fixation.
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
                    title: "TheLadders Updates Popular Recruiter Eye-Tracking Study",
                    publisher: "TheLadders via PR Newswire",
                    year: "2018",
                    href: "https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html"
                },
                {
                    id: "source-2",
                    title: "TheLadders Eye-Tracking Study",
                    publisher: "TheLadders",
                    year: "2012",
                    href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                }
            ]}
        >
            <p className="text-muted-foreground leading-relaxed mb-6">
                TheLadders published its original eye tracking study in 2012 and reported about 6 seconds for the initial screen.
                The 2018 update reported 7.4 seconds. We use the 7.4-second figure for timing and keep the 2012 report as the best source for heatmap detail.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                Read the{" "}
                <a
                    href="https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html"
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
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The skim pattern</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiters are not reading every bullet point. They are scanning for fast answers:
                Who is this person now? Where do they work? What is their title? How long have they been doing it?
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">Where eyes actually look</h2>
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
                            After the header, eyes move to the most recent job—title, company, and dates.
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
                            Paragraphs and cluttered bullets are skipped almost entirely.
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
            </div>
        </ResearchArticle>
    );
}
