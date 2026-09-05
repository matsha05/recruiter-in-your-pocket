import type { Metadata } from "next";
import { ResearchArticle, Citation } from "@/components/research/ResearchArticle";
import { AutomationPipeline } from "@/components/research/diagrams/AutomationPipeline";

export const metadata: Metadata = {
    title: "Hiring algorithms, equity, and bias | Hiring Research",
    description: "Where automation enters the hiring funnel and where bias can enter with it.",
};

export default function AutomationBiasPage() {
    return (
        <ResearchArticle
            header={{
                tag: "ATS & Automation",
                title: "Where automation enters the hiring process",
                description: "Different tools can affect which job ads you see, whether your application is eligible, and how it reaches a reviewer.",
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The System",
                stat: "Bias can enter at several stages",
                statDescription: (
                    <>
                        The cited report maps risks in sourcing, screening, and assessment. A decision made early in the funnel can shape who remains available for later review; the report does not estimate one universal effect size.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Bogen & Rieke (2018), Upturn 'Help Wanted'",
                    href: "https://www.upturn.org/work/help-wanted/"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Where automation enters hiring</h2>
                    <p className="research-body mb-6">
                        Automated decisions can happen before you apply, including when a platform chooses who will see a job ad.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <AutomationPipeline />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Check the resume text",
                        description: "We review the text you submit and point out details that are missing or unclear. We cannot inspect the employer's advertising or screening tools."
                    },
                    {
                        title: "Separate fact from folklore",
                        description: "We separate what public research documents from what private platforms do not disclose."
                    }
                ]
            }}
            relatedArticles={[
                { title: "ATS Myths", href: "/research/ats-myths", tag: "Industry" },
                { title: "Human vs. Algorithm", href: "/research/human-vs-algorithm", tag: "Trust" },
                { title: "Hiring Discrimination", href: "/research/hiring-discrimination-meta-analysis", tag: "Research" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias",
                    publisher: "Upturn",
                    year: "2018",
                    href: "https://www.upturn.org/work/help-wanted/"
                },
                {
                    id: "source-2",
                    title: "Unsuccessful resume parse",
                    publisher: "Greenhouse Support",
                    year: "2026",
                    href: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse"
                }
            ]}
            faq={[
                {
                    question: "Where does bias enter the hiring funnel?",
                    answer: "Bias can enter at ad delivery, eligibility screening, ranking, assessment, and human review. An early decision can change who is available for every later stage."
                },
                {
                    question: "Can a resume fix algorithmic bias?",
                    answer: "No. Making a resume easier to read does not remove bias from the tools or decisions an employer uses."
                },
                {
                    question: "What should candidates do?",
                    answer: "Candidates cannot fix systemic bias. They can keep the file readable and make relevant experience explicit so avoidable parsing failures do not become another problem."
                }
            ]}
        >
            <h2 className="research-h2">One hiring process, several decision points</h2>
            <p className="research-body mb-6">
                The Upturn report examines job advertising, sourcing, screening, assessment, and ranking. Automated decisions can affect each stage. Someone who never sees a job ad may never learn about the opportunity.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Once you have an opportunity to apply, check that your file contains readable text and clear sections. That addresses a possible parsing problem, not the broader risks documented in the report.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">When the system changes who gets seen</h2>
            <p className="research-body mb-6">
                A system that decides who sees a job ad or appears in a search can change who receives attention. Candidates left out may still find another route to the employer, but the initial decision can limit their opportunity.
                <Citation id="source-1">1</Citation>
            </p>
        </ResearchArticle>
    );
}
