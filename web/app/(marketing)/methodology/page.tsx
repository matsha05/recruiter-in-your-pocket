import type { Metadata } from "next";
import MethodologyClient from "@/components/legal/MethodologyClient";

export const metadata: Metadata = {
  title: "Methodology | Recruiter in Your Pocket",
  description:
    "Scoring model and rewrite methodology behind Recruiter in Your Pocket resume and LinkedIn feedback."
};

export default function MethodologyPage() {
  return <MethodologyClient />;
}
