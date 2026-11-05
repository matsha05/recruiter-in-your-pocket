import { pageMetadata } from "@/lib/seo/metadata";
import { HelpPage } from "@/components/legal/HelpPage";

// Help carries the FAQ and support together (bar doc 6c.3, Matt M6, Nov 2, 2026); /faq and /support redirect here.
export const metadata = pageMetadata({
    path: "/help",
    title: "Help: the free report, files, privacy, pricing, and support",
    description: "Answers about the free resume report, supported files, what we keep and how to delete it, pricing, PDF exports, and how to reach a person.",
});

export default function Page() {
    return <HelpPage />;
}
