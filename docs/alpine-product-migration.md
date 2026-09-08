# Alpine visual system: product migration

Date: 2026-09-05. Local implementation of the approved web-product direction. No commit, push, or deployment.

## Design anchor and consultation

September 7 update: the approved hero is `web/public/assets/characters/pocket-lion.webp`, with the glasses-wearing lion reviewing a recognizable resume inside a teal pocket. The original three-line headline, warm environment, dark pill actions, and company marks remain. The granite image is retained only as the trust-row logo source. The sections below record the earlier Alpine migration and its historical verification; they are not evidence of the September 7 deployment.

Matt requested a follow-up consultation in [Visual Improvement Ideas](https://chatgpt.com/c/6a9c0560-9080-83e8-a4d1-6bbeee7f555f). The prompt was submitted with 6 Pro selected. It requests reusable rules, tokens and components, upload/report treatments, migration order, verification criteria, export/email guidance, and perceptible motion inside the existing rock. It explicitly distinguishes the known original image from product screens ChatGPT has not inspected.

Consultation status: the 6 Pro response completed after 10m 54s and was read in full. After asking us to wait for the response, Matt said he liked its recommendations. The shared web identity and separately rendered outputs have now been implemented. Landing motion was fixed separately while the consultation was pending.

## Approved direction

6 Pro recommends one shared system with separate marketing, workspace, and reading densities. The landing report preview is the bridge into the working product. Its proposed token values are implementation targets, not recovered metadata from the image and not an audit of the existing screens.

| Role | 6 Pro proposal |
| --- | --- |
| Canvas / sheet / inset | `#f6f3ef` / `#fbfaf8` / `#f0efeb` |
| Main / muted text | `#12191b` / `#5f6667` |
| Aqua / aqua surface | `#00738f` / `#e6f3f2` |
| Subtle divider / input boundary | `#dcdedb` / `#7e888a`; subtle dividers alone cannot identify inputs |
| Primary actions | Dark pill; 60px on the hero, 48px in the app; fields and utility controls are not all pills |
| Marketing / workspace title | 56/58px and 40/44px, weight 400 |
| Report heading / verdict / body | 24/30px at 500; serif 28/36px at 400; body 16/25px |
| Research / table text | 18/30px with 66ch prose; tables 14/22px with labeled numeric columns |
| Main sheet / inset / field radius | 24px desktop (16px mobile) / 12px / 10px |
| Widths | Marketing 1360px; workspace 960px; report shell 1200px; auth form about 440px |

The adopted pairing is **Instrument Sans + Source Serif 4**. Both are self-hosted with upstream licenses. This supersedes the earlier Satoshi/Georgia trial after Matt approved the consultation. The raster source does not establish the original font identity; the implemented pairing is an approved practical choice. The updated hero and real report were rendered and inspected at matched desktop and mobile viewports.

The recommendation agrees with the current inventory on migration order: reconcile docs and semantic aliases, build shared primitives and density variants, migrate the complete upload-to-report journey, then supporting routes and separately rendered outputs. It specifically warns against placing hex values into existing `hsl(var(...))` slots or styling sample and actual reports independently.

Useful additional requirements: distinguish operational errors from resume findings; preserve real diagnostic facts across web/sample/PDF; keep report content immediately readable; preserve input on recoverable failures; do not invent progress percentages; verify output with fallback fonts and without colored fills. New suggested component names describe responsibilities, not a reason to replace working components.

For motion, it recommends a local water cinemagraph: directionally flowing cascade, readable pool ripples, fixed stone/trees/camera/shadow, pause control and still fallback. It suggests approximately 16–32 source pixels per second of trackable waterfall detail as a starting target. A flat-image shader is a 2D approximation; richer flow requires a prepared local water asset, not a regenerated whole hero. The current motion correction stays within source-aligned water masks.

Prior flags about the image's company marks and the drag cue were already resolved by Matt's explicit earlier instructions. The response does not reopen those decisions.

## Pre-migration baseline

Before-change first-screen captures at 1440 × 1000 are in `output/alpine-product-system-20260905/`. All four routes loaded without horizontal overflow. This is a visual baseline, not authentication, billing, or backend verification.

| Surface | Observed mismatch | Evidence |
| --- | --- | --- |
| Upload workspace | Dark horizontal header, heavy centered title with neon underline, cyan upload icon, rectangular form controls | `workspace-before.png`; `InputPanel.tsx`, `AppHeader.tsx` |
| Sample report | Dark header, heavy oversized findings, square report sheet, bright green/cyan bands | `sample-report-before.png`; active `ReportStream.tsx`, `FixCanvas.tsx` |
| Pricing | Heavy heading, cyan structural rule, square offer panels and buttons | `pricing-before.png`; `PricingPageClient.tsx`, `PricingCard` |
| Research | Dark header, very heavy title, cyan illustrated panel, bright selection indicator | `research-before.png`; `ResearchClient.tsx`, `ResearchArticle.tsx` |

The baseline exposed separate homepage tokens, heavy inherited headings, and old ink/citron/rectilinear rules. These have been reconciled in the shared tokens, components, and canonical documents. Design guardrails now validate the actual HSL palette, local font faces, aliases, and state surfaces.

## Implemented shared system

One set of semantic tokens now lives in `globals.css` and the Tailwind mappings. Linked aliases were updated together, including `background`/`surface-page`, `foreground`/`text-strong`, primary controls, cards, muted text, borders, focus rings, and inverted surfaces. The homepage-only token override was removed and the selected composition was compared again at 1536 × 1024.

| Role | Direction | Intentional variation |
| --- | --- | --- |
| Canvas and surfaces | Warm ivory canvas; slightly lighter report/form surfaces; thin neutral boundaries and restrained shadows | Print uses white paper; dark mode needs its own verified semantic values |
| Type | One shared sans, regular large headings, one occasional serif assessment, small clear labels | Report evidence is readable 16px body text, not the tiny marketing preview scale |
| Primary action | Dark neutral pill, consistent label weight, icon sizing, hover/focus/loading states | Compact controls may be shorter; text fields need recognizable input geometry |
| Accent | Restrained aqua for selection, insight, focus, and relevant chart series | Success, warning, error, and disabled roles remain distinct and do not rely on color alone |
| Layout | Consistent gutters and spacing scale; clear grouping and generous page introductions | Report and workspace interiors use denser spacing while preserving hierarchy |
| Report surfaces | Soft paper panels with evidence directly connected to the finding and next action | Avoid nested cards around every sentence; long reports must remain easy to scan |
| Navigation | Shared wordmark, materials, type, active treatment, and control shapes | Marketing has spacious navigation; the app keeps compact task navigation |
| Motion | Short feedback on controls; visibly flowing water in the homepage artwork | Reading, errors, and loading never depend on decorative animation; reduced motion starts still |

Shared typography roles in Tailwind cover marketing/workspace/report titles, verdicts, controls, labels, data, and prose. Supporting routes reuse these roles instead of repeating arbitrary sizes; the design guard remains within its unchanged debt budget.

## Implementation scope

1. **Canonical rules and tokens.** Reconcile brand/design/research docs, `globals.css`, `tailwind.config.js`, and the guardrails. Record the approved desktop screenshot and a mobile baseline. Resolve intentional dark-theme behavior explicitly.
2. **Shared chrome and primitives.** Migrate `SiteHeader`, `AppHeader`, `Wordmark`, `Footer`, `AppPageIntro`, `ui/button`, `ui/input`, textareas, select controls, tabs, dialogs, badges, and report-paper styles. Build actual error, disabled, focus, loading, selected, and empty examples in System Lab.
3. **The main customer journey.** Apply the system to `InputPanel` → `ReportLayout` → `ReportStream` → `FixCanvas` and `ReadComparison`. Preserve upload/paste, optional job context, generation, evidence, missing-fact entry, comparison, saving, and export behavior. Use the active report components, not obsolete alternatives.
4. **Supporting browser surfaces.** Pricing, authentication/account, settings, report history, research/index/articles/figures, methodology, tools, support, legal and trust pages. Migrate shared layout families rather than making independent route styles.
5. **Outputs.** PDF, Open Graph previews, icons, and authentication email. Their font and rendering pipelines are separate and need independent layout and readability checks. Do not report them as migrated after a global CSS change.

## Journey treatment

**Upload:** continue the landing page's quiet header, left alignment, light title, and warm surface. Give resume input one clear paper panel with a dark file action and readable secondary paste action. Keep optional job context subordinate. Preserve file validation and the disabled/loading/retry states. The visual continuation should be evident before any file is selected.

**Report:** use a light page introduction and a contained report surface. Make the assessment sentence and prioritized next steps the first read. Use restrained aqua selection and neutral evidence panels instead of bright adjacent bands. Keep original wording, what is missing, user-supplied context, and the next action visibly connected. Retain navigation and action density; do not enlarge every finding to marketing-hero size or make the user scroll through theatrical reveals.

These are implementation directions, not changes to report generation, product claims, entitlement, or authored research conclusions.

## Acceptance criteria

- Compare the homepage at 1536 × 1024 to the selected source after shared-token changes. Preserve headline lines, art framing, logo baseline, CTA placement, and report introduction.
- Inspect all shared layout families on desktop and at 320/390/768px. Check 200% zoom, font loading, long titles, long evidence, missing data, empty states, errors, and disabled actions.
- Verify loaded font family and actual weights, semantic colors, CTA geometry, headings, report body measure, borders, radii, icons, and component states across routes. Merely importing the same font is insufficient.
- Test keyboard navigation, visible focus, dialog behavior, associated form labels and errors, touch targets, contrast, and screen-reader names. Pair color with labels/icons; do not infer accessibility from screenshots alone.
- Use fixture reports to exercise core upload-to-report presentation and existing report interactions without sending private resumes or triggering paid actions for visual QA.
- Review research figures and charts at their actual display size, including labels, captions, sources, legends, and mobile overflow. Keep meaningful chart encodings distinct from decorative brand accents.
- Render and open actual PDFs; check embedded fonts, page breaks, selectable text, tables, long findings, grayscale legibility, and link output. Check email with fallback fonts and images disabled.
- Keep a route/state checklist with current screenshots. A phase is complete only when every affected route and state has evidence; remaining phases stay explicitly pending.

## Status

- [x] Requested 6 Pro consultation.
- [x] Inspected current source and four representative browser surfaces.
- [x] Read the completed consultation and adopt the user-approved recommendations.
- [x] Reconcile canonical palette, geometry, and component rules.
- [x] Migrate shared primitives and active web layout families.
- [x] Migrate and render PDF, email, Open Graph, and icons.
- [x] Build the production bundle and pass 49 production-browser checks covering the homepage, report navigation, accessibility, motion, and research families.
- [ ] Exhaustive private-account, billing, and external-client verification remains a release activity; current local evidence is recorded in design-qa.md.

## Explicit boundaries

The separate browser extension and its historical marketing mockups have not migrated. Recoloring the mockups would falsely imply a changed extension UI; they remain a documented exception. Public extension discovery remains governed by its existing feature flag. Live account operations, payment flows, email delivery, real resume generation, and deployment were not triggered for this visual migration.

See `design-qa.md`, `output/alpine-product-system-20260905/supporting-surfaces-migration.md`, and `output/competitive-visuals-20260905/output-identity/README.md` for current evidence and limitations.

## September 5: bold-granite refinement

Matt approved the stronger headline and assessment colors as the next bounded browser change. The hero/wordmark now use 700, major marketing headings 650, and shared workspace/report headings 600. Body and Source Serif 4 verdicts remain 400. Small aqua/green/amber assessment graphics increase contrast without changing scores, priority meanings, copy, artwork, or motion.

Verification: production build, TypeScript, lint, design-system guardrails, 15 responsive/report-navigation browser checks, and three accessibility checks passed. Screenshots were inspected at 390, 1024, 1440, and 1536px; layout measurements also covered 320px. The headline retains three lines with no horizontal overflow. Dark-mode amber markers retain dark ink. Temporary evidence is in `/tmp/riyp-bold-20260905/`.

Browser validation used headless Playwright because desktop control was unavailable while the Mac was locked. The landing had no console errors. The sample report still logs the pre-existing local `/api/free-status` 500 caused by missing Redis configuration; this styling pass does not establish working report generation or hosted service status. Separate PDF/email/social outputs keep their previously verified treatment. No deployment was performed.
