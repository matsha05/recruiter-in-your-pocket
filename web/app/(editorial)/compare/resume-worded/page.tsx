import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparison } from "@/components/compare/comparisons";
import { pageMetadata } from "@/lib/seo/metadata";

const PATH = "/compare/resume-worded";

export const metadata = pageMetadata({
    path: PATH,
    title: "Resume Worded vs Recruiter in Your Pocket",
    description: "Resume Worded scores your resume and LinkedIn by subscription, $19 to $49 a month. Recruiter in Your Pocket is one free report, then $29 once. What each checks.",
    type: "article",
});

export default function ResumeWordedComparisonPage() {
    return <ComparisonPage entry={comparison("resume-worded")} />;
}
