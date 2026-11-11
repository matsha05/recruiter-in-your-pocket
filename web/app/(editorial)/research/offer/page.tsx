import Link from "next/link";
import { PillarPage, pillarMetadata } from "@/components/research/PillarPage";

export const metadata = pillarMetadata(
    "offer",
    "Should you negotiate a job offer? Recruiters say yes",
    "Recruiters expect you to negotiate a job offer. Why we believe it, what a study of 3,858 tech job seekers found, and how to make one clear counter.",
);

export default function OfferPillarPage() {
    return (
        <PillarPage
            id="offer"
            why={
                <>
                    <p>
                        When we make an offer, we expect you to come back with a counter. Asking for more, politely and with a reason, is a normal part of the conversation.
                    </p>
                    <p>
                        Know what the role pays, ask once and clearly, and say what would make you sign. Some companies now call the first offer final. Ask anyway, and be ready to hear no. Our <Link href="/resources" className="focus-ring riyp-link">guides for after the offer</Link> cover what to say and how to compare two offers.
                    </p>
                </>
            }
            evidence={[
                {
                    finding: "In experiments with tech job seekers recruited through Levels.fyi, those who countered got about 12% more on average. Well over half of job seekers accept the first offer.",
                    kind: "Field experiment, working paper",
                    cite: "Cullen, Pakzad-Hurson & Perez-Truglia, 2025 · about 3,858 job seekers",
                    source: {
                        title: "Most Job Seekers Skip Negotiation — and Pay a High Price",
                        publisher: "UCLA Anderson Review, on Cullen, Pakzad-Hurson & Perez-Truglia, NBER Working Paper 33903",
                        href: "https://anderson-review.ucla.edu/most-job-seekers-skip-negotiation-and-pay-a-high-price/",
                    },
                },
                {
                    finding: "A short message telling people that companies expect a counter raised both how many negotiated and what they gained.",
                    kind: "Field experiment, working paper",
                    cite: "NBER Working Paper 33903, 2025",
                    source: {
                        title: "Pushing the Envelope: The Effects of Salary Negotiations",
                        publisher: "Cullen, Pakzad-Hurson & Perez-Truglia. NBER Working Paper 33903",
                        href: "https://www.nber.org/papers/w33903",
                    },
                },
            ]}
            handoff={{ heading: "Ready to make your counter?", href: "/resources/offer-negotiation", label: "Read the negotiation guide" }}
        />
    );
}
