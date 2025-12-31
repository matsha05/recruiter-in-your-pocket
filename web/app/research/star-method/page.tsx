import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";
import { MessageSquare, Target, Zap, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "The STAR Method: Structure That Works | Hiring Research",
    description: "The STAR method isn't just for interviews—it's also the best structure for resume bullets.",
};

export default function StarMethodPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Interview prep",
                title: "The STAR Method: Structure That Works",
                description: "Behavioral interviews dominate modern hiring. The STAR method—Situation, Task, Action, Result—is the framework that works for both interviews and resumes.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                icon: <MessageSquare className="w-4 h-4" />,
                subtitle: "The Structure",
                stat: "S → T → A → R",
                statDescription: "Situation, Task, Action, Result. A framework used by Amazon, Google, and most Fortune 500 companies.",
                source: {
                    text: "Amazon Leadership Principles Interview Guide",
                    href: "https://www.amazon.jobs/en/landing_pages/in-person-interview"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The STAR framework</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        A complete answer structure that works for behavioral interviews—and adapts to resume bullets.
                    </p>
                    <StarStructureDiagram />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Structure Detection",
                        description: "We identify bullets that lack clear results and suggest how to complete the story."
                    },
                    {
                        title: "Interview Prep Bridge",
                        description: "Strong resume bullets become the foundation for behavioral interview answers."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Quantifying Your Impact", href: "/research/quantifying-impact", tag: "Impact" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Format" }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why structure matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Unstructured answers ramble. Structured answers communicate competence. The STAR method
                forces you to tell a complete story with a clear outcome—exactly what interviewers
                are trained to listen for.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The same logic applies to resume bullets. A bullet that describes a situation and action
                but no result leaves the reader guessing. A complete STAR bullet answers: &quot;So what?&quot;
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">Breaking down STAR</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    icon={<Target className="w-4 h-4" />}
                    title="Situation"
                    desc="The context. What was happening? What was the problem or opportunity? Keep it brief."
                />
                <ArticleInsight
                    icon={<Zap className="w-4 h-4" />}
                    title="Task"
                    desc="Your specific responsibility. What were you asked to do? What was your role?"
                />
                <ArticleInsight
                    icon={<MessageSquare className="w-4 h-4" />}
                    title="Action"
                    desc="What you actually did. Be specific about your contributions, not the team&apos;s."
                />
                <ArticleInsight
                    icon={<CheckCircle className="w-4 h-4" />}
                    title="Result"
                    desc="The outcome. Quantify when possible. This is where most people undersell themselves."
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">STAR on a resume</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Resume bullets are compressed STAR stories. You don&apos;t have space for full narratives,
                but you should hit Action and Result explicitly, with Situation/Task implied by context.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Weak:</strong> &quot;Worked on the customer support team handling inquiries.&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Strong:</strong> &quot;Resolved 50+ daily customer escalations, reducing average
                resolution time from 4 hours to 45 minutes and improving satisfaction scores by 22%.&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed">
                The situation (customer support) is implied. The action (resolved escalations) and
                result (faster resolution, higher satisfaction) are explicit. That&apos;s STAR in one sentence.
            </p>
        </ResearchArticle>
    );
}
