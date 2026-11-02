import { pageMetadata } from "@/lib/seo/metadata";
import TermsClient from "@/components/legal/TermsClient";

export const metadata = pageMetadata({
    path: "/terms",
    title: "Terms of Service",
    description: "Terms of service for Recruiter in Your Pocket, including product use, billing, and account responsibilities.",
});

export default function TermsPage() {
    return <TermsClient />;
}
