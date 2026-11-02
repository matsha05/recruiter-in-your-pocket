import { pageMetadata } from "@/lib/seo/metadata";
import PrivacyClient from "@/components/legal/PrivacyClient";

export const metadata = pageMetadata({
    path: "/privacy",
    title: "Privacy policy",
    description: "What information we collect when you use Recruiter in Your Pocket, why we need it, who processes it, and how to export or delete it.",
});

export default function PrivacyPage() {
    return <PrivacyClient />;
}
