import { Metadata } from "next";
import SettingsClient from "@/components/workspace/SettingsClient";

export const metadata: Metadata = {
  title: "Account Settings — Recruiter in Your Pocket",
  description: "Profile, data export, and account deletion controls."
};

export default function SettingsAccountPage() {
  return <SettingsClient initialTab="account" />;
}
