import { narrativeEvidenceClauses } from "./source-evidence-segmentation";

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
    const object = claim.slice(event.index! + event[0].length)
      .split(/[,;.!?\n]|\b(?:in|at|with|by|for|during|after|before|when)\b/iu)[0].slice(0, 160);
    const objectTopics = topics(object);
    const passive = event[1].match(/\b(?:was|were|been)(?:\s+(?:[a-z]+ly|already|later|then|further))*\s*$/iu);
    const subject = passive ? topics(event[1].slice(0, passive.index)) : objectTopics.size > 0 ? objectTopics : topics(event[1]);
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

const personalActionPattern = /\b(develop(?:ed|ing)?|measur(?:e|ed|ing))\b/giu;
const priorityPattern = /\bpriorit(?:y|ies)\b/iu;
const actionObjectBoundary = /[,;.!?\n]|\b(?:for|with|without|using|before|after|during|because|that|which|by|to)\b/iu;
const actionAdverbs = "(?:(?:accurately|regularly|directly|personally|jointly|independently|systematically)\\s*)*";

function actionObjectWords(value: string) {
  return new Set((value.toLowerCase().match(/[a-z]+/gu) || [])
    .map(word => word === "priorities" ? "priority" : word === "times" ? "time" : word)
    .filter(word => !stop.has(word) && !/^(?:did|do|have|had|which|what|personally)$/u.test(word)));
}

function personalActionObject(claim: string, action: RegExpMatchArray) {
  // Coordinated verbs may share an object: "developed and presented priorities".
  const tail = claim.slice(action.index! + action[0].length)
    .replace(/^\s+and\s+(?:present(?:ed|ing)?|communicat(?:e|ed|ing))\s+/iu, " ")
    .split(actionObjectBoundary)[0].split(/\band\b/iu)[0].trim();
  if (/^(?:it|them|those|these)\b/iu.test(tail)) {
    // Resolve only the observed local priority antecedent, never a resume-wide
    // pronoun guess that could borrow a different responsibility.
    return priorityPattern.test(claim.slice(0, action.index)) ? new Set(["priority"]) : new Set<string>();
  }
  if (tail) return actionObjectWords(tail);
  const fronted = claim.slice(0, action.index).match(/\b(?:which|what)\s+(.+?)\s+(?:did|do|have|had)\s+you\s*$/iu);
  return actionObjectWords(fronted?.[1] || "");
}

function personalActionPrefix(claim: string, actionIndex: number) {
  const prefix = claim.slice(0, actionIndex);
  const actor = prefix.match(/\byou\s+(?:(?:personally|directly)\s+)?(?:(?:contribut(?:e|ed)|help(?:ed)?)\s+(?:to\s+)?)?$/iu)
    || prefix.match(/\byour\s+(?:approach|method|contribution|role|part)\s+(?:to|in|for)\s+(?:personally\s+)?$/iu)
    || prefix.match(/\byou\s+[^,;.!?\n]{1,100}\band\s+(?:personally\s+)?$/iu);
  if (!actor) return null;
  const beforeActor = prefix.slice(0, actor.index).split(/[,;.!?\n]/u).at(-1)?.trim() || "";
  // These forms establish whether the action happened. A question beginning
  // "how did you" or "if possible, explain how" still presupposes the action.
  const establishesWhether = /\b(?:if|whether)\s*$/iu.test(beforeActor)
    || /^(?:did|do|have|had|would|could|can)\s*$/iu.test(beforeActor)
    || /\b(?:does\s+not|doesn['’]t|cannot|can['’]t)\s+(?:establish|show|say|confirm|prove)\s+that\s*$/iu.test(beforeActor);
  return { establishesWhether, contributory: /\b(?:contribut(?:e|ed|ion)|help(?:ed)?|role|part)\b/iu.test(actor[0]) };
}

