/**
 * Critical Miss judge - public entry point.
 *
 * This replaces the earlier whole-report LLM judge (evidence, actionability,
 * tone, methodology on gpt-4o-mini). That rubric was retired because it wasn't
 * calibrated to Matt's judgment, its scores sat near the ceiling (9.1/10 on its
 * last bulk run), its "methodology" dimension scored against the 7.4-second
 * reading model the research library no longer supports, and it sent every
 * fixture, including real people's resumes, to the judge model. Evidence and
 * tone are measured deterministically by the validator and the integrity checks.
 * See docs/evals/critical-miss-judge.md.
 */

import type { Fixture, FixtureResult } from "../types";
import { DEFAULT_JUDGE_CONFIG, SpendLedger } from "./client";
import { judgeAbsolute } from "./modes";
import { JUDGE_PROMPT_VERSION } from "./prompt";
import type { JudgeConfig } from "./types";
import { isJudgeableFixture, viewFromReport } from "./view";

export { DEFAULT_JUDGE_CONFIG, GENERATOR_MODEL, JudgeBudgetError, SpendLedger } from "./client";
export { judgeAbsolute, judgePairwise } from "./modes";
export { JUDGE_PROMPT_VERSION, judgePromptSha256 } from "./prompt";
export { isJudgeableFixture, viewFromReport } from "./view";
export type * from "./types";

/** What the eval runner records per fixture when it runs with --with-judge. */
export type EvalJudgeResult = NonNullable<FixtureResult["judge_result"]>;

/**
 * Score one generated report's Critical Miss for the eval runner. Returns null,
 * without a model call, when the fixture isn't synthetic or the report was
 * withheld (FAIL) or has no Critical Miss.
 */
export async function judgeEvalReport(input: {
    fixture: Pick<Fixture, "id" | "tags" | "path">;
    resumeText: string;
    status: FixtureResult["status"];
    report: unknown;
    ledger: SpendLedger;
    config?: JudgeConfig;
    reviewDate?: string;
}): Promise<EvalJudgeResult | null> {
    if (!isJudgeableFixture(input.fixture) || input.status === "FAIL") return null;
    const view = viewFromReport(input.report);
    if (!view) return null;
    const config = input.config || DEFAULT_JUDGE_CONFIG;
    const result = await judgeAbsolute(
        {
            id: input.fixture.id,
            resume_text: input.resumeText,
            review_date: input.reviewDate || new Date().toISOString().slice(0, 10),
        },
        view,
        { config, ledger: input.ledger },
    );
    const criteria = result.raw.criteria;
    return {
        judge: JUDGE_PROMPT_VERSION,
        model: config.model,
        veto: result.veto,
        overall: result.overall,
        first_read_stakes: criteria.first_read_stakes.score,
        concrete_fact: criteria.concrete_fact.score,
        specific_ask: criteria.specific_ask.score,
        recruiter_consequence: criteria.recruiter_consequence.score,
        honest_ask: criteria.honest_ask.score,
        unsupported_claims: result.raw.unsupported_claims.map((claim) => claim.quote),
        rationale: result.raw.rationale,
        cost_usd: result.cost_usd,
    };
}
