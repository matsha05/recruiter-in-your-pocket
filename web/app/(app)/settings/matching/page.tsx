import { Metadata } from "next";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/workspace/SettingsClient";
import { launchFlags } from "@/lib/launch/flags";

export const metadata: Metadata = {
  title: "Matching Settings",
  description: "Manage default resume for job matching and extension workflows."
};

export default function SettingsMatchingPage() {
  if (!launchFlags.extensionSync) {
    redirect("/settings/account");
  }
  return <SettingsClient initialTab="matching" />;
}
