import type { Metadata } from "next";
import StatusClient from "@/components/legal/StatusClient";

export const metadata: Metadata = {
  title: "Launch configuration",
  description: "A configuration snapshot for Recruiter in Your Pocket. This is not a real-time uptime page.",
  robots: { index: false, follow: false },
};

export default function StatusPage() {
  return <StatusClient />;
}
