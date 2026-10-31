import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";

export const metadata: Metadata = {
    title: "Tell the story behind the line",
    description: "Situation, task, action, result: how to use STAR on a resume line and in a structured interview without forcing the formula.",
};

export default function StarMethodPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Story",
                title: "Tell the story behind the line",
                description: "A resume line is the headline. The interview asks for the story underneath it. STAR keeps both honest, as long as you don't treat it as a formula.",
                lastUpdated: "October 2026",
                readTime: "6 min read"
            }}
            keyFinding={{
                subtitle: "What the evidence supports",
                stat: "Shared questions, shared scoring",
                statDescription: (
                    <>
                        Structured interviews ask every candidate job-related questions and rate the answers against standards set in advance. The more structured the interview, the more consistent and predictive the ratings.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Levashina et al., structured interview review",
                    href: "https://apps.it.purdue.edu/sites/Home/DirectoryApi/Files/42d5154c-ccc5-403e-b3ed-edd69e3f6896/Download"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">The four parts of a work story</h2>
                    <p className="research-body mb-6">
                        STAR is a way to organize an example from your own work: what was going on, what was yours to do, what you did, and what happened. It&apos;s a checklist, not a template.
                    </p>
                    <StarStructureDiagram />
                </>
            }
            productTieIn={{
                title: "Where this shows up in your report",
                items: [
                    {
                        title: "The Critical Miss",
                        description: "When a line hides your part or the result, the Critical Miss usually says so first. Fixing it gives you the headline of a story you can tell."
                    },
                    {
                        title: "Your score",
                        description: "The score weighs whether a recruiter can follow what you did. A line they can follow is one you can expand on in the interview."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Show what changed and your part in it", href: "/research/quantifying-impact", tag: "Impact" },
                { title: "What recruiters notice in the first pass", href: "/research/how-recruiters-read", tag: "Perception" },
                { title: "What a referral changes", href: "/research/referral-advantage", tag: "Referrals" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "The Structured Employment Interview: Narrative and Quantitative Review of the Research Literature",
                    publisher: "Levashina, Hartwell, Morgeson & Campion. Personnel Psychology",
                    year: "2014",
                    href: "https://apps.it.purdue.edu/sites/Home/DirectoryApi/Files/42d5154c-ccc5-403e-b3ed-edd69e3f6896/Download"
                },
                {
                    id: "source-2",
                    title: "Structured Interviews",
                    publisher: "U.S. Office of Personnel Management",
                    year: "Current guidance",
                    href: "https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/structured-interviews/"
                }
            ]}
            faq={[
                {
                    question: "Do I need all four parts in every resume line?",
                    answer: "No. What you did and what changed matter most. The role title and the lines around it usually supply the situation."
                },
                {
                    question: "Will every interview question ask about the past?",
                    answer: "No. Some ask what you would do in a situation. For those, walk through your reasoning and what you'd need to know before deciding."
                },
                {
                    question: "Should I memorize my answers?",
                    answer: "Memorize the facts, not the script. You'll need room to answer the question actually asked and to handle follow-ups."
                }
            ]}
        >
            <h2 className="research-h2">On the resume: the headline</h2>
            <p className="research-body mb-6">
                Don&apos;t force four labeled parts into a bullet. A strong line names what you did, gives just enough context to follow it, and says what changed when you know. The role title usually covers the situation.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
                Fictional examples. Only use details like these if they&apos;re true for you.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-6">
                <ArticleInsight
                    title="Before"
                    desc="“Worked on the customer support team handling inquiries.”"
                />
                <ArticleInsight
                    title="After"
                    desc="“Handled billing escalations and wrote the troubleshooting guide the team now uses for repeat issues.”"
                />
            </div>
            <p className="research-body mb-6">
                The second line says what was yours and what it left behind. There&apos;s no invented number, and it doesn&apos;t need one. It&apos;s also the start of an interview answer.
            </p>

            <h2 className="research-h2">In the interview: the story</h2>
            <p className="research-body mb-6">
                In a structured interview, the employer picks the skills that matter for the job and sets the questions and rating standards in advance. Every candidate gets the same test.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                {" "}Expect two kinds of questions.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-6">
                <ArticleInsight
                    title="What did you do?"
                    desc="A behavioral question asks about a real example. Pick one that shows the skill they're asking about."
                />
                <ArticleInsight
                    title="What would you do?"
                    desc="A situational question asks about a hypothetical. Explain your reasoning and what you'd want to know first."
                />
            </div>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> go through the job description and pick a few examples from your resume that match it. For each, note the problem, what was yours, the choices you made, and what happened. In the room, pick the example that answers the question they actually asked.
            </p>
            <div className="not-prose mb-6 rounded-inset border border-line bg-card p-5">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Example prep notes</p>
                <p className="text-foreground">
                    If you&apos;ll talk about a delayed launch, be ready to say what caused the delay, which call was yours, who you brought in, and what happened after you changed the plan.
                </p>
            </div>

            <h2 className="research-h2">Check the story before you tell it</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Can someone tell what you did, apart from what the team did?</li>
                <li>Have you said why you chose that approach?</li>
                <li>Can you describe the outcome accurately, including what didn&apos;t work?</li>
            </ul>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The research is about how employers run interviews. It doesn&apos;t test the STAR acronym itself.</li>
                <li>No study cited here tests whether STAR-shaped resume lines get more interviews.</li>
            </ul>
        </ResearchArticle>
    );
}
