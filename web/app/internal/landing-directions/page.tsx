import { notFound } from "next/navigation";
import LandingDirectionsShowcase from "@/components/internal/LandingDirectionsShowcase";

export default function LandingDirectionsPage() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_INTERNAL_PAGES !== "true") {
    notFound();
  }

  return <LandingDirectionsShowcase />;
}
