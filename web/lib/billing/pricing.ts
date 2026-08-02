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
  boundary: "Eligibility can be affected by repeat use across browsers or shared networks, and daily beta capacity applies.",
  anonymousBoundary: "Anonymous use is limited to one free report per calendar month. Repeat use across browsers or shared networks can affect eligibility, and daily beta capacity applies.",
} as const;

export const JOB_SEARCH_PASS_DECISION = {
  freeBoundary: "This free report is complete. You do not need to pay to see the rest.",
  whenToBuy: "Buy the Job Search Pass only when you have a revised resume to compare or another important role to review.",
  terms: "One payment. 30 days. No automatic renewal.",
  cta: "Get 5 more reports · $29",
} as const;

export const PRICING_PLANS: Record<PricingTierId, PricingPlan> = {
  free: {
    id: "free",
    label: "Free",
    price: "$0",
    period: "1 report",
    description: "Review one resume in the browser before you decide whether you need more.",
    buttonText: "Included",
    features: [
      { text: "1 full in-browser resume report", bold: true },
      { text: "A likely recruiter takeaway" },
      { text: "Evidence behind each recommendation" },
      { text: "Suggested rewrites using your facts" },
      { text: "Role comparison when you add a job posting" },
      { text: "No login or credit card required" }
    ]
  },
  "30d": {
    id: "30d",
    label: "Job Search Pass",
    price: "$29",
    period: "one-time · 30 days",
    description: "Five careful recruiter-style reports for the revisions and applications that matter most.",
    buttonText: "Get the Job Search Pass",
    badge: "Best for an active search",
    features: [
      { text: "5 additional complete reports", bold: true },
      { text: "Compare revised resumes and opening reads" },
      { text: "Review important applications against specific roles" },
      { text: "PDF exports, plus saved history when signed in" },
      { text: "One payment. Access expires after 30 days." }
    ]
  },
};
