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
                description: "Hiring automation is not one bot. It is a chain of systems that can shape exposure, eligibility, ranking, and review.",
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
                        Automation isn&apos;t just &quot;scanning keywords&quot; at the end. It starts before you even see the job ad.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <AutomationPipeline />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Reduce system friction",
                        description: "We use conventional structure and explicit evidence so both systems and people have less to decode."
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
                    answer: "No. A resume can only reduce avoidable noise, not systemic bias."
                },
                {
                    question: "What should candidates do?",
                    answer: "Candidates cannot fix systemic bias. They can keep the file readable and make relevant experience explicit so avoidable parsing failures do not become another problem."
                }
            ]}
        >
            <h2 className="research-h2">One hiring process, several decision points</h2>
            <p className="research-body mb-6">
                Most candidate advice focuses on resume parsing. The Upturn report shows a wider system: job advertising, sourcing, screening, assessment, and ranking can each involve automated decisions. If an ad is not delivered to someone, that person cannot enter the applicant pool at all.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                We cannot fix the ad servers. Once you <em className="text-foreground">are</em> in the pipeline, clear structure can reduce parser friction and make your qualifications easier to interpret.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">When the system changes who gets seen</h2>
            <p className="research-body mb-6">
                Exposure bias happens when the system decides who sees a job or who is surfaced first. Candidates who are not surfaced never get evaluated.
                <Citation id="source-1">1</Citation>
            </p>
        </ResearchArticle>
    );
}
