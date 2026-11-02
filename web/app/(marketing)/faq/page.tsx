import { pageMetadata } from "@/lib/seo/metadata";
import FAQClient from "@/components/legal/FAQClient";

export const metadata = pageMetadata({
    path: "/faq",
    title: "FAQ: the free report, files, privacy, and pricing",
    description: "Answers about the free resume report, supported files, what we keep and how to delete it, pricing, and PDF exports.",
});

export default function FAQPage() {
    return <FAQClient />;
}
