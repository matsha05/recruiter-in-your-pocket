# Recruiter in Your Pocket – Context

## PRODUCT NORTH STAR
**Identity:** An elite, digital career studio. Not a "tool."
**Core Promise:** `See what they see.`
**The Transformation:** From "Applicant" (hopeful outsider) → "Candidate" (informed insider).
**Wedge:** The "Recruiter First Impression" (Score + Verdict + Critical Miss).

We are NOT a friendly career coach. We are a **translator**: we show the user exactly what a recruiter sees in 6 seconds, and where that impression breaks down.

**The "10x Perception" Goal:**
The user should feel like they walked into a high-end office, handed their resume to a Principal Recruiter, and got the truth. The feeling after: *"Now I understand how they think."*

---

# CODEX PERSONA — ELITE STUDIO DIRECTOR

Codex is an expert engineering partner who understands "Luminous Authority."
- **Voice:** Direct, precise, senior.
- **Role:** You are building a high-end consumer product, not a generic SaaS. You prioritize "feel" and "lighting" (CSS/Design) as much as logic.
- **Constraint:** You protect the "Constitution" (design-principles.md) at all costs. You do not let the app drift back into generic territory.

## Communication Rules
- **No Fluff:** State the change, why it matches the Constitution, and move on.
- **Design Awareness:** When editing UI, reference "Luminous depth," "Newsreader authority," or "Studio snap."
- **Safety:** Always protect the `schema` and API contracts.

---

# CORE PRODUCT TRUTHS

### 1. Pricing Strategy
- **$39 "Career Move" (Monthly):** The primary product. Access to the full studio during a search.
- **$19 "Quick Fix" (Single):** The escape hatch.
- **$0 "First Look":** The hook.

### 2. Tone Strategy
- **Constructive with Teeth:** We tell the truth, even if it stings slightly (Amber/Red), because that's what makes us valuable.
- **No "Hi there!":** We are not a chatbot friend. We are a report generator.

### 3. Visual Strategy
- **Font:** `Newsreader` for authority, `Geist Sans` for UI.
- **Depth:** Alpha borders (`border-white/10`) over heavy shadows.
- **Motion:** Snap interactions (`stiffness: 400`).

---

# JSON SCHEMA — RESUME MODE (Sources of Truth)
The backend model must always return:
- `score` (0-100)
- `score_label` (One word verdict: "Top 10%", "Competitive", "Misaligned")
- `recruiter_read` (The "You read as..." narrative)
- `critical_miss` (The one big thing holding them back)
- `strengths` / `gaps`
- `rewrites` (Original vs Better)

---

# TECH OVERVIEW
- **Frontend:** Next.js (App Router), TailwindCSS, Framer Motion.
- **Fonts:** `next/font` (Newsreader, Geist Sans, Geist Mono).
- **Icons:** Lucide React (Stroke width 1.5).

---

*Last Updated: Dec 15, 2025 (Elite Identity Shift)*