function hasFollowingActionCondition(claim: string, action: RegExpMatchArray, object: Set<string>) {
  const condition = claim.slice(action.index! + action[0].length).split(/[.!?;]/u)[0].match(/,\s*if\s+(.+)/iu)?.[1];
  if (!condition) return false;
  if (/^that\s+(?:was|is)\s+part\s+of\s+your\s+role\b/iu.test(condition)) return true;
  const conditionalAction = condition.match(/^you\s+(?:(?:helped|contributed\s+to)\s+)?(develop(?:ed|ing)?|measur(?:e|ed|ing))\s+(.+)/iu);
  if (!conditionalAction || /^develop/iu.test(conditionalAction[1]) !== /^develop/iu.test(action[0])) return false;
  if (/^(?:it|them|that|those)\b/iu.test(conditionalAction[2])) return true;
  const conditionalObject = actionObjectWords(conditionalAction[2].split(actionObjectBoundary)[0]);
  return object.size > 0 && [...object].every(word => conditionalObject.has(word));
}

function sourceEstablishesPersonalAction(source: string, family: "development" | "measurement", object: Set<string>, contributory: boolean) {
  if (object.size === 0) return false;
  const actionPattern = family === "development"
    ? /\b(?:developed|developing|develop|defined|defining|define|formulated|formulating|formulate)\b/giu
    : /\b(?:measured|measuring|measure|tracked|tracking|track|timed|timing|time)\b/giu;
  return narrativeEvidenceClauses(source).some(clause => [...clause.matchAll(actionPattern)].some(action => {
    const prefix = clause.slice(0, action.index).trim().replace(/^[-*]\s*/u, "");
    if (/\b(?:not|never|unable|cannot|can['’]t|didn['’]t|would|could|may|might|if|whether|plan(?:s|ned|ning)?|intend(?:s|ed|ing)?)\b/iu.test(prefix)) return false;
    const immediatePrefix = prefix.split(/[,;:]/u).at(-1)?.trim() || "";
    const directActor = new RegExp(`^(?:(?:I|we)\\s*)?${actionAdverbs}$`, "iu").test(immediatePrefix)
      || new RegExp(`^(?:during|in|at|on)\\s+[^,;.!?]+\\s+(?:I|we)\\s*${actionAdverbs}$`, "iu").test(prefix);
    const contributionActor = /^(?:(?:I|we)\s+)?(?:helped(?:\s+to)?|contributed\s+to|participated\s+in|(?:worked|collaborated)\s+with\s+(?:(?!\bto\b)[^.!?;])+\s+to)\s*$/iu.test(immediatePrefix);
    const assistedActor = contributory && /^(?:(?:I|we)\s+)?(?:helped|assisted|supported)\s+(?:(?:the|data|product|analytics|research)\s+){0,3}(?:analysts?|team|colleagues|engineers?|researchers?|leadership)\s*(?:to\s*)?$/iu.test(immediatePrefix);
    const coordinatedActor = /^(?:(?:I|we)\s+)?(?:[a-z]+ed|built|ran|wrote|led|made|set|grew|took)\b[^.!?;]*\band\s*$/iu.test(prefix);
    // Resume bullets imply the candidate as actor, but "analysts measured" or
    // "leadership developed" cannot establish the candidate's own action.
    if (!directActor && !contributionActor && !assistedActor && !coordinatedActor) return false;
    const tail = clause.slice(action.index! + action[0].length)
      .replace(/^\s+and\s+(?:[a-z]+ed|set|made|built)\s+/iu, " ")
      .split(actionObjectBoundary)[0];
    // Retain coordinated objects but do not borrow the object of a second
    // predicate: "measured engagement and reported setup time" is insufficient.
    for (const [index, part] of tail.split(/\band\b/iu).entries()) {
      if (index > 0 && /\b(?:[a-z]+ed|built|made|set|saw|ran|wrote|led|was|were|has|had|fell|grew)\b/iu.test(part)) break;
      const sourceObject = actionObjectWords(part);
      if ([...object].every(word => sourceObject.has(word))) return true;
    }
    return false;
  }));
}

