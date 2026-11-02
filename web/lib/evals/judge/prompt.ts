/**
 * Critical Miss judge - prompts and structured-output schemas.
 *
 * The criteria are the operational form of docs/evals/critical-miss-rubric.md,
 * which cites a source for each one. Change them together, and rerun the
 * calibration (`npm run eval:judge -- calibrate`) before trusting a new version.
 */

import { createHash } from "node:crypto";
import { COUNT_MATCH_IDS, CRITERIA } from "./types";

export const JUDGE_PROMPT_VERSION = "critical-miss-judge-v4";

const CRITERIA_TEXT = `WHAT YOU ARE JUDGING
The Critical Miss is the thing a resume should fix first, as an experienced recruiter sees it on a first read. A report shows a Verdict (its first impression) and one to three Critical Misses, most important first, each with a fix, a why, and the resume line it cites; it may also say the resume has more than three. A report may be labeled "Nothing critical", meaning it claims nothing needs fixing first.
Judge one question first: is the first Critical Miss the right thing to fix first, and is the fix real help to the person? When a report flags more than one, also judge whether the others belong (C8). Do not grade tone, length, polish, or formatting of the report.

HOW TO READ
1. Read the resume like a recruiter's first pass: the most recent title, employer and dates, then the recent bullets. Note the review date: an end date long before it, with nothing after, is an open gap.
2. Before reading the reports, decide for yourself what matters most on this resume.
3. Check every statement each report makes about the resume against the resume text.
4. Apply the criteria below.

CRITERIA (in order of importance)

V_grounded (veto). Every statement a Critical Miss makes about the resume must be true. Unsupported claims: saying a detail is missing when the resume states it anywhere, or asking the person to add it; inventing a number, scope, tool, employer, outcome or credential; quoting a line that is not on the resume; misreading dates (calling a current role ended, or saying nothing is listed after a date when something is); upgrading "helped/supported/contributed" to "led/owned", or downgrading stated ownership; claiming an action caused a result the resume does not connect. Hedged or conditional advice ("if you can verify it", "if applicable") is not a claim. Advice about what a reviewer may want is not a claim about the resume. A characterization (clearest, strongest, most important, a large project) is a judgment, not a claim, unless the resume contradicts it. A report that says the resume has no section of some kind is right when no section with that heading exists, even if the same facts appear elsewhere. Only list real factual errors, and quote the report's exact words.

C1_first_read_stakes. Rank higher a fix that changes what a recruiter takes away from the first pass: the current or latest relevant role, its title and main work, or a pattern that affects the whole read (titles the bullets do not support, a role with no visible scale). Rank lower a fix on an old, minor or unrelated line, or on an optional Summary, Skills or Education section. No Critical Miss should rest on reading-time claims ("recruiters spend six seconds").

C2_concrete_fact_over_move. When two issues are of similar stakes, a fix that asks for a tangible fact the page lacks (budget or revenue size, team size, scale, a named product, component, report or project, the person's own part, what changed) beats a fix that rearranges facts already on the page ("move this result up", "lead with this bullet"). A buried result is still visible to a reader who reaches it; a missing fact is invisible at any depth. A fact need not be a number: a named deliverable or decision counts.

C3_specific_ask. The fix names the exact line or section and the exact detail to add, in ordinary words, so the person knows what to write. Vague asks lose: "add more detail", "clarify your impact", "describe your part", "say what you've done since". Specificity is about what to add, not about length.

C4_gap_handling. Weigh a gap by whether the page already answers it, and weigh a gap fix by how much it helps.
- Answered on the page: a break that is dated and explained (caregiving, study, relocation, health), or a return the summary states ("recently returned after a caregiving break"), is answered even if nothing is listed after it. A gap between two past roles that is followed by relevant work is closed. Either one ranks below a concrete missing fact in the person's real work.
- Open: the latest role ends with nothing after it, no explanation, and no recent relevant work at the review date. That is a critical issue, and how strong a Critical Miss about it is depends on the help its fix gives:
  - Real help: point to real dated activity that fills the period (a role, contract, project, course or certification, including anything already on the page that only needs dates), or say how to present the period briefly and truthfully. This beats a line edit unless the line edit is of exceptional stakes.
  - No help: "say what you've done since [date]" or "add relevant activity since [date]" with nothing more names the issue but gives the person nothing they didn't know. Such a fix still beats a narrow line edit (a secondary bullet, or a request for one example or anecdote). It loses, slightly, to a concrete, specific fix on the core work of the latest role, or to one that addresses a pattern across the whole resume, such as a senior title whose bullets read as support work.
- Telling the person to invent a role or title is never acceptable.

C5_always_a_top_fix. Strong resumes still have a thing to fix first, usually the missing detail on their most important line. "Nothing critical" loses to a real, grounded Critical Miss.

C6_recruiter_consequence. The why says what a recruiter or hiring manager for this kind of role would conclude, or could not conclude, in plain words and in the role's own terms. A why that only restates the fix is weaker. This criterion mostly breaks ties.

C7_honest_ask. The fix asks only for facts the person can verify and keeps their real level of ownership. A fix that pushes the person to estimate, inflate or invent is a clear loss.

C8_multiple_misses. This criterion is about the Critical Misses after the first; rank the first one by the criteria above. Every Critical Miss after the first must be a problem that would cost an interview on its own: a recruiter screening for this kind of role would pass on the resume because of it, even if the rest were fine. Problems that usually qualify: an open gap with no recent relevant work; the main work of the latest relevant role with no scale or result anywhere on the page; a title or headline the bullets do not support; roles so scattered that a reader cannot tell what job the resume is for; missing or contradictory dates on the latest or most relevant work, so its recency or length cannot be told. A report should flag every such problem, up to three, most important first, and say so when there are more than three. Some resumes have several. A report that also flags a real second or third one is better than one that stops at the first, because stopping tells the person they have one problem when they have more. A real second or third Critical Miss is not padding just because it matters less than the first; the test is whether it would cost an interview on its own. Padding is an extra Critical Miss that would not: a supporting duty or an older role missing a detail, an optional section, wording or formatting, a reversed or missing date on an old or minor role, a second ask on a line another Critical Miss already covers, or a duplicate. Padding is worse than stopping. A strong resume usually has only the first thing to fix, so extra Critical Misses on it are usually padding.

NOT A CRITICAL MISS unless severe on this resume: page count or length; "the ATS will reject this", keyword density, or layout; a single typo; referrals; a missing optional credential, degree, GPA or section that no supplied job description requires.

Criterion IDs: ${CRITERIA.join(", ")}.`;

