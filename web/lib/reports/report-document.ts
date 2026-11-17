/**
 * What a report was written about. A resume report carries no mark, as every report before November 10, 2026;
 * a LinkedIn profile review is the same worklist report written from the profile's PDF export by
 * prompts/linkedin_v3.txt, marked "linkedin" by the route after validation (never by the model). The mark
 * decides the report's wording (lib/reports/worklist-presentation.ts) and keeps a re-check from comparing a
 * profile with a resume.
 */
export const LINKEDIN_DOCUMENT = "linkedin" as const;
export type ReportDocument = typeof LINKEDIN_DOCUMENT;
export type ReportDocumentKind = "resume" | ReportDocument;

export function parseReportDocument(value: unknown): ReportDocument | null {
  return value === LINKEDIN_DOCUMENT ? LINKEDIN_DOCUMENT : null;
}

/** What a saved, fresh or recovered report is about. */
export function reportDocumentKind(report: unknown): ReportDocumentKind {
  return report && typeof report === "object" && (report as { document?: unknown }).document === LINKEDIN_DOCUMENT
    ? LINKEDIN_DOCUMENT
    : "resume";
}

export function isLinkedInReport(report: unknown) {
  return reportDocumentKind(report) === LINKEDIN_DOCUMENT;
}

/** The validated report with its document mark; a resume report is returned as it is. */
export function withReportDocument<T extends object>(payload: T, document: ReportDocument | null): T {
  return document ? { ...payload, document } : payload;
}

/**
 * Whether text is LinkedIn's "Save to PDF" export: the profile address the export prints in its Contact
 * block, and the Experience heading every profile with a job has. Checked before a report is spent on it.
 */
export function looksLikeLinkedInExport(text: string) {
  return /linkedin\.com\/in\/[^\s)]+/iu.test(text) && /(^|\n)\s*Experience\s*(\n|$)/u.test(text);
}

/**
 * What My reports shows under a saved profile review, in place of the first lines of the file: a LinkedIn
 * export opens with the person's contact block, which says nothing about the review.
 */
export const LINKEDIN_SAVED_PREVIEW = "LinkedIn profile review";

/** The preview kept with a saved report: the profile review's own, or the caller's preview of the resume text. */
export function savedPreviewFor(payload: unknown, resumePreview: string) {
  return isLinkedInReport(payload) ? LINKEDIN_SAVED_PREVIEW : resumePreview;
}

export const NOT_A_LINKEDIN_EXPORT_MESSAGE =
  "That doesn't look like a LinkedIn profile PDF. On your profile, choose Resources (or the ⋯ button), then Save to PDF, and upload that file.";

/** The PDF's file name: a LinkedIn review isn't a resume report (live walk, November 17, 2026). */
export function reportPdfFileName(report: unknown) {
  return isLinkedInReport(report) ? "linkedin-profile-review.pdf" : "resume-report.pdf";
}
