import type { Metadata } from "next";
import TermsClient from "@/components/legal/TermsClient";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of service for Recruiter in Your Pocket, including product use, billing, and account responsibilities.",
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return <TermsClient />;
}
