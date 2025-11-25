# Resume scoring rubric

The score measures how clearly your resume tells your story on a first read. It is calibrated from 60 to 100 and anchored on real resumes. It is not a grade on your worth, seniority, or potential. Most solid resumes land in the high 70s to mid 80s. Higher scores reflect clearer structure, stronger ownership language, and more specific outcomes, not just more experience.

The goal is not perfection. The goal is an honest, recruiter-calibrated signal: "If I read this quickly in a real pipeline, how strong would it feel?"

The score is a clarity signal, not a judgment. Bands are calibrated to how clearly a recruiter can understand your story on a first read. These bands are calibrated against a set of 20–30 real and synthetic resumes across multiple domains and seniority levels.

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

**Not ready (around 60 to 69)**  
The story is hard to follow. Sections blur together, bullets read like job descriptions, and impact is mostly missing. A recruiter would struggle to quickly see what you do and what you are good at. The next step is basic structure and clearer responsibilities, not polish.

**Thin signal (around 70 to 76)**  
Some of the right pieces are here, but the signal is faint. You can mostly tell what you do, yet bullets are vague, impact is under described, or the narrative jumps around. With better framing, stronger verbs, and a few concrete results, this can move up quickly.

**Strong foundation (around 78 to 85)**  
The core story is clear. Roles, responsibilities, and value show up in most sections. There are real wins, but not every bullet carries weight, and some impact is still implied rather than explicit. This is a solid resume that benefits from tightening language and adding specific outcomes.

**High bar (around 86 to 90)**  
Ownership, scope, and results are consistently clear. Most bullets show measurable or very specific impact. The narrative lands quickly for a senior recruiter or hiring manager. Remaining changes are small: trimming repetition, merging bullets, or sharpening a few phrases.

**Rare air (around 92 to 96)**  
Exceptionally clear, dense signal without noise. Every line earns its place. Outcomes are specific, scope is obvious, and the story reads like a highlight reel without hype. This is the level where a recruiter immediately understands who you are, what you do, and why you are in the top tier for your track.

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
