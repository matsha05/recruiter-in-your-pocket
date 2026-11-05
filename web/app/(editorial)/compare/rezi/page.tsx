import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparison } from "@/components/compare/comparisons";
import { pageMetadata } from "@/lib/seo/metadata";

const PATH = "/compare/rezi";

export const metadata = pageMetadata({
    path: PATH,
    title: "Rezi vs Recruiter in Your Pocket",
    description: "Rezi builds a resume with AI and scores it as you type, $29 a month or $149 once. Recruiter in Your Pocket reads the one you have, free first. Which to use.",
    type: "article",
});

export default function ReziComparisonPage() {
    return <ComparisonPage entry={comparison("rezi")} />;
}
