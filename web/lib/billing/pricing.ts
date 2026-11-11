import { POSTING_READS_FEATURE } from "../reports/posting-read-terms";

export type PricingTierId = "free" | "30d";

export type PricingFeature = { text: string; bold?: boolean };

export type PricingPlan = {
  id: PricingTierId;
  label: string;
  price: string;
  period: string;
  buttonText: string;
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
  terms: "5 more reports, good for 90 days. No automatic renewal.",
  cta: "Get 5 more reports · $29",
} as const;

// The two plans, as the pricing page, the paywall and Settings > Billing show them.
// Each card is a price, a period and a short list; nothing explains the list.
export const PRICING_PLANS: Record<PricingTierId, PricingPlan> = {
  free: {
    id: "free",
    label: "Free",
    price: "$0",
    period: "one report",
    buttonText: "Get your free report",
    features: [
      { text: "One complete resume report", bold: true },
      { text: "Where your resume stands, and why" },
      { text: "Every line that needs work, with the line as written and what to add" },
      { text: "A revised line, written only from your facts" },
      { text: "PDF export and saved reports when you sign in. No card needed." }
    ]
  },
  "30d": {
    id: "30d",
    label: "Job Search Pass",
    price: "$29",
    period: "one-time · 90 days",
    buttonText: "Get 5 more reports · $29",
    features: [
      { text: "5 more complete reports", bold: true },
      { text: "Re-check a revision and see which lines came off the list" },
      { text: POSTING_READS_FEATURE },
      { text: "$29 once. Good for 90 days. No automatic renewal." }
    ]
  },
};
