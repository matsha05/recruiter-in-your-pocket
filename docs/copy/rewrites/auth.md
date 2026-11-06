# Rewrites: Sign-in

Where: `/auth`, `/signin`, the sign-in form and its API messages. November 6, 2026. Verified on a local production build with the Playwright specs listed in `README.md`.

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/app/auth/page.tsx` | Sign in to access saved reports and role context you choose to keep. | Sign in to see your saved reports and the job postings you kept. | internal_term ("role context") |
| `web/app/api/auth/verify-code/route.ts` | That code was not accepted. Check the latest email or request a new code. | That code didn’t work. Check the latest email or request a new code. | stiff passive; now matches the form's own line |
| `web/app/api/auth/send-code/route.ts` | Could not send your sign-in code. Try again shortly. | We couldn’t send your sign-in code. Try again in a moment. | stiff |
| `web/components/auth/AuthFlow.tsx` | Too many sign-in emails were sent. Wait before requesting another. | We’ve sent several codes already. Wait a little before you ask for another. | passive ("were sent") |
