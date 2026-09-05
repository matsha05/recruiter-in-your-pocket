import { CaretDown } from "@phosphor-icons/react";
import type { ReportData } from "./ReportTypes";

interface FullRecruiterNotesProps {
  report: ReportData;
  hasJobDescription?: boolean;
}

const SECTION_ORDER = ["Summary", "Work Experience", "Skills", "Education"] as const;

function isCopy(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function copyKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function uniqueCopy(values: Array<string | null | undefined>, excluded: Array<string | null | undefined> = []) {
  const seen = new Set(excluded.filter(isCopy).map(copyKey));
  return values.filter((value): value is string => {
    if (!isCopy(value)) return false;
    const key = copyKey(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function NoteList({ items }: { items: string[] }) {
  return (
    <ul className="riyp-border-paper-line riyp-divide-paper-line divide-y border-y">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3 py-4">
          <span className="riyp-tabular-label riyp-type-10px w-8 shrink-0 pt-0.5 font-semibold text-brand">0{index + 1}</span>
          <p className="text-sm leading-6 text-foreground/80">{item}</p>
        </li>
      ))}
    </ul>
  );
}

export function FullRecruiterNotes({ report, hasJobDescription = false }: FullRecruiterNotesProps) {
  const visibleOpening = report.score_comment_short || report.first_impression || report.summary;
  const visibleGap = report.gaps?.[0] || report.biggest_gap_example;
  const detailedReadCandidates = [
    { label: "First impression", text: report.first_impression },
    { label: "Overall assessment", text: report.summary },
    { label: "Example to improve", text: report.biggest_gap_example },
  ];
  const seenDetailedCopy = new Set(
    [visibleOpening, visibleGap, ...(report.top_fixes || []).flatMap((fix) => [fix.fix, fix.text, fix.why])].filter(isCopy).map(copyKey),
  );
  const detailedRead = detailedReadCandidates.filter(({ text }) => {
    if (!isCopy(text)) return false;
    const key = copyKey(text);
    if (seenDetailedCopy.has(key)) return false;
    seenDetailedCopy.add(key);
    return true;
  }) as Array<{ label: string; text: string }>;

  const remainingStrengths = uniqueCopy((report.strengths || []).slice(3));
  const remainingGaps = uniqueCopy((report.gaps || []).slice(1), [visibleGap, ...(report.top_fixes || []).flatMap((fix) => [fix.fix, fix.text, fix.why])]);
  const sectionNotes = SECTION_ORDER.flatMap((name) => {
    const review = report.section_review?.[name];
    if (!review) return [];
    const notes = [
      { label: "What works", text: review.working },
      { label: "Still unclear", text: review.missing },
      { label: "Suggested change", text: review.fix },
    ].filter((note): note is { label: string; text: string } => isCopy(note.text));
    if (notes.length === 0) return [];
    return [{ name, review, notes }];
  });
  const nextSteps = uniqueCopy(report.next_steps || []);

  const alignment = report.job_alignment;
  const roleFit = alignment?.role_fit;
  const visibleRoleCopy = alignment?.positioning_suggestion || alignment?.jd_match_summary;
  const alignmentDetail = hasJobDescription
    ? uniqueCopy([alignment?.jd_match_summary, alignment?.positioning_suggestion], [visibleRoleCopy])[0]
    : undefined;
  const extraBestFitRoles = uniqueCopy((roleFit?.best_fit_roles || []).slice(3));
  const stretchRoles = uniqueCopy(roleFit?.stretch_roles || []);
  const industrySignals = uniqueCopy(roleFit?.industry_signals || []);
  const companyStageFit = isCopy(roleFit?.company_stage_fit) ? roleFit.company_stage_fit : undefined;
  const alignmentGroups = hasJobDescription
    ? [
      { label: "Relevant experience", items: uniqueCopy(alignment?.strongly_aligned || []) },
      { label: "Needs more detail", items: uniqueCopy(alignment?.underplayed || []) },
      { label: "Not shown in the resume", items: uniqueCopy(alignment?.missing || []) },
      { label: "Job terms found", items: uniqueCopy(alignment?.jd_keywords?.matched || []) },
      { label: "Job terms not found", items: uniqueCopy(alignment?.jd_keywords?.missing || []) },
    ].filter(({ items }) => items.length > 0)
    : [];
  const hasRoleDetails = Boolean(
    alignmentDetail
    || alignmentGroups.length > 0
    || extraBestFitRoles.length > 0
    || stretchRoles.length > 0
    || industrySignals.length > 0
    || companyStageFit,
  );
  const hasNotes = detailedRead.length > 0
    || remainingStrengths.length > 0
    || remainingGaps.length > 0
    || sectionNotes.length > 0
    || nextSteps.length > 0
    || hasRoleDetails;

  if (!hasNotes) return null;

  return (
    <details
      id="section-full-notes"
      className="group scroll-mt-36 border-b border-foreground/80"
      data-testid="full-recruiter-notes"
    >
      <summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-4 focus-visible:ring-offset-paper [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="riyp-type-11px riyp-track-017 block font-semibold uppercase text-brand">Complete report</span>
          <span role="heading" aria-level={2} className="mt-2 block font-display text-2xl riyp-weight-520 leading-tight text-foreground sm:text-3xl">Full recruiter notes</span>
          <span className="mt-2 block text-sm leading-6 text-muted-foreground">Section feedback, role details, and a plan for your revision.</span>
        </span>
        <CaretDown className="size-5 shrink-0 text-brand transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div className="riyp-border-paper-line border-t pb-10 sm:pb-14">
        {detailedRead.length > 0 && (
          <section className="py-8 sm:py-10" aria-labelledby="full-notes-read-title">
            <p className="riyp-type-11px riyp-track-015 font-semibold uppercase text-brand">Review details</p>
            <h3 id="full-notes-read-title" className="mt-2 font-display text-2xl riyp-weight-520 text-foreground">The detailed assessment.</h3>
            <dl className="riyp-border-paper-line riyp-divide-paper-line mt-6 divide-y border-y">
              {detailedRead.map(({ label, text }) => (
                <div key={label} className="grid gap-2 py-5 sm:grid-cols-3 sm:gap-6">
                  <dt className="riyp-type-11px riyp-track-013 font-semibold uppercase text-muted-foreground">{label}</dt>
                  <dd className="text-sm leading-7 text-foreground/80 sm:col-span-2 sm:text-base">{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {(remainingStrengths.length > 0 || remainingGaps.length > 0) && (
          <section className="riyp-border-paper-line grid gap-8 border-t py-8 sm:py-10 lg:grid-cols-2 lg:gap-12" aria-label="Additional strengths and gaps">
            {remainingStrengths.length > 0 && (
              <div>
                <h3 className="font-display text-2xl riyp-weight-520 text-foreground">Other strengths</h3>
                <div className="mt-5"><NoteList items={remainingStrengths} /></div>
              </div>
            )}
            {remainingGaps.length > 0 && (
              <div>
                <h3 className="font-display text-2xl riyp-weight-520 text-foreground">Questions still open</h3>
                <div className="mt-5"><NoteList items={remainingGaps} /></div>
              </div>
            )}
          </section>
        )}

        {sectionNotes.length > 0 && (
          <section className="riyp-border-paper-line border-t py-8 sm:py-10" aria-labelledby="full-notes-sections-title">
            <p className="riyp-type-11px riyp-track-015 font-semibold uppercase text-brand">Section by section</p>
            <h3 id="full-notes-sections-title" className="mt-2 font-display text-2xl riyp-weight-520 text-foreground">Notes on each section.</h3>
            <div className="riyp-border-paper-line riyp-divide-paper-line mt-6 divide-y border-y">
              {sectionNotes.map(({ name, review, notes }) => (
                <article key={name} className="py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h4 className="text-base font-semibold text-foreground">{name}</h4>
                    {(isCopy(review.grade) || isCopy(review.priority)) && (
                      <p className="text-xs text-muted-foreground">{[review.grade, review.priority].filter(isCopy).join(" · ")}</p>
                    )}
                  </div>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-6">
                    {notes.map(({ label, text }) => (
                      <div key={label}>
                        <dt className="riyp-type-10px riyp-track-013 font-semibold uppercase text-muted-foreground">{label}</dt>
                        <dd className="mt-2 text-sm leading-6 text-foreground/80">{text}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </section>
        )}

        {nextSteps.length > 0 && (
          <section className="riyp-border-paper-line border-t py-8 sm:py-10" aria-labelledby="full-notes-next-title">
            <p className="riyp-type-11px riyp-track-015 font-semibold uppercase text-brand">Revision order</p>
            <h3 id="full-notes-next-title" className="mt-2 font-display text-2xl riyp-weight-520 text-foreground">What to do next.</h3>
            <div className="mt-6"><NoteList items={nextSteps} /></div>
          </section>
        )}

        {hasRoleDetails && (
          <section className="riyp-border-paper-line border-t py-8 sm:py-10" aria-labelledby="full-notes-role-title">
            <p className="riyp-type-11px riyp-track-015 font-semibold uppercase text-brand">{hasJobDescription ? "Job alignment" : "Role context"}</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
              <h3 id="full-notes-role-title" className="font-display text-2xl riyp-weight-520 text-foreground">{hasJobDescription ? "How you match the job description." : "More about potential roles."}</h3>
              {hasJobDescription && typeof alignment?.jd_match_score === "number" && (
                <p className="riyp-tabular-label text-xs text-muted-foreground">Job match: {alignment.jd_match_score}/100</p>
              )}
            </div>
            {alignmentDetail && <p className="mt-5 max-w-3xl text-sm leading-7 text-foreground/80 sm:text-base">{alignmentDetail}</p>}
            {alignmentGroups.length > 0 && (
              <div className="riyp-border-paper-line mt-7 grid gap-x-10 gap-y-7 border-y py-6 sm:grid-cols-2 lg:grid-cols-3">
                {alignmentGroups.map(({ label, items }) => (
                  <div key={label}>
                    <h4 className="riyp-type-10px riyp-track-013 font-semibold uppercase text-muted-foreground">{label}</h4>
                    <ul className="mt-3 space-y-2">
                      {items.map((item) => <li key={item} className="text-sm leading-6 text-foreground/80">{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {(extraBestFitRoles.length > 0 || stretchRoles.length > 0 || industrySignals.length > 0 || companyStageFit) && (
              <dl className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {extraBestFitRoles.length > 0 && <div><dt className="riyp-type-10px riyp-track-013 font-semibold uppercase text-muted-foreground">Other roles to consider</dt><dd className="mt-2 text-sm leading-6 text-foreground/80">{extraBestFitRoles.join(", ")}</dd></div>}
                {stretchRoles.length > 0 && <div><dt className="riyp-type-10px riyp-track-013 font-semibold uppercase text-muted-foreground">Stretch roles</dt><dd className="mt-2 text-sm leading-6 text-foreground/80">{stretchRoles.join(", ")}</dd></div>}
                {industrySignals.length > 0 && <div><dt className="riyp-type-10px riyp-track-013 font-semibold uppercase text-muted-foreground">Industry context</dt><dd className="mt-2 text-sm leading-6 text-foreground/80">{industrySignals.join(", ")}</dd></div>}
                {companyStageFit && <div><dt className="riyp-type-10px riyp-track-013 font-semibold uppercase text-muted-foreground">Company stage</dt><dd className="mt-2 text-sm leading-6 text-foreground/80">{companyStageFit}</dd></div>}
              </dl>
            )}
          </section>
        )}
      </div>
    </details>
  );
}
