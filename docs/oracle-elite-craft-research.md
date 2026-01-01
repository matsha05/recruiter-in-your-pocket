Launching browser mode (gpt-5.1-pro) with ~7,980 tokens.
[2mThis run can take up to an hour (usually ~10 minutes).[22m
[1mAnswer:[22m
Below is a craft-pattern teardown of those products, written as an implementation spec you can directly translate into a Next.js + Tailwind + Framer Motion UI kit for RIYP. I’ll call out what’s *documented* vs what’s a *recommended RIYP approximation* (since most teams don’t publish their exact easing curves).

---

## 1) Arc Browser

### Core Aesthetic Philosophy

A browser that feels like a spatial workspace, where navigation is a set of purposeful “places” and “glances,” not a pile of tabs. ([Arc Help Center][1])

### Top 5 Implementable Patterns

1. **“Peek” as a first-class interaction (ephemeral preview without context-loss)**

* What Arc does: opens links in a temporary Peek window you can close by clicking outside, without leaving your current context. ([Arc Help Center][2])
* RIYP spec:

  * Use a **non-destructive overlay preview** for: citations, “Recruiter Lens” definitions, example rewrites, evidence sources.
  * Entry: `opacity 0 → 1`, `scale 0.98 → 1`, `y 6 → 0`
  * Timing: `--duration-normal (200ms)` with your `--ease`.
  * Exit: faster than entry (perceived responsiveness): `120–160ms`, `opacity → 0`, `scale → 0.99`, `y → 4`.
* Implementation: Framer `AnimatePresence` + `layoutId` to anchor the preview to the clicked source line.

2. **“Little window” behavior for quick triage**

* What Arc does: Little Arc opens links from other apps as a quick-look window and encourages triage (close, or move into sidebar). ([Arc Help Center][3])
* RIYP spec:

  * Add a “Quick Triage” surface for imported resume/LinkedIn text:

    * “Open as Quick Review” (lightweight, minimal chrome)
    * “Promote to Full Report” (moves into the full analysis flow)
  * Motion: treat as a **transient workspace**:

    * open: `200ms`
    * promote: shared-element transition into the full report shell `350ms` reveal.

3. **Tactile feedback that’s restrained (haptics equivalent on web)**

* Arc lets users turn off “tab haptics,” and explicitly removed a page-dimming effect during Ctrl-Tab switching. That tells you their bar: tactile is good, dimming/overlays that slow you down are bad. ([Arc Help Center][4])
* RIYP spec (web-safe tactile):

  * Replace “haptics” with **micro-press affordances**:

    * Press down: `scale 0.99`, `translateY 1`, `shadow-sm → none`, `100ms`
    * Release: return `120ms`
  * No “global dim” overlays for routine navigation. Only dim for modals that truly block.

4. **Perceived speed improvements are treated as product features**

* Arc release notes call out increased tab switching speed, “faster and flicker-free,” and staggered new windows so they don’t stack perfectly. ([Arc Help Center][5])
* RIYP spec:

  * Treat “flicker-free” as a hard requirement:

    * Avoid unmounted-remounted content where possible. Prefer opacity swaps and `layout` animations over full rerenders.
    * Skeletons should match final layout exactly to prevent reflow.

5. **Spaces as an explicit mental model**

* Arc Spaces are distinct browsing areas with multiple switching methods (icons, gestures, shortcuts, command bar). ([Arc Help Center][1])
* RIYP spec:

  * Introduce “Spaces” equivalent:

    * **Role Spaces**: “Product,” “Engineering,” “Leadership,” “Sales,” “General”
    * **Asset Spaces**: Resume, LinkedIn, Cover Letter
  * Switching should be:

    * keyboard (Cmd+1..4)
    * UI segmented control
    * command palette (“Switch Space: Product”)

### The Signature Moment

**Peek**: clicking a link and instantly getting value without losing your place. ([Arc Help Center][2])

### RIYP Application

Use Peek-style previews for “Evidence Trace” and “Recruiter Lens” callouts so users never lose the thread of the report. Your report becomes a “workspace” instead of a scroll doc.

---

## 2) Raycast

### Core Aesthetic Philosophy

Keyboard-first density where every interaction routes through a single “command surface,” making the product feel native-fast and inevitability-simple. ([Raycast][6])

### Top 5 Implementable Patterns

1. **The search bar is the product (make it visually dominant)**

* Raycast explicitly made the search bar bigger because it’s the center of interaction. ([Raycast][6])
* RIYP spec:

  * On any surface that involves choice, navigation, or filtering, the top element should be an **omnibox**:

    * “Jump to section…”
    * “Search issues…”
    * “Run: LinkedIn rewrite”
  * Typography: Geist Sans 15px input, label above in 11px uppercase.
  * Focus: your `.focus-ring` but upgrade it with a subtle background lift (not shadow), eg `bg-muted/40 → bg-muted/60`.

2. **Action bar as a persistent, teachable affordance**

* Raycast consolidated actions, toasts, and navigation titles into a bottom action bar, and highlights Cmd+K as essential. ([Raycast][6])
* RIYP spec:

  * Add a **bottom action rail** inside report pages:

    * Left: current section name (dense)
    * Center: “Cmd+K Actions”
    * Right: primary next step (“Apply fixes,” “Export,” “Share link”)
  * Toasts appear *inside* this bar, not floating. It feels “system-level,” not “web app.”

3. **List selection feels like a cursor, not a hover**

* RIYP spec:

  * Every list row has 3 distinct states:

    * Hover: `bg-muted/40`
    * Active (keyboard selection): `bg-muted/60` + left 2px brand hairline
    * Pressed: `bg-muted/70` (no scale, avoid jitter in dense lists)
  * Timing: hover in `100ms`, out `160ms` (out slightly slower reads as calm).

4. **Keyboard hints are always visible in the right places**

* Raycast’s Cmd+K framing is “magic, right?” and is treated as a core mechanic. ([Raycast][6])
* RIYP spec:

  * In menus and command results, show shortcuts as Geist Mono 11px:

    * “Export PDF” … `E`
    * “Copy rewrite” … `C`
  * Don’t show hints everywhere. Show them in:

    * Command palette
    * Context menus
    * Bottom action bar

5. **Delight is “tiny details,” not animation**

* Raycast explicitly states principles: fast, simple, delightful, with delight in corners, not theatrics. ([Raycast][6])
* RIYP spec:

  * Your “delight budget” goes into:

    * perfect focus transitions
    * zero-layout-shift skeletons
    * clean empty states
    * consistent menu behavior
  * Motion stays almost invisible.

### The Signature Moment

**Cmd+K opens a command universe, instantly.** ([Raycast][6])

### RIYP Application

Build a recruiter-grade **Command Palette**:

* “Run 6-second scan”
* “Jump to: Red Pen”
* “Toggle: show only critical misses”
* “Export: ATS version”
  This is both premium and deeply differentiated because the commands are uniquely recruiter-flavored.

---

## 3) Linear

### Core Aesthetic Philosophy

Calm power through alignment, contrast discipline, and behavior-defined components that feel inevitable rather than styled. ([Linear][7])

### Top 5 Implementable Patterns

1. **Behavior definitions as a design deliverable**

* Linear explicitly documented behaviors of major components during redesign (“behavior definitions” milestone). ([Linear][7])
* RIYP spec:

  * Add a “Behavior Contract” section to your design principles for:

    * Menus
    * Tooltips/popovers
    * Section headers
    * Expand/collapse
    * Inline edits
  * This is how you get “20-person team” consistency.

2. **Alignment you feel after 2 minutes**

* Linear describes obsessive vertical and horizontal alignment in sidebar/tabs and says it’s not immediately visible but felt after minutes. ([Linear][7])
* RIYP spec:

  * Hard rules:

    * Icon optical alignment: icons sit 0.5px lower than text baseline when needed.
    * Numeric columns: tabular nums, right-aligned, consistent width.
    * Section header format is invariant (you already do this well).
  * Add a “pixel-jitter audit”: no element should move on hover except opacity/background.

3. **Theme/contrast generated from a small set of variables**

* Linear moved to LCH-based theme generation and describes reducing theme definitions down to base color, accent color, and contrast. ([Linear][7])
* RIYP spec:

  * You already have tokens. Add 1 more axis: **contrast intensity** (0.8, 1.0, 1.15) that affects:

    * border alpha
    * muted text
    * hover background opacity
  * This gives “quiet power” without adding decoration.

4. **Invisible menu craft: safe triangle for submenus**

* Linear built a “safe area” triangle so moving from menu to submenu doesn’t accidentally close it, and published how to build it. ([Linear][8])
* RIYP spec:

  * Any nested menu (Export → PDF/Doc, Share → Link/Email, Evidence → Source/Quote) must include a safe zone.
  * This is the kind of invisible detail that screams “elite team.”

5. **Choreography is structural, not decorative**

* RIYP spec:

  * For view changes inside the report:

    * Step 1: highlight the thing that changed (100ms)
    * Step 2: swap content (200ms)
    * Step 3: reveal any supporting details (350ms)
  * Never animate everything at once.

### The Signature Moment

**Context menus that never fight the user’s cursor.** ([Linear][8])

### RIYP Application

Ship the submenu-safe-area pattern everywhere you have nested actions (export/share/evidence). It’s a small amount of code and a massive “feels expensive” multiplier.

---

## 4) Figma

### Core Aesthetic Philosophy

Collaborative precision where the cursor, selection, and spatial feedback create trust in complex operations.

### Top 5 Implementable Patterns

1. **Multiplayer presence: show cursor + selection for context**

* Figma shows the cursor and selection of active participants because it provides context (“who’s here, where are they working”). ([Figma][9])
* RIYP spec (even if RIYP is mostly single-player):

  * Add “presence” equivalents:

    * “Recruiter Lens is looking at…” indicator during scanning
    * If collaboration exists later: shared cursor/selection in the resume editor
  * Implementation baseline: WebSocket presence patterns like cursor add/remove + realtime position updates. ([Mark Skelton][10])

2. **Selection is a product surface**

* RIYP spec:

  * In “Red Pen Reveal,” treat selected text as a first-class selection model:

    * Single click selects a bullet
    * Shift-click range selects bullets
    * Drag box selects multiple bullets
  * Visual: selection outline (1px brand), interior tint very low (brand/6).
  * Motion: selection appears in `100ms` (opacity only).

3. **Handles and affordances appear only when useful**

* RIYP spec:

  * On hover, show:

    * left gutter “handle” for a bullet
    * quick actions: Copy, Apply rewrite, Add to checklist
  * Transition: `opacity 0 → 1` in `100ms`, no movement.

4. **Spring where it represents physics, not delight**

* Figma’s ecosystem uses spring concepts like stiffness/damping/mass for interactions. ([Figma Help Center][11])
* RIYP spec:

  * Restrained spring allowed only for:

    * the Verdict reveal (signature moment)
    * snapping selection handles into place
  * Suggested Framer spring (low overshoot):

    * `type: "spring", stiffness: 520, damping: 48, mass: 0.9`
    * Clamp or keep overshoot amplitude low.

5. **Cursor-as-tool modes**

* RIYP spec:

  * Introduce explicit “modes” in the resume surface:

    * Inspect (default) cursor
    * Select (shows selection affordances)
    * Compare (before/after)
  * Mode switching via command palette, not extra chrome.

### The Signature Moment

**Seeing other people’s cursors and selections makes the system feel real-time and trustworthy.** ([Figma][9])

### RIYP Application

Make the resume “red pen” surface behave like a mini editor: bullet selection, multi-select, and precision affordances. That’s a unique, recruiter-grade differentiator that most resume tools never attempt.

---

## 5) Superhuman

### Core Aesthetic Philosophy

Perceived speed as a design language: everything responds instantly, and the UI teaches you to become faster.

### Top 5 Implementable Patterns

1. **The 100ms rule as a product constraint**

* Superhuman explicitly frames 100ms as the threshold where interactions feel instantaneous. ([Superhuman Blog][12])
* RIYP spec:

  * Any interaction that *looks local* must complete visually in `<100ms`:

    * button press feedback
    * toggles
    * expanding a single list item
  * For network actions, show immediate local commitment, then reconcile.

2. **Command palette as a learning engine**

* Superhuman highlights Cmd+K (Superhuman Command) as the most important shortcut, and uses it to teach shortcuts by showing them in the menu. ([Superhuman][13])
* RIYP spec:

  * Your command palette should show:

    * action name
    * short description
    * shortcut hint
    * “learn it once” design: hints become sticky after repeated use (optional)

3. **Optimistic UI everywhere it’s safe**

* RIYP spec:

  * When user clicks “Apply rewrite,” immediately:

    * visually apply it
    * show a subtle inline “Applied” state
    * if server fails, rollback with an inline error and “Undo”
  * This is perceived speed without playful animation.

4. **Choreographed loading**

* RIYP spec:

  * Replace spinners with:

    * “analysis theater” (you already do)
    * skeletons that match final layout
  * Timing choreography:

    * 0ms: show state change (“Scanning… 01/05”)
    * 200ms: first skeleton appears
    * 350ms: first real result fades in (not everything)

5. **Dense, keyboardable selection flows**

* RIYP spec:

  * In tables/lists (misses, checklist):

    * arrows move selection
    * Enter opens Peek
    * Esc closes Peek
  * Focus state must be beautiful, not browser-default.

### The Signature Moment

**Everything feels instantaneous because the UI commits immediately and never makes you wait to see progress.** ([Superhuman Blog][12])

### RIYP Application

Bake the 100ms rule into RIYP’s component contracts:

* Press feedback in 80 to 100ms
* Hover in 100ms
* Network actions: optimistic + undo
  This is the difference between “nice UI” and “elite tool.”

---

## 6) Stripe

### Core Aesthetic Philosophy

Trust through editorial clarity plus systems-level consistency: typography and spacing feel inevitable, and the UI never surprises you.

### Top 5 Implementable Patterns

1. **Tokenized spacing as a visible discipline**

* Stripe’s docs expose a spacing scale (2/4/8/16/24/32/48) as tokens. ([Stripe Docs][14])
* RIYP spec:

  * You already use a 4px grid. Make it explicit in “Crafted Modernity”:

    * micro gaps: 4
    * control padding: 8–12
    * section spacing: 24–32
    * page rhythm: 48
  * Then enforce it by linting (even a simple PR checklist).

2. **Focus rings that communicate safety and control**

* Stripe Elements examples show a selected tab with a subtle shadow stack plus a 2px focus ring, and invalid inputs with a 2px danger ring. ([Stripe Docs][15])
* RIYP spec:

  * Your `.focus-ring` should:

    * be 2px
    * have a clear offset
    * never be neon
  * Errors: ring only, no red-filled backgrounds (matches your restraint).

3. **“Condensed vs spaced” inputs (density as a switch)**

* Stripe Elements supports “condensed” inputs that group related fields tightly. ([Stripe Docs][15])
* RIYP spec:

  * For high-density pro users, offer compact mode:

    * reduces vertical padding by 2px
    * reduces section spacing by one step
  * Do it as a single toggle so it feels intentional, not inconsistent.

4. **Editorial plus data, not decoration**

* RIYP spec:

  * Use Fraunces only for verdicts/headlines.
  * Use Geist Mono for numbers, metadata, citations.
  * Keep data surfaces neutral, let color mean something (you already do).

5. **Customization without chaos**

* Stripe’s approach: layout stays consistent, styling is variable-driven. ([Stripe Docs][15])
* RIYP spec:

  * Allow user customization only where it doesn’t fragment the experience:

    * compact mode
    * light/dark
    * role space defaults
  * Avoid freeform themes.

### The Signature Moment

**A form or checkout flow that feels calm, inevitable, and trustworthy because every state is designed.** ([Stripe Docs][15])

### RIYP Application

Apply Stripe’s “trust states” to:

* upload/resume parsing
* billing and upgrades
* exporting/sharing (high-stakes actions)
  Design every error and retry path as if money is on the line, because user confidence is.

---

## 7) Notion

### Core Aesthetic Philosophy

Ownership through block-level control: everything is movable, editable, and discoverable, but only revealed when needed.

### Top 5 Implementable Patterns

1. **Progressive disclosure of block controls**

* Notion shows a drag handle (⋮⋮) on hover, used to drag-and-drop blocks. ([notion.com][16])
* RIYP spec:

  * Treat each resume bullet, each “critical miss,” each rewrite as a “block.”
  * On hover:

    * reveal a left gutter handle
    * reveal a small “…” menu
  * Keep default surface clean.

2. **Blue guides during drag**

* Notion mentions blue guides appear to show where a block will go during drag. ([notion.com][16])
* RIYP spec:

  * When reordering misses or checklist items:

    * show a 1px brand/teal insertion line
    * animate line appearance in `100ms` opacity only

3. **Slash commands as a command surface**

* Notion’s help center frames slash commands as a way to insert or modify content quickly. ([notion.com][17])
* RIYP spec (web, restrained):

  * In the rewrite editor, support `/` to:

    * insert impact template
    * insert metrics placeholder
    * convert bullet type (story vs impact vs clarity)
  * This is power-user delight without gamification.

4. **Page identity customization**

* Notion supports page icons and covers. ([notion.com][18])
* RIYP spec:

  * Allow a restrained version:

    * role icon selection (not emoji soup)
    * “report cover” as a subtle header badge, not a big image

5. **Keyboard shortcuts are part of the UX, not documentation**

* Notion has extensive shortcut references. ([notion.com][17])
* RIYP spec:

  * Put shortcut hints inline in the UI where they matter:

    * “Cmd+K Actions”
    * “/ for templates”
    * “Shift+Click to select range”

### The Signature Moment

**Blocks become tangible: hover, grab, move, and the system guides you confidently.** ([notion.com][16])

### RIYP Application

Turn your report into “recruiter blocks”:

* reorderable action plan
* collapsible insight blocks
* hover-revealed controls
  This keeps the surface calm while giving pros the feeling of control and ownership.

---

## 8) Bear Notes and Things 3

### Core Aesthetic Philosophy

Invisible perfection: typography legibility, progressive disclosure, and “it just works” behaviors that disappear until you need them.

### Top 5 Implementable Patterns

1. **Typography tuned for small sizes**

* Bear created a custom font and explicitly calls out tighter letter spacing, larger x-height, and legibility improvements at small body sizes. ([Bear Blog][19])
* RIYP spec:

  * Add a “Legibility pass” to your typography craft rules:

    * UI text (13–15px): avoid loose tracking, prefer neutral or slightly tight
    * Labels (10–11px): increase tracking, increase weight, keep contrast high
    * Numbers: tabular nums everywhere you show scores

2. **Progressive disclosure as a philosophy**

* Bear explicitly says they keep the workspace clean and reveal features only when needed. ([Bear Blog][20])
* RIYP spec:

  * Hide complexity until hover/focus:

    * block handles
    * secondary actions
    * advanced filters
  * But never hide primary action.

3. **Instant search by typing (no focus ceremony)**

* Bear triggers search when the user focuses the list and starts typing. ([Bear Blog][20])
* RIYP spec:

  * In any list (misses, rewrites, evidence):

    * if the list is focused and the user types, open filter instantly
    * show typed query as a small pill at top

4. **Quick Open**

* Bear describes Quick Open as global navigation via shortcut. ([Bear Blog][20])
* RIYP spec:

  * Your Cmd+K palette should support “Quick Open” semantics:

    * open role space
    * open report
    * open a specific section
    * open last 5 actions

5. **“Magic insertion” as a premium moment (adapted for web)**

* Things 3’s “Magic Plus Button” is a celebrated insertion mechanic that changes meaning based on where you drop it. ([MacStories][21])
* RIYP web adaptation:

  * A single “Add to Action Plan” control that can be:

    * clicked to append
    * dragged to insert at a specific spot in the plan
  * Keep it restrained: no bounce, no novelty visuals. It’s “quietly powerful.”

### The Signature Moment

**You notice nothing, and that’s the point: it feels calm because every detail is considered.** ([Bear Blog][20])

### RIYP Application

Do an explicit “Invisible Perfection pass” on:

* typography at 13–15px
* hover reveals
* keyboard search and quick open
* drag insertion guides
  This is where “premium studio” actually comes from.

---

# Synthesis

## Universal Patterns (what all elite products share)

1. **A command surface is central**
   Arc Cmd+T behaviors, Raycast Cmd+K, Superhuman Cmd+K, Notion slash commands all point at the same truth: pros want an omnibox for intent. ([Raycast][6])

2. **Progressive disclosure**
   Controls appear when you hover or focus, not all at once (Notion blocks, Bear philosophy, Linear menu details). ([notion.com][16])

3. **Perceived speed is designed, not hoped for**
   Superhuman’s 100ms framing, Arc’s “flicker-free,” Raycast’s focus on faster use. ([Superhuman Blog][12])

4. **Alignment and spacing are treated like engineering**
   Linear’s alignment commentary and Stripe tokenization show “layout discipline” as a system. ([Linear][7])

5. **“Invisible details” are intentional product work**
   Linear literally shipped the submenu safe area as a felt detail. ([Linear][8])

---

## Anti-Patterns (what they all avoid)

1. **Decorative motion**
   They don’t animate for fun. Motion either:

* teaches what happened
* preserves spatial continuity
* confirms an action

2. **Chrome that competes with content**
   Even when dense, the chrome is quiet. Contrast and hierarchy do the work.

3. **Unstable UI**
   No jitter on hover, no reflow on load, no menus that collapse when you move your mouse “the obvious way.”

4. **Meaningless color**
   Color is semantic, not celebratory. (Your system already aligns with this.)

---

## The Invisible Quality Bar (what separates 9/10 from 10/10)

These are the “users feel it but can’t name it” thresholds:

1. **Zero layout shift in real workflows**
   Skeletons match final layout. Text doesn’t jump when numbers load. Sections don’t resize on hover.

2. **Menus and popovers never punish the cursor**
   Safe areas, predictable dismissal, correct focus trapping, and escape behavior.

3. **Keyboard navigation is fully designed**
   Not just “it works,” but:

* focus ring style is coherent
* selection state is distinct from hover
* shortcuts are discoverable at the moment of need

4. **Latency is staged**
   0ms acknowledgement, 100ms micro feedback, 200ms state change, 350ms narrative reveal.

5. **State transitions preserve context**
   Users always know:

* what changed
* where it went
* what to do next

---

# Direct Answers to Your 5 Questions

## 1) What specific motion/interaction patterns should we add to RIYP design principles?

Add these as explicit “Craft Laws”:

1. **Latency staging contract**

* 0ms: acknowledge input (pressed/selected)
* 80–100ms: micro feedback (hover/press/row select)
* 200ms: UI state changes (tabs, expand/collapse)
* 350ms: narrative reveals (verdict, section reveal)
* Rule: *never* make the user wait to see that the click “worked.”

2. **Spatial continuity default**

* Use shared-element transitions (`layoutId`) for:

  * section header → expanded section
  * selected rewrite → editor
  * citation marker → Peek panel

3. **Menus are engineered**

* Submenus require a safe area (Linear pattern).
* Escape closes topmost layer.
* Click outside dismisses only non-destructive layers (Peek), not destructive confirms.

4. **Selection is a first-class state**

* Hover is not selection.
* Keyboard selection has its own visual system.
* Multi-select behaviors are defined (shift range, cmd toggle, drag box).

## 2) What “delight” moments are permissible within restrained professional aesthetic?

Permissible delight is **competence made visible**:

* A Peek preview that opens instantly and closes cleanly.
* A verdict reveal that counts up once, with restrained spring only on the verdict number (not the entire screen).
* A submenu that never collapses accidentally.
* A command palette that learns the user’s intent (recent commands, role-aware).
* An optimistic “Applied” state with Undo, instead of a spinner.

No confetti. No playful bounce. Delight is “I feel in control.”

## 3) What separates “clean and professional” from “sterile and forgettable”?

Sterile happens when:

* everything is evenly weighted
* nothing has a point of view
* motion is absent or generic
* copy is polite instead of decisive

Memorable, while restrained, comes from:

* **editorial hierarchy** (Fraunces used decisively, not everywhere)
* **verdict-driven structure** (a strong “judgment” moment, then evidence)
* **microcopy with spine** (“This bullet is weak because…”)
* **interaction certainty** (the UI never hesitates or surprises)

## 4) How do we create the feeling of a 20-person design team with AI-assisted solo dev?

Build “team-ness” into the system:

1. **Behavior Contracts**
   A single file that defines interaction rules for: menus, tooltips, selection, focus, loading, errors.

2. **Component finish pass gates**
   A PR checklist that requires:

* hover, active, focus-visible states
* reduced motion behavior
* skeleton parity
* empty state copy
* error state copy + recovery

3. **Motion tokens as code**
   Centralize Framer transitions (one module), never inline random durations.

4. **Visual regression snapshots**
   Even simple screenshot diffs catch “death by a thousand inconsistencies.”

5. **Two-tier icon strategy**
   You already do this. Keep investing: custom glyphs only where it creates signature identity.

## 5) What’s the single highest-leverage craft pattern we’re likely missing?

**A recruiter-grade Command Palette + action bar system** (Raycast + Superhuman, adapted to RIYP).

Why it’s highest leverage:

* It instantly signals “pro tool,” not “resume site.”
* It scales with features without adding chrome.
* It becomes a differentiated “Recruiter OS” layer: role-aware commands, section jumps, export/share/apply flows.

Minimum lovable scope:

* Cmd+K opens palette
* Search actions + sections
* Show shortcuts
* Recent commands
* Context-aware actions based on where you are in the report

---

# If you implement only one new “premium craft” package this week

Implement this bundle:

1. Cmd+K Command Palette (with shortcut hints)
2. Peek Panel for evidence and definitions (non-destructive overlay)
3. Linear-style submenu safe area for nested menus
4. Optimistic apply + undo for rewrites and checklist actions
5. A bottom action bar that hosts toasts and primary next step (Raycast-style)

That combo is restrained, recruiter-grade, and immediately makes RIYP feel “built by a serious team,” not merely “well-designed.”

[1]: https://resources.arc.net/hc/en-us/articles/19228064149143-Spaces-Distinct-Browsing-Areas "Spaces: Distinct Browsing Areas – Arc Help Center"
[2]: https://resources.arc.net/hc/en-us/articles/19335302900887-Peek-Preview-Sites-From-Pinned-Tabs "Peek: Preview Sites From Pinned Tabs – Arc Help Center"
[3]: https://resources.arc.net/hc/en-us/articles/19235387524503-Little-Arc-Quick-Lookups-Instant-Triaging "Little Arc: Quick Lookups & Instant Triaging – Arc Help Center"
[4]: https://resources.arc.net/hc/en-us/articles/20498377604887-Arc-for-macOS-2023-Release-Notes "Arc for macOS - 2023 Release Notes – Arc Help Center"
[5]: https://resources.arc.net/hc/en-us/articles/22513842649623-Arc-for-Windows-2023-2025-Release-Notes "Arc for Windows - 2023-2025 Release Notes – Arc Help Center"
[6]: https://www.raycast.com/blog/a-fresh-look-and-feel "A fresh look and feel - Raycast Blog"
[7]: https://linear.app/now/how-we-redesigned-the-linear-ui "How we redesigned the Linear UI (part Ⅱ) - Linear"
[8]: https://linear.app/now/invisible-details "Invisible details - Building contextual menus - Linear"
[9]: https://www.figma.com/blog/multiplayer-editing-in-figma/ "Multiplayer Editing in Figma | Figma Blog"
[10]: https://mskelton.dev/blog/building-figma-multiplayer-cursors "Building Figma Multiplayer Cursors | Mark Skelton"
[11]: https://help.figma.com/hc/en-us/articles/360051748654-Prototype-easing-and-spring-animations "Prototype easing and spring animations – Figma Learn - Help Center"
[12]: https://blog.superhuman.com/superhuman-is-built-for-speed/?utm_source=chatgpt.com "applying the 100ms rule to email"
[13]: https://help.superhuman.com/hc/en-us/articles/45191759067411-Speed-Up-With-Shortcuts?utm_source=chatgpt.com "Speed Up With Shortcuts"
[14]: https://docs.stripe.com/stripe-apps/style "docs.stripe.com"
[15]: https://docs.stripe.com/elements/appearance-api "docs.stripe.com"
[16]: https://www.notion.com/help/writing-and-editing-basics?utm_source=chatgpt.com "Intro to writing & editing – Notion Help Center"
[17]: https://www.notion.com/help/keyboard-shortcuts?utm_source=chatgpt.com "Keyboard shortcuts – Notion Help Center"
[18]: https://www.notion.com/help/guides/page-icons-and-covers?utm_source=chatgpt.com "Page icons & covers"
[19]: https://blog.bear.app/2023/08/learn-about-our-new-custom-font-bear-sans/ "Meet Bear Sans, the new (type)face of Bear"
[20]: https://blog.bear.app/2024/08/5-hidden-macos-features-you-might-not-know/ "5 Hidden macOS Features You Might Not Know"
[21]: https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/ "Things 3: Beauty and Delight in a Task Manager - MacStories"


[34m11m11s · gpt-5.1-pro[browser] · ↑7.98k ↓7.47k ↻0 Δ15.45k[39m
[2mfiles=3[22m
