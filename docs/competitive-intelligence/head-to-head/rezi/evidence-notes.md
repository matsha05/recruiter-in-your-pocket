# Rezi evidence conventions

- Root `first-screen.png` and its raw text are the first attempt's settled post-upload signup preview. `upload-transition.*` preserves an earlier frame. The original attempt stopped on rebuilding; the later user-authorized continuation is explicitly labeled in `headline.md` and `time.md`.
- `continuation-*`, `without-posting-*`, and `with-posting-*` preserve the continuation, including first report state, all score categories, keyword loading and settled states, and the updated posting context.
- `.txt` files are browser `innerText` captures. Unopened PRO tooltip templates have been replaced with explicit omission markers in the four role-detail text files; visible PRO labels remain. `recommendations.md` records locked categories as labels only and does not infer withheld content. Unlocked role-specific feedback and passed-check text are preserved.
- The random-looking strings in `with-posting-keywords.txt` are the application's obfuscated PRO labels. No attempt was made to recover their underlying keywords.
- Screenshots are full-page at a 1440 × 1000 viewport. Some app pages use fixed-height or internally scrolling panes, so a full-page screenshot can still be 1440 × 1000. Individual score-category screenshots and raw text preserve content across those states.
- Original source input SHA-256: `3c3069d9061b8bffa264ab94da08c76557bb4596469d53f6149f44ceb97e8640`. Every upload used this PDF. The saved local PDF was unchanged.
- First paid offer: public homepage `upsell.png`; later paid-plan dialog: `in-product-upsell.png`. No plan, trial, card submission, rewrite, or suggested insertion was accepted.

## Supplementary screenshot timing limits

- `without-posting-application-ready.png` shows the Application Ready tab selected while its body still displays the preceding email warning. The saved text contains the later application-readiness wording. This PNG is a tab-transition capture and is not visual proof of that final body. The original 56-point state was not recreated or replaced with a later result.
- `director-practices.png` retains the role editor before the passed-check expansion is visible; `director-practices.txt` contains the subsequently exposed passed-check labels and text. The PNG does not by itself show the expanded checks.
