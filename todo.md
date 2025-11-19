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
- [x] Replaced “Pro tip” with brand-aligned “If you have it, include:”
- [x] Added “why this helps” style guidance to enhancement notes

## High Priority (active development)
- [ ] Strengthen rewrite output so bullets feel “elite”, not just cleaned-up wording
- [ ] Refine enhancement notes so they are contextual, grounded, and always meaningful
- [ ] Test rewrite engine across cross-background resumes (teacher, pastor, lawyer, marketer, engineer, sales, nonprofit)
- [ ] Improve summary generation (tone, clarity, uniqueness)
- [ ] Ensure rewrites remain one sentence but not at the cost of meaning
- [ ] Polish frontend UI for rewrite sections and enhancement notes

## Medium Priority
- [ ] Improve scoring rubric consistency and interpretability
- [ ] Add clearer structure in the output card (section dividers, visual rhythm)
- [ ] Improve formatting and readability of strengths/gaps lists
- [ ] Enhance model’s ability to rewrite vague bullets into meaning-rich ones
- [ ] Fine-tune JSON schema constraints for reliability

## Future Work (post-MVP)
- [ ] Offer negotiation mode
- [ ] Offer outreach rewriting mode
- [ ] Activate interview prep mode (currently placeholder)
- [ ] Introduce light role-aware tuning (infer domain without being artificial)
- [ ] Consider persona controls (optional tone presets for early-career vs senior candidates)

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
