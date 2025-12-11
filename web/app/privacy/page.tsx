import type { Metadata } from "next";
import PrivacyClient from "@/components/legal/PrivacyClient";

export const metadata: Metadata = {
    title: "Privacy Policy | Recruiter in Your Pocket",
    description: "Privacy Policy for Recruiter in Your Pocket - how we handle your resume data and protect your privacy."
};

export default function PrivacyPage() {
    return <PrivacyClient />;
}
