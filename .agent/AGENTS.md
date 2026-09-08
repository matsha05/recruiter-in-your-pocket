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
  Browser fonts: Instrument Sans, weights 400-700, through shared --font-brand-sans for display, interface, body, and technical labels. September 5 bold-granite refinement: hero/wordmark 700, major marketing headings 650, workspace/report headings 600, body 400, controls 600, labels 600. Source Serif 4 through --font-editorial stays 400 for selected short verdicts. Small aqua/green/amber assessment graphics use shared --assessment-* tokens; ordinal priorities do not encode severity. No third branded font. PDF, Open Graph, icons, and email have separate rendering pipelines and retain their independently verified output treatment until separately updated and checked.
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
  Current sources of truth: Alpine product system, with Matt's approved 6 Pro recommendations on 2026-09-05:
  - docs/brand-system.md (identity, promise, emotional target, and signature grammar)
  - docs/design-system.md (visual application, production tokens, components, and release contract)

  User override (July 2026): Existing visual designs and design guidance are not sacred. Replace or remove them when they do not serve a world-class product. Preserve product truth, trust, accessibility, and working behavior; do not preserve old aesthetics for their own sake.
  
  Protect the Constitution at all costs. Do not let the app drift into generic territory.
  Alpine is the approved visual direction across the whole product. Preserve the Lifted Line evidence meanings and truthful product behavior, not its retired aesthetics. Do not revive Ink & Paper, Editorial Proof, teal-first, dossier, or red-pen directions as competing systems.
  September 5 approved 6 Pro override: Instrument Sans and Source Serif 4 replace the intermediate Satoshi/Georgia pairing. Warm canvas #f6f3ef, sheet #fbfaf8, inset #f0efeb, ink #12191b, muted #5f6667, aqua #00738f, aqua surface #e6f3f2, divider #dcdedb, and input boundary #7e888a are the shared palette. Dark pill primary actions, quiet warm headers, 10px fields, and 24px desktop/16px mobile sheets replace ink headers, neon acquisition actions, and the mostly rectilinear policy. Preserve product-truth, security, accessibility, and working behavior. Convert hex palette values to HSL components before using hsl(var(...)) tokens.
  Approved reference images are pixel-fidelity targets, not mood boards. Match their typography, color, spacing, borders, radii, composition, and responsive behavior before handoff. Extend that same visual grammar across connected public surfaces, including every Research index, article, figure, and diagram; do not leave secondary routes on a legacy design system.
  September 5 reference correction: Matt explicitly wants the bold reference's coral first priority, golden-yellow second/third priorities, neutral-gray later priorities, and thick forest-green score ring in the illustrative homepage assessment. Do not flatten these to one amber accent. These colors match the illustration; they do not introduce error/severity classifications into report data.
  When editing UI, reference the docs and ask: "Does this make the candidate's real work easier to see, and does it belong to the same Alpine system as the homepage and report?"
  SaaS patterns are allowed when they materially improve clarity, conversion, or growth.
</design-constitution>

<copy-constitution>
  Current sources of truth:
  - docs/voice-and-tone.md (brand voice, tone boundaries, and research language)
  - docs/copy-system.md (supporting UI naming, structure, copy budgets, and CTA rules)

  Voice: "Sharp recruiter friend" — warm, confident, direct, opinionated.
  Before writing ANY user-facing copy, read docs/voice-and-tone.md.
  September 7 user preference: spell "resume" without accents in all product copy and design discussions.
  Do not rewrite Matt's tuned backend prompts to make UI language conform; prompt changes require explicit product reasoning and evaluation.
  Before shipping, run the banned-phrases list and proofreading checklist.
</copy-constitution>

</riyp-instructions>
