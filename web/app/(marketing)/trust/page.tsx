import { pageMetadata } from "@/lib/seo/metadata";
import TrustClient from "@/components/legal/TrustClient";

export const metadata = pageMetadata({
    path: "/trust",
    title: "Trust: your data, billing, and reports",
    description: "How we handle your resume and account data, what you pay for, how deletion works, and what the report can and can't tell you.",
});

export default function TrustPage() {
    return <TrustClient />;
}
