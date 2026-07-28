import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offer Comparison Calculator",
  description: "Compare guaranteed cash, target bonus, modeled equity, vesting, and one-time compensation across job offers.",
  alternates: { canonical: "/resources/tools/comp-calculator" },
};

export default function CompensationCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
