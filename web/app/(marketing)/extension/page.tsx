import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExtensionPageClient from "@/components/marketing/ExtensionPageClient";
import { getChromeWebStoreUrl } from "@/lib/extension/storeContent";
import { launchFlags } from "@/lib/launch/flags";

export function generateMetadata(): Metadata {
  if (!launchFlags.extensionSync) {
    return {
      title: "Page Not Found",
      description: "The requested page is not available.",
      robots: { index: false, follow: false },
    };
  }

  const publicListingReady = Boolean(getChromeWebStoreUrl());

  return {
    title: "Chrome Extension",
    description:
      "Save LinkedIn and Indeed job postings with the RIYP Chrome extension, then check your resume against a saved role.",
    robots: {
      index: publicListingReady,
      follow: publicListingReady,
    },
  };
}

export default function ExtensionPage() {
  if (!launchFlags.extensionSync) notFound();
  return <ExtensionPageClient />;
}
