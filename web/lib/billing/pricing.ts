export type PricingTierId = "free" | "30d";

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

export const FREE_REPORT_ENTITLEMENT = {
  promise: "Your first complete report is free. No card required.",
  boundary: "Repeat use across browsers or shared networks can affect eligibility. Daily capacity limits apply.",
  anonymousBoundary: "Anonymous use is limited to one free report per calendar month. Repeat use across browsers or shared networks can affect eligibility. Daily capacity limits apply.",
} as const;

export const JOB_SEARCH_PASS_DECISION = {
  freeBoundary: "Everything in your free report is yours. Nothing is held back.",
  whenToBuy: "The Job Search Pass is for what comes next: checking your revision, or tailoring your resume to another job.",
  terms: "5 more reports, good for 30 days. No automatic renewal.",
  cta: "Get 5 more reports · $29",
} as const;

export const PRICING_PLANS: Record<PricingTierId, PricingPlan> = {
  free: {
    id: "free",
    label: "Free",
    price: "$0",
    period: "1 report",
    description: "The complete report on one resume. Nothing locked.",
    buttonText: "Get your free report",
    features: [
      { text: "One complete resume report", bold: true },
      { text: "Your Verdict and where your resume stands" },
      { text: "The Critical Miss: the one thing to fix first" },
      { text: "Each suggestion tied to a line on your resume" },
      { text: "Questions that pull out the details you left off" },
      { text: "No account or card needed (one per browser each month)" }
    ]
  },
  "30d": {
    id: "30d",
    label: "Job Search Pass",
    price: "$29",
    period: "one-time · 30 days",
    description: "For revising and applying: check each revision, and read your resume against each job you want.",
    buttonText: "Get 5 more reports · $29",
    badge: "For an active search",
    features: [
      { text: "5 more complete reports", bold: true },
      { text: "Re-check a revision and see whether your Critical Miss changed" },
      { text: "Read your resume against each job posting" },
      { text: "PDF exports, and saved reports when signed in" },
      { text: "$29 once. Good for 30 days. No automatic renewal." }
    ]
  },
};
