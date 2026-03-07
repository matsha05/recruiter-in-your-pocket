import { AlertTriangle, CheckCircle2, ClipboardList, ShieldCheck, Siren, ToggleRight } from "lucide-react";
import { getLaunchReadinessSnapshot } from "@/lib/launch/readiness";
import { LAUNCH_OWNERS, LAUNCH_REHEARSAL_STEPS, ROLLBACK_CONTROLS, VENDOR_REVIEW_ITEMS } from "@/lib/launch/program";

function badgeClass(status: "pass" | "warn" | "fail") {
  if (status === "pass") return "bg-emerald-50 text-emerald-700";
  if (status === "warn") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

export default async function LaunchPage() {
  const snapshot = await getLaunchReadinessSnapshot();

  return (
    <div data-visual-anchor="launch-page" className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Launch Command Center</p>
            <h1 className="font-display text-3xl text-slate-900">Go/no-go launch program</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              This page is the working launch room: runtime readiness, gate status, rollback controls, vendor review, and the final rehearsal checklist.
            </p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${snapshot.goNoGo ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {snapshot.goNoGo ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {snapshot.goNoGo ? "GO" : "NO-GO"}
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">Last generated {new Date(snapshot.generatedAt).toLocaleString()}.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <h2 className="font-display text-lg text-slate-900">Launch gates</h2>
          </div>
          <div className="space-y-3">
            {snapshot.gates.map((gate) => (
              <div key={gate.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{gate.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{gate.description}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${badgeClass(gate.status)}`}>
                    {gate.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Siren className="h-4 w-4 text-slate-500" />
            <h2 className="font-display text-lg text-slate-900">Current blockers</h2>
          </div>
          <div className="space-y-3">
            {snapshot.blockers.length === 0 ? (
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">No launch blockers are currently reported by the runtime readiness system.</p>
            ) : (
              snapshot.blockers.map((blocker) => (
                <div key={`${blocker.gateId}-${blocker.check}`} className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                  <p className="text-sm font-semibold text-rose-800">{blocker.gateLabel}</p>
                  <p className="mt-1 text-sm text-rose-700">{blocker.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-rose-500">{blocker.check.replace(/_/g, " ")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ToggleRight className="h-4 w-4 text-slate-500" />
            <h2 className="font-display text-lg text-slate-900">Rollback controls</h2>
          </div>
          <div className="space-y-3">
            {ROLLBACK_CONTROLS.map((control) => (
              <div key={control.envVar} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{control.surface}</p>
                  <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{control.envVar}</code>
                </div>
                <p className="mt-2 text-sm text-slate-500">{control.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">Default: {control.defaultState}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-500" />
            <h2 className="font-display text-lg text-slate-900">Named owners</h2>
          </div>
          <div className="space-y-3">
            {LAUNCH_OWNERS.map((owner) => (
              <div key={owner.surface} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-900">{owner.surface}</p>
                <p className="mt-1 text-sm text-slate-600">Primary: {owner.owner}</p>
                <p className="text-sm text-slate-500">Backup: {owner.backup}</p>
                <p className="mt-2 text-xs text-slate-400">{owner.channel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-slate-900">Vendor and privacy review</h2>
          <div className="mt-4 space-y-3">
            {VENDOR_REVIEW_ITEMS.map((item) => (
              <div key={item.vendor} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.vendor}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    {item.launchDecision}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.purpose}</p>
                <p className="mt-2 text-sm text-slate-600">Data: {item.dataClasses}</p>
                <p className="mt-2 text-sm text-slate-500">{item.reviewNotes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-slate-900">Launch rehearsal</h2>
          <div className="mt-4 space-y-3">
            {LAUNCH_REHEARSAL_STEPS.map((step, index) => (
              <div key={step.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Step {index + 1} · {step.surface}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-2 text-sm text-slate-500">{step.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
