# Recruiter in Your Pocket

## Product and working boundaries

- RIYP is recruiter-first software. Its promise is "See what they see," and its wedge is the Recruiter First Impression: Score, Verdict, and Critical Miss. Do not frame it as a consultancy, agency, or editorial service.
- The web app uses Next.js App Router, Tailwind CSS, Framer Motion, npm, and Vercel. Use npm for repository commands. See [README.md](README.md) for the module map and setup; root scripts route web work to `web/`.
- Preserve working behavior during refactors. Ground career analysis in evidence; never invent numerical results, benchmarks, or authority. Label estimates and assumptions and measure when a decision depends on the result.
- Complete the requested customer journey and relevant verification. The target is a fully live product; do not reclassify unresolved defects as accepted beta issues or expose unfinished features.
- Preserve existing work and tuned backend prompts. A prompt change needs explicit product reasoning and evaluation; a UI wording change alone is not a reason to rewrite a prompt.
- Follow the user's current instructions. Complete authorized reversible work before requesting a missing decision; ask only when it materially affects the result. External submissions, publishing, deployment, spending, or destructive actions need authorization for that action if the user has not already provided it.

## Load guidance for the work at hand

- For repository work, read `~/Desktop/dev/agent-scripts/AGENTS.md` if present and not already loaded. These project rules take precedence over that shared guidance.
- For UI, visual assets, typography, motion, or visual-system work, read [docs/agent-design-standards.md](docs/agent-design-standards.md), [docs/brand-system.md](docs/brand-system.md), and the relevant sections of [docs/design-system.md](docs/design-system.md). Approved images are exact targets. Follow the latest explicit user direction; do not revive retired aesthetics merely because old files remain.
- For user-facing copy, read [docs/voice-and-tone.md](docs/voice-and-tone.md), then [docs/copy-system.md](docs/copy-system.md) for the relevant naming, state, or CTA. Write "resume" without accents. Use the warm, direct "sharp recruiter friend" voice and run the relevant banned-phrase and proofreading checks on changed copy.
- Apply editorial quality across public pages, reports, research, figures, tools, account/payment flows, errors, emails, PDFs, and feedback instructions/fallbacks. Keep advice useful and factual; avoid arbitrary numbers or timeframes, unfinished templates presented as finished writing, and repeated observations.
- For an optional Oracle consultation, read [.agent/workflows/oracle.md](.agent/workflows/oracle.md). Use it when an independent perspective can resolve a concrete uncertainty; ordinary work does not require it.

## Completion

Use focused checks for the affected behavior, plus any applicable project release gates. A small documentation or copy edit does not require an unrelated full-product audit. For UI work, inspect the actual result and relevant interaction states against its reference. For release work, tie verification and hosted claims to the exact candidate commit. Finish with what changed, what passed, and any remaining uncertainty; distinguish local, pushed, and verified live results.
