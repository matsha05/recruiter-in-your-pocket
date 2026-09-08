/** Shared guide roles composed from the site's semantic Tailwind foundation. */
const guidePresentation = {
  pageTitle: "font-sans text-workspace-title text-foreground text-balance sm:text-page-title",
  sectionTitle: "font-sans text-4xl font-normal leading-10 tracking-tight text-foreground text-balance sm:text-section-title",
  componentTitle: "font-sans text-report-title text-foreground text-balance",
  readingCopy: "max-w-reading text-prose font-normal text-muted-foreground",
  label: "text-label tracking-wide",
  script: "max-w-reading font-serif text-[22px] font-normal leading-8 text-foreground",
  sheet: "min-w-0 rounded-2xl border border-border bg-card sm:rounded-sheet",
  inset: "rounded-inset border border-border bg-muted",
  primaryAction: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-transparent bg-primary px-6 py-3 text-control text-primary-foreground transition-colors duration-normal hover:bg-primary/90 motion-reduce:transition-none",
  field: "min-h-12 w-full rounded-md border border-input bg-card text-foreground transition-colors duration-normal focus-visible:border-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring read-only:cursor-default read-only:bg-muted read-only:text-muted-foreground motion-reduce:transition-none",
  table: "w-full table-fixed text-data",
} as const;

export default guidePresentation;