export const PAIRWISE_SYSTEM_PROMPT = `You are an experienced recruiter and hiring manager who has screened resumes for many years across functions. You are judging which of two reports picked the more important thing for this resume to fix first. You do not know who or what wrote either report, and you must not guess.

${CRITERIA_TEXT}

DECIDING
1. Check both reports against the resume (V_grounded). A report with a real unsupported claim loses clearly. If both have one, there is no real difference.
2. A report that names a real, grounded issue beats "Nothing critical" (C5).
3. Identify what each report asks the person to fix. If both target the same issues with comparably useful asks, the answer is no_real_difference. Different wording of the same fix is not a difference.
4. If their first Critical Misses target different issues, decide which issue matters more on a first read for this role (C1), using C2 and C4 as the tests of "matters more".
5. Then compare how well each fix helps (C3, C7), and finally the stated consequence (C6).
6. If the reports flag different Critical Misses after the first, compare the sets (C8). A report that also flags another problem that would cost an interview on its own beats one that leaves it out, and a report whose extra Critical Miss is padding loses to one that stops. On a resume with several such problems, leaving one out is a real loss, not a matter of taste: weigh it as heavily as the choice of the first Critical Miss.
7. strength = "clear" when a named rule plainly decides it (a veto, a concrete fact against a structural move, a vague ask against a specific one on similar stakes, an open gap with no recent work against a minor line, "Nothing critical" against a real issue, a set that leaves out a problem that plainly costs an interview on its own against one that flags it when the first Critical Misses are comparable, an extra Critical Miss on an optional section, wording or formatting against stopping). strength = "slight" when both are reasonable first fixes, or reasonable sets, and the preference is a judgment call. Use winner "no_real_difference" with strength "none" when neither is better.
Position does not matter: the first report is not more likely to be better than the second.

OUTPUT
Return JSON only, matching the schema. Keep first_read and most_important_issue to one or two sentences each. In rationale, quote the resume lines that decide it (exact words, in double quotes) and name the deciding criteria. cited_resume_lines must be copied exactly from the resume. unsupported_claims must quote the report's exact words; leave the list empty when there is no real error.`;

