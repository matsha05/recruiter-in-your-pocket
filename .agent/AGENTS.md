# Agent Instructions - Recruiter in Your Pocket

READ ~/Desktop/dev/agent-scripts/AGENTS.md BEFORE ANYTHING (skip if missing).

---

# RIYP-Specific Rules

<riyp-instructions>

<identity>
  Product: A recruiter-first software product. Never frame it as a consultancy, agency, or editorial service.
  Core Promise: "See what they see."
  Wedge: The "Recruiter First Impression" (Score + Verdict + Critical Miss).
  Hosting: Vercel. Next.js App Router.
</identity>

<stack>
  Frontend: Next.js (App Router), TailwindCSS, Framer Motion.
  Fonts: Space Grotesk Variable (display/authority/actions), Instrument Sans Variable (interface/body/technical labels). No third branded font.
  Icons: Phosphor for branded and public-facing expression. Existing Lucide icons may remain until the surface is intentionally migrated; never mix icon families within one surface.
  Package manager: npm (not yarn, not pnpm).
</stack>

<epistemology>
  Assumptions are the enemy. Never guess numerical values - benchmark instead of estimating.
  When uncertain, measure. Say "this needs to be measured" rather than inventing statistics.
  Protect "Absolute Verifiability" - no hallucinated authority in career analysis.
</epistemology>

<constraints>
  Do not break existing behavior during refactors.
  September 4, 2026 product direction: Matt wants a fully live product, not a beta stopping point. Complete the core customer journeys and their release verification; do not relabel unresolved defects as accepted beta issues. Keep the voice human and specific, with character grounded in useful recruiter observations. Additional features still need working end-to-end behavior before public exposure.
  Apply the same editorial standard to every layer: public pages, reports, research and figures, tools, account and payment flows, errors, emails, PDF exports, and generated-feedback instructions and fallbacks. A polished homepage does not establish quality across the product. Keep advice useful and factual; do not impose numbers or timeframes without a reason, praise incomplete templates as finished writing, or pad reports with repeated observations.
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
  Current sources of truth, rewritten for Lifted Line 2.0 on 2026-07-20:
  - docs/brand-system.md (identity, promise, emotional target, and signature grammar)
  - docs/design-system.md (visual application, production tokens, components, and release contract)

  User override (July 2026): Existing visual designs and design guidance are not sacred. Replace or remove them when they do not serve a world-class product. Preserve product truth, trust, accessibility, and working behavior; do not preserve old aesthetics for their own sake.
  
  Protect the Constitution at all costs. Do not let the app drift into generic territory.
  Lifted Line is the approved brand direction. Do not revive Ink & Paper, Editorial Proof, teal-first, dossier, or red-pen directions as competing systems.
  Approved reference images are pixel-fidelity targets, not mood boards. Match their typography, color, spacing, borders, radii, composition, and responsive behavior before handoff. Extend that same visual grammar across connected public surfaces, including every Research index, article, figure, and diagram; do not leave secondary routes on a legacy design system.
  When editing UI, reference the docs and ask: "Does this make the candidate's real work easier to see, and does it unmistakably belong to Lifted Line?"
  SaaS patterns are allowed when they materially improve clarity, conversion, or growth.
</design-constitution>

<copy-constitution>
  Current sources of truth:
  - docs/voice-and-tone.md (brand voice, tone boundaries, and research language)
  - docs/copy-system.md (supporting UI naming, structure, copy budgets, and CTA rules)

  Voice: "Sharp recruiter friend" — warm, confident, direct, opinionated.
  Before writing ANY user-facing copy, read docs/voice-and-tone.md.
  Do not rewrite Matt's tuned backend prompts to make UI language conform; prompt changes require explicit product reasoning and evaluation.
  Before shipping, run the banned-phrases list and proofreading checklist.
</copy-constitution>

</riyp-instructions>
