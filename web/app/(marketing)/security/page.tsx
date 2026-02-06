import type { Metadata } from "next";
import SecurityClient from "@/components/legal/SecurityClient";

export const metadata: Metadata = {
  title: "Security & Data Handling | Recruiter in Your Pocket",
  description:
    "How Recruiter in Your Pocket secures uploads, stores report data, and handles billing and account deletion."
};

export default function SecurityPage() {
  return <SecurityClient />;
}
