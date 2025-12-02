# Deploying Recruiter in Your Pocket

1) Install Node (see `.nvmrc` or `package.json` engines):
```
nvm use || nvm install
```

2) Install dependencies:
```
npm install
```

3) Configure environment:
```
cp .env.example .env
# fill in OPENAI_API_KEY and optional API_AUTH_TOKEN
```

4) Run locally:
```
npm start
```

5) Health/ready checks:
- Liveness: `GET /health`
- Readiness: `GET /ready` (verifies prompt load and API key present)

6) Deploy entrypoint:
- Use `npm start` to launch `server.js`.

Optional:
- Set `LOG_FILE` to persist structured logs.
- Set `API_AUTH_TOKEN` to require a bearer token on `/api/*`.

## PDF Export Requirements

The PDF export feature uses Puppeteer, which requires Chrome/Chromium. Setup varies by platform:

### Vercel (Serverless)

For Vercel deployments, install the Chromium package optimized for serverless:

```bash
npm install @sparticuz/chromium puppeteer-core
```

The code automatically detects Vercel and uses `@sparticuz/chromium`. No additional configuration needed.

**Note:** Vercel serverless functions have execution time limits:
- Hobby plan: 10 seconds
- Pro plan: 60 seconds

PDF generation typically takes 5-15 seconds. If you hit timeouts, consider:
- Upgrading to Pro plan
- Using Vercel's Edge Functions (if supported)
- Moving PDF generation to a separate service

### Other Platforms

For other platforms (Railway, Render, Heroku, etc.):

1. **If Chrome is pre-installed**: Set `CHROME_EXECUTABLE_PATH` environment variable to the Chrome binary path.

2. **If Chrome needs to be installed**: Install Chrome/Chromium as part of your build process. The code will automatically use enhanced launch arguments for serverless environments.

### Troubleshooting PDF Export

If PDF export fails on production:

1. **Check server logs** for detailed error messages (the code logs specific error types).

2. **Common issues:**
   - **"PDF service is temporarily unavailable"**: Chrome/Chromium not found or failed to launch
   - **"PDF generation timeout"**: Process took too long (check platform timeout limits)
   - **"EXPORT_CONFIG_ERROR"**: Chrome executable path incorrect or missing

3. **For Vercel specifically:**
   - Ensure `@sparticuz/chromium` and `puppeteer-core` are in `package.json` dependencies
   - Check that your function timeout is sufficient (Pro plan recommended)
   - Review Vercel function logs in the dashboard

4. **Testing locally:**
   - PDF export should work with regular `puppeteer` package
   - To test Vercel setup locally, install `@sparticuz/chromium` and `puppeteer-core`, then set `VERCEL=1` in your environment
