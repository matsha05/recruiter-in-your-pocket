import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { ResumeHeatmap } from "@/components/research/diagrams/ResumeHeatmap";
import { Eye, FileText, List, AlertCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "How Recruiters Actually Read Resumes | Hiring Research",
    description: "Eye tracking research reveals recruiters spend about 6 seconds on their initial decision.",
};

export default function HowRecruitersReadPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Eye-tracking research",
                title: "How Recruiters Actually Read Resumes",
                description: "Most advice about resumes is based on guesswork or recycled tips. This page is based on eye tracking research that watched recruiters as they reviewed resumes in real time.",
                lastUpdated: "December 2024",
                readTime: "4 min read"
            }}
            keyFinding={{
                icon: <Clock className="w-4 h-4" />,
                subtitle: "The Key Finding",
                stat: "6 Seconds",
                statDescription: "The average time spent on the initial \"fit/no-fit\" decision.",
                source: {
                    text: "TheLadders Eye-Tracking Study (2012)",
                    href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                },
                sampleSize: "30 professional recruiters reviewing 300+ resumes"
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Visualizing the 6 Seconds</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        The "Heatmap" below allows us to see exactly where attention is focused. The red areas indicate intense fixation.
                    </p>
                    <ResumeHeatmap />
                </>
            }
            productTieIn={{
                title: "How this shapes our tool",
                items: [
                    {
                        title: "Recruiter First Impression",
                        description: "We explicitly model this \"First 6 Seconds\" to show you what stands out."
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
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The skim pattern</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiters are not reading every bullet point. They are scanning for fast answers:
                Who is this person now? Where do they work? What is their title? How long have they been doing it?
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">Where eyes actually look</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    icon={<FileText className="w-4 h-4" />}
                    title="1. Name & Title"
                    desc="The name/title area receives the longest fixation time during the initial scan."
                />
                <ArticleInsight
                    icon={<List className="w-4 h-4" />}
                    title="2. Current Role"
                    desc="After the header, eyes move to the most recent job—title, company, and dates."
                />
                <ArticleInsight
                    icon={<Eye className="w-4 h-4" />}
                    title="3. Layout Quality"
                    desc="Resumes with clear headings and consistent formatting got more focused attention."
                />
                <ArticleInsight
                    icon={<AlertCircle className="w-4 h-4" />}
                    title="4. Dense Text"
                    desc="Paragraphs and cluttered bullets are skipped almost entirely."
                />
            </div>
        </ResearchArticle>
    );
}
