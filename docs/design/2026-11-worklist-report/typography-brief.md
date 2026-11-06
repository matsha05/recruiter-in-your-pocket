# The list's typography, from first principles

November 6, 2026. Matt, on the built worklist: "i love the score plus bands and the summary section. however i dont know about the font selection and spacing overall. its hard to read. its just like a blob of text. i love the highlighting and also the examples you give. its mostly spacing, font selection, variety of colors. i dont know but it just doesnt seem high craft." Then: "do more abstract thinking, external design research, see how other world class products handle this or would handle this. be thoughtful and act from first principles."

## What the list is

Strip the product away and the list is an old genre: **a reviewer's marks on someone's manuscript, handed back to the author to revise.** Three hands appear on every entry:

1. **The author's text**, as it stands on the page (the quoted line).
2. **The reviewer's pencil**: what the line doesn't let a reader see (the note), and the query that would fix it (the question).
3. **The author's revision**: the same line with the detail in, which the author writes, not the reviewer (the example with its blanks).

Everything else on the entry is apparatus: where the line sits, how far along the list we are, Copy.

The important observation is that hands 1 and 3 are the **same hand**. The quoted line and the example are both the resume: one is the resume today, the other is the resume after the edit. The built page sets them as two different things (the quote in Literata at body size on a paper strip; the example in Literata at lead size behind a blue rule), so the eye sees three serif blocks of similar weight stacked with a sans question between them, and reads a blob. The fix is not a new typeface. It is giving each hand one consistent voice, and giving the two resume lines the same one.

## What the world-class versions do

