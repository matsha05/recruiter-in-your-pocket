# Rewrites: Pricing and purchase

Where: `/pricing`, `/purchase/confirmed`, the paywall. November 6, 2026. Verified on a local production build with the Playwright specs listed in `README.md`.

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/components/marketing/PricingPageClient.tsx` | Weighing other tools? | Other tools do different jobs. | question_heading |
| `web/components/marketing/PricingPageClient.tsx` | A writer, a keyword scanner, a builder, and a recruiter’s read are different purchases, and the read is the one that decides: | Writers rewrite, keyword scanners match words, builders lay it out. A recruiter decides whether you get the call, and | coined_word ("the read" twice) |
| `web/components/marketing/PricingPageClient.tsx` | Could not open checkout. Try again. If this continues, contact support. | Checkout didn’t open. Try again, and if it keeps happening, write to support. | stiff ("Could not… If this continues") |
| `web/lib/billing/pricing.ts` | Your Verdict and where your resume stands | Where your resume stands, and why | retired_name (Verdict) |
| `web/components/purchase/PurchaseConfirmedClient.tsx` | You’re in. Five more reads. | You’re in! Five more reads. | a real win gets one exclamation point |
