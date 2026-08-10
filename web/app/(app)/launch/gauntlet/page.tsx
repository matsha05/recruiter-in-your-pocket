import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  CircleDashed,
  ExternalLink,
  FlaskConical,
  ShieldAlert,
  X,
} from "lucide-react";
import { GauntletIterationSubmit } from "./GauntletIterationSubmit";
import {
  getGauntletProgress,
  UnknownGauntletIterationError,
} from "@/lib/gauntlet/progress";
import type {
  CandidateBinding,
  CaseProgress,
  CaseVariantInspection,
  ContentReceipt,
  DimensionProgress,
  GateStatus,
} from "@/lib/gauntlet/types";
import { canAccessInternalLaunchSurface, shouldProtectInternalLaunchSurface } from "@/lib/launch/access";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/seo/privateRouteMetadata";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gauntlet progress",
  robots: PRIVATE_ROUTE_ROBOTS,
};

type SearchParams = Record<string, string | string[] | undefined>;
const SAFE_SELECTOR = /^[a-z0-9][a-z0-9-]{0,63}$/;

function statusClass(status: GateStatus) {
  if (status === "pass") return "border-success/35 bg-success/10 text-success";
  if (status === "fail") return "border-destructive/35 bg-error-surface text-destructive";
  if (status === "retired") return "border-line bg-paper-muted text-muted-foreground";
  return "border-warning/35 bg-warning/10 text-warning-foreground";
}

function StatusIcon({ status, className = "size-4" }: { status: GateStatus; className?: string }) {
  if (status === "pass") return <Check aria-hidden="true" className={className} />;
  if (status === "fail") return <X aria-hidden="true" className={className} />;
  return <CircleDashed aria-hidden="true" className={className} />;
}

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-5">
      <div className="mb-5 max-w-3xl">
        <h2 className="font-display text-xl riyp-weight-560 riyp-track-n025 text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function DimensionCard({ progress, noun }: { progress: DimensionProgress; noun: string }) {
  return (
    <div className="border-l-2 border-line pl-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold capitalize text-foreground">{progress.dimension}</p>
        <span className={`inline-flex items-center gap-1 border px-2 py-1 riyp-type-0625 font-semibold uppercase riyp-track-010 ${statusClass(progress.status)}`}>
          <StatusIcon status={progress.status} className="size-3" />
          {progress.status}
        </span>
      </div>
      <p className="mt-4 font-display text-3xl riyp-weight-600 riyp-track-n04 text-foreground">
        {progress.rate === null ? "Not measured" : `${Math.round(progress.rate * 100)}%`}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {progress.candidateWins}/{progress.targetWins} required {noun}; {progress.reviewed}/12 reviewed
      </p>
    </div>
  );
}

