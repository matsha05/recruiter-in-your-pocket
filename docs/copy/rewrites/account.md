# Rewrites: My reports and progress

Where: `/reports`, `/dashboard`. November 6, 2026. Verified on a local production build with the Playwright specs listed in `README.md`.

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/app/(app)/reports/page.tsx` | Your saved resume reports, with the Verdict, score, and fixes from each. | Every report you’ve saved, with its score and the lines that needed work. | retired_name (Verdict) |
| `web/app/(app)/reports/page.tsx` | Showing your latest 50 reports. Older reports remain stored and can be included in an account export. | These are your latest 50 reports. Older ones are still saved, and an account export includes them. | stiff ("remain stored and can be included") |
| `web/app/(app)/reports/page.tsx` | Your report history could not load. | We couldn’t load My reports. | two_names ("report history"), passive |
| `web/app/dashboard/ProgressView.tsx` | Same score as your first report. The written findings show what moved. | Same score as your first report. The write-up says what changed. | two_names ("written findings" for the write-up) |
| `web/app/dashboard/ProgressView.tsx` | What keeps tripping recruiters up, and what keeps landing. | What keeps coming up across your reports, and what keeps working. | coined_word ("landing") |
| `web/app/dashboard/layout.tsx` | What keeps tripping recruiters up in your resume, and what keeps landing. | What keeps coming up across your reports, and what keeps working. | coined_word ("landing") |
