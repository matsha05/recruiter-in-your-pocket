import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { ATSFunnel } from "@/components/research/diagrams/ATSFunnel";
import { Server, Filter, Search } from "lucide-react";

export const metadata: Metadata = {
    title: "ATS: How Applicant Tracking Systems Actually Work | Hiring Research",
    description: "Understanding how ATS systems store, rank, and surface candidates.",
};

export default function ATSMythsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry research",
                title: "ATS: How They Actually Work",
                description: "ATS systems store, rank, and help recruiters search candidates. They rarely auto-reject based on resume content alone. The real gate is human attention."
            }}
            keyFinding={{
                icon: <Server className="w-4 h-4" />,
                subtitle: "The Reality",
                stat: "It's a Database, not a Guard",
                statDescription: "\"Auto-reject\" typically only triggers on knockout questions (Visa, License), not keywords.",
                source: {
                    text: "Hunkenschroer & Luetge (2022) Ethics of AI Recruiting",
                    href: "https://link.springer.com/article/10.1007/s10551-022-05049-6"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Visualizing the Bottleneck</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        The real reason resumes don't get seen isn't an algorithm. It's math. There are too many applicants for the number of recruiters.
                    </p>
                    <ATSFunnel />
                </>
            }
            productTieIn={{
                title: "How we optimize for this",
                items: [
                    {
                        title: "Clarity over Keywords",
                        description: "We focus on clear, standard language so both the parser AND the human understand you."
                    },
                    {
                        title: "No \"Beat the Bot\" Tricks",
                        description: "We don't sell fear. We sell standard, readable formatting."
                    }
                ]
            }}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">What an ATS actually does</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Most ATS systems function as workflow engines. They store candidate data, support filtering, and enable recruiters to search.
                They are fundamentally different from the popular image of a robot auto-deleting resumes.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose not-prose my-8">
                <ArticleInsight
                    icon={<Filter className="w-4 h-4" />}
                    title="Knockout Questions"
                    desc="Filters for work authorization or required degrees. This is where auto-rejection happens."
                />
                <ArticleInsight
                    icon={<Search className="w-4 h-4" />}
                    title="Search & Discovery"
                    desc="Recruiters use keywords to find people in the database. If you aren't found, you aren't seen."
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Where the '75%' myth comes from</h2>
            <p className="text-muted-foreground leading-relaxed">
                The claim that "75% of resumes are never seen" is a misunderstanding. It's not that a robot deleted them.
                It's that <strong>recruiters are busy</strong>. If 1,000 people apply, a human might only have time to open 50.
                The bottleneck is human time, not AI malice.
            </p>
        </ResearchArticle>
    );
}
