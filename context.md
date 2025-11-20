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

# Recruiter in Your Pocket — Design System v1

A minimal, intentional design language rooted in calm clarity.

## 1. Design Philosophy
- The interface must feel calm, intentional, and trustworthy.  
- No visual noise, no surprises, no playful UI elements.  
- Every pixel has a purpose.  
- The user should never feel rushed or overwhelmed.  
- The page should feel like someone took time to craft it.  

## 2. Typography

### Font family
- Use one sans serif family: system font stack or Inter.
- Never mix fonts.

### Headings
- Weight: 600  
- Tight letter spacing  
- Compact, calm scale  
- H1: 22–26px  
- H2: 18–20px  
- H3: 16–18px  

### Body text
- 15–16px  
- Normal weight (400)  
- Line-height: 1.55–1.65  

### Forbidden
- Italics for emphasis  
- All caps  
- Bright or high-chroma text colors  

## 3. Color System

### Backgrounds
- Primary background: deep navy / near black (#020617)
- Elevated surfaces: slightly lighter (#020818)

### Borders
- Ultra subtle: rgba(148,163,184,0.18)

### Accent
- Single blue: #3b82f6 or #2563eb  
- Use only for: primary button, score pill, active mode indicator

### Error
- Soft red text  
- Soft tinted background  
- Never bright red on black  

### Success  
- No bright green  
- Quiet confirmation only  

## 4. Layout and Spacing Rules

### Vertical rhythm
Use spacing tokens:
- XS: 4px  
- S: 8px  
- M: 16px  
- L: 24px  
- XL: 32px  

Never exceed XL between related elements.

### Cards
- Padding: 24px on all sides  
- Rounded corners: 12px  
- Shadow: extremely subtle or none  

### Sections
- One divider above each section header  
- Spacing:
  - Divider → H2: 12px  
  - H2 → content: 8px  

### Lists
- 16px above list  
- 8px between bullets  
- No nested lists  

## 5. Loading States

### Preferred
- Thin indeterminate progress line  
- Gentle shimmer inside the results card  

### Forbidden
- Full-sentence loading text  
- Spinners  
- Bounce animations  
- “Sending your resume for review…” style copy  

### Empty state
Use:
> Your feedback will appear here.

Quiet, neutral, unobtrusive.

## 6. Interactions

### Buttons
- Subtle focus ring  
- Muted disabled state  
- Minimal animations  

### Copy interactions
- Single quiet icon button  
- Tooltip: “Copied”  

### Keyboard
- Enter submits  
- Escape clears focus  

## 7. Tone & Microcopy Rules (Updated)

The product voice is a senior recruiter who is also a trusted friend. Tone balances authority with genuine care.

### Core identity
- Expert recruiter with deep practical experience  
- Calm, grounded presence  
- Direct insight without ego  
- Genuinely wants the user to succeed  

### Emotional posture
- Rooting for the user  
- Calm, steady, optimistic  
- Honest but never harsh  
- Encouraging but never cheesy  
- Adult-to-adult communication  

### Style guidelines
- Short, meaningful sentences  
- Direct guidance  
- Subtle warmth when appropriate  
- Zero hype, zero marketing tone  
- No exclamation points  
- No emojis  
- Avoid “awesome,” “super,” “amazing,” “magic,” “insane,” etc.  

### When giving feedback
- Speak like a senior recruiter sitting beside the user  
- Praise specifically, critique clearly  
- Give concrete steps  
- Avoid overwhelming the user  
- Encourage them in a grounded way:
  “You’re close. Here’s exactly how to make this stronger.”  

### Overall feeling
The user should feel:
“This is a calm expert who cares about me and is helping me win.”

## Design Studio Principles (Best-in-Class Standard)

This product should be designed with the mindset, rigor, and taste level of a world-class design studio. Every decision — visual, structural, or typographic — should reflect elite craft.

### 1. Reduction to the Essential
- Remove anything that does not meaningfully improve clarity or usability.  
- Every pixel, color, and word must earn its place.  
- Default to removing rather than adding.

### 2. Visual Silence
- The interface should feel calm, quiet, and emotionally stable.  
- No element should compete for attention unless it carries critical information.  
- Avoid visual noise: heavy shadows, big borders, gradients, animations, and color clutter.

### 3. Optical Precision
- Elements should align by optical correctness, not mathematical grids.  
- Prioritize what “feels right” to the human eye over strict numeric centering.  
- Use micro-adjustments (0.5–1px shifts, slight letter-spacing changes) to achieve harmony.

### 4. Hierarchy Without Shouting
- The user should understand structure instinctively.  
- Typography should guide the eye through weight, scale, and spacing rather than bright colors or decoration.  
- The brand mark should be present but understated.

### 5. Emotional Clarity
- The product should make the user feel supported, capable, and calm.  
- Avoid hype language or urgent cues.  
- The voice is confident but warm, like a trusted expert and ally.

### 6. Intentional Spacing Rhythm
- Use XS, S, M, L, XL spacing tokens consistently.  
- Avoid arbitrary numbers.  
- Vertical rhythm must feel even, modern, and breathable.

### 7. Cohesion Across All Surfaces
- The mark, wordmark, headings, body text, buttons, cards, dividers, and empty states must feel like one coherent language.  
- No element should feel imported from a different style or system.

### 8. Subtle, Controlled Motion
- Only use motion when it reduces cognitive load.  
- Hover states should be extremely subtle — never bouncy or dramatic.  
- Loading should use calm, thin indicators or a quiet shimmer.

### 9. Elegance in Restraint
- Favor simplicity over cleverness.  
- Favor clarity over novelty.  
- Favor timeless design over trendy aesthetics.

### 10. “This Could Ship at Apple or Stripe”
Before accepting any UI change:
- Would this feel at home in a premium Apple settings view?  
- Would this feel consistent with Stripe, Linear, or Superhuman’s design sensibilities?  
- Does this communicate quality, trust, and modernity?

If not, refine using reduction, alignment, hierarchy, and optical balance.

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
