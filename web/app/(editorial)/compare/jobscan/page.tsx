import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparison } from "@/components/compare/comparisons";
import { pageMetadata } from "@/lib/seo/metadata";

const PATH = "/compare/jobscan";

export const metadata = pageMetadata({
    path: PATH,
    title: "Jobscan vs Recruiter in Your Pocket",
    description: "Jobscan scores your keyword match to one posting, from $29.98 a month. Recruiter in Your Pocket reads the whole resume, free first. Which to use, and when.",
    type: "article",
});

export default function JobscanComparisonPage() {
    return <ComparisonPage entry={comparison("jobscan")} />;
}
