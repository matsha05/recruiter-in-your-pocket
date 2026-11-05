import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparison } from "@/components/compare/comparisons";
import { pageMetadata } from "@/lib/seo/metadata";

const PATH = "/compare/enhancv";

export const metadata = pageMetadata({
    path: PATH,
    title: "Enhancv vs Recruiter in Your Pocket",
    description: "Enhancv builds a designed resume, free for seven days with branding, then from $16.50 a month. Recruiter in Your Pocket reads the words on yours, free first.",
    type: "article",
});

export default function EnhancvComparisonPage() {
    return <ComparisonPage entry={comparison("enhancv")} />;
}
