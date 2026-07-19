import "server-only";

import type Stripe from "stripe";
import {
  normalizeRequestedTier,
  type RequestedPricingTier,
} from "./entitlements";

export type ApprovedStripeOffer = {
  tier: RequestedPricingTier;
  mode: "payment" | "subscription";
  priceId: string;
  productId: string;
  expectedCurrency?: string;
  expectedUnitAmount?: number;
};

export type StripeOfferConfigurationIssue = {
  tier: RequestedPricingTier;
  missing: string[];
};

export type StripeOfferCatalog = {
  offers: ApprovedStripeOffer[];
  issues: StripeOfferConfigurationIssue[];
};

export type StripeOfferEnvironment = Record<string, string | undefined>;

export type StripeCheckoutValidationFailureReason =
  | "catalog_not_configured"
  | "line_items_missing"
  | "multiple_line_items"
  | "invalid_quantity"
  | "price_missing"
  | "unknown_price"
  | "product_mismatch"
  | "mode_mismatch"
  | "currency_mismatch"
  | "amount_mismatch"
  | "metadata_mismatch";

export type StripeCheckoutValidation =
  | { ok: true; offer: ApprovedStripeOffer }
  | { ok: false; reason: StripeCheckoutValidationFailureReason };

type OfferSpec = {
  tier: RequestedPricingTier;
  mode: "payment" | "subscription";
  priceEnv: string;
  productEnv: string;
  expectedCurrency?: string;
  expectedUnitAmount?: number;
};

type CheckoutSessionLike = Pick<Stripe.Checkout.Session, "mode" | "metadata" | "line_items">;

// Only the 30-day offer is available for new checkout. The remaining pairs are
// restore-only so existing customers can recover a known historical purchase.
// An offer is trusted only when both identifiers are configured.
const OFFER_SPECS: OfferSpec[] = [
  {
    tier: "30d",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_ID_30D",
    productEnv: "STRIPE_PRODUCT_ID_30D",
    expectedCurrency: "usd",
    expectedUnitAmount: 2_900,
  },
  {
    tier: "monthly",
    mode: "subscription",
    priceEnv: "STRIPE_PRICE_ID_MONTHLY",
    productEnv: "STRIPE_PRODUCT_ID_MONTHLY",
  },
  {
    tier: "lifetime",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_ID_LIFETIME",
    productEnv: "STRIPE_PRODUCT_ID_LIFETIME",
  },
  {
    tier: "24h",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_ID_24H",
    productEnv: "STRIPE_PRODUCT_ID_24H",
  },
];

export const STRIPE_CHECKOUT_SESSION_EXPAND = [
  "line_items.data.price.product",
] as const;

function cleanId(value: unknown, prefix: "price_" | "prod_"): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("MISSING") || trimmed.includes("PLACEHOLDER")) return null;
  return trimmed.startsWith(prefix) ? trimmed : null;
}

export function getStripeOfferCatalog(
  env: StripeOfferEnvironment = process.env
): StripeOfferCatalog {
  const offers: ApprovedStripeOffer[] = [];
  const issues: StripeOfferConfigurationIssue[] = [];

  for (const spec of OFFER_SPECS) {
    const rawPriceId = env[spec.priceEnv]?.trim() || "";
    const rawProductId = env[spec.productEnv]?.trim() || "";

    // Legacy offers are optional. Once either half is present, require the
    // complete canonical pair so a price can never float to another product.
    if (!rawPriceId && !rawProductId && spec.tier !== "30d") continue;

    const priceId = cleanId(rawPriceId, "price_");
    const productId = cleanId(rawProductId, "prod_");
    const missing: string[] = [];
    if (!priceId) missing.push(spec.priceEnv);
    if (!productId) missing.push(spec.productEnv);

    if (missing.length > 0) {
      issues.push({ tier: spec.tier, missing });
      continue;
    }

    offers.push({
      tier: spec.tier,
      mode: spec.mode,
      priceId: priceId!,
      productId: productId!,
      expectedCurrency: spec.expectedCurrency,
      expectedUnitAmount: spec.expectedUnitAmount,
    });
  }

  return { offers, issues };
}

export function getLaunchStripeOffer(
  env: StripeOfferEnvironment = process.env
): ApprovedStripeOffer | null {
  return getStripeOfferCatalog(env).offers.find((offer) => offer.tier === "30d") || null;
}

function productIdFromPrice(price: Stripe.Price): string | null {
  if (typeof price.product === "string") return price.product;
  if (price.product && typeof price.product.id === "string") return price.product.id;
  return null;
}

function tierFromPassMetadata(value: unknown): RequestedPricingTier | null {
  if (typeof value !== "string" || !value.trim()) return null;
  if (value.trim().toLowerCase() === "single_use") return "24h";
  return normalizeRequestedTier(value);
}

function configuredTierForPrice(
  priceId: string,
  env: StripeOfferEnvironment
): RequestedPricingTier | null {
  const spec = OFFER_SPECS.find((candidate) => env[candidate.priceEnv]?.trim() === priceId);
  return spec?.tier || null;
}

export function validateStripeCheckoutSession(
  session: CheckoutSessionLike,
  env: StripeOfferEnvironment = process.env
): StripeCheckoutValidation {
  const lineItems = session.line_items;
  if (!lineItems) return { ok: false, reason: "line_items_missing" };
  if (lineItems.has_more || lineItems.data.length !== 1) {
    return { ok: false, reason: "multiple_line_items" };
  }

  const lineItem = lineItems.data[0];
  if (lineItem.quantity !== 1) return { ok: false, reason: "invalid_quantity" };
  if (!lineItem.price?.id) return { ok: false, reason: "price_missing" };

  const catalog = getStripeOfferCatalog(env);
  const offer = catalog.offers.find((candidate) => candidate.priceId === lineItem.price!.id);
  if (!offer) {
    return configuredTierForPrice(lineItem.price.id, env)
      ? { ok: false, reason: "catalog_not_configured" }
      : { ok: false, reason: "unknown_price" };
  }

  if (productIdFromPrice(lineItem.price) !== offer.productId) {
    return { ok: false, reason: "product_mismatch" };
  }
  if (session.mode !== offer.mode) return { ok: false, reason: "mode_mismatch" };
  if (
    offer.expectedCurrency &&
    lineItem.price.currency?.toLowerCase() !== offer.expectedCurrency
  ) {
    return { ok: false, reason: "currency_mismatch" };
  }
  if (
    typeof offer.expectedUnitAmount === "number" &&
    lineItem.price.unit_amount !== offer.expectedUnitAmount
  ) {
    return { ok: false, reason: "amount_mismatch" };
  }

  const metadataTier = normalizeRequestedTier(session.metadata?.tier);
  const passTier = tierFromPassMetadata(session.metadata?.pass_tier);
  if ((metadataTier && metadataTier !== offer.tier) || (passTier && passTier !== offer.tier)) {
    return { ok: false, reason: "metadata_mismatch" };
  }

  return { ok: true, offer };
}

export function isUnrelatedStripeCheckout(
  validation: StripeCheckoutValidation
): boolean {
  return !validation.ok && validation.reason === "unknown_price";
}
