# Web (Next.js) frontend

This directory hosts the new Next.js App Router frontend with Tailwind.

## Setup

1) Install deps  
`npm install`

2) Configure Supabase env (required for auth)  
Create a `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
Do **not** expose your service role key in the browser.

3) Run dev server  
`npm run dev`

## Supabase clients
- Browser: `lib/supabase/browserClient.ts`
- Server (App Router): `lib/supabase/serverClient.ts` (uses Next.js cookies)

## Pages
- `/` — placeholder landing shell
- `/signin` — stub magic-link flow using Supabase Auth
- `/workspace` — protected; redirects to `/signin` if no Supabase session

Next steps: port the workspace UI, call existing backend APIs (or new route handlers), and wire Stripe + Mixpanel events.***

