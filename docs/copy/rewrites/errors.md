# Rewrites: Error pages

Where: `app/error.tsx`, `app/global-error.tsx`. November 6, 2026. Verified on a local production build with the Playwright specs listed in `README.md`.

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/app/error.tsx` | Something broke on our end, not yours. Saved reports aren’t affected. | Our bad. Something broke on our end. Your saved reports are fine. | Matt's error voice: own it first (November 6) |
| `web/app/global-error.tsx` | Something broke on our end. If it keeps happening, email support and include the error reference below, if you see one. | Our bad. Something broke on our end. If it keeps happening, email support and include the error reference below, if you see one. | Matt's error voice: own it first |
