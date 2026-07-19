import { Metadata } from "next";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/workspace/SettingsClient";
import { launchFlags } from "@/lib/launch/flags";

export const metadata: Metadata = {
  title: "Billing Settings",
  description: "Manage plans, receipts, and purchase restoration."
};

export default function SettingsBillingPage() {
  if (!launchFlags.billingUnlock) {
    redirect("/settings/account");
  }
  return <SettingsClient initialTab="billing" />;
}
