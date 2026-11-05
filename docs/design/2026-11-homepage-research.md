# Homepage research: what gives the best product homepages a pulse

November 3, 2026. Sixteen reference heroes were captured headless at 1440 × 900 (frames at 1.2 s and 3.7 s after load, plus one scroll), and three research passes read how those teams build the first screen. The page with the captures is the artifact "Homepage Pulse Research"; this file holds the sources. Anything the sources could not confirm is marked unverified.

## What the references do

| Site | Hero, as captured | What carries the life |
| --- | --- | --- |
| Linear | Headline about weight 510, one line, no hero button, then a real issue (DRV-8852) with a two-minute-old activity feed and an agent panel, working above the fold | The product is real and dense; chrome recedes; almost no shadows |
| Apple (iPhone, iOS) | One word or two lines at 80px weight 600, then the product at full width on a flat field; sections 225px apart | Start-frame to end-frame reveals that play once; pacing like chapters |
| OpenAI | The input box is the hero in a field of air; cinematic imagery below | One idea per viewport |
| Claude | Serif headline beside a photograph of a real desk covered in paper | Warmth from a photograph of actual work |
| Cursor | Weight-400 headline, then a real agent session floating over a classical painting | Real session plus a painting for warmth |
| Granola | Slab-serif headline, a real note mid-enhancement with a live cursor, a photographed call, paper texture | The document shown becoming; a brand built from a co-founder's handwriting |
| Stripe | Weight-500 headline over the WebGL wave kept since 2016 | Years of tuning on one ambient surface; text legibility checked over it |
| Vercel | Weight-400 headline at 72px, a black triangle, three lines | Geometry and air |
| Notion | Bold headline with a hand-drawn figure and a highlighted word, then a real workspace | Illustration, used sparingly |
| Figma | Weight-400 headline beside a collage of real work | The output, not the tool |
| iA Writer | Name, two lines, the editor with one sentence lit | The document is the hero, the UI absent |
| Family | Illustrated characters with physics | "We fly instead of teleport" |
| Superhuman | Weight-400 headline over a photograph with floating product panels | The counter-example: panels fight the photo |
| Things | Icon, name, a paragraph, a video link | Restraint |

Observed across the set: no headline above weight 600 except Notion's; warmth, where present, is a photograph, a painting or a texture with a job, never a radial gradient; the product shown is real, with specific data.

## Sources

Linear
- Homepage, fetched November 3, 2026: https://linear.app
- "How we redesigned the Linear UI" (March 28, 2024): https://linear.app/now/how-we-redesigned-the-linear-ui ("reduce visual noise, maintain visual alignment, and increase the hierarchy")
- Product Hunt thread on the relaunch: https://www.producthunt.com/p/linear/what-do-you-think-of-linear-s-new-homepage ("a working demo on the home page feels like a big plus over just some screenshots")
- Designmunk teardown: https://designmunk.com/linear/ ("Weight 510 (not full bold)"; "Shadows are almost entirely absent"; violet "reserved for interactive highlights")
- Karri Saarinen, YC brand design talk (transcript): https://rosetta.to/u/ycombinator/brand-design-tips-from-linear-founder-karri-saarinen ("it might not be the best thing to have this looping movement")
- Karri Saarinen, Figma blog, 10 rules: https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/
- Token extraction, unverified against live CSS: https://github.com/voltagent/awesome-design-md/blob/main/design-md/linear.app/DESIGN.md
- Not found: any Linear source stating animation durations. The 100 to 250 ms figures online are a blogger's reconstruction (https://blakecrosley.com/guides/design/linear).

Apple
- Built CSS with the type scale: https://www.apple.com/v/mainstage/f/built/styles/overview.built.css (`typography-headline-super` 80px / 1.05 / weight 600 / -0.015em; sections `margin-top: 225px`)
- iPhone 18 Pro page with `hero_startframe` / `hero_endframe` assets: https://www.apple.com/iphone-18-pro/
- Human Interface Guidelines, Motion: https://developer.apple.com/design/human-interface-guidelines/motion ("Don't add motion for the sake of adding motion"; "Make motion optional"; "Let people cancel motion")
- Scroll-driven image sequence breakdown: https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/
- Brad Holmes on Apple's discipline: https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/
- Pacing analyses: https://webtrends.pages.dev/posts/apple-product-page-design-analysis ("paced like a feature documentary, not a brochure"); https://autonoma-digital.pages.dev/blog/cinematic-scroll/ ("One idea per viewport. One motion at a time. One accent colour")

