import type { OfferData } from "@/lib/compensation-model";

export const OFFER_STYLES = [
  { bar: "bg-foreground", wash: "bg-foreground/10", text: "text-foreground" },
  { bar: "bg-brand", wash: "bg-brand/10", text: "text-brand" },
  { bar: "bg-citron", wash: "bg-citron/20", text: "text-foreground" },
  { bar: "bg-cyan-bright", wash: "bg-cyan-bright/20", text: "text-brand-strong" },
  { bar: "bg-muted-foreground", wash: "bg-muted-foreground/10", text: "text-muted-foreground" },
] as const;

export function offerStyle(offer: OfferData) {
  return OFFER_STYLES[offer.styleIndex % OFFER_STYLES.length];
}

export function offerName(offer: OfferData, fallbackIndex: number) {
  return offer.companyName.trim() || (offer.isCurrentJob ? "Current job" : `Offer ${fallbackIndex + 1}`);
}
