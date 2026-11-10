# Local release checks

When GitHub Actions cannot start, run the same checked-in workflow commands locally. This checks the code on the recorded candidate; it does not stand in for a hosted journey, real email delivery, payment fulfillment, or deployment approval.

Use Node 24, matching CI and Vercel. Bootstrap the runner's existing YAML dependency with `npm ci` at the repository root (its postinstall installs `web`). A full run repeats the workflow's locked installation commands and Chromium setup, recording their results alongside the checks. On macOS it omits Playwright's Linux-only `--with-deps` package-manager step.

```sh
node scripts/local-release-checks.cjs --list
node scripts/local-release-checks.cjs
```

If another task owns the default browser-test port 3100, choose a free local port instead of stopping its server:

```sh
RIYP_LOCAL_TEST_PORT=3113 node scripts/local-release-checks.cjs
```

The runner validates ports from 1024 through 65535, records the chosen value, and passes it to Playwright and its local server. The base URL, readiness URL, and Next listening port agree. Invalid values fail before the checks start. Externally managed runs using `PLAYWRIGHT_SKIP_WEB_SERVER=1` and `PLAYWRIGHT_TEST_BASE_URL` retain their existing URL behavior.

The runner reads `.github/workflows/ci.yml`, so new executable workflow checks join the local suite automatically. No GitHub status is posted, no model calls are authorized, and no deployment is created. The tests use synthetic service configuration; ambient credentials and variable names in local `.env` files (including symlinks) are blanked before any child process runs. Child commands use the same Node executable as the runner.

The browser build uses `https://riyp-launch-test.supabase.co` with a dummy public key so it exercises the existing production CSP unchanged. Signed-in UI fixtures fulfill the auth user/token requests before they reach the network. This hostname and key are synthetic test inputs, not credentials for a production project. Root endpoint-contract servers retain their separate loopback configuration.

Each run creates an ignored directory under `docs/launch-readiness/generated/local-checks/`, containing complete per-command logs and `receipt.json`. The receipt records the workflow hash, Node/platform, lockfile hashes, Git commit, tracked diff hash, and untracked-source content hash before and after. It records success, failure, or partial coverage explicitly. Only a complete pass on an unchanged clean commit has `exactCandidatePassed: true`; the release verdict still requires a hosted rehearsal and approval.

For a diagnostic subset, pass the exact IDs printed by `--list`:

```sh
node scripts/local-release-checks.cjs --only web-lint,web-typecheck,web-security-tests
```

Use `--keep-going` to collect independent failures, `--skip-install` for diagnostics against already installed packages, or `--output /absolute/ignored/output-directory` to choose a receipt location. Skipped installation, partial, or dirty-tree checks are useful during implementation but cannot produce a clean-candidate release pass. Commit the final changes and run the complete suite for that proof. Do not edit source while it runs, and do not start another build or browser server in the same checkout.

The existing launch gate remains a separate command in this suite and retains its candidate, evidence and readiness checks. Its synthetic CI configuration is a test fixture, not verification that production services are configured.
