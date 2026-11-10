import { ExampleLines, PillarPage, pillarMetadata } from "@/components/research/PillarPage";

export const metadata = pillarMetadata(
    "story",
    "Your resume’s story: who you are in one line",
    "Recruiters need to say who you are in one line and picture you in the job. Why we believe it, what the research says, and how to write the line.",
);

export default function StoryPillarPage() {
    return (
        <PillarPage
            id="story"
            why={
                <>
                    <p>
                        When we move a resume forward, we have to explain you to a hiring manager, usually in a sentence. If we can&rsquo;t say who you are in one line, we can&rsquo;t make that case, however good the experience behind it.
                    </p>
                    <ExampleLines
                        weak="Results-driven professional with a passion for excellence."
                        strong="Product designer who has shipped payments flows at two fintech companies."
                    />
                    <p>
                        The line we&rsquo;re after is plain: what you do, at what level, and what you&rsquo;re known for. The rest of your resume should make it easy to believe, with jobs that lead toward the role you want.
                    </p>
                </>
            }
            evidence={[
                {
                    finding: "In mock interviews, the first few minutes predicted the final ratings and, later, real internship offers.",
                    kind: "Peer-reviewed study",
                    cite: "Barrick, Swider & Stewart, 2010 · interviews, not resumes",
                    source: {
                        title: "Initial evaluations in the interview: Relationships with subsequent interviewer evaluations and employment offers",
                        publisher: "Barrick, Swider & Stewart. Journal of Applied Psychology 95(6)",
                        href: "https://doi.org/10.1037/a0019918",
                    },
                },
                {
                    finding: "On a large freelance marketplace, employers favored people who had moved in steps between related kinds of work over histories that jumped around.",
                    kind: "Peer-reviewed study",
                    cite: "Leung, American Sociological Review, 2014 · freelance hiring",
                    source: {
                        title: "Dilettante or Renaissance Person? How the Order of Job Experiences Affects Hiring in an External Labor Market",
                        publisher: "Leung. American Sociological Review 79(1)",
                        href: "https://doi.org/10.1177/0003122413518638",
                    },
                },
            ]}
            handoff={{ heading: "See the one line a recruiter would say about yours.", href: "/workspace", label: "Get your free report" }}
        />
    );
}
