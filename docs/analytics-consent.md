# Optional analytics

Product analytics requires all three conditions: `NEXT_PUBLIC_ENABLE_ANALYTICS=true`, a configured `NEXT_PUBLIC_MIXPANEL_TOKEN`, and the visitor choosing **Allow analytics**. The build-time flag remains a separate operational kill switch. The missing production enable flag was set to `true` on September 14, 2026, retaining the existing token. It applies to the next production build; it does not establish that analytics is active in the previously deployed bundle.

`web/lib/analyticsConsent.ts` owns the versioned browser preference. Unknown, declined, Do Not Track, and Global Privacy Control states prevent SDK initialization and tracking. Visitors can reopen **Privacy choices** in the site footer. The choice still works for the current page if browser storage is unavailable.

`web/lib/analytics.ts` rechecks consent after loading the SDK and before each operation. Withdrawal clears local analytics identifiers and queued events, stops SDK senders, and propagates to other tabs. It does not delete data already received by the provider. Actions from before consent or withdrawal are not replayed. Re-consent starts a fresh browser identifier.

Only explicit, allowlisted events are recorded. Homepage links use `data-analytics-cta`; public route views use fixed surface names. Page URLs, referrers, query strings, automatic click capture, and session recording are excluded. The implementation uses the SDK's documented persistence defaults for `opt_out_tracking` and `clear_opt_in_out_tracking`; profile deletion is explicitly disabled during withdrawal. See [Mixpanel's JavaScript documentation](https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript).

The repeat sweep also excludes the SDK's automatically attached campaign parameters, advertising click IDs, and search keywords. Failed preference writes override stale stored acceptance for the current page and remove the old stored choice when possible. Logout cancels pending account-specific operations without dropping public page views when initial authentication resolves to signed out.

## Verification

From `web/`:

```sh
npm run test:analytics-privacy
npm run test:consent-ui
```

The browser command uses a test token and intercepts Mixpanel requests. It verifies payloads and browser behavior, not ingestion into the production dashboard. The regular UI suite skips the enabled-vendor funnel case unless `RIYP_ANALYTICS_TEST_ENABLED=1`; the dedicated command enables it and builds the test server with analytics enabled.

Before claiming production analytics is active, verify the build-time flag/token on the exact deployment, exercise the consented funnel, and confirm receipt in the intended Mixpanel project. No real resume, account, or payment is needed for this check.

### Repeat sweep evidence

The final isolated production build generated all 88 pages. Eight consent/analytics browser checks passed, including actual SDK payload interception for all supported campaign/click parameters, search keywords, withdrawal with failed storage writes, cross-tab withdrawal, browser privacy signals, and keyboard/mobile behavior. The combined SEO, responsive layout, accessibility, instrument, and motion run passed 77 checks; one LinkedIn-only case skipped because that feature was disabled in this test build. Total: 85 passed, one feature-dependent skip.

Security/privacy contracts, ESLint, TypeScript, design-system checks, whitespace checks, and the production dependency audit passed; npm reported zero vulnerabilities. The final source manifest contains 553 runtime files, all matching the tested build. Temporary evidence: `/tmp/riyp-resweep-source-manifest.json`, `/tmp/riyp-checklist-resweep-results`, and `/tmp/riyp-resweep-integration`. Build ID: `a_oa97gAR49BzfGibN4zI` at `http://127.0.0.1:3039`.

The new consent and product-motion browser suites are included in CI. These results are local, with synthetic data and intercepted vendor traffic. No new commit, push, deployment, real payment, email delivery, or production Mixpanel receipt is established by this sweep.

## Related landing changes

The mobile report action appears after the hero action leaves view. It yields to inline report actions, the footer, the privacy panel, and open dialogs.

`clean-plate.v2.webp` is 93,632 bytes, compared with 1,041,498 bytes for v1. It retains the original 1536 × 1024 calibration. The approved original and lossless delivery copy remain available. Run `node scripts/art/optimize-instrument-images.cjs` from the repository root to reproduce the delivery assets.
