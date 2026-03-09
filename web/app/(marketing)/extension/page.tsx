import type { Metadata } from "next";
import ExtensionPageClient from "@/components/marketing/ExtensionPageClient";

export const metadata: Metadata = {
  title: "Chrome Extension — Recruiter in Your Pocket",
  description:
    "Install the RIYP Chrome extension to capture supported job postings, keep saved roles close, and jump into recruiter-grade review when you need it.",
};

export default function ExtensionPage() {
  return <ExtensionPageClient />;
}
