# Recruiter in Your Pocket – Architecture

Last updated: 2025-01-27  
Owner: Matt

This file is the concise, always-current map of how the app works: components, endpoints, data paths, and state flows. Update it whenever UI, API, or data handling changes.

## High-level flow
- User pastes or loads a sample resume in the frontend (`index.html`).
- On **Get feedback**, text is sent to the backend resume endpoint.
- Backend validates, calls OpenAI (or mock), normalizes/guards the response, and returns structured JSON.
- Frontend renders score, summary, strengths, gaps, rewrites, next steps, and Missing Wins; export/copy live off the rendered data.
- No resume text is stored server-side; local text is kept in-browser until submit.

## Backend (Express, app.js/server.js)
- Entry: `server.js` boots Express app from `app.js`.
- Health/ready: `/health`, `/ready` (checks prompt file + key or mock).
- Static: serves root `index.html` plus assets.
- Auth: optional bearer token on `/api/*` via `API_AUTH_TOKEN`.
- Rate limiting: simple IP bucket (60 req/min).
- Logging: JSON lines to stdout; optional file via `LOG_FILE`. Each request includes reqId; OpenAI calls log success/latency; errors log code/status.

### Resume feedback: `POST /api/resume-feedback`
- Input: `{ text, mode }` (mode defaults to `"resume"`, even though UI only shows resume).
- Validation: length ≤ 30k; allowed modes `["resume","resume_ideas"]`; optional jobContext/seniorityLevel as strings.
- Call: OpenAI Chat Completions with `response_format: json_object`; model from `OPENAI_MODEL` (default `gpt-4.1-mini`); retries/timeout controlled by env.
- Response guard: parses content, enforces schema (score label/comments, summary, strengths, gaps, rewrites, next_steps), clamps score 0–100; fails closed on parse/shape errors unless USE_MOCK_OPENAI is set.

### Missing wins (ideas): `POST /api/resume-ideas`
- Input: `{ text }` validated for length.
- Call: OpenAI with `response_format: json_object`; schema-enforced questions/notes/how_to_use; fails closed on parse/shape errors unless USE_MOCK_OPENAI is set.

### OpenAI / mocks
- Mock path when `USE_MOCK_OPENAI` is truthy; reads fixtures in `tests/fixtures`.
- Live path requires `OPENAI_API_KEY`; errors mapped to user-friendly messages (timeout, network, parse).

### Env vars (key ones)
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TIMEOUT_MS`, `OPENAI_MAX_RETRIES`
- `USE_MOCK_OPENAI`
- `API_AUTH_TOKEN`
- `LOG_FILE`
- `PORT`

## Frontend (index.html)
- Structure: hero → input card (textarea, sample button, data-handling toggle/panel, Get feedback) → recruiter feedback card (score/summary/sections) → Missing Wins inline block → modals and footer.
- State: plain JS inlined at bottom of `index.html`.
  - Local storage: resume text stored under `rip-main-input-v1`; saved indicator shows when persisted.
  - Sample resume: “Try a sample resume →” button injects a generic resume, triggers save, resize, hint hide.
  - Hint overlay: hidden when textarea has content/focus.
  - Data handling panel: toggled by link; closes on outside click, textarea focus, or Get feedback.
  - Get feedback: posts to `/api/resume-feedback`; shows skeleton, handles errors, renders structured results; copy/export buttons appear after results.
  - Missing Wins: inline teaser + modal; modal fetches `/api/resume-ideas`; falls back to static if parse fails.
  - Modes: UI only exposes resume; mode buttons still wired for setMode logic but Offer is hidden/disabled.
  - Export/Copy: buttons at bottom of results; hidden until feedback renders.
  - Skeleton: static light lines while awaiting results.
  - Footer trust: “We never store your resume or use it to train models.”

## UI & Design System
- Single-page HTML/JS/CSS frontend using a small design system:
  - Accent color: `#3341A6` (Deep Indigo) with supporting boost/strong shades.
  - Spine motif for the Insight Stack.
  - Heading/body type scale with display font for headings and Manrope for body.
  - Spacing tokens for rhythm and hierarchy.
- PDF template reuses these design primitives (accent, spine, headings, spacing) to keep exports consistent with UI.
- Buttons: `.btn-primary` (accent solid) and `.btn-secondary` (muted/outline) are the standard CTA classes, following the accent and neutral palette from design-principles.
- Motion: one signature motion (report reveal) that must respect `prefers-reduced-motion`; it is part of the UI contract, not an optional flourish.

## Data handling
- In-browser until submit: textarea content saved locally and hinted as such.
- On submit: sent over HTTPS to backend, processed, not stored long term; no training use.
- Data handling panel surfaces this plainly; header pill reiterates trust.

## Testing and fixtures
- `npm test` runs: validation, schema contracts (resume + ideas), smoke endpoints, mock run.
- Fixtures: `tests/fixtures/mock_response.json`, `mock_response_ideas.json` used when `USE_MOCK_OPENAI` is set.
- Additional samples: `tests/resumes/` for contract tests.

## Deployment assumptions
- Node 18.18+ (see `package.json` engines).
- Express static + API on the same origin.
- No client-side build step; index.html is hand-authored with inline CSS/JS.

## Keeping this doc current
- Update when: endpoints/validation change, new env vars appear, UI flows shift (e.g., new modes, changed sections), data-handling/trust copy changes, or new tests/fixtures are added.
