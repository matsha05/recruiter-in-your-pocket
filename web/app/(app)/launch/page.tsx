import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, ShieldCheck, Siren, ToggleRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getLaunchReadinessSnapshot } from "@/lib/launch/readiness";
import { LAUNCH_OWNERS, LAUNCH_REHEARSAL_STEPS, ROLLBACK_CONTROLS, VENDOR_REVIEW_ITEMS } from "@/lib/launch/program";
import { canAccessInternalLaunchSurface, shouldProtectInternalLaunchSurface } from "@/lib/launch/access";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

function badgeClass(status: "pass" | "warn" | "fail") {
  if (status === "pass") return "border-success/35 bg-success/10 text-success";
  if (status === "warn") return "border-warning/35 bg-warning/10 text-warning-foreground";
  return "border-destructive/35 bg-error-surface text-destructive";
}

function LaunchPanel({ icon, title, children }: { icon?: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line bg-background p-5 md:p-6">
      <div className="mb-5 flex items-center gap-2 text-brand">
        {icon}
        <h2 className="font-display text-xl riyp-weight-560 tracking-[-0.025em] text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const rowClass = "border-t border-line py-4 first:border-t-0 first:pt-0 last:pb-0";

export default async function LaunchPage() {
  if (await shouldProtectInternalLaunchSurface()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!canAccessInternalLaunchSurface(data.user?.email)) {
      notFound();
    }
  }

  const snapshot = await getLaunchReadinessSnapshot();
  const hasWarnings = snapshot.gates.some((gate) => gate.status === "warn");
  const launchLabel = !snapshot.goNoGo ? "NO-GO" : hasWarnings ? "GO WITH WARNINGS" : "GO";

  return (
    <div data-visual-anchor="launch-page" className="min-h-full bg-paper px-4 py-8 text-foreground sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="grid gap-6 border-t border-line pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Launch command center</p>
            <h1 className="launch-command-title mt-3 font-display riyp-weight-620 text-foreground riyp-stretch-91">
              Go or no-go, with receipts.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Runtime readiness, launch gates, rollback controls, vendor review, ownership, and the final rehearsal in one place.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Generated {new Date(snapshot.generatedAt).toLocaleString()}.</p>
          </div>
          <div className={`inline-flex min-h-12 items-center gap-2 border-l-4 px-4 py-2 text-sm font-semibold ${!snapshot.goNoGo ? "border-destructive bg-error-surface text-destructive" : hasWarnings ? "border-warning bg-warning/10 text-warning-foreground" : "border-citron bg-citron/15 text-foreground"}`}>
            {snapshot.goNoGo ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
            {launchLabel}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <LaunchPanel icon={<ShieldCheck className="size-4" />} title="Launch gates">
            <div>
              {snapshot.gates.map((gate) => (
                <div key={gate.id} className={rowClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{gate.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{gate.description}</p>
                    </div>
                    <span className={`riyp-type-0625 riyp-track-012 shrink-0 border px-2 py-1 font-semibold uppercase ${badgeClass(gate.status)}`}>
                      {gate.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </LaunchPanel>

          <LaunchPanel icon={<Siren className="size-4" />} title="Current blockers">
            {snapshot.blockers.length === 0 ? (
              <p className="border-l-2 border-success bg-success/10 p-4 text-sm leading-6 text-success">No launch blockers are reported by the runtime readiness system.</p>
            ) : (
              <div>
                {snapshot.blockers.map((blocker) => (
                  <div key={`${blocker.gateId}-${blocker.check}`} className={`${rowClass} border-l-2 border-l-destructive bg-error-surface px-4`}>
                    <p className="text-sm font-semibold text-destructive">{blocker.gateLabel}</p>
                    <p className="mt-1 text-sm leading-6 text-destructive">{blocker.message}</p>
                    <p className="riyp-type-0625 riyp-track-012 mt-2 uppercase text-destructive/75">{blocker.check.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            )}
          </LaunchPanel>

          <LaunchPanel icon={<ToggleRight className="size-4" />} title="Rollback controls">
            <div>
              {ROLLBACK_CONTROLS.map((control) => (
                <div key={control.envVar} className={rowClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{control.surface}</p>
                    <code className="border border-line bg-paper-muted px-2 py-1 text-xs text-muted-foreground">{control.envVar}</code>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.reason}</p>
                  <p className="riyp-type-0625 riyp-track-012 mt-2 uppercase text-muted-foreground">Default {control.defaultState}</p>
                </div>
              ))}
            </div>
          </LaunchPanel>

          <LaunchPanel icon={<ClipboardList className="size-4" />} title="Named owners">
            <div>
              {LAUNCH_OWNERS.map((owner) => (
                <div key={owner.surface} className={rowClass}>
                  <p className="text-sm font-semibold text-foreground">{owner.surface}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Primary: {owner.owner}</p>
                  <p className="text-sm text-muted-foreground">Backup: {owner.backup}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{owner.channel}</p>
                </div>
              ))}
            </div>
          </LaunchPanel>

          <LaunchPanel title="Vendor and privacy review">
            <div>
              {VENDOR_REVIEW_ITEMS.map((item) => (
                <div key={item.vendor} className={rowClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{item.vendor}</p>
                    <span className="riyp-type-0625 riyp-track-012 border border-line bg-paper-muted px-2 py-1 font-semibold uppercase text-muted-foreground">
                      {item.launchDecision}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.purpose}</p>
                  <p className="mt-2 text-sm text-foreground">Data: {item.dataClasses}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reviewNotes}</p>
                </div>
              ))}
            </div>
          </LaunchPanel>

          <LaunchPanel title="Launch rehearsal">
            <div>
              {LAUNCH_REHEARSAL_STEPS.map((step, index) => (
                <div key={step.id} className={rowClass}>
                  <p className="riyp-type-0625 riyp-track-012 font-semibold uppercase text-brand">Step {index + 1} · {step.surface}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.evidence}</p>
                </div>
              ))}
            </div>
          </LaunchPanel>
        </div>
      </div>
    </div>
  );
}
