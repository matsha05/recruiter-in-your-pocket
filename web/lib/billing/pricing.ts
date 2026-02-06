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
    period: "1 review",
    description: "One full review to validate fit before you pay.",
    buttonText: "Current Plan",
    features: [
      { text: "1 full resume review (all sections)", bold: true },
      { text: "Recruiter first-impression verdict" },
      { text: "Evidence Ledger + Red Pen rewrites" },
      { text: "Role alignment with job description" },
      { text: "PDF export + share link" }
    ]
  },
  monthly: {
    id: "monthly",
    label: "Full Access",
    price: "$9",
    period: "/month",
    description: "Unlimited reviews while you are actively searching.",
    buttonText: "Start Monthly",
    features: [
      { text: "Unlimited resume + LinkedIn reviews", bold: true },
      { text: "Evidence Ledger + Red Pen on every run" },
      { text: "Role matching + Missing Wins" },
      { text: "Export, share, and report history" },
      { text: "Cancel anytime in billing portal" }
    ]
  },
  lifetime: {
    id: "lifetime",
    label: "Lifetime",
    price: "$79",
    period: "one-time",
    description: "Pay once for long-term career iteration.",
    buttonText: "Get Lifetime Access",
    badge: "Best Value",
    features: [
      { text: "Everything in Full Access", bold: true },
      { text: "No recurring billing" },
      { text: "All future updates included" },
      { text: "Permanent export and history access" },
      { text: "Long-term access to new features" }
    ]
  }
};
