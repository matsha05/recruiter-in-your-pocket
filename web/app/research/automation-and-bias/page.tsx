import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { AutomationPipeline } from "@/components/research/diagrams/AutomationPipeline";
import { Bot, Network } from "lucide-react";

export const metadata: Metadata = {
    title: "Hiring algorithms, equity, and bias | Hiring Research",
    description: "Where automation enters the funnel and how bias compounds across stages.",
};

export default function AutomationBiasPage() {
    return (
        <ResearchArticle
            header={{
                tag: "ATS & Automation",
                title: "Hiring algorithms: Where automation enters the funnel",
                description: "It's not just one 'bot'. It's a chain of automated decisions. Expanding our ATS myths into screening systems education."
            }}
            keyFinding={{
                icon: <Bot className="w-4 h-4" />,
                subtitle: "The System",
                stat: "Compounding Bias",
                statDescription: "Bias isn't isolated; it amplifies as candidates move from ad targeting to screening to ranking.",
                source: {
                    text: "Bogen & Rieke (2018), Upturn 'Help Wanted'",
                    href: "https://www.upturn.org/work/help-wanted/"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The Automated Funnel</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Automation isn't just "scanning keywords" at the end. It starts before you even see the job ad.
                    </p>
                    <AutomationPipeline />
                </>
            }
            productTieIn={{
                title: "What this changes in RIYP",
                items: [
                    {
                        title: "Survive Systems",
                        description: "Our goal is to help you communicate clearly to humans AND survive system filters."
                    },
                    {
                        title: "Screening Education",
                        description: "We explain exactly how these tools work so you can stop guessing and start writing."
                    }
                ]
            }}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Bias compounds across stages</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Most advice focuses on the "Resume Parsing" stage. But predictive ranking algorithms and ad delivery algorithms also play a huge role.
                If an ad platform decides you aren't the "target demographic," you might never see the role.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                We can't fix the ad servers, but we can ensure that once you *are* in the pipeline, your data is structured so clearly that no parser can misunderstand your qualifications.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    icon={<Network className="w-4 h-4" />}
                    title="The 'Hidden' Funnel"
                    desc="Understanding that you are navigating a complex machine helps you write with more structure and less fluff."
                />
            </div>
        </ResearchArticle>
    );
}
