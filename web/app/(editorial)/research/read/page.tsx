import { PillarPage, pillarMetadata } from "@/components/research/PillarPage";
import { ReadFindings } from "@/components/research/PillarFindings";

export const metadata = pillarMetadata(
    "read",
    "How recruiters read a resume, and where the time goes",
    "A person reads your resume, and most of the time goes to your background and experience. Why we believe it, and what eye-tracking and typo studies found.",
);

export default function ReadPillarPage() {
    return (
        <PillarPage
            id="read"
            why={
                <>
                    <p>
                        We read resumes. On a busy day we read fast, but there&rsquo;s no timer, and what we look for first is what you&rsquo;ve done: where you worked, what you did there, and how recently.
                    </p>
                    <p>
                        That&rsquo;s where our time goes, so that&rsquo;s where your best material belongs. Clean writing matters too. Errors pull attention away from the work you want us to see.
                    </p>
                </>
            }
            figure={<ReadFindings />}
            evidence={[
                {
                    finding: "No study shows a fixed timer. In 2,043 resume reviews, recruiters who spent longer on Experience were more likely to move a resume forward.",
                    kind: "Peer-reviewed eye-tracking study",
                    drawn: true,
                    cite: "Pina et al., 2023 · 2,043 resume reviews",
                    source: {
                        title: "Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume",
                        publisher: "Machine Learning and Knowledge Extraction",
                        href: "https://doi.org/10.3390/make5030038",
                    },
                },
                {
                    finding: "Five spelling errors cost 1.85 points on a 0–10 interview rating. A single typo wasn’t tested.",
                    kind: "Experiment",
                    drawn: true,
                    cite: "Sterkens et al., PLOS ONE, 2023 · 445 hiring professionals",
                    source: {
                        title: "Costly mistakes: Why and when spelling errors in resumes jeopardise interview chances",
                        publisher: "Sterkens et al. PLOS ONE",
                        href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280",
                    },
                },
            ]}
            handoff={{ title: "See what a recruiter reads first on yours.", href: "/workspace", label: "Get your free report" }}
        />
    );
}
