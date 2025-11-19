# Recruiter in Your Pocket – Context

## North Star
Give people calm, honest clarity about their career quickly.  
No fluff, no hype. Clear signal in a grounded tone.

## Modes (long term)
1. Resume feedback  
2. Offer negotiation  
3. Outreach rewriting  
4. Interview prep (UI-visible later mode)

## Current Focus
Ship an excellent MVP centered on:
- Resume feedback (primary)
- Negotiation mode (next major feature)

Interview Prep remains a placeholder in the UI for now, not implemented in backend logic.

## Current Sub Focus
- Refining resume rewrite quality  
- Enforcing Mechanism → Scope → Impact structure across all rewritten bullets  
- Improving enhancement notes (optional, contextual, grounded in real recruiter guidance)  
- Strengthening prompt consistency and output reliability  
- Polishing frontend rendering of rewritten bullets and enhancement notes  
- Confirming stability of backend and JSON schema  
- Ensuring cross-background accuracy across all roles and industries  

## Design Ethos
- Clean, intentional, minimalist  
- Calm clarity inspired by Jony Ive  
- Avoid cleverness, gimmicks, or noise  
- Only add features that:
  - Deliver real clarity  
  - Save time  
  - Increase confidence  
  - Give actionable rewrites  
  - Create a “holy shit that helped” moment  

## Tech Overview
- Frontend: static index.html with dark, modern UI  
- Backend: Node + Express (server.js)  
- Backend exposes at least:
  - POST /api/resume-feedback  
- OpenAI API is called only from the backend  
- API keys never appear in frontend code  

## Rewrite Engine Philosophy
The rewrite engine improves resume bullets by:
- Applying Mechanism → Scope → Impact logic  
- Using one-sentence high-impact rewrites  
- Strengthening clarity and business meaning  
- Preserving essential nouns (company names, tools, roles, industries, metrics)  
- Never removing signal for the sake of brevity  
- Avoiding all fluff (“improved efficiency,” “drove results,” etc.)  
- Avoiding hallucinated facts, metrics, or invented details  
- Producing output equally strong for all backgrounds (tech, sales, HR, ministry, education, nonprofit, academic, legal, etc.)  

## Enhancement Notes
- Displayed beneath each rewritten bullet  
- Always begin with “If you have it, include:”  
- Provide exactly one optional metric, scope detail, or contextual cue  
- Must reference the specific bullet it follows  
- Must include a brief clause explaining why adding that detail helps (e.g., “so the reader can understand scale,” “which clarifies the magnitude of improvement,” etc.)  
- Must be grounded, calm, and supportive  
- Never editorialize format, grammar, style, or clarity  

## Non-Tech Roles Requirement
Resume advice must work equally well for:
- Marketing  
- Legal  
- Nonprofit  
- Education  
- Pastoral  
- Service, operations, frontline work  
- Technical roles (engineering, data, infra)  
- Corporate roles (sales, HR, finance, ops)  

Guidance must match the discipline represented in the resume.

## Next Major Improvements

### Model Prompt Refinement
- Improve consistency of rewrite logic  
- Strengthen clarity of rewrites without flattening meaning  
- Improve summary generation tone and accuracy  
- Reduce hedging and over-cautious language  
- Provide more calibrated scores  

### Role Alignment Improvements
- Ensure feedback is equally helpful for non-technical resumes  
- Remove unnecessary industry-specific assumptions  
- Keep recommendations rooted in the user's domain  