Stripe, Vercel, OpenAI, Anthropic
- Stripe gradient reverse-engineering: https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect
- Katie Dill on the Stripe site (summary, April 2026): https://summify.io/discover/how-stripe-built-their-new-website-ypzNhw/ (the wave kept as "joyful and enduring")
- Vercel Geist: https://vercel.com/geist/introduction and https://vercel.com/geist/grid
- OpenAI brand: https://openai.com/brand/; teardown: https://landingdoctors.com/de/teardowns/openai-com
- Anthropic brand by Geist: https://geist.co/work/anthropic

Document and editorial products
- iA Writer: https://ia.net/writer; "The Web Is All About Typography. Period.": https://ia.net/topics/the-web-is-all-about-typography-period
- Granola brand (Ragged Edge): https://raggededge.com/partnerships/granola; Granola's own post: https://granola.ai/blog/a-new-look-for-granola
- Medium and GT Super (Collins, 2020): https://the-brandidentity.com/feed/collins-refresh-medium-keeps-one-eye-future-editorial-origins/ ("captures the movement of writing")
- NYT type roles: https://fontsinuse.com/uses/3907/the-new-york-times-article-redesign-may-2013
- Are.na's Areal, type that fades back: https://www.are.na/editorial/introducing-areal-are-nas-new-typeface
- Readwise: https://readwise.io; Grammarly: https://www.grammarly.com
- Mosby's Files (Tubik, Awwwards SOTD August 2026): https://www.mosbyfiles.com/
- Annotation tooling: Rough Notation https://roughnotation.com; marker-path demo https://css-houdini.iamvdo.me/highlighter-marker-annotations
- Typewriter effect accessibility: https://dev.to/savvasstephnds/the-problem-with-the-typewriter-effect-and-how-to-fix-it-2731

Craft and motion
- Rauno Freiberg, interaction design: https://rauno.me/craft/interaction-design
- Emil Kowalski, great animations: https://emilkowal.ski/ui/great-animations
- Benji Taylor, Family values: https://benji.org/family-values ("We fly instead of teleport")

Failure modes
- 925Studios, AI slop design tells: https://www.925studios.co/blog/ai-slop-design-tells
- "The Purple Gradient Problem": https://dev.to/james_anderson_h/the-purple-gradient-problem-why-ai-ui-all-looks-alike-and-how-to-fix-it-3j65
- YC, design experts review vibe-coded sites: https://rosetta.to/u/ycombinator/design-experts-review-vibe-coded-websites
- "Gradient fog": https://aismells.pages.dev/gradient-fog.html

## The rules the evidence supports

1. The hero is the product, and the product is real, with specific data.
2. Headlines are large and light: 500 to 600, never 800.
3. Warmth comes from a real thing (photograph, painting, document), not from CSS gradients.
4. One reveal, once, that ends on a still; stage labels, not keystrokes.
5. Chrome recedes; contrast goes to content; shadows only where an object exists.
6. Pace: one idea per viewport, sections far apart.
7. Serif for the writing, grotesk for the tool; never on a single word.
8. Interaction has physics; decoration has none.

## Directions for RIYP

1. The report, becoming (recommended): the hero is the sample report rendered with the real components; on load the Critical Miss takes the highlighter and the note appears once as a word-level fade; then still.
2. A real desk: warmth from art-directed photography of a printed resume, a pen and a highlighter; waits on photography.
3. Two voices, whole: the headline in Literata at 500, the deck in Schibsted, over direction 1's real report.

What the four earlier "pulse" drafts got wrong: they animated a mock-up of someone else's software, applied the serif to one phrase, used a gradient as weather, and put a hover lift on a screenshot. None addressed the deficit the references expose, which is that nothing in the hero is real.

## Verified November 4, 2026: the figures behind the pile

Read directly from Greenhouse, *The Hire Standard*, North America benchmark report, March 2026 (PDF, page 7, "Funnel efficiency metrics"; 6,000+ companies, 640M+ applications, 2022 to 2025):

- Applications per job: 116 (2022), 189 (2023), 223 (2024), **244 (2025)**, up 111%.
- **Stage 1 progression rate: 7.6%** in 2025, down 14.8% since 2022. Stage 2 progression rate: 22.0%.
- Interviews per job: 22.7. Recruiters per organization: 10.43 (2022) to 4.62 (2025).

So the hero's arithmetic holds: 7.6% of 244 is 18.5, and the pile shows 18 green sheets, "Eighteen got called back." The caption on the page cites "7.6% past the first screen." The public benchmarks page shows only the applications figures; the progression rates are in the gated PDF, so cite the report, not the web page.

