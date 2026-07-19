# Recruiter in Your Pocket

Elite resume studio that shows candidates how recruiters read them in the first seconds.

## Product Wedge
- Recruiter First Read: score, likely takeaway, open question, and first move
- Evidence-led bullet upgrades with honest before and after examples
- Story, Impact, Clarity, and Readability diagnostics

## Monorepo Layout
- `web/` - Next.js App Router web app and API routes
- `extension/` - Chrome extension for LinkedIn and Indeed capture
- `scripts/` - scoring, matching, calibration, eval utilities
- `tests/` - contract tests and fixtures
- `docs/` - design constitution, research, audits

## Tech Stack
- Next.js 16 App Router, React 19, TypeScript
- TailwindCSS, Framer Motion, Radix UI
- Supabase (auth and data), Upstash Redis, Inngest
- Stripe billing, Sentry, Mixpanel, Vercel Analytics
- Puppeteer or Sparticuz Chromium for PDF export and parsing
- Chrome extension: Vite + CRXJS

## Local Development
Prereqs: Node 24, npm

1) Install deps
`npm install`

2) Configure env
- Copy `web/env.example` to `web/.env.local`
- Copy `.env.example` to `.env` if you run root scripts or tests

3) Run the web app
`npm run dev`

### Extension Development
```bash
npm install --prefix extension
npm run dev --prefix extension
```
Load `extension/dist` in `chrome://extensions` (Developer Mode).

## Useful Scripts
- `npm run dev` - web app
- `npm run build` - web build
- `npm run lint` - web lint
- `npm run test` - contract tests and smoke checks
- `npm run eval:dry-run` - offline evaluation harness sanity check
- `npm run eval:smoke` - paid smoke evaluation harness
- `npm run calibrate` - score calibration

## Design and Research
- `docs/brand-system.md`
- `docs/design-system.md`
- `docs/voice-and-tone.md`
- `docs/copy-system.md`
- `docs/homepage-story-arc.md`
- `docs/research-ui-contract.md`
