import type { Metadata } from "next";
import StatusClient from "@/components/legal/StatusClient";

export const metadata: Metadata = {
  title: "Status | Recruiter in Your Pocket",
  description: "Live readiness and launch-critical status checks for Recruiter in Your Pocket.",
};

export default function StatusPage() {
  return <StatusClient />;
}
