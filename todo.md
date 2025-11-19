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
