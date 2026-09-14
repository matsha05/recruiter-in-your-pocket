# Agent design standards

Read this for RIYP UI, imagery, typography, motion, or visual-system work. Paths below are relative to the repository root. These recorded approvals supplement `docs/brand-system.md` and `docs/design-system.md`; the user's latest explicit direction takes precedence. An exploratory prototype is not evidence that a production design has been approved or released.

## Stack and rendering contract

  Frontend: Next.js (App Router), TailwindCSS, Framer Motion.
  Browser fonts: Instrument Sans, weights 400-700, through shared --font-brand-sans for display, interface, body, and technical labels. September 5 bold-granite refinement: hero/wordmark 700, major marketing headings 650, workspace/report headings 600, body 400, controls 600, labels 600. Source Serif 4 through --font-editorial stays 400 for selected short verdicts. Small aqua/green/amber assessment graphics use shared --assessment-* tokens; ordinal priorities do not encode severity. No third branded font. PDF, Open Graph, icons, and email have separate rendering pipelines and retain their independently verified output treatment until separately updated and checked.
  Icons: Phosphor for branded and public-facing expression. Existing Lucide icons may remain until the surface is intentionally migrated; never mix icon families within one surface.
  Package manager: npm (not yarn, not pnpm).

## Accepted design contract

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

## Completion evidence

Inspect the actual affected UI states at relevant desktop and mobile sizes against the approved reference. For an interactive reference, inspect resting, active, held, and released behavior where relevant; working controls alone do not establish visual acceptance. Verify the affected content and user journey as well as appearance. Follow the design-system document's release checks for a visual-system change, and verify separate output pipelines when they are changed. Report remaining deviations clearly.
