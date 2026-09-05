import { Metadata } from "next";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/workspace/SettingsClient";
import { launchFlags } from "@/lib/launch/flags";

export const metadata: Metadata = {
  title: "Matching Settings",
  description: "Choose the default resume to compare with jobs you save through the extension."
};

export default function SettingsMatchingPage() {
  if (!launchFlags.extensionSync) {
    redirect("/settings/account");
  }
  return <SettingsClient initialTab="matching" />;
}
