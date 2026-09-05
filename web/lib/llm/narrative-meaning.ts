// Keep distinctions that a bag of source words cannot establish.
const recurringPipeline = /\b(?:pipeline\s+(?:in\s+)?(?:ARR|annual recurring revenue)|(?:ARR|annual recurring revenue)\s+pipeline)\b/iu;
const outcomeFamilies = [
  { intent: /\bto (?:increase|improve|enhance|boost)\b/iu, achieved: /\b(?:increased|improved|enhanced|boosted)\b/iu },
  { intent: /\bto (?:reduce|lower|decrease|cut)\b/iu, achieved: /\b(?:reduced|lowered|decreased|cut)\b/iu },
];
const stop = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with", "its", "their", "your", "that", "this"]);
function subjectWords(value: string) {
  return new Set((value.toLowerCase().match(/[a-z]+/g) || []).filter(word => !stop.has(word) && word.length > 2));
}
function overlap(left: Set<string>, right: Set<string>) {
  return [...left].filter(word => right.has(word)).length;
}
function isUnassertedVerb(text: string, index: number) {
  const prefix = text.slice(0, index).split(/[,;:]/u).at(-1) || "";
  return /\bto\s*$/iu.test(prefix)
    || /\b(?:whether|if|would|could|may|might|not|never)\b/iu.test(prefix);
}

function geographicBindings(value: string) {
  return [...value.matchAll(/\b(?:in|across)\s+(?:the\s+)?(\d+)\s+(countries|regions|states|markets)\b/giu)].flatMap(match => {
    const preceding = value.slice(Math.max(0, match.index! - 150), match.index).split(/[,;.!?\n]/u).at(-1) || "";
    const subject = [...preceding.matchAll(/\b(teams?|organizations?|workforce|staff|employees?|offices?|users?|customers?|clients?)\b/giu)].at(-1)?.[1];
    if (!subject) return [];
    return [{ count: match[1], unit: match[2].toLowerCase(), audience: /^(?:users?|customers?|clients?)$/iu.test(subject) }];
  });
}

function plannedExecutionIssues(claim: string, source: string) {
  const topics = (value: string) => new Set([...subjectWords(value)]
    .filter(word => !/^(?:was|were|has|have|had|been|already|finally|successfully|new)$/u.test(word)));
  const plans = [...source.matchAll(/\b(?:decided|decision|planned|plans?|agreed|agreement)\s+to\s+(expand|launch)\b([^.!?;\n]{1,160})/giu)];
  const sourceClauses = source.split(/[\n;.!?]+/u);
  const issues: string[] = [];
  // Temporal questions can presuppose execution even though they end with a question mark.
  for (const event of claim.matchAll(/\b(?:before|after)\s+([^,;.!?\n]{1,100}?)\b(expanded|launched)\b/giu)) {
    const subject = topics(event[1]);
    if (subject.size === 0) continue;
    const action = event[2].toLowerCase() === "expanded" ? "expand" : "launch";
    const requiredOverlap = Math.min(2, subject.size);
    const intentOnly = plans.some(plan => plan[1].toLowerCase() === action
      && overlap(subject, topics(plan[2])) >= requiredOverlap);
    if (!intentOnly) continue;
    const executed = sourceClauses.some(clause => {
      const pastAction = new RegExp(`\\b${action === "expand" ? "expanded" : "launched"}\\b`, "giu");
      return [...clause.matchAll(pastAction)].some(result => {
        if (isUnassertedVerb(clause, result.index!)) return false;
        const before = clause.slice(0, result.index).split(/\b(?:and|but|then|before|after)\b|[,;:]/iu).at(-1) || "";
        const after = clause.slice(result.index! + result[0].length).split(/\b(?:and|but|then|before|after|to|for|with)\b|[,;:]/iu)[0];
        return overlap(subject, topics(before)) >= requiredOverlap || overlap(subject, topics(after)) >= requiredOverlap;
      });
    });
    if (!executed) issues.push("a decision or plan does not establish that the expansion or launch occurred");
  }
  return issues;
}

export function narrativeMeaningIssues(claim: string, source: string): string[] {
  const issues: string[] = plannedExecutionIssues(claim, source);
  const sourceGeography = geographicBindings(source);
  for (const binding of geographicBindings(claim)) {
    const sameQuantity = sourceGeography.filter(item => item.count === binding.count && item.unit === binding.unit);
    if (!binding.audience && sameQuantity.some(item => item.audience) && !sameQuantity.some(item => !item.audience)) {
      issues.push("customer or user geography does not establish the team's geographic footprint");
    }
  }
  if (recurringPipeline.test(claim) && !recurringPipeline.test(source)) {
    issues.push("pipeline and recurring revenue are not interchangeable");
  }
  const incompleteWork = /\b(?:work|projects?|measurement|analysis)(?: itself)?\s+(?:is|was|are|were|remains?|looks?|seems?)\s+(?:incomplete|unfinished)\b/iu;
  const unfinished = incompleteWork.exec(claim);
  const describesAccount = unfinished && /(?:description|explanation|account) of (?:[\p{L}-]+\s+){0,4}$/iu.test(claim.slice(0, unfinished.index));
  if (unfinished && !describesAccount && !incompleteWork.test(source)) {
    issues.push("missing resume detail does not establish that the work itself was unfinished");
  }
  const conflict = /\b(?:pointed? in different directions|conflict(?:ed|s|ing)?|competing direction)\b/iu;
  const checksWhetherConflictOccurred = /\b(?:if|whether)\b|^\s*(?:(?:at|in|during|for)\s+[^,;.!?\n]{1,80},\s*)?(?:did|were|was|have|has)\b/iu.test(claim);
  // A discrepancy between written Education dates is not an assertion that
  // people or research inputs disagreed. Its dates still face the factual audit.
  const educationDateDiscrepancy = /\b(?:dates?|years?|graduation timing)\b/iu.test(claim)
    && /\b(?:education|graduation|degree|header)\b/iu.test(claim)
    && !/\b(?:feedback|inputs?|updates?|analytics)\b/iu.test(claim);
  if (conflict.test(claim) && !checksWhetherConflictOccurred && !educationDateDiscrepancy
    && !/\b(?:conflict|competing|disagree|contradict|different directions)/iu.test(source)) {
    issues.push("the source does not establish conflicting inputs; ask whether there was a conflict first");
  }
  // Questions and conditional recommendations do not assert an achieved result.
  if (/\?|^\s*(?:add|ask|describe|explain|include|name|state|verify)\b/iu.test(claim)) return issues;
  const sourceClauses = source.split(/[\n;.!?]+/u);
  for (const family of outcomeFamilies) {
    const achieved = family.achieved.exec(claim);
    if (!achieved || isUnassertedVerb(claim, achieved.index)) continue;
    const subject = subjectWords(claim.slice(achieved.index + achieved[0].length).split(/[,;:]/u)[0].slice(0, 100));
    if (subject.size === 0) continue;
    const requiredOverlap = Math.min(2, subject.size);
    const intentOnly = sourceClauses.some(clause => {
      const intent = family.intent.exec(clause);
      return intent && overlap(subject, subjectWords(clause.slice(intent.index + intent[0].length))) >= requiredOverlap;
    });
    const achievedSupport = sourceClauses.some(clause => {
      const result = family.achieved.exec(clause);
      return result && !isUnassertedVerb(clause, result.index)
        && overlap(subject, subjectWords(clause.slice(result.index + result[0].length))) >= requiredOverlap;
    });
    if (intentOnly && !achievedSupport) issues.push("the source states an intended improvement, not an achieved result");
  }
  return issues;
}
