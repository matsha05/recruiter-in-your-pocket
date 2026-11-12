import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { ReportHistoryList, type ReportHistoryItem } from "@/components/reports/ReportHistoryList";

export const dynamic = "force-dynamic";

const internalPagesEnabled = () => process.env.NODE_ENV !== "production" || process.env.ALLOW_INTERNAL_PAGES === "true";

export function generateMetadata(): Metadata {
  if (!internalPagesEnabled()) return {};
  return { title: "Reports Lab", robots: { index: false, follow: false } };
}

// My reports with fixture rows (Nov 11, 2026): the page itself needs a signed-in server session, so this is where its
// rows are read and checked. One of each kind: a profile review part answered, a named report with every line
// answered and a score that rose, an unnamed one that fell, one with nothing to count, and an early report with
// no stored verdict. The customer success resume has three versions; `?latest=versions` puts it first. `?latest=resume` puts a resume report first; `?empty=1` shows the empty state. The people are fictional.
const FIXTURES: ReportHistoryItem[] = [
  { id: "00000000-0000-4000-8000-000000000001", score: 81, isProfile: true, verdict: "A recruiting lead whose headline says the level, but whose About section never names the hiring you ran.", name: null, targetRole: "Talent Acquisition", createdAt: "2026-11-11T15:00:00.000Z", progress: { total: 5, answered: 2 } },
  { id: "00000000-0000-4000-8000-000000000002", score: 88, isProfile: false, verdict: "A senior payments product manager with launches, revenue growth, and customer results attached.", name: "After the rewrite", targetRole: "Senior Product Manager", createdAt: "2026-11-08T15:00:00.000Z", progress: { total: 3, answered: 3 }, change: { delta: 9, since: "2026-11-02T15:00:00.000Z" } },
  { id: "00000000-0000-4000-8000-000000000003", score: 77, isProfile: false, verdict: "A customer success manager with a defined SaaS portfolio, but few details about renewals and what changed.", name: null, targetRole: "Customer Success Manager", createdAt: "2026-11-05T15:00:00.000Z", progress: { total: 6, answered: 0 }, change: { delta: -2, since: "2026-11-01T15:00:00.000Z" }, revises: "00000000-0000-4000-8000-000000000007", revisions: { sinceId: "00000000-0000-4000-8000-000000000006", gone: 4, still: 3, added: 3 } },
  // Two earlier versions of the customer success resume above: 03 re-checked 07, which re-checked 06.
  { id: "00000000-0000-4000-8000-000000000007", score: 79, isProfile: false, verdict: "A customer success manager with a named SaaS portfolio, and renewals described only as a duty.", name: null, targetRole: "Customer Success Manager", createdAt: "2026-11-03T15:00:00.000Z", progress: { total: 6, answered: 4 }, revises: "00000000-0000-4000-8000-000000000006" },
  { id: "00000000-0000-4000-8000-000000000006", score: 58, isProfile: false, verdict: "A customer success manager whose accounts, renewals and results are all still unnamed.", name: "First draft", targetRole: "Customer Success Manager", createdAt: "2026-11-01T15:00:00.000Z", progress: { total: 7, answered: 7 } },
  { id: "00000000-0000-4000-8000-000000000004", score: 42, isProfile: false, verdict: "Your resume names a Marketing Manager goal, but the work shown is mostly retail and warehouse duties.", name: null, targetRole: "Marketing Manager", createdAt: "2026-11-01T15:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000005", score: 64, isProfile: false, verdict: null, name: null, targetRole: null, createdAt: "2026-10-20T15:00:00.000Z" },
];

export default async function ReportsLabPage({ searchParams }: { searchParams: Promise<{ empty?: string; latest?: string }> }) {
  if (!internalPagesEnabled()) notFound();
  const { empty, latest } = await searchParams;
  const rows = latest === "resume" ? FIXTURES.slice(1) : latest === "versions" ? FIXTURES.slice(2) : FIXTURES;
  return (
    <section className="flex-1 bg-background">
      <div className="mx-auto flex box-content w-auto max-w-column flex-col gap-8 px-[var(--marketing-gutter)] py-8 sm:py-12">
        <AppPageIntro title="Your saved reports" />
        <ReportHistoryList initialReports={empty ? [] : rows} pass={{ usesLeft: 3, expiresAt: "2027-02-03T00:00:00.000Z" }} />
      </div>
    </section>
  );
}
