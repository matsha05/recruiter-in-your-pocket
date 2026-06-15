export type PricingTierId = "free" | "monthly" | "lifetime";

export type PricingFeature = { text: string; bold?: boolean };

export type PricingPlan = {
  id: PricingTierId;
  label: string;
  price: string;
  period: string;
  description: string;
  buttonText: string;
  badge?: string;
  features: PricingFeature[];
};

export const PRICING_PLANS: Record<PricingTierId, PricingPlan> = {
  free: {
    id: "free",
    label: "Free",
    price: "$0",
    period: "1 report",
    description: "Get one full in-browser report before you pay a thing.",
    buttonText: "Current Plan",
    features: [
      { text: "1 full in-browser resume report", bold: true },
      { text: "Recruiter first-impression verdict" },
      { text: "Evidence Ledger + Red Pen rewrites" },
      { text: "Role alignment when you add a job" },
      { text: "No login or credit card required" }
    ]
  },
  monthly: {
    id: "monthly",
    label: "Full Access",
    price: "$9",
    period: "/month",
    description: "Run repeated role-specific reports while you're actively applying.",
    buttonText: "Start Monthly",
    features: [
      { text: "More resume + LinkedIn reports for each role", bold: true },
      { text: "Evidence Ledger + Red Pen on every run" },
      { text: "Role matching + Missing Wins" },
      { text: "Version history and export for reports you keep" },
      { text: "Cancel anytime in billing portal" }
    ]
  },
  lifetime: {
    id: "lifetime",
    label: "Lifetime",
    price: "$79",
    period: "one-time",
    description: "Pay once for long-term access.",
    buttonText: "Get Lifetime Access",
    badge: "Pay Once",
    features: [
      { text: "Everything in Full Access", bold: true },
      { text: "No recurring billing" },
      { text: "Product updates included while the service operates" },
      { text: "Long-term report workspace access" },
      { text: "Access to new resume features as they ship" }
    ]
  }
};
