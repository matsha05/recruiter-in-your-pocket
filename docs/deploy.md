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
