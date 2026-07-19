import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { freeCookieOptions } from "../lib/backend/freeCookie";
import { getScoreLabel } from "../lib/score-utils";

assert.equal(
  freeCookieOptions().maxAge,
  365 * 24 * 60 * 60,
  "cookie maxAge must be expressed in seconds"
);

assert.equal(getScoreLabel(85), "Clear and specific");
assert.equal(getScoreLabel(84), "Mostly clear");
assert.equal(getScoreLabel(70), "Mostly clear");
assert.equal(getScoreLabel(69), "Needs more context");

const defaultResumeRoute = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/user/default-resume/route.ts"),
  "utf8",
);
const embeddingService = fs.readFileSync(
  path.resolve(process.cwd(), "lib/matching/embedding-service.ts"),
  "utf8",
);
assert.match(defaultResumeRoute, /readJsonWithLimit<any>\(request, 128 \* 1024\)/);
assert.match(defaultResumeRoute, /MAX_RESUME_CHARACTERS = 30_000/);
assert.match(defaultResumeRoute, /MAX_FILENAME_CHARACTERS = 255/);
assert.match(defaultResumeRoute, /default-resume-write/);
assert.match(defaultResumeRoute, /existingProfile\?\.resume_hash === resumeHash/);
assert.ok(
  defaultResumeRoute.indexOf("existingProfile?.resume_hash === resumeHash")
    < defaultResumeRoute.indexOf("await createEmbedding(resumeText)"),
  "unchanged resumes must skip the embedding provider",
);
assert.match(embeddingService, /signal: AbortSignal\.timeout\(10_000\)/);

console.log("backend-contracts tests passed");
