/**
 * The sample reports (Nov 11, 2026). Jordan's is the one the homepage quotes and lives at /sample-report. The
 * others show the report on a different situation each, at /sample-report/<slug>: a new graduate, a career
 * change, a return from a career break, and a senior resume that is already mostly clear.
 *
 * Every one is real output from the production prompt on a fictional resume with fictional employers and
 * schools (tests/fixtures/sample), published exactly as generated. tests/sample-report-contract.test.ts holds
 * each to its resume.
 */
export type SampleReport = {
  /** The path segment under /sample-report; null for Jordan's, which is /sample-report itself. */
  slug: string | null;
  /** The fixture's file stem in tests/fixtures/sample. */
  fixture: string;
  /** The fictional person's first name, as the report's sample header and ending say it. */
  person: string;
  /** The situation, as the switcher between samples names it. */
  situation: string;
  /** One sentence for the page's description. */
  description: string;
};

export const SAMPLE_REPORTS: readonly SampleReport[] = [
  { slug: null, fixture: "jordan-miller", person: "Jordan", situation: "Customer success, mid-career", description: "A complete resume report on a fictional candidate, Jordan: what a recruiter takes from the resume, and the lines that need work." },
  { slug: "new-graduate", fixture: "daniel-okafor", person: "Daniel", situation: "A new graduate", description: "A complete resume report on a fictional new graduate, Daniel: one internship, a help desk job and three projects, and the lines a recruiter can't tell anything from." },
  { slug: "career-change", fixture: "maria-delgado", person: "Maria", situation: "Changing careers", description: "A complete resume report on a fictional candidate changing careers, Maria: eight years of teaching, a move into data analytics, and where the new work sits on her resume." },
  { slug: "career-break", fixture: "laura-jensen", person: "Laura", situation: "Back from a career break", description: "A complete resume report on a fictional candidate, Laura, returning after a caregiving break: how the dates read to a recruiter, and what to add." },
  { slug: "staff-engineer", fixture: "wei-chen", person: "Wei", situation: "A senior resume", description: "A complete resume report on a fictional staff engineer, Wei: a resume that is already mostly clear, and the few lines still worth work." },
];

export function samplePath(sample: Pick<SampleReport, "slug">) {
  return sample.slug ? `/sample-report/${sample.slug}` : "/sample-report";
}

export function sampleBySlug(slug: string | null): SampleReport | undefined {
  return SAMPLE_REPORTS.find((sample) => sample.slug === slug);
}
