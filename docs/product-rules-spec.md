# Product rules, guardrails, copy, and Mixpanel instrumentation

## Product rules (lock these first)
- **Free tier (external promise: “your first full report is free”)**
  - Unlimited Clarity Scores.
  - **Free report content is deliberately thin** (to preserve paid value):
    - Score
    - One short paragraph diagnosis
    - Top 2–3 issues
    - 1–2 example rewrites
  - What is NOT free: full list of issues; full rewrites for every bullet; Missing Wins; export to PDF; copy-full-report; deep Insight Stack sections (Impact & Results, Clarity, Focus & Craft, Stronger phrasing, Next steps).
  - Hide/disable PDF export, copy-full-report, full list of issues, all rewrites, and “Missing wins” prompts for free runs.
  - No login or card required.
- **Free allocation (v1 simplification)**
  - External copy: “first full report is free.”
  - Internal enforcement: **2 free full reports per browser or per email** before paywall. No silent redo logic needed.
  - Before login: track per anonymous cookie/session. After login: track per email/user. Do not attempt to sync anonymous use into the account for v1 (leakage acceptable).
  - Final-free-run notice before the second run: “This is your final free full report. You’ll still get unlimited free Clarity Scores.”
  - After-run toasts:
    - After #1: “Free report used. We’ll give you one extra run in case you need it.”
    - After #2: “You’ve used your free full reports. You can still get your Clarity Score for free anytime.”
- **Naming and expectations**
  - Keep internal access tier `free_full`. Externally keep the pricing copy: “Your first full report is free. Detailed rewrites after that need a pass.”
  - Make sure the free UI looks purposeful (not “taken away” mid-flow): show the thin report clearly and gate deeper sections with an upsell rather than leaving gaps.
- **Paid tiers**
  - 24-Hour Fix Pass: unlimited full reports for 24 hours; all sections, full issue list, all rewrites; Missing wins prompts; export and copy.
  - 30-Day Campaign Pass: same features for 30 days; works across devices with email sign-in.
  - 24-Hour Fix Pass is the hero (dark accent, primary, preselected). 30-Day Campaign Pass is “Best value.”
  - Pass start rule: starts after the first post-purchase analysis, not at Stripe checkout.
- **Positioning story**
  - Free: “See exactly what is wrong.”
  - Paid: “Get every fix and iterate as much as you need.”

## Report experience (free vs paid)
- Thin free report (v1): score; one strong paragraph (“How your story lands”); top 2–3 issues; 1–2 example rewrites (copyable).
- Locked section pattern (free): sections remain visible with heading/spacing; replace content with teaser “Unlock 4 more rewrites in this section,” subtle lock icon, inline CTA “Get every fix with a pass.”
- Paid full report: full issue list; every rewrite; Missing Wins; export; copy-all; full Insight Stack depth (score → how you read → strengths → what’s buried → stronger phrasing → enhancement notes → next steps).

## Guardrails to avoid the “half resume” burn
- **Short-resume confirmation (client before consuming free run)**
  - Trigger when pasted text is abnormally short: e.g., `< 8` bullet-like lines (lines starting with `-`, `•`, `*`, or similar) **or** `< 1200` characters after trimming.
  - Dialog copy: “This looks shorter than a typical resume. Did you mean to paste the full thing?”
    - Primary (default): “Paste full resume” → closes dialog, keeps focus in textarea, does **not** consume free run.
    - Secondary: “Review anyway” → proceed; only then is a free full report marked as used.
  - Add a tiny checkbox: “Do not show this again today” that stores a sessionStorage flag; if checked, skip the dialog for that session.
  - Log events for impressions and choices (see analytics section). Do not hit the API until the user confirms.
  - Treat thresholds (`< 8` bullets, `< 1200` chars) as tunable constants; Mixpanel events already capture `text_length` and `bullet_count` to adjust later.
- **Silent redo**
  - Not required for v1 under the “2 free full reports” policy. If reintroduced later, limit it to the first free run only.

## Paywall behavior — final
- Triggers: scrolling into a locked section or clicking a locked control (Missing Wins, Export, see all rewrites).
- Modal only. Report remains visible behind it (no blur/dim). User may close it and continue reading the thin free report.
- Flow: email → code → Stripe → auto-regenerate full report (premium moment).
- 24-hour pass is the primary hero; 30-day pass marked “Best value.”

## UI copy placements
- **Hero CTA helper line** (under `#hero-cta-scroll` button): `Your first full report is free. No login or card.` (ensure this exact line appears).
- **Above textarea** (under “Paste your resume text below for a recruiter-grade review”): add helper line `Your first full report is free. No login or card.` (same line; repeat intentionally).
- **Run helper text** (next to `#run-button`): same line again for repetition.
- **Clarity Score card (pricing)** keep title/price, update bullets to:
  - “Instant Clarity Score and recruiter style diagnosis”
  - “See how your resume actually reads to a hiring manager”
  - “Your first full report is free. Detailed rewrites after that need a pass.”
  - “No account or credit card required”
