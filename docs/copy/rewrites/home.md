# Rewrites: Homepage

Where: `/`, plus the app manifest. November 6, 2026. Verified on a local production build with the Playwright specs listed in `README.md`.

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/app/(marketing)/page.tsx` | Get a free resume report: what a recruiter takes from your page, the lines they trip on, and what to add to each one before you apply. | A free resume report that shows what a recruiter takes from your resume, the lines they’d stop on, and what to add to each one before you apply. | coined_word ("your page"), colon_fragment |
| `web/app/manifest.ts` | See what a recruiter sees: your Verdict, where your resume stands, and what to fix first. | See what a recruiter sees in your resume, line by line. | retired_name (Verdict), colon_fragment |
| `web/components/landing/home/HiringTruths.tsx` | Not forty tips. Every line a recruiter trips on, in the order they hit it. | We show you where. The lines a recruiter would stop on, in the order they’d read them. | not_x_but_y ("Not forty tips."), coined_word ("hit it") |
| `web/components/landing/home/HiringTruths.tsx` | No ATS score. No interview odds. Just what reads clearly and what doesn’t. We’ll rewrite your line. Only from your facts. | Nobody can score you against an ATS or tell you your interview odds. So we don’t pretend to. We tell you which lines are clear, and rewrite yours only from your facts. | punch_fragments, not_x_but_y ("No X. No Y. Just…") |
