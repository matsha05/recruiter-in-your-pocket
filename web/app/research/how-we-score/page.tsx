import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";

export const metadata: Metadata = {
    title: "The 7.4-Second Signal Model | How We Score Resumes",
    description: "The framework we use to evaluate resumes: Story, Impact, Clarity, and Readability — and why Story matters most.",
};

export default function HowWeScorePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Methodology",
                title: "The 7.4-Second Signal Model",
                description: "Every resume tells a story. Here is how we measure first-impression signal and what you can do about it.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Core Principle",
                stat: "Story First",
                statDescription: "Internal signal: narrative coherence is the primary dimension we emphasize in scoring — above keywords or formatting.",
                source: {
                    text: "RIYP methodology based on recruiter behavior research",
                    href: "/research/how-recruiters-read"
                },
                sampleSize: "Internal synthesis informed by recruiter behavior research"
            }}
            productTieIn={{
                title: "How Recruiter in Your Pocket applies this",
                items: [
                    {
                        title: "The 7.4-Second Verdict",
                        description: "Your overall score reflects the signal strength a recruiter perceives in those crucial first moments."
                    },
                    {
                        title: "Signal Analysis",
                        description: "We break down Story, Impact, Clarity, and Readability so you know exactly where to focus."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Actually Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "Quantifying Impact on Resumes", href: "/research/quantifying-impact", tag: "Research" },
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
            {/* The Why */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why resumes fail</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Most resumes are lists of responsibilities disguised as accomplishments.
                &quot;Managed a team of 5&quot; tells me nothing. &quot;Scaled product org from 2 to 5 PMs while shipping 3 major releases&quot; tells me you can build.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The difference isn&apos;t just word choice — it&apos;s narrative structure. Good resumes answer an implicit question:
                <em className="text-foreground"> &quot;Why should I believe this person can do the job I&apos;m hiring for?&quot;</em>
            </p>

            {/* The Framework */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">The four dimensions</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
                We score resumes across four dimensions, weighted by how strongly they shape recruiter impressions.
                Each dimension is scored 0–100 based on how clearly your resume signals that quality.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-12">
                <ArticleInsight
                    title="Story (Highest Weight)"
                    desc="Is there a coherent narrative? Can I tell where you&apos;ve been, what you&apos;ve done, and where you&apos;re going? This is the most important signal."
                />
                <ArticleInsight
                    title="Impact"
                    desc="Do you quantify outcomes? Numbers, percentages, revenue, users — concrete evidence that you moved needle."
                />
                <ArticleInsight
                    title="Clarity"
                    desc="Is your language precise and jargon-free? Can a non-expert understand what you actually did?"
                />
                <ArticleInsight
                    title="Readability"
                    desc="Is the formatting clean? Are bullets scannable? Does the visual hierarchy guide the recruiter&apos;s eye?"
                />
            </div>

            {/* Story deep dive */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">Why Story matters most</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                When a recruiter opens your resume, they&apos;re not reading — they&apos;re pattern-matching.
                They&apos;re asking: &quot;Does this person make sense for this role?&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                A strong Story score means your career progression is legible. Your job titles connect.
                Your accomplishments build on each other. The recruiter doesn&apos;t have to work to understand who you are.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                A weak Story score means there are gaps, inconsistencies, or missing context.
                You might be a great candidate, but you&apos;re making the recruiter do the mental labor of piecing it together —
                and in 7.4 seconds, they won&apos;t.
                <Citation id="source-1">1</Citation>
            </p>

            {/* The Thresholds */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">What the scores mean</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                We calibrated our thresholds internally based on recruiter feedback patterns and review discussions.
            </p>

            <div className="not-prose border-t border-border/30 divide-y divide-border/30 mb-8">
                <div className="flex items-start gap-5 py-4">
                    <span className="text-2xl font-serif font-semibold text-foreground">85+</span>
                    <div>
                        <p className="text-sm font-medium text-foreground">Strong Signal</p>
                        <p className="text-sm text-muted-foreground">Clear narrative, quantified impact, clean presentation. You&apos;re competing at the top.</p>
                    </div>
                </div>
                <div className="flex items-start gap-5 py-4">
                    <span className="text-2xl font-serif font-semibold text-foreground">70–84</span>
                    <div>
                        <p className="text-sm font-medium text-foreground">Solid</p>
                        <p className="text-sm text-muted-foreground">Good foundation, but opportunities to sharpen. Usually 1-2 key improvements will push you up.</p>
                    </div>
                </div>
                <div className="flex items-start gap-5 py-4">
                    <span className="text-2xl font-serif font-semibold text-foreground">&lt;70</span>
                    <div>
                        <p className="text-sm font-medium text-foreground">Needs Work</p>
                        <p className="text-sm text-muted-foreground">Significant friction points that may cause quick rejections. Focus on the highest-leverage fixes first.</p>
                    </div>
                </div>
            </div>

            {/* The Bottom Line */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">The bottom line</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Your resume is not a document — it&apos;s a first impression compressed into a page.
                In those 7.4 seconds, a recruiter forms a hypothesis about you. Our job is to make sure that hypothesis is accurate —
                and compelling.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed">
                The 7.4-Second Signal Model isn&apos;t about gaming algorithms or stuffing keywords.
                It&apos;s about telling your story clearly enough that the right recruiter can recognize it instantly.
            </p>
        </ResearchArticle>
    );
}
