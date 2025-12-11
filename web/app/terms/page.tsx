import type { Metadata } from "next";
import TermsClient from "@/components/legal/TermsClient";

export const metadata: Metadata = {
    title: "Terms of Service | Recruiter in Your Pocket",
    description: "Terms of Service for Recruiter in Your Pocket - AI-powered resume feedback."
};

export default function TermsPage() {
    return <TermsClient />;
}
