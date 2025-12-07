# Scale Playbook

When the product grows, these are optimizations worth considering. Not urgent — just documented so future-you knows the options.

---

## When Traffic Gets Heavy (~3,000+ DAU)

**Symptom:** Rate limiting leaks (same user exceeds limits), Vercel cold starts cause inconsistent behavior, Postgres latency on high-frequency lookups.

**Solution:** Distributed rate limiting with Redis (Upstash)
- Upstash has a free tier, serverless-friendly
- ~50 lines of code to implement
- Only worth it if you see rate limit bypass in logs or user complaints

---

## When OpenAI Costs Climb (~$100+/month)

**Symptom:** High OpenAI bill, lots of duplicate requests in logs (same resume analyzed multiple times).

**Solution:** Response caching in Postgres
- Cache key = hash of resume text + job description
- 24-hour TTL
- "Refresh analysis" button to bypass cache
- Saves ~20% of OpenAI costs if duplicate rate is typical

---

## Signals That You're Ready

| Metric | Threshold | What to do |
|--------|-----------|------------|
| Daily active users | 3,000+ | Consider Redis rate limiting |
| OpenAI monthly bill | $100+ | Consider response caching |
| Support complaints | "Rate limited but I only ran it twice" | Redis is overdue |
| Repeat request rate | >20% duplicates | Caching pays for itself |

---

## Current State (Dec 2025)

- Rate limiting: in-memory (works fine for single-instance / low traffic)
- Response caching: none (not needed yet)
- Database: Postgres via Neon (handles everything for now)

This doc exists so you don't have to re-research these options later.