- **Code review (GitHub's suggested changes, Gerrit, Phabricator).** The original line and the suggested line are set in the same face at the same size, aligned to the same left edge, so the change itself is what you see. The commentary is in the interface's sans, smaller, beside or beneath. Nobody sets the suggestion in a display size. The craft is in the alignment, not in decoration.
- **The copyeditor's manuscript.** The text dominates. Marks are sparse and in one pencil color. Queries to the author are short, in the margin, in a different hand, and the author's answers go into the text itself, not into a form.
- **Grammarly, Hemingway, LanguageTool.** Marks over the text, and one small card per issue with the replacement shown in the text's own font. Hemingway's per-category colors are its most criticized trait; reviewers praise the simplicity and fault the rainbow. The lesson: one hue per voice is the ceiling, not the floor.
- **Editorial marginalia** (Liza Daly's interactive marginalia; Tufte CSS; Gwern's survey of sidenotes). Notes display by default, never behind a click. Each voice gets one typeface and one color, kept consistent so the reader learns who is speaking. Notes go in the right margin on wide screens and fall inline on narrow ones. Many or long notes break margins; keep them short.
- **Sentence forms** (Huffduffer, iTunes smart playlists; the UI Patterns "fill in the blanks" entry). Blanks one text line tall, inside the sentence, underlined rather than boxed; the sentence is the label. They work when filling the blanks is the point, and fail when the fields are many or optional. Ours are few and the point.
- **Practical Typography** (Butterick). Body text 15 to 25px, line spacing 120 to 145 percent, a measure of 45 to 90 characters, bold and italic as little as possible and never together, 5 to 12 percent tracking on all caps.
- **Linear, Stripe.** Monochrome by default, color only where it carries meaning, a small type scale used consistently, borders that mean something. Linear's density is for people operating a tool all day; a report is read once, so the density is lower, but the restraint carries over.

## The principles this gives us

1. **One voice per hand, and the two resume lines share one.** The quoted line and the example are set in the same face, the same size, on the same left edge: Literata at the lead role (18/30, 20/32 wide), the document's own type. The reviewer's note is the pen: Literata italic at the note role, in pen green, smaller than the line it comments on. The question and the controls are the product's sans, small, muted. The label is the sans label role.
2. **Color lives in the text, never in rules.** The marker on the quoted line (the only yellow), the blue in the blanks and the answers, the pen in the note. No blue rule, no pen rule, no pen-tinted pill in the margin. The dashed box stays for a structural statement, because it is a statement about the page rather than a line from it, and it is the one frame.
3. **Before and after read as a diff.** The example sits directly under the clipping, aligned to the quoted line's left edge, in the same type. The question sits between them as the reviewer's query, in the sans, small and muted. The eye reads: the line; the query; the line with the detail in. That is the Lifted Line, without an arrow.
4. **The note is marginalia.** On a wide screen it sits in the right margin, level with the clipping, no rule, display by default. On a phone it falls inline under the clipping, where the v2 report's miss sheet put it.
5. **Rhythm you can feel.** An 8px grid. Inside an entry: 12px between the label and the strip, 16px between the strip, the query and the example, 12px to the tools. Between entries: 48px with a hairline. The margin column hangs the label like a manuscript's line numbers; the count sits under it.
6. **Measure.** The resume column is at most 60 characters of the lead size (36rem). The note column 15 to 17rem. Nothing wider than its measure, nothing narrower than it needs.
7. **Bold and italic do one job each.** Italic is the pen's note and nothing else. Bold is reserved for the label and the Filled in state. The question is neither.
8. **Nothing decorative.** No tick on the keep entry's label beyond the one tick the pen allows; no pills; no inset tints behind the example. The paper strip is the one material, because it is the real thing (a clipping of the page).

## What the build found that the sketch didn't

- **The resume's hand is not Literata.** The site's clipping sets a resume line in the document's own face (`--font-document`, Georgia, at the prose size; `Paper.module.css`), because an illustration of a document may use the document's type (design-system.md §3). Literata is the pen. The built page had set the example, the candidate's line-to-be, in Literata, which by the system's own logic is the recruiter speaking. The example is now in the document's face at the strip's size and indent, so before and after are one hand to the pixel.
- **The phone order.** The note falls under the line it comments on, before the query and the example, as the brief says; the sketch had it last.
- **Blanks on the baseline.** A field inside the sentence is a rule under the blank, no box and no fill at rest (fill and the pen's ring on focus), so the line reads as a line until the person touches it.
- **Quieter states.** Filled is the pen's word in the margin with a tick, not a pill; the keep entry is the strip without the marker, the note beside it, nothing under it.

## What the outside critique corrected (November 6)

A fresh reviewer, briefed as a staff product engineer at an Anthropic, Google or OpenAI bar, read the build against this brief and disagreed with it in four places. All four were right and are now the rule:

- **The question is not small and muted.** It is the one line that asks the person to act, so it is body size in ink; the label and the controls are the small things.
- **Focus is the candidate's blue, not the pen.** The pen is the recruiter; the blank is the candidate's.
- **A statement about the page is not the pen's italic.** "Nothing is dated after June 2023" is a fact about the manuscript, so it is set in the document's hand, upright; the note beside it stays the pen. Otherwise two pen blocks in a row read as a repeat.
- **The marker rule needs the wrapped case.** Most quotes wrap. The marker is a sweep across every line the quote occupies, at every width.

## What this changes on the page

- The example moves under the clipping, in the clipping's type, aligned to its text; the blue rule goes.
- The question moves between them and drops to the small sans, muted.
- The note moves to the right margin from 960px (inline under the clipping below that), loses its rule, keeps the pen.
- The label stays in the left margin; the count under it; the Filled in state is the label in pen with a tick, not a pill.
- Entries: 48px apart, hairline between; the first has none.
- The keep entry: the line on its strip without the marker, the note in the margin, nothing under it.

Sketch D in `type-sketches.html` draws it. The score, the bands and the write-up above the list do not change.

## Sources

- Butterick, Practical Typography, "Summary of key rules": https://practicaltypography.com/summary-of-key-rules.html
- Liza Daly, "Interactive marginalia": https://lizadaly.com/essays/interactive-marginalia/
- Gwern, "Sidenotes in web design": https://gwern.net/sidenotes
- Tufte CSS (sidenotes, margin notes): https://edwardtufte.github.io/tufte-css/
- UI Patterns, "Fill in the blanks": https://ui-patterns.com/patterns/FillInTheBlanks
- Konigi, Kelley Blue Book's mad-libs form: https://konigi.com/interfaces/kelley-blue-book-mad-libs-form
- Hemingway Editor reviews on its color coding (Reedsy, TCK Publishing): https://reedsy.com/blog/hemingway-app-review, https://www.tckpublishing.com/hemingway-editor-review/
- Grammarly, grouped writing suggestions: https://www.grammarly.com/blog/product/grouped-writing-suggestions/
- GitHub suggested changes, as the reference for before/after in one type (product behavior, not a design write-up)
