# Recruiter in Your Pocket

Recruiter in Your Pocket is a tiny, high-end "resume studio" that reads your resume like a recruiter, then hands you a crafted report: how you read, what's working, what's harder to see, stronger bullets, and simple next steps. It includes a beautiful PDF export and plain-text report copy designed for sharing.

## Features
- Insight Stack: how you read, what's working, what's harder to see, stronger phrasing, next steps.
- PDF export: designed, share-ready report that mirrors the UI.
- Copy report: plain-text version for quick sharing.
- Trust: no resume storage; text stays in your browser until you request feedback.

## Tech stack
- Node/Express backend.
- Static HTML/JS frontend (no build step).
- Puppeteer for PDF generation.

## Design
- Design principles: `docs/design-principles.md`
- Design system: `docs/design-system.md`

## Environment Variables

### Required for Production

- `API_AUTH_TOKEN` - **Required in production**. A secret token used to authenticate API requests. The server will refuse to start in production if this is not set.

  **How to generate a secure token:**
  ```bash
  # Using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Or using OpenSSL
  openssl rand -hex 32
  ```

  **Local development:** `API_AUTH_TOKEN` is optional. You can omit it for local testing.

  **Production:** Must be set in your environment variables. All `/api/*` endpoints will require a `Authorization: Bearer <token>` header in production.

### Required for OpenAI

- `OPENAI_API_KEY` - Your OpenAI API key for generating resume feedback.

### Optional

- `USE_MOCK_OPENAI` - Set to `1` or `true` to use mock responses instead of calling OpenAI (useful for testing).
- `PORT` - Server port (default: 3000).
- `LOG_FILE` - Optional path to log file for structured logging.
- `STRIPE_SECRET_KEY` - Stripe secret key for payment processing.
- `STRIPE_PRICE_ID` - Stripe price ID for checkout sessions.
- `FRONTEND_URL` - Frontend URL for Stripe redirects (default: http://localhost:3000). You can provide a comma-separated list to allow multiple origins (e.g., `https://app.example.com, https://www.example.com`).

### Security & CORS

- The backend only accepts browser requests from `FRONTEND_URL` (and from `http://localhost:3000` / `http://127.0.0.1:3000` in non-production).
- If you see CORS errors in the browser console, make sure the page origin matches `FRONTEND_URL` exactly (protocol, host, and port).
- In production, all `/api/*` endpoints require a bearer token header:
  - `Authorization: Bearer $API_AUTH_TOKEN`
- `/health` remains unauthenticated for uptime checks; `/ready` is intended for infrastructure readiness checks and still validates prompts/OpenAI/mock configuration.
