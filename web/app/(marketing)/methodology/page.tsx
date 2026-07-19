import type { Metadata } from "next";
import MethodologyClient from "@/components/legal/MethodologyClient";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "Scoring model and rewrite methodology behind Recruiter in Your Pocket resume feedback."
};

export default function MethodologyPage() {
  return <MethodologyClient />;
}
