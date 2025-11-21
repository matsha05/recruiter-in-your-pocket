# Recruiter in Your Pocket – Context

## North Star
Give people calm, honest clarity about their career quickly.  
No fluff, no hype. Clear signal in a grounded tone.
The voice and personality of this product should reflect a real, world-class recruiter who is exceptionally gifted at helping people understand their careers in clear, actionable, and novel ways. It should feel like working with someone who sees your story faster and more deeply than you do, calls out the things you’re not giving yourself enough credit for, pushes you toward clarity without pressure, and gives you practical next steps that genuinely help. The tone is calm but confident, sharp but human, never corporate or fluffy, and always anchored in real insight. Every feature should reinforce the feeling that the product "gets you," surfaces what matters, skips what doesn’t, and gives you the kind of personalized clarity that only the best career advisors in the world can provide.

Design source of truth: see `docs/design-principles.md` for the Design North Star and Principles that govern all UI/UX and copy decisions. Keep this context doc slim and point to that file for design guidance.

## Modes (long term)
1. Resume feedback  
2. Offer negotiation  
3. Outreach rewriting  
4. Interview prep (UI-visible later mode)

## Current Focus
Ship an excellent MVP centered on:
- Resume feedback (primary)
- Negotiation mode (next major feature)

Interview Prep remains a placeholder in the UI for now. It is not implemented in the backend yet.

## Current Sub Focus
- Refining resume rewrite quality  
- Enforcing Mechanism → Scope → Impact structure across all rewritten bullets  
- Improving enhancement notes so they are contextual, optional, and grounded in real recruiter guidance  
- Strengthening summary generation so it sounds like a calm, senior recruiter (Matt) rather than AI or corporate HR  
- Calibrating scoring to feel honest and meaningful for real users  
- Polishing frontend rendering of summary, strengths, gaps, rewrites, and enhancement notes  
- Confirming stability of the backend and JSON schema  
- Ensuring cross-background accuracy for all roles and industries  

## Tech Overview
- Frontend: static `index.html` with dark, modern UI  
- Backend: Node + Express (`server.js`)  
- Backend exposes at least:
  - POST `/api/resume-feedback`  
- OpenAI API is called only from the backend  
- API keys never appear in frontend code  

## Rewrite Engine Philosophy
The rewrite engine improves resume bullets by:
- Applying Mechanism → Scope → Impact logic  
- Using one-sentence, high-impact rewrites wherever possible  
- Strengthening clarity and business meaning  
- Preserving essential nouns (company names, tools, roles, industries, metrics)  
- Never removing signal just to be shorter  
- Avoiding all fluff ("improved efficiency", "drove results", etc.)  
- Avoiding hallucinated facts, metrics, or invented details  
- Producing output that works equally well for all backgrounds (tech, sales, HR, ministry, education, nonprofit, academic, legal, and more)  

## Enhancement Notes
- Displayed beneath each rewritten bullet  
- Always begin with "If you have it, include:"  
- Provide exactly one optional metric, scope detail, or contextual cue  
- Must reference the specific bullet it follows  
- Must include a short clause explaining why adding that detail helps (for example, "so the reader can understand scale" or "which clarifies the magnitude of improvement")  
- Must be grounded, calm, and supportive  
- Must never explain rewriting decisions or editing rationale  
- Must not use industry-specific jargon unless clearly stated in the resume  
- Must never invent or guess metrics  

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

## Summary Engine
The summary is the "recruiter take" on how the resume lands. It should:
- Start with "You read as..." to anchor identity  
- Capture patterns: identity, edge, how they operate, gaps, and trajectory  
- Sound like a calm senior recruiter talking to a friend  
- Use short, plain sentences and everyday language  
- Avoid corporate phrasing or hype  
- Be grounded in what is actually on the page  

Summaries should feel like something a hiring manager would want to hear in a 30 to 60 second explanation of the candidate.

## Next Major Improvements

### Model Prompt Refinement
- Maintain strong rewrite logic without flattening nuance  
- Keep summaries sharp, clear, and non-corporate  
- Reduce hedging or over-cautious language where it does not help the user  
- Calibrate scoring so numbers match the story the summary tells  

