/** Shared guide roles composed from the site's semantic Tailwind foundation. */
const guidePresentation = {
  pageTitle: "font-sans text-headline text-foreground text-balance",
  sectionTitle: "font-sans text-headline text-foreground text-balance",
  componentTitle: "font-sans text-heading text-foreground text-balance",
  readingCopy: "max-w-reading text-prose font-normal text-muted-foreground",
  label: "text-label tracking-wide",
  script: "max-w-reading text-verdict text-foreground",
  sheet: "min-w-0 rounded-2xl border border-border bg-card sm:rounded-sheet",
  inset: "rounded-inset border border-border bg-muted",
  field: "min-h-12 w-full rounded-md border border-input bg-card text-foreground transition-colors duration-normal focus-visible:border-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring read-only:cursor-default read-only:bg-muted read-only:text-muted-foreground motion-reduce:transition-none",
  table: "w-full table-fixed text-data",
} as const;

export default guidePresentation;
