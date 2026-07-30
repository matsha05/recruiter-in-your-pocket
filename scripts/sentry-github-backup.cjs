#!/usr/bin/env node

"use strict";

const SENTRY_ORG = "recruiter-in-your-pocket";
const SENTRY_PROJECT = "javascript-nextjs";
const DEFAULT_LOOKBACK_MINUTES = 120;
const ALLOWED_LEVELS = new Set(["error", "fatal"]);

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function parseLookbackMinutes() {
  const raw = process.env.RIYP_ALERT_LOOKBACK_MINUTES?.trim();
  if (!raw) return DEFAULT_LOOKBACK_MINUTES;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 15 || value > 1440) {
    throw new Error("RIYP_ALERT_LOOKBACK_MINUTES must be an integer from 15 to 1440");
  }
  return value;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = body?.detail || body?.message || `HTTP ${response.status}`;
    throw new Error(`${new URL(url).host} request failed: ${detail}`);
  }

  return body;
}

async function listRecentSentryIssues({ token, lookbackMinutes }) {
  const url = new URL(
    `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/`,
  );
  url.searchParams.set("query", "is:unresolved environment:production");
  url.searchParams.set("sort", "date");
  url.searchParams.set("limit", "100");

  const issues = await requestJson(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const cutoff = Date.now() - lookbackMinutes * 60 * 1000;

  return issues.filter((issue) => {
    const lastSeen = Date.parse(issue.lastSeen || "");
    return (
      issue.id &&
      issue.shortId &&
      issue.permalink &&
      ALLOWED_LEVELS.has(String(issue.level || "").toLowerCase()) &&
      Number.isFinite(lastSeen) &&
      lastSeen >= cutoff
    );
  });
}

async function githubApi(path, { token, method = "GET", body } = {}) {
  return requestJson(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function listExistingAlertTitles({ repository, token }) {
  const issues = await githubApi(
    `/repos/${repository}/issues?state=all&per_page=100&sort=created&direction=desc`,
    { token },
  );

  return new Set(issues.filter((issue) => !issue.pull_request).map((issue) => issue.title));
}

function alertTitle(issue) {
  return `[Sentry ${issue.shortId}] Production error detected`;
}

function alertBody(issue) {
  const level = String(issue.level || "error").toLowerCase();
  return [
    "Automatic secondary alert from Sentry.",
    "",
    `- Sentry issue: [${issue.shortId}](${issue.permalink})`,
    `- Level: ${level}`,
    `- First seen: ${issue.firstSeen || "unknown"}`,
    `- Last seen: ${issue.lastSeen || "unknown"}`,
    `- Status: ${issue.status || "unresolved"}`,
    "",
    "This issue intentionally contains no event payload, stack trace, user data, or request data. Follow the Sentry link for the scrubbed diagnostic record.",
    "",
    `<!-- sentry-group:${issue.id} -->`,
  ].join("\n");
}

async function main() {
  const sentryToken = requireEnv("RIYP_SENTRY_READ_TOKEN");
  const githubToken = requireEnv("GITHUB_TOKEN");
  const repository = requireEnv("GITHUB_REPOSITORY");
  const lookbackMinutes = parseLookbackMinutes();

  const [sentryIssues, existingTitles] = await Promise.all([
    listRecentSentryIssues({ token: sentryToken, lookbackMinutes }),
    listExistingAlertTitles({ repository, token: githubToken }),
  ]);

  let created = 0;
  let existing = 0;

  for (const issue of sentryIssues) {
    const title = alertTitle(issue);
    if (existingTitles.has(title)) {
      existing += 1;
      continue;
    }

    await githubApi(`/repos/${repository}/issues`, {
      token: githubToken,
      method: "POST",
      body: { title, body: alertBody(issue) },
    });
    existingTitles.add(title);
    created += 1;
  }

  console.log(
    JSON.stringify({
      ok: true,
      considered: sentryIssues.length,
      created,
      existing,
      lookbackMinutes,
    }),
  );
}

main().catch((error) => {
  console.error(`Secondary alert delivery failed: ${error.message}`);
  process.exitCode = 1;
});
