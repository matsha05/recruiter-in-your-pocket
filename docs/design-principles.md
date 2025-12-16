# Recruiter in Your Pocket — Design Constitution
**Elite Studio. Luminous Authority. Honest Clarity.**

## The 10x Constitution
We are building a product that feels 10x better than generic career tools. This requires strict adherence to the following constitution.

### 1. Elite Flavor: The "Un-SaaS"
We avoid "marketing-site energy" (illustrations, cheerful mascots, bouncy animations).
We embrace "Studio energy" (Stripe, Linear, Notion, Zed).
- **Vibe:** Serious, premium, capable.
- **Visuals:** Luminous depth (subtle gradients, soft shadows, alpha-borders, occasional glass).
- **Restraint:** Only use color for meaning.

### 2. Typography Creates Authority
Hierarchy tells the user we know more than they do.
- **Editorial (Authority):** `Newsreader` (Serif). Used for big statements, verdicts, and section headers. Signals "Institutional Wisdom."
- **Interface (Utility):** `Geist Sans`. Used for controls, labels, and body text. Signals "Modern Software Tool."
- **Data (Truth):** `Geist Mono`. Used for scores, metrics, and code-like elements. Signals "Precision."

### 3. The University Anti-Pattern
We are NOT a friendly university career center. We are a high-stakes partner.
- **Banned:** Flat vector illustrations of diverse people high-fiving.
- **Banned:** "Hi there!" onboarding voice.
- **Approved:** Cinematic loops, light mechanics, reveal interactions, precision microcopy.

### 4. Tone: Constructive, But With Teeth
We are "The Partner" — a confident human expert who tells you the truth because they want you to win.
- **Directness:** "Your impact is buried." > "Try to showcase your impact more."
- **Colors:** Amber for warnings (standard problems), Red for critical failures (deal-breakers). We are not afraid of red.
- **Positive Reinforcement:** Cameos of "Win" moments (score went up, rewrite applied).

### 5. Interaction Physics
Speed signals power.
- **Snap/Instant:** UI interactions (checkboxes, tabs, toggles) should feel immediate (`stiffness: 400`).
- **Controlled Reveals:** High-value moments (score reveal, rewrite generation) use slower, cinematic reveals to build weight.
- **No Bounce:** Avoid playful wobbles or gelatinous physics.

---

# DESIGN PRINCIPLES

## 1. Luminous Authority
Authority comes from clarity and depth, not shouting.
- Use **alpha-borders** (white/10%) to define edges, not heavy grey lines.
- Use **inner-shadows** and **gradients** to create "luminous" buttons that look like light sources.
- Text should feel like ink on paper (sharp contrast) or etched glass (subtle secondary).

## 2. Hero Hierarchy
Every screen has ONE hero.
- **Landing Page:** The `SampleReportPreview` is the hero. The headline supports it.
- **Report View:** The "Recruiter Read" summary is the hero. The score supports it.
- **Pricing:** The $39 "Career Move" pass is the hero.

## 3. Pricing Aggression
We are not a $5 tool. We are a career partner.
- **$39 "Career Move":** Primary. Bold gold styling. The default choice.
- **$19 "Quick Fix":** Secondary. For the specific problem solver.
- **$0 "Try":** The escape hatch, not the destination.

## 4. Light Mode First
Light mode is professional, like a resume document.
- **Light Mode:** The primary "Paper & Ink" experience. High contrast, serious.
- **Dark Mode:** The secondary "Night Shift" premium mode. Deep OLED blacks, glowing accents.

## 5. Trust Through Specificity
We build trust by being hyper-specific, not generic.
- **Generic:** "Improve your resume."
- **Specific:** "Recruiters spend 7.4s skimming. Here is what they see in second 3."
- **Proof:** Cite specific studies (TheLadders, Harvard PON) in the UI.

---

# VISUAL LANGUAGE

