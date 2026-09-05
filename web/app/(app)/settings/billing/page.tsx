import { Metadata } from "next";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/workspace/SettingsClient";
import { launchFlags } from "@/lib/launch/flags";

export const metadata: Metadata = {
  title: "Billing Settings",
  description: "Check your remaining reports, restore a purchase, or find a receipt."
};

export default function SettingsBillingPage() {
  if (!launchFlags.billingUnlock) {
    redirect("/settings/account");
  }
  return <SettingsClient initialTab="billing" />;
}