function EvidenceMark({ complete, label }: { complete: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${complete ? "text-success" : "text-muted-foreground"}`}>
      {complete ? <Check aria-hidden="true" className="size-3" /> : <CircleDashed aria-hidden="true" className="size-3" />}
      {label}
    </span>
  );
}

function HashValue({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="riyp-type-0625 font-semibold uppercase riyp-track-010 text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all font-mono riyp-type-11px leading-5 text-foreground">{value ?? "Not bound"}</dd>
    </div>
  );
}

function Receipt({ label, receipt }: { label: string; receipt: ContentReceipt | null }) {
  return (
    <div>
      <p className="riyp-type-0625 font-semibold uppercase riyp-track-010 text-muted-foreground">{label}</p>
      {receipt ? (
        <dl className="mt-2 space-y-2">
          <HashValue label="Canonical path" value={receipt.path} />
          <HashValue label="SHA-256" value={receipt.sha256} />
        </dl>
      ) : <p className="mt-1 text-sm text-muted-foreground">Not bound</p>}
    </div>
  );
}

function BindingCard({ label, binding }: { label: string; binding: CandidateBinding }) {
  return (
    <article className="border-l-2 border-line pl-4">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <HashValue label="Repository ref" value={binding.ref} />
        <HashValue label="Deployment status" value={binding.deploymentStatus} />
        <HashValue label="Renderer commit" value={binding.commit} />
        <HashValue label="Model" value={binding.model} />
      </dl>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Receipt label="Resume prompt" receipt={binding.resumePrompt} />
        <Receipt label="Report renderer" receipt={binding.renderer} />
      </div>
    </article>
  );
}

function VariantInspection({ variant }: { variant: CaseVariantInspection }) {
  return (
    <article className="min-w-0 border border-line bg-paper-muted p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-lg riyp-weight-560 capitalize text-foreground">{variant.variant}</h4>
          <p className="mt-1 text-xs text-muted-foreground">Immutable generation source and later rendered presentation · synthetic fixture only</p>
        </div>
        <span className="border border-line bg-paper px-2 py-1 riyp-type-0625 font-semibold uppercase riyp-track-010 text-muted-foreground">
          {variant.presentation.viewport.width}×{variant.presentation.viewport.height}
        </span>
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <HashValue label="Artifact" value={variant.artifactSha256} />
        <HashValue label="Report" value={variant.reportSha256} />
        <HashValue label="Fixture" value={variant.fixtureSha256} />
        <HashValue label="Visible text" value={variant.presentation.visibleTextSha256} />
        <HashValue label="Screenshot" value={variant.presentation.screenshotSha256} />
        <HashValue label="Generation source" value={variant.generation.sanitizedOutput.sha256} />
        <HashValue label="Generation commit" value={variant.generation.sourceCommit} />
        <HashValue label="Renderer commit" value={variant.binding.commit} />
        <HashValue label="Canonical prompt" value={variant.generation.canonicalPromptSha256} />
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Generated {variant.generation.generatedAt} · run {variant.generation.runId} · model {variant.generation.model}
      </p>
      <div className="mt-5 border-t border-line pt-4">
        <p className="riyp-type-0625 font-semibold uppercase riyp-track-010 text-muted-foreground">Rendered presentation</p>
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground">
          {variant.presentation.visibleText}
        </pre>
      </div>
    </article>
  );
}

function CaseInspection({ testCase }: { testCase: CaseProgress }) {
  return (
    <Panel
      title={`${testCase.role} · ${testCase.seniority}`}
      description="The source resume and fixture path are never rendered. Variant identity appears only after a current hash-bound blind judgment exists."
    >
      {!testCase.blindVerdict ? (
        <div className="border-l-4 border-warning bg-warning/10 px-4 py-4 text-sm leading-6 text-warning-foreground">
          Candidate and production remain hidden until this case has a valid blind judgment bound to the current output pair.
        </div>
      ) : (
        <>
          <div className="grid gap-5 border-y border-line py-5 md:grid-cols-3">
            {Object.entries(testCase.blindVerdict.preferences).map(([dimension, preference]) => (
              <div key={dimension}>
                <p className="riyp-type-0625 font-semibold uppercase riyp-track-010 text-muted-foreground">{dimension}</p>
                <p className="mt-2 text-sm font-semibold capitalize text-foreground">{preference}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{testCase.blindVerdict!.rationale[dimension as keyof typeof testCase.blindVerdict.rationale]}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Reviewed by {testCase.blindVerdict.reviewer} · {new Date(testCase.blindVerdict.reviewedAt).toLocaleString()}
          </p>
          {testCase.candidate && testCase.production ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <VariantInspection variant={testCase.candidate} />
              <VariantInspection variant={testCase.production} />
            </div>
          ) : (
            <div className="mt-6 border-l-4 border-destructive bg-error-surface px-4 py-4 text-sm text-destructive">
              The prior verdict is unavailable because one or both output receipts are no longer valid.
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

export default async function GauntletPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const protectedHost = await shouldProtectInternalLaunchSurface();
  if (protectedHost) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!canAccessInternalLaunchSurface(data.user?.email)) notFound();
  }

  const params = await searchParams;
  const iterationParam = params.iteration;
  const caseParam = params.case;
  if (Array.isArray(iterationParam) || Array.isArray(caseParam)) notFound();
  if (iterationParam !== undefined && !SAFE_SELECTOR.test(iterationParam)) notFound();
  if (caseParam !== undefined && !SAFE_SELECTOR.test(caseParam)) notFound();

  let snapshot: Awaited<ReturnType<typeof getGauntletProgress>>;
  try {
    snapshot = await getGauntletProgress(undefined, iterationParam);
  } catch (error) {
    if (error instanceof UnknownGauntletIterationError) notFound();
    notFound();
  }
  if (protectedHost && !["pending", "baseline_pending", "retired"].includes(snapshot.iteration.status)) notFound();
  const selectedCase = caseParam ? snapshot.cases.find((testCase) => testCase.id === caseParam) : undefined;
  if (caseParam && !selectedCase) notFound();

  const overallLabel = snapshot.overallStatus === "retired"
    ? "GAUNTLET ENDED"
    : snapshot.overallStatus === "pass"
    ? "QUALITY BAR CLEARED"
    : snapshot.overallStatus === "fail"
      ? "EVIDENCE BLOCKED"
      : snapshot.iteration.status === "baseline_pending" ? "BASELINE PENDING" : "EVIDENCE PENDING";
  const selectedHistory = snapshot.iterations.find((iteration) => iteration.selected);

  return (
    <div data-visual-anchor="gauntlet-progress" className="min-h-full bg-paper px-4 py-8 text-foreground sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="border-t border-line pt-5">
          <Link href="/launch" className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-foreground">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Launch command center
          </Link>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">
                Gauntlet loop · {snapshot.iteration.status === "retired" ? "ended by owner" : "operator only"}
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-4xl riyp-weight-620 riyp-leading-098 riyp-track-n055 text-foreground sm:text-5xl lg:text-6xl">
                Can the first free review earn the second?
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {snapshot.iteration.status === "retired"
                  ? "Matt ended this loop before evidence capture. It is retired without a quality verdict, not waiting for more tokens or review."
                  : "Twelve existing synthetic resumes. Nine candidate wins in every dimension. Zero invented facts. Zero critical desktop or mobile journey failures."}
              </p>
            </div>
            <div className={`inline-flex min-h-12 items-center gap-2 self-start border-l-4 px-4 py-3 text-sm font-semibold ${statusClass(snapshot.overallStatus)}`}>
              <StatusIcon status={snapshot.overallStatus} />
              {overallLabel}
            </div>
          </div>
          <div className="mt-8 grid gap-4 border-y border-line py-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="riyp-type-0625 font-semibold uppercase riyp-track-012 text-muted-foreground">Iteration</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{snapshot.iteration.label}</p>
            </div>
            <div>
              <p className="riyp-type-0625 font-semibold uppercase riyp-track-012 text-muted-foreground">Rendered pairs</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{snapshot.pairedOutputCases}/12</p>
            </div>
            <div>
              <p className="riyp-type-0625 font-semibold uppercase riyp-track-012 text-muted-foreground">Human source audits</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{snapshot.sourceAuditedCases}/12</p>
            </div>
            <div>
              <p className="riyp-type-0625 font-semibold uppercase riyp-track-012 text-muted-foreground">Journey failures</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {snapshot.criticalJourneyFailures === null ? "Not measured" : snapshot.criticalJourneyFailures}
              </p>
            </div>
          </div>
        </header>

        <Panel title="Iteration record" description={snapshot.iteration.status === "retired"
          ? "This read-only record preserves the decision to stop without claiming a pass."
          : "Ledger selection is read-only. Every completed record is chained to its predecessor and sealed to its exact evidence tree."}>
          <form method="get" className="grid gap-3 border border-line bg-paper-muted p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="text-sm font-semibold text-foreground">
              Inspect iteration
              <select name="iteration" defaultValue={snapshot.iteration.id} className="mt-2 block min-h-11 w-full border border-line bg-paper px-3 text-sm text-foreground">
                {snapshot.iterations.map((iteration) => (
                  <option key={iteration.id} value={iteration.id}>{iteration.label} · {iteration.status}</option>
                ))}
              </select>
            </label>
            <GauntletIterationSubmit />
          </form>
          {selectedHistory && !selectedHistory.active ? (
            <p className="mt-3 border-l-4 border-brand bg-brand/5 px-4 py-3 text-sm font-semibold text-foreground">Historical · read-only</p>
          ) : null}
          <nav aria-label="Iteration history" className="mt-5 flex flex-wrap gap-2">
            {snapshot.iterations.map((iteration) => (
              <Link
                key={iteration.id}
                href={`/launch/gauntlet?iteration=${encodeURIComponent(iteration.id)}`}
                aria-current={iteration.selected ? "page" : undefined}
                className={`border px-3 py-2 text-xs font-semibold ${iteration.selected ? "border-brand bg-brand/5 text-brand" : "border-line text-muted-foreground"}`}
              >
                {iteration.label}{iteration.active ? " · active" : ""}
              </Link>
            ))}
          </nav>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HashValue label="Ledger SHA-256" value={snapshot.iterationLedgerSha256} />
            <HashValue label="Created" value={snapshot.iteration.createdAt} />
            <HashValue label="Status" value={snapshot.iteration.status} />
            <HashValue label="Critic verdict" value={snapshot.iteration.critic.verdict} />
          </dl>
        </Panel>

        <Panel title="Builder and critic" description="The builder claim is recorded separately from the independent verdict and remaining gap.">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="border-l-2 border-brand pl-4">
              <p className="riyp-type-0625 font-semibold uppercase riyp-track-010 text-brand">Builder record</p>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Change</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{snapshot.iteration.builder.change}</p>
              <h3 className="mt-4 text-sm font-semibold text-foreground">Claim</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{snapshot.iteration.builder.claim}</p>
            </article>
            <article className="border-l-2 border-line pl-4">
              <p className="riyp-type-0625 font-semibold uppercase riyp-track-010 text-muted-foreground">Critic record · {snapshot.iteration.critic.verdict}</p>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Rationale</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{snapshot.iteration.critic.rationale}</p>
              <h3 className="mt-4 text-sm font-semibold text-foreground">Remaining gap</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{snapshot.iteration.critic.remainingGap}</p>
            </article>
          </div>
        </Panel>

        <Panel title="Repository bindings" description="These receipts must resolve from the named clean Git snapshot; SHA-shaped placeholders do not count.">
          <div className="grid gap-8 lg:grid-cols-2">
            <BindingCard label="Candidate" binding={snapshot.iteration.candidate} />
            <BindingCard label="Production" binding={snapshot.iteration.production} />
          </div>
        </Panel>

        <Panel title="Evidence gates" description={snapshot.iteration.status === "retired"
          ? "Unfinished gates are retired, not passed and not queued for more work."
          : "Missing evidence stays pending. Invalid, stale, mutated, or unsafe evidence fails closed."}>
          <div className="grid gap-x-8 md:grid-cols-2">
            {snapshot.gates.map((gate) => (
              <div key={gate.id} className="flex gap-3 border-t border-line py-4 first:border-t-0 md:[&:nth-child(2)]:border-t-0">
                <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center border ${statusClass(gate.status)}`}>
                  <StatusIcon status={gate.status} className="size-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{gate.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{gate.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-10 lg:grid-cols-2">
          <Panel title="Blinded candidate vs. production" description="A/B placement remains hidden until a judgment is bound to the exact output, visible-text, and screenshot hashes.">
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {snapshot.dimensions.map((progress) => <DimensionCard key={progress.dimension} progress={progress} noun="wins" />)}
            </div>
          </Panel>
          <Panel title="Candidate vs. public reference bar" description="Structured assessment against inspectable Teal and Jobscan artifacts; this is not same-resume competitor output.">
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {snapshot.referenceDimensions.map((progress) => <DimensionCard key={progress.dimension} progress={progress} noun="meets-or-beats" />)}
            </div>
          </Panel>
        </div>

        {selectedCase ? <CaseInspection testCase={selectedCase} /> : null}

        <Panel title="Twelve-case board" description="Choose a synthetic case to inspect. No source resume text or fixture path is rendered.">
          <div className="border-y border-line">
            {snapshot.cases.map((testCase, index) => (
              <div key={testCase.id} className="grid gap-3 border-t border-line py-4 first:border-t-0 md:grid-cols-[2rem_minmax(12rem,1fr)_minmax(19rem,1.4fr)] md:items-center">
                <p className="riyp-type-0625 font-semibold text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <Link href={`/launch/gauntlet?iteration=${encodeURIComponent(snapshot.iteration.id)}&case=${encodeURIComponent(testCase.id)}`} className="text-sm font-semibold text-brand hover:text-foreground">
                    {testCase.role}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{testCase.seniority} · {testCase.quality}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <EvidenceMark complete={testCase.pairedOutputs} label="pair" />
                  <EvidenceMark complete={testCase.blindReviewed} label="blind" />
                  <EvidenceMark complete={testCase.automatedChecked} label="checks" />
                  <EvidenceMark complete={testCase.sourceAudited} label="source" />
                  <EvidenceMark complete={testCase.referenceAssessed} label="reference" />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <Panel title="Inspectable external bar" description="Selected from official public artifacts on July 31, 2026.">
            <div className="space-y-6">
              {snapshot.manifest.competitorReferences.map((reference) => (
                <article key={reference.id} className="border-l-2 border-brand pl-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{reference.name}</h3>
                      <p className="mt-1 riyp-type-0625 font-semibold uppercase riyp-track-010 text-brand">
                        {reference.role === "cold_entry" ? "Cold-entry reference" : "Report/actionability reference"}
                      </p>
                    </div>
                    <a href={reference.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-foreground">
                      Official artifact <ExternalLink aria-hidden="true" className="size-3" />
                    </a>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {reference.observedCapabilities.map((capability) => <li key={capability}>- {capability}</li>)}
                  </ul>
                  <p className="mt-3 text-xs leading-5 text-warning-foreground">{reference.limitation}</p>
                </article>
              ))}
            </div>
          </Panel>
          <Panel title={snapshot.iteration.status === "retired" ? "Why this ended" : "What is actually missing"} description={snapshot.iteration.baselineStatement}>
            <ol className="space-y-4">
              {snapshot.baselineGaps.map((gap, index) => (
                <li key={`${index}-${gap}`} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-line bg-paper-muted riyp-type-0625 font-semibold text-foreground">{index + 1}</span>
                  {gap}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <footer className="grid gap-5 border-t border-line pt-5 sm:grid-cols-[auto_1fr] sm:items-start">
          <span className="flex size-10 items-center justify-center border border-line bg-paper-muted text-brand">
            {snapshot.dataIssues.length > 0 ? <ShieldAlert aria-hidden="true" className="size-5" /> : <FlaskConical aria-hidden="true" className="size-5" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {snapshot.iteration.status === "retired" ? "Retired record" : "Operator command"}
            </p>
            {snapshot.iteration.status === "retired" ? (
              <p className="mt-2 text-sm text-muted-foreground">No eval, evidence capture, or critic work remains authorized for this iteration.</p>
            ) : (
              <code className="mt-2 block overflow-x-auto border border-line bg-background px-3 py-2 text-xs text-muted-foreground">
                npm run gauntlet:strict -- --iteration={snapshot.iteration.id}
              </code>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Snapshot generated <time dateTime={snapshot.generatedAt}>{new Date(snapshot.generatedAt).toLocaleString()}</time>.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
