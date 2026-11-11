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
// no stored verdict. `?latest=resume` puts a resume report first; `?empty=1` shows the empty state. The people are fictional.
const FIXTURES: ReportHistoryItem[] = [
  { id: "00000000-0000-4000-8000-000000000001", score: 81, isProfile: true, verdict: "A recruiting lead whose headline says the level, but whose About section never names the hiring you ran.", name: null, targetRole: "Talent Acquisition", createdAt: "2026-11-11T15:00:00.000Z", progress: { total: 5, answered: 2 } },
  { id: "00000000-0000-4000-8000-000000000002", score: 88, isProfile: false, verdict: "A senior payments product manager with launches, revenue growth, and customer results attached.", name: "After the rewrite", targetRole: "Senior Product Manager", createdAt: "2026-11-08T15:00:00.000Z", progress: { total: 3, answered: 3 }, change: { delta: 9, since: "2026-11-02T15:00:00.000Z" } },
  { id: "00000000-0000-4000-8000-000000000003", score: 77, isProfile: false, verdict: "A customer success manager with a defined SaaS portfolio, but few details about renewals and what changed.", name: null, targetRole: "Customer Success Manager", createdAt: "2026-11-05T15:00:00.000Z", progress: { total: 6, answered: 0 }, change: { delta: -2, since: "2026-11-01T15:00:00.000Z" } },
  { id: "00000000-0000-4000-8000-000000000004", score: 42, isProfile: false, verdict: "Your resume names a Marketing Manager goal, but the work shown is mostly retail and warehouse duties.", name: null, targetRole: "Marketing Manager", createdAt: "2026-11-01T15:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000005", score: 64, isProfile: false, verdict: null, name: null, targetRole: null, createdAt: "2026-10-20T15:00:00.000Z" },
];

export default async function ReportsLabPage({ searchParams }: { searchParams: Promise<{ empty?: string; latest?: string }> }) {
  if (!internalPagesEnabled()) notFound();
  const { empty, latest } = await searchParams;
  const rows = latest === "resume" ? FIXTURES.slice(1) : FIXTURES;
  return (
    <section className="flex-1 bg-background">
      <div className="mx-auto flex box-content w-auto max-w-column flex-col gap-8 px-[var(--marketing-gutter)] py-8 sm:py-12">
        <AppPageIntro title="Your saved reports" />
        <ReportHistoryList initialReports={empty ? [] : rows} pass={{ usesLeft: 3, expiresAt: "2027-02-03T00:00:00.000Z" }} />
      </div>
    </section>
  );
}
