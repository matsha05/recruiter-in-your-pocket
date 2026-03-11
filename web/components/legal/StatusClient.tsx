"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";

type ReadinessCheck = {
  name: string;
  status: "operational" | "limited";
  message: string;
};

type ReadinessPayload = {
  ok: boolean;
  generatedAt: string;
  summary?: {
    status: "operational" | "limited";
    title: string;
    message: string;
  };
  services?: ReadinessCheck[];
  incidents?: string[];
};

export default function StatusClient() {
  const [payload, setPayload] = useState<ReadinessPayload | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setPayload(data);
        }
      })
      .catch(() => {
        if (active) {
          setPayload({
            ok: false,
            generatedAt: new Date().toISOString(),
            summary: {
              status: "limited",
              title: "Status temporarily unavailable",
              message: "Could not load the current public status summary.",
            },
            services: [],
            incidents: [],
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const services = payload?.services || [];
  const incidents = payload?.incidents || [];
  const summary = payload?.summary;

  return (
    <LegalShell
      pageKey="status"
      eyebrow="Status"
      title="Current product status"
      description="A customer-facing summary of the systems you rely on before, during, and after a report."
    >
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${summary?.status === "operational" ? "bg-emerald-50" : "bg-amber-50"}`}>
            {summary?.status === "operational" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl text-slate-900">
              {summary?.title || "Checking current status"}
            </h2>
            <p className="text-sm text-slate-500">
              {payload?.generatedAt
                ? `Last checked ${new Date(payload.generatedAt).toLocaleString()}.`
                : "Checking current status."}
            </p>
            <p className="text-sm text-slate-600">
              {summary?.message || "We use this page to summarize the customer-facing systems that matter most."}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link href="/trust" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Trust overview
          </Link>
          <Link href="/security" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Security details
          </Link>
          <Link href="/extension" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Extension install flow
          </Link>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-slate-400" />
          <h2 className="font-display text-lg text-slate-900">Customer-facing systems</h2>
        </div>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">{service.name}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  service.status === "operational"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {service.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{service.message}</p>
            </div>
          ))}
          {services.length === 0 ? <p className="text-sm text-slate-500">System status is not available yet.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-400" />
          <h2 className="font-display text-lg text-slate-900">Current incidents</h2>
        </div>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident} className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-sm text-amber-800">{incident}</p>
            </div>
          ))}
          {incidents.length === 0 ? <p className="text-sm text-slate-500">No customer-facing incidents are reported right now.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          <h2 className="font-display text-lg text-slate-900">Support and trust</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800">Support</p>
            <p className="mt-2 text-sm text-slate-500">
              Need help with billing, restore, or product issues? Email support@recruiterinyourpocket.com.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800">Security and privacy</p>
            <p className="mt-2 text-sm text-slate-500">
              Our public trust pages explain data handling, security posture, and how extension capture works before you install it.
            </p>
          </div>
        </div>
      </section>
    </LegalShell>
  );
}
