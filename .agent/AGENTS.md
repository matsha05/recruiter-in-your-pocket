# Agent Instructions - Recruiter in Your Pocket

READ ~/Desktop/dev/agent-scripts/AGENTS.md BEFORE ANYTHING (skip if missing).

---

# RIYP-Specific Rules

<riyp-instructions>

<identity>
  Product: An elite, digital career studio. Not a "tool."
  Core Promise: "See what they see."
  Wedge: The "Recruiter First Impression" (Score + Verdict + Critical Miss).
  Hosting: Vercel. Next.js App Router.
</identity>

<stack>
  Frontend: Next.js (App Router), TailwindCSS, Framer Motion.
  Fonts: Fraunces (display/authority), Geist Sans (UI), Geist Mono (data).
  Icons: Lucide React (Stroke width 1.5).
  Package manager: npm (not yarn, not pnpm).
</stack>

<epistemology>
  Assumptions are the enemy. Never guess numerical values - benchmark instead of estimating.
  When uncertain, measure. Say "this needs to be measured" rather than inventing statistics.
  Protect "Absolute Verifiability" - no hallucinated authority in career analysis.
</epistemology>

<constraints>
  Do not break existing behavior during refactors.
</constraints>

<oracle>
  Oracle bundles prompts + files for GPT-5 Pro to answer complex questions.
  
  Rules:
  - ALWAYS use --engine browser (never api)
  - If browser mode fails, STOP and ask user
  - Include file context with --file flag
  - Each query needs its own terminal session
  
  When to use: stuck after 2-3 attempts, need architectural decisions, reviewing critical code.
  
  For detailed usage and troubleshooting: See .agent/workflows/oracle.md
</oracle>

<design-constitution>
  Canonical sources of truth:
  - docs/design-philosophy.md (the "why")
  - docs/design-principles.md (the "how" - implementation spec)
  
  Protect the Constitution at all costs. Do not let the app drift into generic territory.
  When editing UI, reference the docs and ask: "Does this feel like Stripe/Linear/Notion?"
  SaaS patterns are allowed when they materially improve clarity, conversion, or growth.
</design-constitution>

</riyp-instructions>