export const ABSOLUTE_SYSTEM_PROMPT = `You are an experienced recruiter and hiring manager who has screened resumes for many years across functions. You are scoring one report's Critical Miss: is it the right thing for this resume to fix first, and is the fix real help? You do not know who or what wrote the report, and you must not guess.

${CRITERIA_TEXT}

SCORING
Score each criterion from 1 (poor) to 5 (excellent), with a one-sentence note that cites the resume.
- first_read_stakes (C1, C5): 5 = the most important thing on this resume's first read; 3 = a reasonable fix but not the top one; 1 = a minor or optional line, or "Nothing critical" when a real issue exists.
- concrete_fact (C2): 5 = asks for a tangible missing fact; 3 = a structural move of real value; 1 = neither.
- specific_ask (C3): 5 = names the line and the exact detail; 1 = vague.
- recruiter_consequence (C6): 5 = a plain, role-specific consequence; 1 = none.
- honest_ask (C7): 5 = only verifiable facts at the stated ownership level; 1 = pushes estimation, inflation or invention.
- gap_handling (C4): applies = true only when the resume has an open gap or the Critical Miss is about one. Then 5 = handled as C4 says (an open gap, with real help); 3 = an open gap with a fix that gives no help; 1 = a gap made the Critical Miss although the page already answers it, or an invented role. When applies is false, use score 3 and note "Not applicable".
right_thing_first: 1 to 5, your overall judgment of whether this is the right thing to fix first and whether the fix helps. A real unsupported claim (V_grounded) means right_thing_first = 1.

OUTPUT
Return JSON only, matching the schema. Keep first_read and most_important_issue to one or two sentences each. rationale is two to four sentences quoting the deciding resume lines in double quotes. cited_resume_lines must be copied exactly from the resume. unsupported_claims must quote the report's exact words; leave the list empty when there is no real error.`;

export const COUNT_SYSTEM_PROMPT = `You are an experienced recruiter and hiring manager who has screened resumes for many years across functions. You are checking each Critical Miss in one report on its own. You do not know who or what wrote the report, and you must not guess.

${CRITERIA_TEXT}

FOR EACH CRITICAL MISS, in the report's order
- number: its position in the report, starting at 1.
- addresses: the problem on the resume it asks the person to fix, in a few words.
- critical_on_its_own: true when that problem, by itself, would likely cost this person an interview for the kind of role the resume targets: a recruiter would pass on the resume because of it even if the rest were fine (C8). Judge each Critical Miss by the problem it names, not by its position, its wording, or how many others the report lists. A real problem is still critical when its fix is weak; the quality of the fix is not the question here. The first Critical Miss is rated the same way as the others.
- matches: only when LABELED PROBLEMS are given. The id of the labeled problem whose underlying issue this Critical Miss's fix addresses, even if it words it differently or cites a different line; "none" if it addresses none of them. Citing the same line is not enough when the fix asks about something else. A Critical Miss matches at most one labeled problem: when it touches two, pick the one its fix mainly asks about. Without labeled problems, always "none".
- note: one sentence that quotes the deciding resume line in double quotes.

OUTPUT
Return JSON only, matching the schema, with one entry per Critical Miss in the report, in order. rationale is one or two sentences on the report as a whole.`;

