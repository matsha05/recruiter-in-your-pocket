import type { Metadata } from "next";
import Footer from "@/components/landing/Footer";
import { CompCalculatorClient } from "@/components/guides/comp-calculator/CompCalculatorClient";

export const metadata: Metadata = {
  title: "Offer Comparison Calculator",
  description: "Compare base salary, target bonus, modeled equity, vesting, and one-time compensation across job offers.",
  alternates: { canonical: "/resources/tools/comp-calculator" },
};

export default function CompCalculatorPage() {
  return (
    <>
      <CompCalculatorClient />
      <Footer />
    </>
  );
}
