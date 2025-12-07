# Recruiter in Your Pocket — Product Vision

## IDENTITY

Recruiter in Your Pocket is a small, elite, recruiter-owned studio for your story.  
It should read like a high-end tool, not a generic AI builder.  
Our core promise: we tell you how you read and exactly how to sharpen the story.

The experience should feel:
- crafted, not generic  
- confident, not tentative  
- joyfully clear, not sterile  

Clarity is our foundation.  
Confidence and small moments of delight sit on top of it.

---

## CORE EXPERIENCE

The rhythm is simple: upload/paste in workspace → get a crafted read → stronger bullets → next steps.

### 1. Input
The user brings something meaningful via the dedicated workspace:
- resume (upload PDF/DOCX or paste text)
- optional job description for alignment analysis
- offer, outreach, interview context (future)  

### 2. Insight Stack  
The heart of the product. For resumes, it is:
- how your story reads at a glance  
- what’s working  
- what’s harder to see  
- stronger phrasing you can use  
- next steps  

### 3. Export with care  
PDF and Copy must feel as designed and intentional as the UI.

### 4. Next Steps  
The user leaves with 3–5 clear actions they can take this week.

The interface should feel like a crafted expert report, not a dashboard.

---

## ACCESS MODEL

- Promise: your first full report is free. No login or card.
- Allocation: 2 free full reports per browser/email (second is a grace buffer). No silent redo. Anonymous usage does not merge into logged-in counts.
- Passes are email-bound, cross-device.
- Pass start: begins after the first post-purchase analysis, not at Stripe checkout (prevents midnight-buyer regret).

### Free tier — always free
- Unlimited Clarity Scores.
- Unlimited short diagnoses (one paragraph).
- Unlimited top 2–3 issues identified per run.
- 1–2 example rewrites per report (copyable).

### Free tier — not free
- Full list of issues.
- Full rewrites for every bullet.
- Missing Wins.
- Export to PDF; copy-full-report.
- Deep Insight Stack sections (Impact & Results, Clarity, Focus & Craft, Stronger phrasing, Next steps).

### Free run UX
- Final-free-run notice before the second run: “This is your final free full report. You’ll still get unlimited free Clarity Scores.”
- After-run toasts:
  - After #1: “Free report used. We’ll give you one extra run in case you need it.”
  - After #2: “You’ve used your free full reports. You can still get your Clarity Score for free anytime.”

### Paid tiers
- 24-Hour Fix Pass (hero): unlimited full reports; all rewrites; Missing Wins; export + copy; email-bound. Copy: “Unlimited full reports for 24 hours.” “Ideal when you need to send a resume today.” Primary, dark accent, preselected.
- 30-Day Campaign Pass (best value): same features for 30 days; intended for active seekers. Copy: “Unlimited full reports for 30 days.” “Perfect when you are applying to multiple roles this month.”

---

## REPORT EXPERIENCE — FREE VS PAID

### Thin free report (v1)
- Score.
- One strong paragraph (“How your story lands”).
- Top 2–3 issues.
- 1–2 example rewrites (copyable).
- Locked sections stay visible (heading/spacing) with:
  - Teaser: “Unlock 4 more rewrites in this section.”
  - Subtle lock icon.
  - Inline CTA: “Get every fix with a pass.”

### Paid full report
- Everything unlocked: full issue list; every rewrite; Missing Wins; export; copy-all; full Insight Stack depth (score → how you read → strengths → what’s buried → stronger phrasing → enhancement notes → next steps).

---

## PAYWALL BEHAVIOR

- Triggers: scroll into a locked section or click a locked control (Missing Wins, Export, see all rewrites).
- Modal-only. Report stays visible behind (no blur/dim). User may close and continue the thin free report.
- Flow: email → code → Stripe → auto-regenerate full report (premium moment).
- 24-hour pass is the primary hero; 30-day shows “Best value.”

---

## GUARDRAILS

- Short-resume warning: <8 bullet-like lines or <1200 chars. Dialog: “This looks shorter than a typical resume. Did you mean to paste the full thing?”
  - Primary: “Paste full resume”
  - Secondary: “Review anyway”
  - Checkbox: “Do not show again today”
- No API call until confirmed. Aligns to “reduce anxiety; protect confidence.”

---

## INTERACTION QUALITY

- Run button debounce: 1500ms; “Running…” state; skeleton loading; prevents double billing/analysis.
- Microcopy (hero helper, textarea helper, run helper): “Your first full report is free. No login or card.”

---

## DEVICE + IDENTITY

- Passes: email-bound, cross-device.
- Anonymous to logged-in sessions do not merge free-report counts.

---

## ANALYTICS (MIXPANEL)

- Core events: resume_pasted; review_started; free_report_viewed; paywall_opened; checkout_started; purchase_completed; short_resume_dialog_shown; short_resume_review_anyway; short_resume_paste_full.
- Props: tier_state (free_full, pass_full, preview); pass_tier (none, 24h_fix, 30d_campaign); text_length; bullet_count; resume_size_bucket; is_sample_resume; paywall_trigger (scroll_locked_section, click_locked_control); free_run_index (1 or 2).
- No reminder nudges about remaining free runs.

---

## SIGNATURE PATTERN

### Insight Stack  
A single column with one clear takeaway per section.

### Crafted Accents  
A thin accent line or subtle highlight used sparingly to guide the eye.

---

## CORE MODES

### Resume Studio (current)  
The hero mode, live today:
- crafted read on how your resume lands  
- strengths  
- gaps  
- rewrites  
- missing wins  
- next steps  

### Offer Studio (planned)  
Negotiation clarity and leverage with its own Insight Stack.

### Outreach Studio (future)  
Cold and warm outreach clarity with a tailored stack.

### Interview Story Studio (future)  
Story patterns and narrative strength with its own stack.

All studios share the same design language: spine, headings, cards, motion. Future ideas must reinforce clarity, confidence, and craft.

---

## PRODUCT EMOTION

We reduce anxiety and build grounded confidence.

Typical emotional arc:
1. “I’m anxious and unclear about how I read.”  
2. “This sees me clearly.”  
3. “I understand what’s strong vs thin.”  
4. “I know exactly what to do next.”  
5. “I feel energized and better about my story.”

Tone: calm hands + sharp eyes. Users should leave feeling:
- seen  
- understood  
- more confident  
- clear about next steps  

---

## DESIGN CONNECTION

This vision works together with:
- `docs/design-principles.md`
- `context.md`

Identity traits:
- crafted  
- confident  
- joyfully clear  

Anything that drifts away from these traits should be reconsidered or removed.
