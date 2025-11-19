# Recruiter in Your Pocket – Context

## North Star
Give people calm, honest clarity about their career quickly.
No fluff, no hype. Clear signal in a grounded tone.

## Modes (long term)
1. Resume feedback
2. Offer negotiation
3. Outreach rewriting
4. Interview prep

### Current focus
Ship an excellent MVP focused on:
- Resume feedback mode as the primary feature
- Negotiation mode as the next major feature

### Immediate sub focus
The backend is currently broken. Priority is:
1. Rebuild a simple, reliable backend for /api/resume-feedback
2. Make sure it works locally every time
3. Then hook the frontend to it cleanly
4. Then deploy in a boring, stable way

## Design ethos
- Clean, intentional, minimalist
- Calm clarity inspired by Jony Ive
- Avoid clutter or cleverness that does not help the user
- Only add features that:
  - Deliver real clarity
  - Save time
  - Increase confidence
  - Give actionable rewrites
  - Create a "holy shit that helped" moment

## Tech overview
- Frontend: static index.html with dark, modern UI
- Backend: Node + Express (server.js)
- Backend exposes at least:
  - POST /api/resume-feedback
- OpenAI API is called only from the backend
- API key lives in .env, never in frontend code

## Non tech roles requirement
Resume advice must work for:
- Non technical roles like marketing, legal, nonprofit
- Not just engineers or product people

Bar is the same for everyone: excellent, practical resume feedback.
