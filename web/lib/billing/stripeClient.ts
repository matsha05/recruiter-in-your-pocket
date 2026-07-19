import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-06-24.dahlia" as const;

export function createStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
    maxNetworkRetries: 2,
    typescript: true,
  });
}