Greenhouse, *2026 Future of Hiring Candidate Report* (October 20, 2026; 2,800+ job seekers, 1,200 in the US): **81% of US respondents** were rejected from at least one job in the past year without speaking to a human recruiter or an AI interviewer; 31% said it happens often or almost always. This is the figure behind "Nobody tells you why."

## Page-arc research, November 4, 2026 (summary)

Twelve craft-led product pages measured: Linear, Apple (MacBook Air), Stripe, Vercel, Dia, Raycast, iA Writer, Monzo, Notion, Superhuman, Things, HEY. Restrained pages run four to six body sections (Vercel 4, Dia 4, Notion 4, Things 5, Superhuman 6, Linear 7); anything above ten is a catalog. The order is nearly universal: short proof, three or four chapters of one idea and one image each, trust, then a one-line restatement with the hero button. The primary button recurs two to four times on the restrained set (nav, hero, close); chapters use a text link, never a second button. Chapters run 0.7 to 1.5 screens. Nobody puts pricing on the homepage.

Precedents for showing a judgment on a document without an interface: Pound's marks on *The Waste Land* drafts (subtraction and a terse margin word), Nabokov's annotated *Metamorphosis* (the margin note states a fact), NPR's annotated State of the Union (the document is the page), Ben Fry's *Preservation of Favoured Traces* and the WSJ Fed statement tracker (revised words take a color), Rauschenberg's *Erased de Kooning* (when the fix is removal, show the gap), DDB's VW "Lemon" (the inspection as the ad), the NYT "An Incalculable Loss" front page (a field of marks under one sentence). The red-pen study (Rutchick, Slepian and Ferris, 2010) supports spending red once.

## Copy density below the fold, measured November 4, 2026

Ten restrained product pages, 72 body sections, words counted from server-rendered HTML (Linear, Vercel, Dia, Superhuman, HEY, Things, Apple MacBook Air, iA Writer, Family, Notion Calendar). Median 44.5 words per section; 30 of 72 sections are 40 words or under. Median headline 5 words. The repeating feature unit on HEY, Notion Calendar, Vercel and Dia is a headline, one paragraph of 20 to 40 words (Vercel: one 9-word customer line and no paragraph at all), and one visual. The longest supporting paragraph in any feature section outside Apple is 38 words. Quotes never sit inside a feature section; they get their own band as one 11 to 25 word line with a name, or they are cut. No page captions its visual. Rules applied to RIYP: a section is a headline, at most one short paragraph, one object and one link; the example lives in the object, never under it as a quote, caption or list.

## Built, November 4, 2026

The page described above is the homepage. Its parts, all in `web/components/landing/home/`:

- `PileHero` (the pile, the ticking 244, the source line), `ReadBeat` (the pen, Move forward / Reject, the red circle, the ending), `Clipping` (one line on a strip of paper with the marker and the margin note), `NoteSection` (the note Jordan never saw), `HiringTruths` (unchanged), `RecheckSection` (two clippings and the ladder), `FounderNote` (the drawing and the signed note), `CloseField` (the pile again, one sheet outlined). `HomePage.module.css` holds the rhythm; sections compose `.section`, `.title` and `.link` from it. `LandingMineral.tsx` composes the page.
- The founder drawing is `web/public/founder-portrait.webp`, a trimmed transparent raster of the green pen "Reference study" (1033 by 997, 116 KB). The source drawings stay in Matt's desktop collection, not in the repository.
- The social card (`web/app/og/home/route.tsx`, `?v=20261104`) shows the pile and the headline.
- Rejected on the way and deleted with the preview route: the pen sketches, the paper silhouettes, the fictional founder, the four looks and four pulses, the marked page, the report hero, and the old hero, worked example, silence section and progress beat.
- Contrast: the unchosen choice falls back to `--text-muted`, and the clipping's neighbouring lines are a grey that reads at 4.5:1 and fade by mask, because axe measures the ink, not the mask. The page scans clean at 1440 and 320.

## Promoted to the site, November 4, 2026

