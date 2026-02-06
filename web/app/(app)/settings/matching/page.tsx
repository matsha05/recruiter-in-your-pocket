import { Metadata } from "next";
import SettingsClient from "@/components/workspace/SettingsClient";

export const metadata: Metadata = {
  title: "Matching Settings — Recruiter in Your Pocket",
  description: "Manage default resume for job matching and extension workflows."
};

export default function SettingsMatchingPage() {
  return <SettingsClient initialTab="matching" />;
}
