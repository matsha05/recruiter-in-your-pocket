import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparison } from "@/components/compare/comparisons";
import { pageMetadata } from "@/lib/seo/metadata";

const PATH = "/compare/kickresume";

export const metadata = pageMetadata({
    path: PATH,
    title: "Kickresume vs Recruiter in Your Pocket",
    description: "Kickresume builds a resume from a template with an AI writer, from $8 a month on a yearly plan. Recruiter in Your Pocket reads the one you have, free first.",
    type: "article",
});

export default function KickresumeComparisonPage() {
    return <ComparisonPage entry={comparison("kickresume")} />;
}
