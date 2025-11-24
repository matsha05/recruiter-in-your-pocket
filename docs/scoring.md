# Resume scoring rubric

The score is a 0 to 100 view of how well your resume tells a clear, focused, evidence-based story for the roles you want.

The goal is not perfection. The goal is an honest, recruiter-calibrated signal: "If I read this quickly in a real pipeline, how strong would it feel?"

The score is a clarity signal, not a judgment. Bands are calibrated to how clearly a recruiter can understand your story on a first read.

## Components of the score

Today the score is driven by a content clarity component, and we are starting to annotate a separate layout / visual quality component for calibration.

**Content clarity score (current live input)**
- Measures how clearly your story lands on a first read.
- Driven by structure, bullet quality, ownership, outcomes, and narrative coherence.

**Layout / visual ease score (calibration only for now)**
- Measures how easy the resume is to scan visually assuming the same content.
- Driven by headings, spacing, section separation, and overall template sanity.

## Planned weighting

For the eventual combined score, we plan to use:
- Content clarity: 80 percent of the final score
- Layout / visual ease: 20 percent of the final score

Right now only the content clarity score is used in the app. Layout is being annotated in the calibration sheet to guide future implementation.

## API response fields for scoring

- `score`: Current live score used in the UI today. For now this is equal to `content_score`.
- `content_score`: Content clarity score calibrated by anchors. This remains the backbone of the system.
- `layout_score`: Reserved for future use; will represent visual layout and scanability once PDF-based layout scoring is implemented. Currently null.
- `layout_band`: Reserved string band for layout quality, currently `"unknown"`.
- `layout_notes`: Reserved short text explaining layout observations, currently empty.

## Dimensions and weights

The model considers five dimensions:

1. Impact & outcomes (30)
   - Clear business, mission, or team outcomes.
   - Uses metrics, scale, or before/after language when appropriate.
   - Shows how work moved the needle, not just what tasks were done.

2. Relevance & focus (25)
   - Content is aligned with the target role or family of roles.
   - Headline and top of page frame the right story.
   - Older or less relevant experience is present but de-emphasized.

3. Clarity & structure (20)
   - Sections are well labeled and easy to scan.
   - Bullets are concise and focused on one idea each.
   - Titles, companies, dates, and locations are clear and consistent.

4. Evidence & ownership (15)
   - Uses language that shows ownership: "I led, drove, delivered" when true.
   - Connects actions to outcomes instead of listing responsibilities only.
   - Avoids vague phrasing such as "helped with", "involved in", or "various tasks".

5. Craft & polish (10)
   - Formatting is consistent: spacing, bullets, tense, capitalization.
   - No obvious spelling or grammar issues.
   - Overall presentation feels intentional and professional.

Scores are not a strict formula, but the model is guided to stay within these weights.

## Score bands

These anchors guide both the model and human reviewers.

- **60–69 – Not ready**  
  Story is unclear. Bullets feel busy or generic. Outcomes are missing or weak. Structure hides signal.

- **70–77 – Thin signal**  
  Base is solid but impact is muted. Ownership is soft. Outcomes exist but are inconsistent or too light.

- **78–84 – Strong foundation**  
  Clear ownership and value. Some bullets drift or overexplain. Signal is strong but not consistently sharp.

- **85–91 – High bar**  
  High signal. Scope, ownership, and outcomes land cleanly. Minor clarity edits would make this elite.

- **92–100 – Rare air**  
  Elite signal. Every bullet carries weight, focus, and measurable impact. No noise. No drift.

## Layout bands (visual / template quality)

- **60–69 – Layout problematic**  
  Hard to scan, cramped or chaotic, misaligned sections, distracting formatting.

- **70–79 – Layout needs work**  
  Readable but dense, weak hierarchy, sections bleed into each other.

- **80–89 – Layout neutral**  
  Standard clean template, headings and spacing are fine, nothing fancy but not in the way.

- **90–100 – Layout strong**  
  Very clean modern hierarchy, excellent spacing and alignment, extremely easy to scan.

## Visual layout soft scores (internal, 1–10)

For calibration we record five visual soft scores on a 1–10 scale for each anchor resume:

- `visual_scanability_score`: how easily a recruiter can see sections and key information on first glance.
- `visual_whitespace_score`: whether spacing and density feel readable or cramped.
- `visual_typography_score`: consistency and professionalism of fonts, sizes, and emphasis.
- `visual_date_alignment_score`: how cleanly dates and roles line up and can be scanned.
- `visual_modernity_score`: whether the template feels current, professional, and not gimmicky.

These scores are currently used only for calibration of the future layout component. The live app still uses the content clarity score as the primary scoring input.

Anchor note: the Jeremy Hampton in-house corporate counsel anchor is tagged as `layout_band=layout_neutral` (planned 80–89 range) with visual scores 6, 8, 8, 10, 8.
