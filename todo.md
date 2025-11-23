# Todo / Open Issues

## Completed
- [x] Rebuilt backend and restored stable POST /api/resume-feedback  
- [x] Ensured backend works reliably locally  
- [x] Connected frontend and backend cleanly  
- [x] Added JSON structure for strengths, gaps, rewrites, next_steps  
- [x] Implemented rewrite engine with anti-hallucination and clarity rules  
- [x] Added enhancement_note support in backend (JSON)  
- [x] Implemented enhancement_note rendering in frontend  
- [x] Established Mechanism → Scope → Impact rewrite logic  
- [x] Replaced "Pro tip" with brand-aligned "If you have it, include:"  
- [x] Added "why this helps" style guidance to enhancement notes  
- [x] Added summary generation rules to match Matt’s tone and structure  
- [x] Added `docs/design-principles.md` and pointed context to it  
- [x] Slimmed context.md to keep design guidance in a separate source of truth  

## High Priority (active development)
- [ ] Monetization: decide the first paid wedge (e.g., unlimited runs + saved reports) and test pricing with a simple paywall.
- [ ] Continue strengthening rewrite output so bullets feel "elite", not just cleaned-up wording  
- [ ] Expand cross-background testing (teacher, pastor, lawyer, marketer, engineer, sales, nonprofit) with real resumes  
- [ ] Calibrate scoring so it feels meaningful and honest for typical users  
- [ ] Tighten summary behavior on edge-case resumes (very short, very long, non-standard backgrounds)  
- [ ] Polish resume feedback UI for spacing, section dividers, and visual rhythm  
- [ ] Improve formatting and readability of strengths and gaps lists  
- [ ] Achievement Ideas: in real mode, use the live OpenAI response first and only fall back when the JSON is invalid; keep fallback ideas generic  
- [ ] Achievement Ideas UI: keep pre-run minimal, render 3 tailored questions max, and ensure hierarchy/typing align with design principles  

## Medium Priority
- [ ] Improve scoring rubric documentation so it is easy to explain what "70 vs 85" means  
- [ ] Enhance the model’s ability to rewrite vague bullets into meaning-rich ones without inventing details  
- [ ] Fine-tune JSON schema and error handling for resilience  
- [ ] Explore light auto-expansion or "show more" behavior for long rewrites  
- [ ] Add subtle visual treatment for enhancement notes (background, left accent line)  

## Future Work (post-MVP)
- [ ] Ship Offer Studio v1 (negotiation tone, scoring, structure)  
- [ ] Interview Story Studio (only if real demand is proven)  
- [ ] Introduce light role-aware tuning (infer domain gently, do not force a persona)  
- [ ] Consider optional persona controls (for example, early-career vs senior nuance)  

## Tone Alignment Checklist

To keep the product voice consistent with Matt's tone, audit and update the following areas:

### Backend
- **Summaries**  
  Ensure the new Matt style summary pattern is consistently applied.
- **Strengths**  
  Use direct, human phrasing ("You do a good job of...", "You consistently...").
- **Gaps**  
  Frame gaps as "hard to see", "not obvious", or "unclear" rather than harsh judgment.
- **next_steps**  
  Sound like Matt giving someone quick homework ("Add one metric where you can", "Sharpen these bullets to surface your impact").

### Frontend
- **Headings and subheadings**  
  Should read like a calm recruiter talking to you ("Here is how your resume lands").
- **Buttons**  
  Keep them simple and human ("Get feedback", "Paste your resume", "Try again").
- **Helper text and inline notes**  
  Avoid corporate tone. Keep it steady, warm, and clear.
- **Empty states and errors**  
  Stay calm and non panicky ("Something broke on our end. Try again in a moment.").

### Global consistency
- No corporate cliches  
- No hype  
- No overly formal sentences  
- Maintain clarity, warmth, and decisiveness  
- Ensure the rewrite engine, summary engine, strengths, gaps, enhancement notes, next_steps, and UI all feel like the same human speaking
