import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparison } from "@/components/compare/comparisons";
import { pageMetadata } from "@/lib/seo/metadata";

const PATH = "/compare/topresume";

export const metadata = pageMetadata({
    path: PATH,
    title: "TopResume vs Recruiter in Your Pocket",
    description: "TopResume rewrites your resume with a human writer from $179. Recruiter in Your Pocket reads the one you have, free first. Which fits, and what each costs.",
    type: "article",
});

export default function TopResumeComparisonPage() {
    return <ComparisonPage entry={comparison("topresume")} />;
}
