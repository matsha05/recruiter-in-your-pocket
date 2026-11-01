import { pageMetadata } from "@/lib/seo/metadata";
import SecurityClient from "@/components/legal/SecurityClient";

export const metadata = pageMetadata({
  path: "/security",
  title: "Security and data handling",
  description: "How Recruiter in Your Pocket secures uploads, stores report data, and handles billing and account deletion.",
});

export default function SecurityPage() {
  return <SecurityClient />;
}
