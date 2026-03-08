"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { LegalShell } from "@/components/legal/LegalShell";

type ReadinessCheck = {
  name: string;
  status: "ok" | "missing" | "disabled";
  message: string;
};

type LaunchGate = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  description: string;
};

type LaunchBlocker = {
  gateId: string;
  gateLabel: string;
  check: string;
  message: string;
};

type ReadinessPayload = {
  ok: boolean;
  goNoGo?: boolean;
  generatedAt?: string;
  checks?: ReadinessCheck[];
  gates?: LaunchGate[];
  blockers?: LaunchBlocker[];
  message?: string;
};

export default function StatusClient() {
  const [payload, setPayload] = useState<ReadinessPayload | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/ready", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setPayload(data);
        }
      })
      .catch(() => {
        if (active) {
          setPayload({ ok: false, message: "Could not load current readiness status." });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const checks = payload?.checks || [];
  const gates = payload?.gates || [];
  const blockers = payload?.blockers || [];

  return (
    <LegalShell
      pageKey="status"
      eyebrow="Status"
      title="Current product status"
      description="A live summary of launch-critical readiness checks and the controls we verify before shipping."
    >
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${payload?.goNoGo ? "bg-emerald-50" : "bg-amber-50"}`}>
            {payload?.goNoGo ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl text-slate-900">{payload?.goNoGo ? "Launch-ready" : "Needs attention"}</h2>
            <p className="text-sm text-slate-500">
              {payload?.generatedAt
                ? `Last checked ${new Date(payload.generatedAt).toLocaleString()}.`
                : payload?.message || "Checking current status."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-slate-400" />
          <h2 className="font-display text-lg text-slate-900">Launch gates</h2>
        </div>
        <div className="space-y-3">
          {gates.map((gate) => (
            <div key={gate.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">{gate.label}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  gate.status === "pass"
                    ? "bg-emerald-50 text-emerald-700"
                    : gate.status === "warn"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                }`}>
                  {gate.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{gate.description}</p>
            </div>
          ))}
          {gates.length === 0 ? <p className="text-sm text-slate-500">Launch gate data is not available yet.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-400" />
          <h2 className="font-display text-lg text-slate-900">Current blockers</h2>
        </div>
        <div className="space-y-3">
          {blockers.map((blocker) => (
            <div key={`${blocker.gateId}-${blocker.check}`} className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
              <p className="text-sm font-semibold text-rose-800">{blocker.gateLabel}</p>
              <p className="mt-2 text-sm text-rose-700">{blocker.message}</p>
            </div>
          ))}
          {blockers.length === 0 ? <p className="text-sm text-slate-500">No live blockers are reported right now.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          <h2 className="font-display text-lg text-slate-900">Readiness checks</h2>
        </div>
        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.name} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">{check.name.replace(/_/g, " ")}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  check.status === "ok"
                    ? "bg-emerald-50 text-emerald-700"
                    : check.status === "disabled"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-amber-50 text-amber-700"
                }`}>
                  {check.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{check.message}</p>
            </div>
          ))}
          {checks.length === 0 ? <p className="text-sm text-slate-500">Live readiness data is not available yet.</p> : null}
        </div>
      </section>
    </LegalShell>
  );
}
