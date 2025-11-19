# Todo / Open Issues

## Backend first
- [ ] Replace current server.js with a clean, minimal Express server
- [ ] Confirm .env is loaded and OPENAI_API_KEY is read correctly
- [ ] Make POST /api/resume-feedback return a stable JSON shape
- [ ] Make npm start run the backend with a single command
- [ ] Test locally from the frontend and confirm no CORS or 500 errors

## High priority product work
- [ ] Improve resume feedback formatting and readability
- [ ] Finalize scoring rubric and visual display
- [ ] Ensure non tech roles (marketing, legal, nonprofit, etc) get relevant advice
- [ ] Clean up ghost loading behavior and error states
- [ ] Stabilize deployment flow once local dev is solid

## Later
- [ ] Design negotiation mode UI in the same visual style
- [ ] Add negotiation prompt and scoring logic on backend
- [ ] Add basic landing content that explains what the app does

## Newly Added High Priority Items

- [ ] (E) Improve model prompt consistency and reliability. Ensure JSON always matches frontend structure.
- [ ] (G) Strengthen alignment for non-technical career paths so feedback is accurate for marketing, HR, legal, nonprofit, creative, education, and operations roles.

## Newly Added Later Items

- [ ] Expand prompt instructions to match Matt’s grounded, calm recruiter voice.
- [ ] Add role-specific heuristics so feedback feels customized (tech, marketing, HR, design, legal, etc.).
- [ ] Add model constraints to avoid generic AI phrasing and make output crisp, human, specific.
