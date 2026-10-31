import type { OfferData } from "@/lib/compensation-model";

// In the calculator, color means the kind of money, everywhere on the page: the validated
// categorical order from the design system (blue ink, green pen, plum, orange). Offers are
// told apart by name, so no color ever carries two meanings on one screen.
export const COMPONENTS = [
  { key: "base", label: "Base salary", swatch: "bg-chart-1" },
  { key: "stock", label: "Equity", swatch: "bg-chart-2" },
  { key: "bonus", label: "Target bonus", swatch: "bg-chart-3" },
  { key: "oneTime", label: "One-time cash", swatch: "bg-chart-4" },
] as const;

export type ComponentKey = (typeof COMPONENTS)[number]["key"];

// Offers wear ink; the current job, the reference point, wears quiet graphite.
export function offerStyle(offer: OfferData) {
  return offer.isCurrentJob
    ? { bar: "bg-muted-foreground/55" }
    : { bar: "bg-foreground" };
}

export function offerName(offer: OfferData, fallbackIndex: number) {
  return offer.companyName.trim() || (offer.isCurrentJob ? "Current job" : `Offer ${fallbackIndex + 1}`);
}
