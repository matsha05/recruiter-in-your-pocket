import { PillarPage, pillarMetadata } from "@/components/research/PillarPage";
import { ReferralFindings } from "@/components/research/PillarFindings";

export const metadata = pillarMetadata(
    "referrals",
    "Do referrals help? Why a referral gets your resume read",
    "With hundreds of applicants per hire, a referral gets your resume read. Why we believe it, and what 38 million applications showed.",
);

export default function ReferralsPillarPage() {
    return (
        <PillarPage
            id="referrals"
            why={
                <>
                    <p>
                        Every application we open shows whether someone referred you. When a role has hundreds of applicants, that flag gets you read. A referred resume gets reviewed, whatever happens to the rest of the pile.
                    </p>
                    <p>
                        A referral doesn&rsquo;t get you the job. It puts your resume in front of us, so the resume still has to hold up once we read it.
                    </p>
                </>
            }
            figure={<ReferralFindings />}
            evidence={[
                {
                    finding: "Recruiters now handle about 291 applications per hire, against roughly 100 in early 2021.",
                    kind: "Vendor data",
                    cite: "Ashby, Recruiter Productivity report",
                    source: {
                        title: "Recruiter Productivity",
                        publisher: "Ashby Talent Trends Report (vendor data)",
                        href: "https://www.ashbyhq.com/talent-trends-report/reports/2023-recruiter-productivity-trends-report",
                    },
                },
                {
                    finding: "40% of referred applications reached an interview. Of applications sent in cold, 3% did.",
                    kind: "Vendor data",
                    drawn: true,
                    cite: "Ashby customers, 2021 to 2024 · 38 million applications",
                    source: {
                        title: "Are referred candidates more likely to get hired?",
                        publisher: "Ashby Talent Trends Report (vendor data). 38M+ applications across 93,000 jobs",
                        href: "https://www.ashbyhq.com/talent-trends-report/reports/referrals",
                    },
                },
            ]}
            handoff={{ title: "A referral gets you read. Make sure what they read holds up.", href: "/workspace", label: "Get your free report" }}
        />
    );
}
