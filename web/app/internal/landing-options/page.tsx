import { notFound } from "next/navigation";
import LandingOptionsClient from "@/components/internal/LandingOptionsClient";

export default function LandingOptionsPage() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_INTERNAL_PAGES !== "true") {
    notFound();
  }

  return <LandingOptionsClient />;
}