- **Pass copy (pricing + paywall modal)**
  - 24-Hour Pass → **“24-Hour Fix Pass”**
    - Line 1: “Unlimited full reports for 24 hours”
    - Line 2: “Ideal when you need to send a resume today”
  - 30-Day Pass → **“30-Day Campaign Pass”**
    - Line 1: “Unlimited full reports for 30 days”
    - Line 2: “Perfect when you are applying to multiple roles this month”
  - Use exactly this wording everywhere (pricing, modal, any mentions). Keep helper under email field: “Use this email to access your pass from any device.”
- **Missing wins / export / copy for free runs**
  - Hide/disable for free runs and add an inline upsell: “Upgrade to unlock all rewrites and Missing wins prompts.”
  - If free reports are exhausted and no pass is active, still return the Clarity Score and short diagnosis, and mark the rest of the report as locked with the upsell (Clarity Score is always available).
  - Locked section pattern in free mode should follow the teaser + lock + inline CTA described above.

## Debounce / rate limiting
- Run button: debounce at 1500ms; button enters “Running…”; use skeleton loading pattern to avoid double billing/analysis.

## Device + identity rules
- Paid passes are email-bound, not device-bound; work cross-device with email login.
- Anonymous → logged-in sessions do NOT merge free-report counts.

## Implementation notes (where to wire)
- **Frontend (`index.html` script)**
  - Short-resume check inside `runAnalysis` preflight; gate API until confirmed; honor “do not show again today” checkbox via sessionStorage.
  - Free run rendering: show only score, short paragraph diagnosis, top 2–3 issues, 1–2 example rewrites. Hide `#export-button`, `#copy-full-button`, full rewrites, and Missing wins; show upsell line near those controls; keep locked sections visible with teaser + lock + inline CTA.
  - Apply copy updates in hero helper, textarea helper, run helper, pricing cards, and paywall tier labels/descriptions (with exact wording above).
  - Keep copy strings centralized (constants) to avoid drift between pricing and paywall surfaces.
  - Update `logEvent` to call Mixpanel via a single `trackEvent` wrapper that checks DNT and token; no-op otherwise. Inject Mixpanel via `<script>` in `<head>` with token from an inline var.
- **Backend (`app.js`, `auth.js`, `db.js`)**
  - Replace boolean `FREE_COOKIE` with a structured tracker:
    - HTTP-only cookie `rip_free_meta` storing `{ used: number, last_free_ts }` (signed/HMAC). Cap at 2 uses.
    - For authenticated users, persist in DB table `free_runs`: `id, user_id, count, last_free_at, created_at, updated_at` (can be deferred; cookie-only is acceptable for v1 if you prefer).
  - `determineAccess`:
    - Full access if active pass.
    - If free uses < 2, allow full; otherwise return `preview` and trigger paywall.
    - Only increment free-use counters after a request flagged as “confirmed” (client cleared short-resume dialog). Consider request flag `short_confirmed: true`.
  - Tag responses with `access_tier` (`free_full`, `pass_full`, `preview`) and ensure PDF/export endpoints honor gating.
- **Paywall flow (`index.html` + `/api/create-checkout-session` + Stripe webhook)**
  - Trigger paywall when scrolling into locked sections or clicking locked controls. Modal only; keep report visible behind; allow closing without blocking the thin free report.
  - Rename tiers/descriptions to the exact copy above across pricing and modal; 24-hour preselected; 30-day marked Best value.
  - Maintain email-code auth; ensure webhook logs Mixpanel `purchase_completed` with tier, price, user id/email.

## Mixpanel event schema (funnel coverage)
- **Core events (v1)**
  - `resume_pasted`
  - `review_started` (on submit after validation)
  - `free_report_viewed` (first free full report rendered)
  - `paywall_opened` (limit or CTA)
  - `checkout_started`
  - `purchase_completed` with `tier` (`24h_fix`, `30d_campaign`), amount, currency
  - `short_resume_dialog_shown`
  - `short_resume_review_anyway`
  - `short_resume_paste_full`
- **Minimal props (stable)**
  - `tier_state`: `free_full` | `pass_full` | `preview`
  - `pass_tier`: `none` | `24h_fix` | `30d_campaign`
  - `source`: `hero` | `pricing` | `sample_report` | `paywall`
  - `text_length`, `bullet_count` for review/short-resume events
  - `resume_size_bucket`
  - `is_sample_resume`
  - `paywall_trigger` (`scroll_locked_section`, `click_locked_control`)
  - `paywall_reason` (`limit_hit`, `manual_cta`)
  - `free_run_index` (1 or 2) on `free_report_viewed` to see how the second free behaves.
- **Integration hook**
  - Single `trackEvent(name, props)` wrapper that checks DNT and token, otherwise calls `mixpanel.track`.
  - Inject Mixpanel via `<script>` using `window.MIXPANEL_TOKEN`.
  - Server-side purchases: Stripe webhook logs `purchase_completed` with tier and user id/email via Mixpanel server SDK.

- No reminder nudges about remaining free runs (intentional).

