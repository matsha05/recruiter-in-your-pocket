# Agent design standards

Read this for RIYP UI, imagery, typography, motion, or visual-system work. Paths below are relative to the repository root. These recorded approvals supplement `docs/brand-system.md` and `docs/design-system.md`; the user's latest explicit direction takes precedence. An exploratory prototype is not evidence that a production design has been approved or released.

## Stack and rendering contract

  Frontend: Next.js (App Router), TailwindCSS, Framer Motion.
  Browser fonts (Highlighter, Oct 30, 2026): Schibsted Grotesk for headlines and interface (--font-brand-sans, --font-display), Literata for the recruiter's voice (--font-editorial). Self-hosted in web/public/fonts. Palette: ink actions, pen #1f5a46 accent, highlighter #ffe14d only for the Critical Miss. No other branded fonts. PDF, Open Graph, icons, and email have separate rendering pipelines and must be render-checked after changes.
  Icons: Phosphor for branded and public-facing expression. Existing Lucide icons may remain until the surface is intentionally migrated; never mix icon families within one surface.
  Package manager: npm (not yarn, not pnpm).

## Accepted design contract

  Current sources of truth: the Highlighter system Matt chose on 2026-10-30:
  - docs/brand-system.md (identity, promise, emotional target, and signature grammar)
  - docs/design-system.md (visual application, production tokens, components, and release contract)

  User override (July 2026): Existing visual designs and design guidance are not sacred. Replace or remove them when they do not serve a world-class product. Preserve product truth, trust, accessibility, and working behavior; do not preserve old aesthetics for their own sake.

  Protect the Constitution at all costs. Do not let the app drift into generic territory.
  Highlighter is the approved visual direction across the whole product (it replaced Alpine on Oct 30, 2026). Preserve the Lifted Line evidence meanings and truthful product behavior, not its retired aesthetics. Do not revive Ink & Paper, Editorial Proof, teal-first, dossier, or red-pen directions as competing systems.
  Highlighter palette: ground #f4f4f1, paper #ffffff, inset #e9eae6, ink #111513, muted #5a605c, pen #1f5a46, pen tint #e6f0eb, highlighter #ffe14d, miss sheet #fff6c2 / #f2dc6b, miss ink #6b5400, divider #dfe0dc, input boundary #808983. Dark pill primary actions, 18px sheets, no drop shadows. Convert hex values to HSL components before using hsl(var(...)) tokens. The September 5 Alpine palette (aqua) and Instrument Sans / Source Serif 4 are retired.
  Approved reference images are pixel-fidelity targets, not mood boards. Match their typography, color, spacing, borders, radii, composition, and responsive behavior before handoff. Extend that same visual grammar across connected public surfaces, including every Research index, article, figure, and diagram; do not leave secondary routes on a legacy design system.
  October 30, 2026 decisions: the Sept 5 coral/golden-yellow/forest-green homepage assessment colors are retired; no monospace face; the Highlighter system replaces Alpine everywhere.
  When editing UI, reference the docs and ask: "Does this make the candidate's real work easier to see, and does it belong to the same Highlighter system as the homepage and report?"
  SaaS patterns are allowed when they materially improve clarity, conversion, or growth.

## Completion evidence

Inspect the actual affected UI states at relevant desktop and mobile sizes against the approved reference. For an interactive reference, inspect resting, active, held, and released behavior where relevant; working controls alone do not establish visual acceptance. Verify the affected content and user journey as well as appearance. Follow the design-system document's release checks for a visual-system change, and verify separate output pipelines when they are changed. Report remaining deviations clearly.
