# Next.js Migration Status

**Saved:** Dec 10, 2024

## Completed ✅

### Auth System
- [x] Supabase Auth integration (signInWithOtp, verifyOtp)
- [x] AuthProvider context with user state
- [x] Native Next.js auth API routes (`/api/auth/send-code`, `/api/auth/verify-code`, `/api/me`)
- [x] AuthModal with email → code → name flow
- [x] Email confirmation disabled in Supabase for reduced friction

### Checkout/Payment
- [x] Pure Next.js checkout route (`/api/checkout`) - bypasses Express
- [x] PaywallModal - email only, name from Stripe billing
- [x] Webhook updated to extract billing name, never overwrite existing

### Settings
- [x] Full Settings page at `/settings`
- [x] Two-column Notion/Linear layout
- [x] Profile, Passes, Preferences, Delete account sections
- [x] `/api/passes` endpoint for order history

### Components Migrated
- [x] Header (landing)
- [x] WorkspaceHeader
- [x] Hero (personalized for logged-in users)
- [x] Pricing
- [x] PaywallModal
- [x] AuthModal
- [x] SettingsPage
- [x] ThemeToggle
- [x] LegalHeader, PrivacyClient, TermsClient

---

## Remaining 🚧

### Core Functionality
- [ ] **Resume Analysis Flow** - Wire up workspace to submit resumes, call OpenAI, show reports
- [ ] **ReportPanel** - Display analysis results (partially done, needs data wiring)
- [ ] **History Sidebar** - Fetch and display past reports

### Backend Routes to Migrate/Wire
- [ ] `/api/resume-feedback` - Main analysis endpoint
- [ ] `/api/history/*` - Report history endpoints

### Deployment
- [ ] Add Stripe env vars to production (`STRIPE_PRICE_ID_24H`, `STRIPE_PRICE_ID_30D`)
- [ ] Point Stripe webhook to production URL
- [ ] Deploy Next.js app (replace static file serving)
- [ ] Test full end-to-end flow in staging

---

## Notes
- Express backend still handles: resume analysis, report storage, legacy auth
- Next.js handles: Settings, checkout, new auth flow
- Safe to commit - all changes are additive

ORIGINAL PLAN BELOW
Next.js + Supabase Migration Plan
Stand up a Next.js App Router app with Tailwind + token file in web/ and scaffold core pages (landing, workspace) while proxying to existing APIs for parity.
Introduce Supabase (Auth + Postgres + Storage) for auth, profiles, resumes, and reports; add RLS/policies and a minimal DB schema; wire Next.js server components/actions to Supabase client/server SDKs.
Reimplement auth and resume flows in Next.js: magic-link login via Supabase Auth, file upload to Supabase Storage, trigger analysis via existing OpenAI wrapper (or a Next.js route handler calling the current backend), display reports.
Integrate Stripe webhook + checkout with Supabase subscription records; keep Mixpanel events (page view, report generated, checkout started/completed) in the new app.
Cut over: swap landing/workspace to Next.js routes, retire old static pages once parity is confirmed; keep the old Express API only for PDF/legacy endpoints until migrated.