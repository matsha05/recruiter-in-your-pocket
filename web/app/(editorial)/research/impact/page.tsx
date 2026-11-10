import { ExampleLines, PillarPage, pillarMetadata } from "@/components/research/PillarPage";

export const metadata = pillarMetadata(
    "impact",
    "Showing impact on a resume: what recruiters look for",
    "Recruiters want to see what changed because you were there, with a number when you have a real one. Why we believe it and what the research says.",
);

export default function ImpactPillarPage() {
    return (
        <PillarPage
            id="impact"
            why={
                <>
                    <p>
                        Most bullets tell us what your job was. We already know that from the title. What we can&rsquo;t guess is what happened because you were the one doing it.
                    </p>
                    <ExampleLines
                        weak="Responsible for the onboarding flow."
                        strong="Rebuilt onboarding so new customers finished setup in one session instead of three."
                    />
                    <p>
                        A number is the fastest way to show the change, so use one whenever you have it. Use only numbers you can explain in the interview, because we&rsquo;ll ask how you got them. When you don&rsquo;t have one, say plainly what changed.
                    </p>
                </>
            }
            evidence={[
                {
                    finding: "“Accomplished X, as measured by Y, by doing Z.” A formula for a line that says what changed, how you know, and what you did.",
                    kind: "Practitioner advice, not a study",
                    cite: "Laszlo Bock, from Google",
                    source: {
                        title: "My personal formula for a better resume",
                        publisher: "Laszlo Bock on LinkedIn (practitioner guidance)",
                        href: "https://www.linkedin.com/pulse/20140929001534-24454816-my-personal-formula-for-a-better-resume",
                    },
                },
                {
                    finding: "An honest result without a number beats a precise one you can’t explain, and a precise number invites the question of how you measured it.",
                    kind: "Practitioner advice, not a study",
                    cite: "The Random Recruiter, 2026",
                    source: {
                        title: "Your Resume Bullets Don't Explain What You Actually Did",
                        publisher: "The Random Recruiter (practitioner newsletter)",
                        href: "https://randomrecruiter.substack.com/p/your-resume-bullets-dont-explain",
                    },
                },
                {
                    finding: "A clear, specific, true line with no number often beats one with a forced number. Never make up a number you can’t defend.",
                    kind: "Practitioner advice, not a study",
                    cite: "Hiration",
                    source: {
                        title: "Showing Real Impact on a Resume Without Making Up Numbers",
                        publisher: "Hiration (practitioner guidance)",
                        href: "https://www.hiration.com/blog/quantify-resume-achievements-without-numbers/",
                    },
                },
                {
                    finding: "Clearer writing helped a little at scale. New freelancers whose profiles went through a writing tool were hired 3.3% of the time, against 3.1%.",
                    kind: "Randomized experiment",
                    cite: "Wiles, Munyikwa & Horton, 2025 · 480,948 jobseekers",
                    source: {
                        title: "Algorithmic Writing Assistance on Jobseekers' Resumes Increases Hires",
                        publisher: "Wiles, Munyikwa & Horton. Management Science 71(12)",
                        href: "https://doi.org/10.1287/mnsc.2024.04528",
                    },
                },
            ]}
            handoff={{ heading: "Check what your bullets say changed.", href: "/workspace", label: "Get your free report" }}
        />
    );
}
