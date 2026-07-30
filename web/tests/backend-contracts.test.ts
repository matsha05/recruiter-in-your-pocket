import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { freeCookieOptions } from "../lib/backend/freeCookie";
import { getScoreLabel } from "../lib/score-utils";
import { validateResumeFeedbackRequest } from "../lib/backend/validation";
import { isResumeIdeasApiEnabled } from "../lib/launch/serverFlags";
import {
  REQUIRED_PUBLIC_TRUST_FILES,
  resolvePublicTrustSurfaceStatus,
} from "../lib/launch/program";

assert.equal(
  freeCookieOptions().maxAge,
  365 * 24 * 60 * 60,
  "cookie maxAge must be expressed in seconds"
);

assert.equal(getScoreLabel(85), "Clear and specific");
assert.equal(getScoreLabel(84), "Mostly clear");
assert.equal(getScoreLabel(70), "Mostly clear");
assert.equal(getScoreLabel(69), "Needs more context");

assert.equal(
  resolvePublicTrustSurfaceStatus({
    verified: false,
    inspectionAvailable: false,
    hostedRuntime: true,
  }),
  "disabled",
  "a hosted serverless function must defer to release-bound CI when source and global route manifests are omitted",
);
assert.equal(
  resolvePublicTrustSurfaceStatus({
    verified: false,
    inspectionAvailable: true,
    hostedRuntime: true,
  }),
  "missing",
  "an inspected hosted artifact must fail when a required public trust route is absent",
);
assert.equal(
  resolvePublicTrustSurfaceStatus({
    verified: false,
    inspectionAvailable: false,
    hostedRuntime: false,
  }),
  "missing",
  "local and hermetic checks must fail closed when trust surfaces cannot be inspected",
);
assert.equal(
  resolvePublicTrustSurfaceStatus({
    verified: true,
    inspectionAvailable: true,
    hostedRuntime: true,
  }),
  "ok",
);

const repoRoot = fs.existsSync(path.join(process.cwd(), "web"))
  ? process.cwd()
  : path.resolve(process.cwd(), "..");
for (const relativePath of REQUIRED_PUBLIC_TRUST_FILES) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, relativePath)),
    true,
    `required public trust surface must exist: ${relativePath}`,
  );
}

const validResumeRequest = validateResumeFeedbackRequest({
  text: "A".repeat(100),
  mode: "resume",
});
assert.equal(validResumeRequest.ok, true);
assert.equal(
  validateResumeFeedbackRequest({ text: "A".repeat(100), mode: "linkedin" }).ok,
  false,
  "the public resume endpoints must reject internal product modes",
);
for (const hiddenMode of ["resume_ideas", "case_resume", "case_interview", "case_negotiation"] as const) {
  assert.equal(
    validateResumeFeedbackRequest({ text: "A".repeat(100), mode: hiddenMode }).ok,
    false,
    `the public resume endpoints must reject hidden mode ${hiddenMode}`,
  );
}
assert.equal(isResumeIdeasApiEnabled({}), false, "the experimental API must fail closed");
assert.equal(
  isResumeIdeasApiEnabled({ RIYP_ENABLE_RESUME_IDEAS_API: "true" }),
  true,
  "the experimental API requires its server-only opt-in",
);
assert.equal(
  validateResumeFeedbackRequest({ text: "A".repeat(30_001), mode: "resume" }).ok,
  false,
  "resume text must stay inside the 30,000 character contract",
);

const defaultResumeRoute = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/user/default-resume/route.ts"),
  "utf8",
);
const embeddingService = fs.readFileSync(
  path.resolve(process.cwd(), "lib/matching/embedding-service.ts"),
  "utf8",
);
const parseResumeRoute = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/parse-resume/route.ts"),
  "utf8",
);
const resumeFeedbackRoute = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/resume-feedback/route.ts"),
  "utf8",
);
const resumeFeedbackStreamRoute = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/resume-feedback-stream/route.ts"),
  "utf8",
);
const resumeIdeasRoute = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/resume-ideas/route.ts"),
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
assert.ok(
  embeddingService.indexOf("await assertGenerationCapacity()")
    < embeddingService.indexOf('fetch("https://api.openai.com/v1/embeddings"'),
  "embedding calls must reserve from the shared paid-AI ceiling before contacting OpenAI",
);
assert.match(parseResumeRoute, /MAX_FILE_SIZE = 4 \* 1024 \* 1024/);
assert.match(parseResumeRoute, /MAX_EXTRACTED_TEXT_LENGTH = 30_000/);
assert.match(parseResumeRoute, /EXTRACTED_TEXT_TOO_LARGE/);
assert.ok(
  resumeIdeasRoute.indexOf("if (!isResumeIdeasApiEnabled())")
    < resumeIdeasRoute.indexOf("await readJsonWithLimit"),
  "the experimental resume-ideas API must reject requests before parsing or provider work",
);

for (const [name, source] of [
  ["resume feedback", resumeFeedbackRoute],
  ["streaming resume feedback", resumeFeedbackStreamRoute],
] as const) {
  const insertAt = source.indexOf('from("reports").insert');
  const commitAt = source.indexOf("await commitGenerationAccess", insertAt);
  const rollbackAt = source.indexOf('from("reports")', commitAt);
  assert.ok(insertAt >= 0, `${name} must persist a signed-in report`);
  assert.ok(commitAt > insertAt, `${name} must persist before committing the report credit`);
  assert.ok(rollbackAt > commitAt, `${name} must roll back persistence if credit commit fails`);
  assert.match(
    source,
    /const \{ error: reportInsertError \} = await [\s\S]+if \(reportInsertError\) \{[\s\S]+throw reportPersistenceError\(\)/,
    `${name} must check the report insert result and fail closed`,
  );
  assert.match(
    source,
    /\.delete\(\)[\s\S]+\.eq\("id", reportId\)[\s\S]+\.eq\("user_id", user\.id\)/,
    `${name} rollback must be scoped to the generated report and authenticated owner`,
  );
}

assert.match(
  resumeFeedbackRoute,
  /reservationCommitted = true;[\s\S]+if \(accessReservation && !reservationCommitted\)/,
  "the non-stream endpoint must not refund a committed report after a delivery error",
);

console.log("backend-contracts tests passed");
