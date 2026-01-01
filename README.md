# Recruiter in Your Pocket

Elite resume studio that shows candidates how recruiters read them in the first seconds.

## Product Wedge
- Recruiter First Impression: score, verdict, critical miss
- Red Pen rewrites with before and after
- Signal analysis with subscores and gaps

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
Prereqs: Node 20, npm

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
- `npm run eval:smoke` - evaluation harness (run inside `web`)
- `npm run calibrate` - score calibration

## Design and Research
- `docs/design-philosophy.md`
- `docs/design-principles.md`
- `docs/design-system.md`
- `docs/research-ui-contract.md`
