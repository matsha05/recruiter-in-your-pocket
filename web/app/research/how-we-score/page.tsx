import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { BookOpen, Target, Lightbulb, Eye, BarChart3, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
    title: "The 6-Second Signal Model | How We Score Resumes",
    description: "The research-backed framework we use to evaluate resumes: Story, Impact, Clarity, and Readability — and why Story matters most.",
};

export default function HowWeScorePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Methodology",
                title: "The 6-Second Signal Model",
                description: "Every resume tells a story. In 6 seconds, a recruiter decides whether yours is worth hearing. Here's exactly how we measure that signal — and what you can do about it.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                icon: <BookOpen className="w-4 h-4" />,
                subtitle: "The Core Principle",
                stat: "Story First",
                statDescription: "According to Recruiter in Your Pocket's analysis, the single most predictive signal of interview callbacks is narrative coherence — not keywords, not formatting.",
                source: {
                    text: "RIYP methodology based on recruiter behavior research",
                    href: "/research/how-recruiters-read"
                },
                sampleSize: "Synthesized from 10+ studies on recruiter decision-making"
            }}
            productTieIn={{
                title: "How Recruiter in Your Pocket applies this",
                items: [
                    {
                        title: "The 6-Second Verdict",
                        description: "Your overall score reflects the signal strength a recruiter perceives in those crucial first moments."
                    },
                    {
                        title: "Signal Analysis",
                        description: "We break down Story (60% weight), Impact, Clarity, and Readability so you know exactly where to focus."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Actually Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "Quantifying Impact on Resumes", href: "/research/quantifying-impact", tag: "Research" },
                { title: "The STAR Method", href: "/research/star-method", tag: "Format" }
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
                We score resumes across four dimensions, weighted by their predictive power for recruiter callbacks.
                Each dimension is scored 0–100 based on how clearly your resume signals that quality.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-12">
                <ArticleInsight
                    icon={<BookOpen className="w-4 h-4" />}
                    title="Story (Highest Weight)"
                    desc="Is there a coherent narrative? Can I tell where you&apos;ve been, what you&apos;ve done, and where you&apos;re going? This is the most important signal."
                />
                <ArticleInsight
                    icon={<Target className="w-4 h-4" />}
                    title="Impact"
                    desc="Do you quantify outcomes? Numbers, percentages, revenue, users — concrete evidence that you moved needle."
                />
                <ArticleInsight
                    icon={<Lightbulb className="w-4 h-4" />}
                    title="Clarity"
                    desc="Is your language precise and jargon-free? Can a non-expert understand what you actually did?"
                />
                <ArticleInsight
                    icon={<Eye className="w-4 h-4" />}
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
                and in 6 seconds, they won&apos;t.
            </p>

            {/* The Thresholds */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">What the scores mean</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                We calibrated our thresholds based on recruiter feedback patterns — how often resumes at different signal levels
                actually result in interview requests.
            </p>

            <div className="space-y-4 not-prose mb-8">
                <div className="flex items-center gap-4 p-4 bg-success/10 border border-success/20 rounded">
                    <span className="text-3xl font-serif font-bold text-success">85+</span>
                    <div>
                        <p className="font-medium text-foreground">Strong Signal</p>
                        <p className="text-sm text-muted-foreground">Clear narrative, quantified impact, clean presentation. You&apos;re competing at the top.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-premium/10 border border-premium/20 rounded">
                    <span className="text-3xl font-serif font-bold text-premium">70–84</span>
                    <div>
                        <p className="font-medium text-foreground">Solid</p>
                        <p className="text-sm text-muted-foreground">Good foundation, but opportunities to sharpen. Usually 1-2 key improvements will push you up.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-destructive/10 border border-destructive/20 rounded">
                    <span className="text-3xl font-serif font-bold text-destructive">&lt;70</span>
                    <div>
                        <p className="font-medium text-foreground">Needs Work</p>
                        <p className="text-sm text-muted-foreground">Significant friction points that may cause quick rejections. Focus on the highest-leverage fixes first.</p>
                    </div>
                </div>
            </div>

            {/* The Bottom Line */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">The bottom line</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Your resume is not a document — it&apos;s a first impression compressed into a page.
                In those 6 seconds, a recruiter forms a hypothesis about you. Our job is to make sure that hypothesis is accurate —
                and compelling.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                The 6-Second Signal Model isn&apos;t about gaming algorithms or stuffing keywords.
                It&apos;s about telling your story clearly enough that the right recruiter can recognize it instantly.
            </p>
        </ResearchArticle>
    );
}
