import { PillarPage, pillarMetadata } from "@/components/research/PillarPage";

export const metadata = pillarMetadata(
    "ats",
    "Does an ATS reject your resume? What recruiters see",
    "Does an ATS reject your resume? Software can sort the pile, but a recruiter decides who moves forward. Where automatic rejection really happens, with sources.",
);

export default function AtsPillarPage() {
    return (
        <PillarPage
            id="ats"
            why={
                <>
                    <p>
                        Software helps us sort. For roles with a big pile, an employer may set knockout questions that reject anyone who answers a certain way, or turn on a tool that ranks people by how well they match. When a role draws a thousand applicants, some of us just search the pile for the words the job needs.
                    </p>
                    <p>
                        A person still decides who moves forward. For a niche role, or one with fewer applicants, we usually read everyone. So write for the person: use the job&rsquo;s own words where they&rsquo;re true, answer the application questions carefully, and be wary of any tool that promises a score for what an ATS thinks of you.
                    </p>
                </>
            }
            evidence={[
                {
                    finding: "Automatic rejection runs on application questions. An employer picks an answer to a yes-or-no or multiple-choice question, and anyone who gives it is rejected.",
                    kind: "Vendor documentation",
                    cite: "Greenhouse, on auto-reject rules",
                    source: {
                        title: "Auto-reject",
                        publisher: "Greenhouse Support",
                        href: "https://support.greenhouse.io/hc/en-us/articles/360000653472-Auto-reject",
                    },
                },
                {
                    finding: "When the software can’t read your file into fields, the file stays attached and someone enters the details by hand.",
                    kind: "Vendor documentation",
                    cite: "Greenhouse, on resume parsing",
                    source: {
                        title: "Unsuccessful resume parse",
                        publisher: "Greenhouse Support",
                        href: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse",
                    },
                },
                {
                    finding: "Software can screen people out before the resume: which job ads you see, whether you’re eligible, and how you reach a person.",
                    kind: "Review of hiring tools",
                    cite: "Upturn (Bogen & Rieke), 2018",
                    source: {
                        title: "Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias",
                        publisher: "Upturn",
                        href: "https://www.upturn.org/work/help-wanted/",
                    },
                },
            ]}
            handoff={{ heading: "See how yours reads to the person after the software.", href: "/workspace", label: "Get your free report" }}
        />
    );
}
