# Wordmark directions, November 2026

Exploration for decision D6. **Decided Nov 1, 2026: Matt chose direction C, Two Voices, with favicon C2, The Noted R.** The other directions and favicon options stay here for the record. Wiring the mark into the app is a separate change. Open `board.html` in a browser, or look at `board-1440.png` and `board-390.png`.

Decision so far: Matt picked C, Two Voices, and asked for a better favicon than the plain R. Those options are in "C favicon options" below and on `board-c-favicons.html` (`board-c-favicons.png`).

## The problem

Today's mark is 12 px stacked uppercase (10 px in the app header), smaller than the 15 px navigation beside it. Its uppercase tracking is also a style the design system now reserves for the Verdict and Critical Miss labels. Each direction below sets the full name at 20 px on one line for desktop and on two lines for phones, and has a favicon that works on its own.

## A. The Marked Line

A resume sheet with three lines. The middle one is swiped in highlighter, with the slanted ends of a chisel tip. It is the Critical Miss as a picture.

Where it bends:

- At 16 px it is redrawn on whole pixels: 1 px outline, 2 px lines, 1 px gaps.
- Yellow appears on every page. On the report it sits next to the Critical Miss, so report pages would need the name without the symbol.
- Document icons are common. The yellow line is the only thing that makes this one ours.
- On phones its three lines sit across from the three-line menu icon.

## B. The Pocket Pen

A shirt pocket with the recruiter's green pen clipped over the edge. The name, drawn, in ink and pen green only.

Where it bends:

- At 16 px the pocket is 12 by 10 px, the pen a 4 px cap with a 2 px clip, cut out with 1 px gaps.
- On dark browser chrome, `favicon.svg` switches to a light pocket and the mint dark-mode pen. PNG fallbacks (`web/app/icon.tsx`) can't switch, so they should use the paper tile from `app-icon.svg`.
- Without the pen, the pocket is a generic badge. The two are never separated.

## C. Two Voices

No symbol in the lockup. "Recruiter" and "Your Pocket" in Schibsted Grotesk ExtraBold, "in" in Literata italic in the green pen: the same two voices as the report, so the long name reads as two halves.

Where it bends:

- The italic "in" turns faint at 12 px on a standard screen. Keep the logotype at 14 px or larger.
- The favicon is a plain R on ink. It is legible and says nothing on its own.

## Original recommendation: B, The Pocket Pen (superseded: Matt chose C)

- It explains a 24-character name in one look.
- It keeps yellow for the one line a recruiter would miss. A puts a highlighter on every page, including beside the Critical Miss.
- Its silhouette holds at 16 px and nobody in the category owns it. C's R does not give us that.
- Its colors already mean something: ink for the product, green pen for the recruiter.

The risk: it is about the name, not the wedge. The homepage and share card carry the wedge, so the mark doesn't have to.

## Open questions for Matt

1. Which direction: A, B, or C?
2. If B: does the pocket feel charming, or too illustrated beside the sharp type?
3. If A: is a yellow mark on every page acceptable, given that yellow is meant to mark only the miss?
4. B's home screen icon is on a paper tile. Keep that, or use ink to match today's favicon?
5. The sign-in email has a 4 px yellow rule across the top that marks nothing. Keep it, or drop it with the new mark?

## C favicon options

Each option pairs the product's Schibsted R with the recruiter's Literata italic in the green pen (mint on dark). Light files sit on a paper tile and dark files on an ink tile. The 16 px versions are redrawn on whole pixels, not scaled down. The 32 px versions are scaled so the R's stem is a whole number of pixels.

- **C1, The Finished R.** Schibsted's R with its leg replaced by the leg of Literata's italic R, in pen green. Both voices make one letter, the way the italic "in" sits inside the name. At 16 px the leg becomes a 2 px pen stroke with the same curl.
- **C2, The Noted R.** The full R, underlined once in pen, with italic-cut ends and a slight lift at 180 px. It is the crispest at 16 px and the closest to today's favicon. The underline is a mark under the letter, though, not a second voice.
- **C3, R in.** The R and the italic "in" side by side, the first two words of the name. It is the most literal tie to the logotype. At 16 px the italic has to become upright 1 px strokes, and the pair reads as "Rin".

I set aside the italic "in" on its own. It is the prettiest at 180 px, but a rounded tile that says "in" reads as LinkedIn, which job seekers usually have open in the next tab.

**Chosen: C2, The Noted R (Matt, Nov 1, 2026).** Use `c-two-voices/favicons/c2-noted-r/` for the favicon (16 and 32 px), the apple touch icon (180 px), and the PWA icons.

Our recommendation had been C1: it is the only option where the two voices form one shape, so it carries the logotype's idea instead of repeating its letters. It still reads as an R in a 16 px tab, and the green leg makes it unlike any other R favicon. C2 is the fallback if Matt wants the safest, most legible mark.

Files: `c-two-voices/favicons/<option>/{16,32,180}-{light,dark}.svg`, where the options are `c1-finished-r`, `c2-noted-r` and `c3-r-in`. The 180 px files are full bleed, because iOS rounds the corners itself.

## Files

Each direction folder has the same set:

- `symbol.svg`, `symbol-dark.svg`: the symbol for light and dark grounds (C has only the R tile)
- `favicon.svg` (32 px grid) and `favicon-16.svg` (redrawn for 16 px)
- `app-icon.svg`: 180 px home screen icon, full bleed, since iOS rounds the corners
- `logotype.svg`, `logotype-dark.svg`: one line, for the desktop header, PDF, share card and email
- `logotype-stacked.svg`, `logotype-stacked-dark.svg`: two lines, for phone headers

Every letter is an outline path from the repo's static Schibsted Grotesk and Literata cuts, so nothing depends on the web fonts. Spacing uses the fonts' own kerning plus two optical word-space adjustments (after "r" and before "Y"), with -0.015 em tracking. The kerning is measured in Chromium because opentype.js 0.11 can't read it.

Implementation notes for whichever direction is picked: email clients strip SVG, so the email needs a 2x PNG with the alt text "Recruiter in Your Pocket". The signed-in app header isn't mocked here; the one-line lockup at about 18 px should replace the 10 px compact mark.

To regenerate after a change, run `node generator/build.cjs` and then `node generator/render.cjs` from this folder. The build writes every SVG and both boards (the C favicon options come from `generator/cfav.cjs`), and the render writes all three PNGs. They use opentype.js and Playwright from `web/node_modules`. Run `node generator/kern.cjs` first if the font files change.
