/**
 * PromptOps checks for the worklist report (contract v3). The production validator has already refused any
 * draft with a misquoted line or an invented number, so these checks measure what is left: the score against
 * the fixture's range, the retired phrases, mechanical copy, and the shape of the card set. Errors fail the
 * fixture; warnings are reported.
 */

import type { BaselineFixture, CheckResult, ErrorCode, Fixture, WarningCode } from "./types";
import { checkScoreRange } from "./contract-checks";
import { findMechanicalCopyIssues } from "./checks";
import { bannedPhrasesIn, blanksOf, ungroundedTokensInExample, resolveCardLine } from "../llm/worklist-grounding";
import { isWorklistReport, type WorklistReport } from "../llm/worklist-schema";

export interface WorklistChecksInput {
  output: unknown;
  resumeText: string;
  fixture: Fixture;
  baseline?: BaselineFixture;
  globalBanned: string[];
  globalDiscouraged: string[];
}

export interface WorklistMetrics {
  cards: number;
  kinds: Record<string, number>;
  keep: boolean;
  /** Cards whose example has at least one bracketed blank. */
  cards_with_blanks: number;
  blanks: number;
  write_up_paragraphs: number;
  write_up_words: number;
  lifted_by_employer: boolean;
  /** Where the structural cards sit in the set (0-based), so "in the order a recruiter hits them" can be read. */
  structural_positions: number[];
}

export function worklistMetrics(report: WorklistReport): WorklistMetrics {
  const kinds: Record<string, number> = {};
  for (const card of report.cards) kinds[card.kind] = (kinds[card.kind] || 0) + 1;
  const words = report.write_up.join(" ").split(/\s+/u).filter(Boolean).length;
  return {
    cards: report.cards.length,
    kinds,
    keep: report.cards.some((card) => card.kind === "keep"),
    cards_with_blanks: report.cards.filter((card) => blanksOf(card.example).length > 0).length,
    blanks: report.cards.reduce((total, card) => total + blanksOf(card.example).length, 0),
    write_up_paragraphs: report.write_up.length,
    write_up_words: words,
    lifted_by_employer: report.lifted_by_employer,
    structural_positions: report.cards.flatMap((card, index) => (card.kind === "structure" || card.kind === "dates" ? [index] : [])),
  };
}

export function runWorklistChecks(input: WorklistChecksInput): { errors: Array<{ code: ErrorCode; message: string }>; warnings: Array<{ code: WarningCode; message: string }> } {
  const errors: Array<{ code: ErrorCode; message: string }> = [];
  const warnings: Array<{ code: WarningCode; message: string }> = [];
  const add = (result: CheckResult) => {
    if (result.passed || !result.code) return;
    const entry = { code: result.code, message: result.message || "" };
    if (result.code.startsWith("E_")) errors.push(entry as { code: ErrorCode; message: string });
    else warnings.push(entry as { code: WarningCode; message: string });
  };

  if (!isWorklistReport(input.output)) {
    errors.push({ code: "E_SCHEMA", message: "Output is not a worklist report (contract v3)" });
    return { errors, warnings };
  }
  const report = input.output;
  if (/\[?SOURCE_\d{3}\]?/i.test(JSON.stringify(report))) errors.push({ code: "E_SOURCE_TAG_LEAK", message: "Output exposes an internal SOURCE catalog tag" });

  for (const result of checkScoreRange(report.score, input.fixture.expected_score, input.baseline)) add(result);

  // The validator's own checks, repeated here so a saved output replayed through the harness is held to them.
  report.cards.forEach((card, index) => {
    if (card.kind === "line" || card.kind === "keep" || card.kind === "upgrade") {
      const resolved = resolveCardLine(card.line, input.resumeText);
      if (resolved.status === "missing") errors.push({ code: "E_EVIDENCE_NOT_VERBATIM", message: `Card ${index + 1} quotes a line that is not on the resume: "${card.line}"` });
      if (resolved.status === "ambiguous") errors.push({ code: "E_EVIDENCE_NOT_VERBATIM", message: `Card ${index + 1} quotes a line that matches more than once: "${card.line}"` });
    }
    for (const issue of ungroundedTokensInExample(card.example, input.resumeText, card.kind === "line" || card.kind === "upgrade" ? card.line : "")) {
      errors.push({ code: "E_REWRITE_INVENTED_SPECIFIC", message: `Card ${index + 1} example states a ${issue.kind} the resume doesn't have outside a bracket: "${issue.token}"` });
    }
  });

  const prose = [report.verdict, ...report.write_up, ...report.cards.flatMap((card) => [card.cannot_tell, card.question]), report.fit.note].join("\n");
  for (const phrase of new Set([...bannedPhrasesIn(prose), ...input.globalBanned.filter((phrase) => prose.toLowerCase().includes(phrase.toLowerCase()))])) {
    errors.push({ code: "E_BANNED_PHRASE", message: `Contains banned phrase: "${phrase}"` });
  }
  for (const phrase of input.globalDiscouraged) {
    if (prose.toLowerCase().includes(phrase.toLowerCase())) warnings.push({ code: "W_DISCOURAGED_PHRASE", message: `Contains discouraged phrase: "${phrase}"` });
  }
  for (const issue of findMechanicalCopyIssues({ verdict: report.verdict, write_up: report.write_up, cards: report.cards.map((card) => ({ cannot_tell: card.cannot_tell, question: card.question })), fit: { note: report.fit.note } })) {
    warnings.push({ code: "W_MECHANICAL_COPY", message: issue });
  }
  // A card that needs work with no blank in its example asks for nothing the person can fill in.
  report.cards.forEach((card, index) => {
    // A headline or summary rewritten from the page's own facts is a finished line: it has nothing to fill in.
    if (card.kind === "line" && !/^(headline|summary)$/iu.test(card.where.trim()) && blanksOf(card.example).length === 0) warnings.push({ code: "W_SPECIFICITY_LOW", message: `Card ${index + 1} example has no blank to fill` });
  });
  return { errors, warnings };
}
