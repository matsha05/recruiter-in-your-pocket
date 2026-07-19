import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExtensionPageClient from "@/components/marketing/ExtensionPageClient";
import { launchFlags } from "@/lib/launch/flags";

export const metadata: Metadata = {
  title: "Chrome Extension",
  description:
    "Install the RIYP Chrome extension to save supported job postings, keep saved roles close, and open the full report when you need it.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExtensionPage() {
  if (!launchFlags.extensionSync) notFound();
  return <ExtensionPageClient />;
}