function personalActionPresuppositionIssues(claim: string, source: string) {
  const issues = new Set<string>();
  for (const action of claim.matchAll(personalActionPattern)) {
    const attribution = personalActionPrefix(claim, action.index!);
    if (!attribution || attribution.establishesWhether) continue;
    const object = personalActionObject(claim, action);
    if (hasFollowingActionCondition(claim, action, object)) continue;
    const development = /^develop/iu.test(action[0]);
    // The development check is limited to the observed promotion from
    // presenting priorities to creating them. It does not police unrelated
    // development work or neutral descriptions of how priorities were made.
    if (development && !object.has("priority")) continue;
    if (sourceEstablishesPersonalAction(source, development ? "development" : "measurement", object, attribution.contributory)) continue;
    issues.add(development
      ? "the source does not establish your contribution to developing priorities; ask whether you helped develop them first"
      : "the source does not establish that you personally measured this result; ask how it was measured or whether you measured it");
  }
  return [...issues];
}

export function narrativeMeaningIssues(claim: string, source: string): string[] {
  const issues: string[] = [...plannedExecutionIssues(claim, source), ...personalActionPresuppositionIssues(claim, source)];
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
  const conflict = /\b(?:pointed? in different directions|conflict(?:ed|s|ing)?|competing direction|(?:priorities|inputs|feedback|directions)\s+(?:differed|(?:was|were)\s+different))\b/iu;
  const checksWhetherConflictOccurred = /\b(?:if|whether)\b|^\s*(?:(?:at|in|during|for)\s+[^,;.!?\n]{1,80},\s*)?(?:did|were|was|have|has)\b/iu.test(claim);
  // A discrepancy between written Education dates is not an assertion that
  // people or research inputs disagreed. Its dates still face the factual audit.
  const educationDateDiscrepancy = /\b(?:dates?|years?|graduation timing)\b/iu.test(claim)
    && /\b(?:education|graduation|degree|header)\b/iu.test(claim)
    && !/\b(?:feedback|inputs?|updates?|analytics)\b/iu.test(claim);
  const sourceEstablishesConflict = narrativeEvidenceClauses(source).some((clause) => {
    for (const asserted of clause.matchAll(/\b(?:conflict(?:ed|s|ing)?|competing|disagree(?:d|s|ing|ment|ments)?|contradict(?:ed|s|ing|ory|ion|ions)?|different directions|(?:priorities|inputs|feedback|directions)\s+(?:differed|(?:was|were)\s+different))\b/giu)) {
      if (isUnassertedVerb(clause, asserted.index!)) continue;
      const prefix = clause.slice(0, asserted.index);
      const suffix = clause.slice(asserted.index! + asserted[0].length);
      // Negation must describe the disagreement, not an unrelated consequence
      // such as "resolved conflicts without escalation" or "with no delay".
      if (/\b(?:no|without|avoided|lacked)\s+(?:(?:any|further|significant|major|minor|actual|reported|unresolved)\s+){0,3}$/iu.test(prefix)) continue;
      if (/^\s+(?:(?:was|were|is|are)\s+)?(?:absent|avoided|prevented)\b|^\s+(?:did\s+not|never)\s+(?:occur|happen|arise|exist)\b|^\s+(?:was|were|is|are)\s+not\s+(?:present|reported|observed|experienced)\b/iu.test(suffix)) continue;
      // A possible disagreement or a plan for one is not a past disagreement.
      if (/\b(?:hypothetical|hypothetically|potential|potentially|possible|possibly|simulated|scenarios?|simulations?)\b/iu.test(prefix)) continue;
      if (/\b(?:plans?|planned|planning|procedures?|training)\b[^.!?;]*\b(?:for|when|if)\b/iu.test(prefix)) continue;
      return true;
    }
    return false;
  });
  // "Without assuming a conflict occurred" disclaims the conflict instead of asserting it.
  const disclaimsConflict = /\b(?:without|not|never|rather than)\s+(?:assuming|presuming|implying|suggesting)\b[^.!?;]{0,60}\b(?:conflict|differ)/iu.test(claim);
  if (conflict.test(claim) && !checksWhetherConflictOccurred && !educationDateDiscrepancy && !disclaimsConflict
    && !sourceEstablishesConflict) {
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
