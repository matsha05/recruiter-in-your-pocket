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
      { text: "1 full resume review", bold: true },
      { text: "Recruiter first-impression verdict" },
      { text: "Signal score and critical gaps" },
      { text: "Sample rewrites and next steps" }
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
      { text: "Unlimited resume and LinkedIn reviews", bold: true },
      { text: "Role-specific JD matching" },
      { text: "Rewrite + hidden wins sections" },
      { text: "PDF export and history tracking" },
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
      { text: "Priority support" }
    ]
  }
};
