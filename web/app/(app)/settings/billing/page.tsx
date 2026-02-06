import { Metadata } from "next";
import SettingsClient from "@/components/workspace/SettingsClient";

export const metadata: Metadata = {
  title: "Billing Settings — Recruiter in Your Pocket",
  description: "Manage plans, receipts, and purchase restoration."
};

export default function SettingsBillingPage() {
  return <SettingsClient initialTab="billing" />;
}
