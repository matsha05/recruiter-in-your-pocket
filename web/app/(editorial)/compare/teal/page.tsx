import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparison } from "@/components/compare/comparisons";
import { pageMetadata } from "@/lib/seo/metadata";

const PATH = "/compare/teal";

export const metadata = pageMetadata({
    path: PATH,
    title: "Teal vs Recruiter in Your Pocket",
    description: "Teal builds and tracks resumes, with Teal+ from $13 a week. Recruiter in Your Pocket reads the resume you built, free first. What each does, and using both.",
    type: "article",
});

export default function TealComparisonPage() {
    return <ComparisonPage entry={comparison("teal")} />;
}
