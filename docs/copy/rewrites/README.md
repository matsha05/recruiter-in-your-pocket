# Route rewrites, November 6, 2026

The first-seen routes rewritten against the copy system (`docs/copy-system.md`), from the voice judge's run on the inventory (`docs/copy/judge/inventory-first-seen-*.md`) and a read-aloud of each screen. The judge proposes; the read-aloud decides. Buttons, prices, legal terms and error facts stay literal.

Left alone on purpose:

- **The homepage beats Matt approved on November 4** (the pile, "By the time you finish reading this sentence…", "Nobody tells you why.", "Changed. Up 6.", the founder note, the close). The judge flagged several and its rewrites flattened them; the copy system's homepage table is Matt's.
- **Illustration descriptions** on the pricing sheets ("One sheet of paper: your first report"): they describe the picture for screen readers, which is their job.
- **Older-server outcome sentences** in `lib/billing/generationFailureCopy.ts`: the code matches them to read messages from deployments still rolling over.
- **"Our bad." on every error.** The judge proposed it on nearly every server message. Matt chose it for errors that are ours; on every message it becomes a costume, so it opens the error pages and the plain "We couldn't…" carries the rest.
- **The model's report prose and prompts.** Those change only through the gated prompt update (its own session and PR).

| Route | Lines changed |
| --- | --- |
| [Homepage](./home.md) | 4 |
| [Workspace and report shell](./workspace.md) | 16 |
| [Pricing and purchase](./pricing.md) | 5 |
| [Sign-in](./auth.md) | 4 |
| [Error pages](./errors.md) | 2 |
| [My reports and progress](./account.md) | 6 |
| [How the report works](./methodology.md) | 3 |
| [Sample report page](./sample-report.md) | 1 |
| [Chrome extension popup](./extension.md) | 1 |
