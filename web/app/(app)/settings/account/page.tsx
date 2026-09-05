import { Metadata } from "next";
import SettingsClient from "@/components/workspace/SettingsClient";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Update your name, download your data, or delete your account."
};

export default function SettingsAccountPage() {
  return <SettingsClient initialTab="account" />;
}