Matt agreed the same style and form should go to every page, with the design system updated first. The materials became shared components in `web/components/materials/` (`Paper`, `Pile`, `Pen`, `Clipping`, `SignedNote`, `Rhythm.module.css`, with `useSeen` in `web/hooks/use-seen.ts`) and tokens in `globals.css` (`--paper-sheet`, `--paper-edge`, `--paper-shadow`, `--document-ink`, `--document-ghost`, `--font-document`, `--marker`, `--reject-ink`, `--beat`, `--duration-gesture`, `--delay-gesture`, `--ease-pen`, `--ease-marker`), and the homepage was rebuilt on them with no visible change. The display role now describes the read's sentence (60/62 at 600) and the marketing weight is `--weight-marketing`, so the page passes the type budget instead of being exempt from it. The contract is `docs/design-system.md` §10, "The site system".

Three research passes decided the reach of the materials (sources in each pass's notes; summary here):

- **Carrying a signature across a site.** Twelve craft sites (HEY, Basecamp, Linear, Stripe, Vercel, iA Writer, Things, Granola, Monzo, Notion, Raycast, Dia), 70-plus pages read from HTML. The composed hero device appears once, on home, and its class or asset has zero hits on docs, help and sign-in on every site. What travels is a cheaper token of the same material: HEY's handwritten "+" and "New!" stamp on pricing, Granola's one handwritten word in the sitewide closing action, Stripe's gradient on marketing heroes only, Things' icon blocks going five, one, none. Help pages run 50 to 500 words; sign-in 29 to 89 words with no decoration. Every pricing page uses cards with the free tier first; the primary button repeats once per plan plus the hero.
- **Pricing and sample pages.** Fifteen pricing pages: billing cadence sits under the price everywhere, refunds are the most-omitted term (absent on Linear, HEY, Monzo, Granola, Craft, Raycast, Superhuman), and only iA Writer puts the refund policy on the pricing page itself. One-time purchases say it plainly ("Things is a one-time purchase, not a subscription"). Sample pages from craft-led companies (Linear's demo, Stripe's response panel) show the raw artifact with no marketing wrapper, labelled once; the resume tools wrap screenshots in copy, repeat the button after every block, and never label sample data as fictional.
- **Method, help, sign-in and article pages.** Linear's Method, Shape Up and 37signals explain a method in plain prose, 15 to 85 words a section, with no diagrams and no FAQ, ending on a next link; no precedent states what the product cannot tell you, which is the gap RIYP fills. Help indexes use plain headings or cards, never accordions, under about 500 words, with contact at the bottom. Sign-in pages carry 20 to 60 words, a wordmark and at most one warm line. Research-grade articles open in 90 to 130 words; marginalia appears only in figures (The Pudding), never in the prose margin.

The rule Matt chose, on the recommendation: the materials go only where they are literally true. Pricing shows reports as sheets (one free, five on the pass; direction A of three mocked, chosen over the plain list and today's cards as paper). The signed note recurs once, on How the report works. Help and sign-in get the rhythm and the button name and no props. The methodology page is cut to the density rule. The sample report page gets only its frame in Phase 2; the report's first screen changes with the workspace in Phase 3.

Round 2, the same day, from one stacked preview: How the report works as mocked (seven sections and the signed note; "tighter" and "keep the diagram" offered and not taken); the research bridge as a note in the margin rather than today's card with a button; sign-in bare with the wordmark only, over a page under the site header; help as plain questions with a person at the end, over the accordion. What each became is in `docs/design-system.md` §10.

Product surfaces, researched November 4, 2026 for Phase 3 (five parallel passes over live pages, help docs and teardowns; nothing seen in pixels). Upload screens: writing tools make the whole surface the input with zero or one line of placeholder and no button; intake tools draw one bounded object with one or two lines and the single action on or under it; no empty state ran past about ten words. Wait screens: most consumer tools show an indeterminate spinner on a tile carrying the file name, with no stages and no cancel; the only documented real-progress cases make the job's own material the display (Vercel streams the build log, Midjourney sharpens the image), which is what RIYP's wait already does with the person's own resume and the stream's stages. First screens of a verdict: scoring tools lead with one number qualified by a band word; Hemingway and Readwise put the judgment in the material itself with the number secondary, the side RIYP is on; no competitor labels a demo as a sample. Comparing two reads: document tools mark difference, not improvement, inline and in place, with split view as an opt-in; only number-based tools claim progress. Settings and billing: a hub of small single-topic pages or one sheet, receipts as one line each linking to Stripe's hosted invoice, delete last on the profile page confirmed by a second click, no "danger zone" chrome, and Granola's help page at about 150 words.

Round 3: After the offer as rows on hairlines in place of six cards, and each guide's opening with the quick start as rows and our take as the deck (both built; the guide bodies untouched); the sample report's frame left as it is, since it already shows the raw report labelled once with one button, and its first screen moves with the workspace in Phase 3.