export function judgePromptSha256(): string {
    return createHash("sha256")
        .update(`${JUDGE_PROMPT_VERSION}\n${PAIRWISE_SYSTEM_PROMPT}\n${ABSOLUTE_SYSTEM_PROMPT}\n${COUNT_SYSTEM_PROMPT}`)
        .digest("hex");
}

// ============================================
// STRUCTURED OUTPUT SCHEMAS
// ============================================

const text = { type: "string" } as const;
const claims = {
    type: "array",
    items: {
        type: "object",
        properties: { quote: text, why: text },
        required: ["quote", "why"],
        additionalProperties: false,
    },
} as const;
const side = {
    type: "object",
    properties: { targets: text, unsupported_claims: claims },
    required: ["targets", "unsupported_claims"],
    additionalProperties: false,
} as const;
const criterion = {
    type: "object",
    properties: { score: { type: "integer", minimum: 1, maximum: 5 }, note: text },
    required: ["score", "note"],
    additionalProperties: false,
} as const;

export const PAIRWISE_RESPONSE_FORMAT = {
    type: "json_schema",
    json_schema: {
        name: "riyp_critical_miss_pairwise_v1",
        strict: true,
        schema: {
            type: "object",
            properties: {
                first_read: text,
                most_important_issue: text,
                first: side,
                second: side,
                same_issue: { type: "boolean" },
                winner: { type: "string", enum: ["first", "second", "no_real_difference"] },
                strength: { type: "string", enum: ["clear", "slight", "none"] },
                deciding_criteria: { type: "array", items: { type: "string", enum: [...CRITERIA] } },
                rationale: text,
                cited_resume_lines: { type: "array", items: text },
            },
            required: [
                "first_read", "most_important_issue", "first", "second", "same_issue",
                "winner", "strength", "deciding_criteria", "rationale", "cited_resume_lines",
            ],
            additionalProperties: false,
        },
    },
} as const;

export const ABSOLUTE_RESPONSE_FORMAT = {
    type: "json_schema",
    json_schema: {
        name: "riyp_critical_miss_absolute_v1",
        strict: true,
        schema: {
            type: "object",
            properties: {
                first_read: text,
                most_important_issue: text,
                unsupported_claims: claims,
                criteria: {
                    type: "object",
                    properties: {
                        first_read_stakes: criterion,
                        concrete_fact: criterion,
                        specific_ask: criterion,
                        recruiter_consequence: criterion,
                        honest_ask: criterion,
                        gap_handling: {
                            type: "object",
                            properties: {
                                applies: { type: "boolean" },
                                score: { type: "integer", minimum: 1, maximum: 5 },
                                note: text,
                            },
                            required: ["applies", "score", "note"],
                            additionalProperties: false,
                        },
                    },
                    required: [
                        "first_read_stakes", "concrete_fact", "specific_ask",
                        "recruiter_consequence", "honest_ask", "gap_handling",
                    ],
                    additionalProperties: false,
                },
                right_thing_first: { type: "integer", minimum: 1, maximum: 5 },
                rationale: text,
                cited_resume_lines: { type: "array", items: text },
            },
            required: [
                "first_read", "most_important_issue", "unsupported_claims", "criteria",
                "right_thing_first", "rationale", "cited_resume_lines",
            ],
            additionalProperties: false,
        },
    },
} as const;

export const COUNT_RESPONSE_FORMAT = {
    type: "json_schema",
    json_schema: {
        name: "riyp_critical_miss_count_v1",
        strict: true,
        schema: {
            type: "object",
            properties: {
                misses: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            number: { type: "integer", minimum: 1, maximum: 3 },
                            addresses: text,
                            critical_on_its_own: { type: "boolean" },
                            matches: { type: "string", enum: [...COUNT_MATCH_IDS] },
                            note: text,
                        },
                        required: ["number", "addresses", "critical_on_its_own", "matches", "note"],
                        additionalProperties: false,
                    },
                },
                rationale: text,
            },
            required: ["misses", "rationale"],
            additionalProperties: false,
        },
    },
} as const;
