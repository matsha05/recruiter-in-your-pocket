import type { Metadata } from "next";
import StatusClient from "@/components/legal/StatusClient";

export const metadata: Metadata = {
  title: "Configuration Checks",
  description: "Check whether the settings required for reports, sign-in, billing, and support are in place. These checks do not measure live uptime.",
  robots: { index: false, follow: false },
};

export default function StatusPage() {
  return <StatusClient />;
}
