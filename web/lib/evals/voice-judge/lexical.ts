/**
 * Voice judge - the zero-cost checks.
 *
 * These catch the tics a pattern can catch, without a model call: coined and
 * retired product words, "please" in UI, Title Case labels, three-dot
 * ellipses, exclamation marks, the generic AI vocabulary, internal terms in a
 * message a reader sees. `npm run copy:judge -- --dry-run` runs only these;
 * the paid judge runs them too and reports both.
 *
 * The lists mirror the "Tics" and "Glossary" sections of docs/copy-system.md;
 * tests/voice-judge.test.ts checks that every id here is in the doc.
 */

import type { CopyString, TicId } from "./types";

/** Words that stand in for the thing instead of naming it. The fix is in docs/copy-system.md. */
export const COINED_WORDS: Array<{ pattern: RegExp; word: string; fix: string }> = [
    // "A read" meaning one review is fine (Matt, November 6, 2026); "the read" as an idea is not.
    { pattern: /\bthe read\b(?! (?:of|on) )|\bthe first read\b|\bpass the read\b/i, word: "the read", fix: "the report, or what a recruiter takes from the resume" },
    // "Halfway down the page" is the sheet; "the page" as the resume's content is a stand-in.
    { pattern: /\bthe page\b(?! (?:one|two|count|break))(?<!(?:down|top of|bottom of|on one|on the) the page)/i, word: "the page", fix: "your resume, or the line" },
    { pattern: /\bsignals?\b/i, word: "signal", fix: "the detail, the result, the evidence" },
    { pattern: /\brungs?\b/i, word: "rung", fix: "band" },
    { pattern: /\b(?:hits?|hit) (?:them|it)\b/i, word: "hits them", fix: "reads, reaches, trips on" },
    { pattern: /\bcards? (?:a|the|each|every) line|\bgets a card\b|\bneeds a card\b|\bcarded\b/i, word: "card (verb)", fix: "lists the line, the line is on the list" },
    { pattern: /\brecruiter-ready\b/i, word: "recruiter-ready", fix: "say what is clear" },
    { pattern: /\b(?:it |what |that |this )lands\b|\bkeeps landing\b/i, word: "lands", fix: "works, comes through" },
    { pattern: /\bthe lifted line\b|\blifted trace\b/i, word: "lifted line", fix: "the revised line" },
];

/** Names Matt retired. Reports saved before November 6, 2026 may still render some; new copy never writes them. */
export const RETIRED_NAMES: Array<{ pattern: RegExp; word: string; fix: string }> = [
    { pattern: /\bCritical Miss(?:es)?\b/, word: "Critical Miss", fix: "the line that needs work" },
    { pattern: /\bVerdict\b/, word: "Verdict (as a label)", fix: "the write-up; lowercase verdict only as an ordinary word" },
    { pattern: /\bNothing critical\b/, word: "Nothing critical", fix: "Nothing here needs work." },
    { pattern: /\bRead mine\b|\bStart a report\b|\bReview my resume\b/, word: "a retired button name", fix: "Get your free report" },
    { pattern: /\bLeave these alone\b|\bKeep this one\b/, word: "a retired keep label", fix: "Don't touch this one" },
    { pattern: /\bWorth tightening\b|\bThe question they.d ask\b/, word: "a retired v2 heading", fix: "Lines that need work." },
    { pattern: /\b(?:Career )?[Rr]esources\b|\bAll Resources\b/, word: "Resources", fix: "After the offer" },
    { pattern: /\bSee an example\b|\bExample report\b/, word: "Example report", fix: "Sample report / See Jordan's report" },
    { pattern: /\bSave report\b/, word: "Save report", fix: "Save this version" },
];

/** Recruiter language Matt rejected as fake (from earlier product work, recorded in docs/copy/calibration/chatgpt-style-read-2026-11-06.md). */
export const REJECTED_PHRASES = /\b(bucket(?:s|ed)? you|trajectory points up|strong foundation)\b/i;

