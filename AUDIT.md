# Independent repository audit

Help Matt decide whether Recruiter in Your Pocket is ready for a paying customer to trust it with a resume. The product promise is “See what they see.” A reader should get a recruiter’s first impression, understand which lines need work, and be able to act on the feedback using facts they can stand behind.

Review the entire repository. Start at the tip of `main` and record the full commit SHA and date in your findings. Use branches, tags and history where they explain a decision or reveal a regression. The [README](README.md) maps the project, and [AGENTS.md](AGENTS.md) explains the product and working conventions.

## Walk the customer journey

| Review question | Starting points |
| --- | --- |
| Can a new visitor run a free report, sign in by email, and find that same report on the first visit to My reports? Follow the used-allowance path too. Check what happens on a retry, when a response is slow, and after signing out and back in. | [Workspace](web/components/workspace/), [authentication](web/lib/auth/), [reports](web/lib/reports/), [API routes](web/app/api/) |
| Does the feedback quote the right experience and keep roles and dates straight? Can the user edit a card, reload, and export a PDF that preserves the answer? Trace one fictional resume line from input to the saved report and PDF. | [Prompts](web/prompts/), [model calls](web/lib/llm/), [evaluations](web/lib/evals/), [PDF export](web/app/api/export-pdf/), [fixtures](tests/fixtures/) |
| Can someone reach only their own saved data? Does declining analytics work? Trace what is stored, exported or deleted, including the extension’s permissions and data handling. | [Database migrations](web/database/migrations/), [database client](web/lib/supabase/), [extension](extension/) |
| Does one completed purchase grant exactly the advertised allowance? Trace cancellation, repeated webhook delivery, refund and restoration. Check whether failures are observable and recoverable. | [Checkout](web/app/api/checkout/), [Stripe events](web/app/api/stripe/), [billing](web/lib/billing/), [incident runbook](docs/launch-readiness/90-incident-runbook.md) |
| Do the public pages, examples, and pricing accurately describe the product? Could the team detect a broken journey after a release? | [Web routes](web/app/), [CI workflows](.github/workflows/), [hosting configuration](web/vercel.json), [launch rehearsal](docs/launch-readiness/95-launch-rehearsal.md) |

## Run focused checks

Use Node 24 and npm. From the repository root, run `npm ci` for the root and web packages, then `npm ci --prefix extension` for the extension. Start with these local checks.

```sh
npm --prefix web run test:source-fidelity
npm --prefix web run test:privacy-lifecycle
npm --prefix web run test:stripe-fulfillment
npm --prefix extension test
```

Use synthetic fixtures and local checks. This is a read-only review. Production accounts, production credentials, real resumes, live payments, deployments and paid model evaluations are outside its scope.

## Return your findings

Send Matt one private Markdown report. Open with your launch verdict and the evidence behind it. Rank findings by customer impact. For each one, include the affected journey, a file and line at the reviewed SHA, what you observed, and the smallest change and acceptance check that would resolve it. Distinguish an observed failure from a concern found by reading code. Close with the commands you actually ran, the important paths that passed and anything you could not verify.