## Color System
- **Ink:** The primary text color. Defined, sharp black (or white).
- **Paper:** The background. subtle texture allowed.
- **Gold:** (`#F5B25C`) The "Premium" accent. Used for high-value actions (Upgrade, Score).
- **Moss:** (`#10B981`) The "Success" accent. Used for wins and valid states.
- **Amber:** (`#F59E0B`) The "Warning" accent. Used for common mistakes.
- **Rose:** (`#F43F5E`) The "Danger" accent. Used for critical failures.

## Depth System
We use a 3-layer depth system:
1.  **Base:** The page background.
2.  **Surface:** Cards and panels (`bg-surface`, `border-subtle`).
3.  **Glass:** Floating elements (Sticky headers, toasts) use blur + alpha.

## Iconography
- **Set:** Lucide React.
- **Weight:** `strokeWidth={1.5}` for elegance, `{2}` for small sizes.
- **Style:** Minimal. No fill unless active state.

---

# MESSAGING FRAMEWORK: "SEE WHAT THEY SEE"

## The Core Identity
**One-Liner:** `See what they see.`

**The Problem We Solve:** Users don't know why their resume fails.
**The Transformation:** From "Applicant" (hopeful outsider) → "Candidate" (informed insider).
**The Feeling After:** *"Now I understand how they think."*

## The Psychological Promise
- Apple makes you feel **creative**.
- Nike makes you feel **powerful**.
- **Recruiter Pocket makes you feel *informed*.** You're no longer on the outside hoping. You're on the inside, seeing what they see.

## Copy Rules

### 1. Frame Everything From The Recruiter's Perspective
- **Wrong:** "Get AI feedback on your resume."
- **Right:** "This is what a recruiter sees in 6 seconds."

### 2. The 7.4 Second Anchor
Use the specific "7.4 seconds" (or "6 seconds") stat from eye-tracking research as the grounding detail. It's specific, it's based on data, and it creates urgency.
- **Hero:** "In 7.4 seconds, a recruiter has already decided. This is what they saw."
- **Skim Modal:** "What They See in 6 Seconds"

### 3. Authority, Not Coaching
We are not a "helpful career coach." We are an **expert translator** between the user and the recruiter.
- **Wrong:** "Consider adding more impact statements."
- **Right:** "Your impact is buried. Here's what needs to surface."

### 4. The "Other Side of the Desk"
The product gives you the recruiter's perspective. Use this spatial metaphor:
- "See your resume from the other side of the desk."
- "This is what a recruiter sees."
- "The rules they don't teach you."

### 5. Research is the Playbook
The Research section is not an "academic library." It's the secret playbook.
- **Section Title:** "The Hiring Playbook"
- **Headline:** "The rules they don't teach you."
- **Subhead:** "The biases, the shortcuts, the patterns. Learn what recruiters actually see—and why."

## Key Copy Lines (Reference)

| Location | Copy |
|---|---|
| Hero H1 | `See what they see.` |
| Hero Subhead | `In 7.4 seconds, a recruiter has already decided. This is what they saw.` |
| Skim Modal Title | `What They See in 6 Seconds` |
| Skim Modal Subhead | `This is the moment. Before they read a single bullet, this is the impression.` |
| Report Byline | `This is what a recruiter sees.` |
| Report Footer | `That's the full picture. Now you know.` |
| Pricing Headline | `Know before you apply.` |
| Pricing Subhead | `One scan shows you what they see. The rest helps you win.` |
| Research Headline | `The rules they don't teach you.` |
| Paywall Header | `Ready for the full recruiter perspective?` |

---

# DO NOT BUILD
- **Dashboards:** We are building a *Report*, not a dashboard. Avoid "widget" layouts.
- **Gamification:** No badges, streaks, or confetti. The reward is a better resume.
- **Social Features:** This is a private studio. No "share to feed."

---
*Last Updated: Dec 15, 2025 (Phase 3: "See What They See" Identity)*