/** Slang and swearing stay off the site (Matt, November 6, 2026: "Warmth yes, slang no"). */
export const SLANG = /\b(dude|bro|hell yeah|damn|shit|fuck\w*|bullshit|crap|wtf|omg)\b|\bman,|, man\b/i;

/** Praise with no reason. A sentence that names what earned it is not caught here. */
export const EMPTY_PRAISE = /^(?:great job|amazing(?: work| job)?|awesome(?: work| job)?|nice work|well done|you(?:'|’)ve got this|nailed it|love it)[.!]*$/i;

/** Telling the reader how they feel. */
export const INVENTED_EMOTION = /\b(don(?:'|’)t worry|you(?:'|’)re (?:probably |likely )?(?:feeling |)(?:discouraged|stressed|overwhelmed|frustrated|nervous|anxious)|we know (?:this|it) (?:is|can be) (?:stressful|hard|frustrating)|we know (?:exactly )?how you feel)\b/i;

/** Moments where no exclamation point belongs. */
const NO_EXCLAMATION_MOMENTS = new Set(["error", "legal", "pdf", "rewrite", "analysis"]);

export const GENERIC_AI_WORDS = /\b(unlock|elevate|transform|seamless|empower|journey|game-chang\w*|supercharge|leverage|streamline|effortless|delight\w*|robust|cutting-edge|best-in-class|world-class|next-level)\b/i;

/** Words a UI message never needs: "Please", "successfully", "simply", "just", "actually". */
export const FILLER = /\b(please|successfully|simply|just|actually)\b/i;

/** Server and code vocabulary that reached a reader. */
export const INTERNAL_TERMS = /\b(admin client|not configured|null|undefined|payload|endpoint|stack ?trace|exception|unauthori[sz]ed|forbidden|invalid (?:id|token|payload|request)|fetch(?:ed|ing)? failed|failed to fetch|parse error|500|404|JSON|OTP)\b/i;

const TITLE_CASE = /^(?:[A-Z][a-z]+ ){1,3}[A-Z][a-z]+$/;
/** Proper nouns and names that are allowed in Title Case. */
const TITLE_CASE_ALLOWED = /^(Job Search Pass|Recruiter in Your Pocket|Your Pocket|Privacy Policy|Terms of Service|Chrome Web Store|New York|Structured Interviews|The Jobless Trap|Understanding Resume Parsing)$/;

const BUTTON_KINDS = /^(jsx-text|key:(?:label|cta|primaryCta|secondaryCta|buttonText)|attr:(?:label|aria-label)|const)$/;

function isSentenceLike(text: string) {
    return /[.!?…]$/.test(text) || text.split(/\s+/).length > 6;
}

/** The tics a regex can find in one string. */
export function lexicalTics(item: Pick<CopyString, "text" | "kind" | "moment">): TicId[] {
    const text = item.text.trim();
    const tics = new Set<TicId>();
    if (COINED_WORDS.some(({ pattern }) => pattern.test(text))) tics.add("coined_word");
    if (RETIRED_NAMES.some(({ pattern }) => pattern.test(text))) tics.add("retired_name");
    if (GENERIC_AI_WORDS.test(text)) tics.add("generic_ai_word");
    if (/\bplease\b/i.test(text)) tics.add("please");
    // One earned exclamation point on a win is the voice (Matt, November 6, 2026). Overuse, or one where the moment allows none, is the tic.
    const bangs = (text.match(/!/g) || []).length;
    if (bangs > 0 && !/^".*"$/.test(text)) {
        const wrongMoment = NO_EXCLAMATION_MOMENTS.has(item.moment) || (item.moment === "pricing" && /\$\d|refund|charged|renew/i.test(text));
        if (bangs > 1 || /!!/.test(text) || wrongMoment || /\b(?:couldn|can(?:'|’)t|didn|failed|error|try again)\b/i.test(text)) tics.add("exclamation");
    }
    if (REJECTED_PHRASES.test(text)) tics.add("rejected_phrase");
    if (SLANG.test(text)) tics.add("slang");
    if (EMPTY_PRAISE.test(text)) tics.add("empty_praise");
    if (INVENTED_EMOTION.test(text)) tics.add("invented_emotion");
    if (/\b(serves as|boasts|stands as)\b/i.test(text)) tics.add("copula_avoidance");
    if (/, (?:highlighting|reflecting|underscoring|showcasing|demonstrating|fostering) /i.test(text)) tics.add("ing_analysis");
    if (INTERNAL_TERMS.test(text) && item.moment !== "research" && item.moment !== "legal") tics.add("internal_term");
    if (TITLE_CASE.test(text) && !TITLE_CASE_ALLOWED.test(text) && (!item.kind || BUTTON_KINDS.test(item.kind))) tics.add("title_case");
    // A heading that is a label, a colon, then a list or fragment: "How the report works: the score, the write-up, the lines".
    if (/^[A-Z][^:.!?]{2,40}:\s+(?:the |a |an )?[a-z][^.!?]*$/.test(text) && !/^(https?|mailto)/.test(text) && text.split(/\s/).length <= 14) tics.add("colon_fragment");
    // "the X, the Y, the Z" or "X, Y, and Z" as the whole sentence.
    if (/^(?:the |your |a )?[^,.:;]{2,30}, (?:the |your |a )?[^,.:;]{2,30},? and (?:the |your |a )?[^,.:;]{2,40}\.?$/i.test(text) && isSentenceLike(text)) tics.add("tricolon");
    if (/\b[Nn]ot [^.,;]{2,40}, but\b/.test(text) || /^(?:Not|No) [^.]{2,40}\.(?: (?:Not|No) [^.]{2,40}\.)* (?:Just|Only|Every|What) /.test(text) || /\bit(?:'|’)s not [^.,;]{2,30}, it(?:'|’)s\b/i.test(text)) tics.add("not_x_but_y");
    // Three or more fragments of at most four words in a row.
    const fragments = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (fragments.length >= 3 && fragments.filter((piece) => piece.split(/\s+/).length <= 4).length >= 3) tics.add("punch_fragments");
    if (/\b(trust me|we.ve got you)\b/i.test(text)) tics.add("fake_intimacy");
    // A number the research library does not back: "recruiters spend six seconds".
    if (/\b(?:six|6|seven|7|7\.4) seconds?\b/i.test(text) && item.moment !== "research") tics.add("invented_number");
    if (/^(?:RIYP|Recruiter in Your Pocket|The (?:product|tool|app)) (?:reads|uses|leverages|helps|makes|lets|allows)\b/.test(text)) tics.add("product_about_itself");
    return [...tics];
}

/** Which coined or retired word a string uses, for the report. */
export function namedTics(text: string): string[] {
    const hits: string[] = [];
    for (const { pattern, word } of [...COINED_WORDS, ...RETIRED_NAMES]) if (pattern.test(text)) hits.push(word);
    const generic = text.match(GENERIC_AI_WORDS);
    if (generic) hits.push(generic[0].toLowerCase());
    return hits;
}

/** The three-dot ellipsis and a straight apostrophe in prose are typography, not voice; reported separately. */
export function typographyNotes(text: string): string[] {
    const notes: string[] = [];
    if (/\.\.\./.test(text)) notes.push("three dots; use …");
    if (/\s--?\s/.test(text) || /—/.test(text)) notes.push("a dash; the house style uses a period or a comma");
    return notes;
}

/** Class names, style strings and other code the inventory let through: never sent to the judge. */
export function looksLikeCode(text: string): boolean {
    const tokens = text.trim().split(/\s+/);
    const codeLike = tokens.filter((token) => /^[a-z0-9]+(?:[-:/][a-z0-9.%[\]]+)+$/.test(token) || /^[a-z-]+:[^\s]+;?$/.test(token));
    if (tokens.length > 0 && codeLike.length / tokens.length >= 0.5) return true;
    return /<\/?[a-z][^>]*>/i.test(text) || /^\{[^}]*\}$/.test(text.trim());
}