### Role Alignment Improvements
- Ensure feedback is equally helpful across technical and non-technical resumes  
- Remove unnecessary industry assumptions  
- Keep recommendations grounded in the user’s domain  

## Command Line Principle

Any time the assistant suggests changes to:
- the context doc  
- the codebase  
- the project structure  
- or any new files  

The assistant should also provide a ready-to-copy terminal command.  
These commands should be simple, safe, and beginner friendly.

Examples the assistant may provide:
- \`echo "text" >> context.md\`
- \`sed -i '' 's/old/new/' context.md\`
- \`mkdir prompts\`
- \`touch prompts/resume.md\`
- \`git add . && git commit -m "Update context doc"\`
- \`git push\`

The goal is to let Matt move fast without needing to know Git or Unix deeply.
The assistant should assume Matt prefers copy-pasteable commands for all structural changes.


## JSON Schema (Resume Mode)

The resume mode must always return valid JSON with this shape:

{
  "score": number,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "rewrites": [
    {
      "label": string,
      "original": string,
      "better": string,
      "enhancement_note": string
    }
  ],
  "next_steps": string[]
}

Field rules:
- score: integer from 0 to 100, calibrated to real-world standards for strong roles.
- summary: 4–6 sentences following Identity → Edge → How they operate → Gaps → Trajectory → Optional synthesis.
- strengths: 3–6 concrete patterns grounded in the actual resume.
- gaps: 3–6 real, fixable clarity issues.
- rewrites: 3–5 rewritten bullets following Mechanism → Scope → Impact logic.
- enhancement_note: "If you have it, include:" + optional context + short value statement.
- next_steps: 3–6 actions that the user can do in 1–2 work sessions.

The model must always return JSON only, with no markdown formatting or fences.


## Resume UI Hierarchy

The output should render in the following order:

1. Score pill
2. Summary (Recruiter's Take)
3. Strengths
4. What Needs Work (gaps)
5. Stronger Phrasing (rewrites)
6. Enhancement Notes (one per rewrite)
7. Next Steps

UI spacing rules:
- A thin separator line appears above every section except the Recruiter's Take.
- Headings use consistent visual style.
- Summary is broken into short, readable chunks.
- Rewrites ideally use a before → after layout when possible.
- The entire UI should feel calm, clean, intentional.


## Error State and UX Messaging Principles

Errors should always:
- Protect the user’s confidence.
- Avoid technical jargon.
- Avoid blaming the user.
- Provide clear next steps.
- Use calm, short, human language.

Examples:
- “We hit a snag generating your feedback. Your resume is safe. Try again in a moment.”
- “Something interrupted the request. Please refresh or try again.”

Never show:
- Raw JSON errors
- Stack traces
- Apologies from the model
- Corporate or hyped language


## Product Purpose (The Why)

Job seekers feel anxious and unclear about how their story reads. Most advice online is generic, hyped, or unhelpful.

Recruiter in Your Pocket exists to deliver:
- Calm, honest clarity  
- Direct, human feedback  
- Actionable rewrites  
- A grounded sense of direction  

The goal is that users finish feeling more confident and less overwhelmed.


## Roadmap

### Near Term
- Perfect resume mode UI  
- Add error states  
- Add backend validation  
- Add structured logging  
- Extract prompts to their own files  
- Ship negotiation mode

### Medium Term
- Outreach rewriting  
- Interview prep (guided experience)  
- Analytics on common resume patterns  

### Long Term
- Premium version  
- Agent-driven workflows  
- Portfolio builder  
- Tools for recruiters and hiring managers  


## Mode UX Philosophy

### Resume
The hero feature. Sharp clarity. Actionable rewrites. Calm, grounded tone.

### Negotiation
Give specific scripts, steps, and guidance. Tone: steady, tactical, supportive.

### Outreach
Rewrite messages with specificity, empathy, and clarity.

### Interview Prep
A step-based, guided experience that feels like a real coach.


## Interaction Philosophy

Every interaction must help the user feel:
- Understood  
- Calmer  
- Aware of their patterns  
- Clear on what to do next  

Guiding principles:
- No hype or corporate tone  
- Short sentences  
- Grounded clarity  
- Pattern-level insight  
- Never overwhelm  
- Respect time and attention  
- The experience should create a “quiet mind”  
