import type { Metadata } from "next";
import StatusClient from "@/components/legal/StatusClient";

export const metadata: Metadata = {
  title: "Status",
  description: "Customer-facing service status for Recruiter in Your Pocket.",
};

export default function StatusPage() {
  return <StatusClient />;
}
