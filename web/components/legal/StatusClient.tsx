"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Pulse, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";

type ReadinessCheck = {
  name: string;
  status: "configured" | "limited";
  message: string;
};

type ReadinessPayload = {
  ok: boolean;
  generatedAt: string;
  summary?: {
    status: "configured" | "limited";
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
              title: "Configuration status unavailable",
              message: "Could not load the launch configuration snapshot.",
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
      title="Launch configuration status"
      description="A transparent configuration snapshot. Real-time uptime monitoring is not published yet."
    >
      <section className="border-y border-line bg-surface-sky/35 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex size-10 items-center justify-center rounded-sm ${summary?.status === "configured" ? "bg-brand/10 text-brand" : "bg-accent-apricot/25 text-foreground"}`}>
            {summary?.status === "configured" ? <CheckCircle className="size-5" weight="fill" /> : <WarningCircle className="size-5" weight="fill" />}
          </div>
          <div className="gap-y-1">
            <h2 className="font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground">
              {summary?.title || "Checking current status"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {payload?.generatedAt
                ? `Last checked ${new Date(payload.generatedAt).toLocaleString()}.`
                : "Checking current status."}
            </p>
            <p className="text-sm text-muted-foreground">
              {summary?.message || "We use this page to summarize the customer-facing systems that matter most."}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link href="/trust" className="focus-ring inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/45 hover:bg-brand/5">
            Trust overview
          </Link>
          <Link href="/security" className="focus-ring inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/45 hover:bg-brand/5">
            Security details
          </Link>
          {isLaunchFlagEnabled("extensionSync") && (
            <Link href="/extension" className="focus-ring inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/45 hover:bg-brand/5">
              Extension install flow
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-line py-7 md:py-9">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle className="size-5 text-brand" weight="bold" />
          <h2 className="font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground">Customer-facing systems</h2>
        </div>
        <div className="border-y border-line">
          {services.map((service) => (
            <div key={service.name} className="grid gap-3 border-b border-line py-5 last:border-b-0 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(0,1.3fr)] sm:items-start">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{service.name}</p>
                <span className={`rounded-sm px-2 py-1 text-xs font-semibold uppercase riyp-track-008 ${
                  service.status === "configured"
                    ? "bg-brand/10 text-brand-strong"
                    : "bg-accent-apricot/30 text-foreground"
                }`}>
                  {service.status}
                </span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{service.message}</p>
            </div>
          ))}
          {services.length === 0 ? <p className="py-5 text-sm text-muted-foreground">System status is not available yet.</p> : null}
        </div>
      </section>

      <section className="border-y border-line bg-proof px-6 py-7 md:px-8">
        <div className="mb-4 flex items-center gap-2">
          <WarningCircle className="size-5 text-accent-apricot" weight="fill" />
          <h2 className="font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground">Known configuration limitations</h2>
        </div>
        <div className="gap-y-3">
          {incidents.map((incident) => (
            <div key={incident} className="border-l-2 border-accent-apricot pl-4">
              <p className="text-sm leading-6 text-foreground/85">{incident}</p>
            </div>
          ))}
          {incidents.length === 0 ? <p className="text-sm text-muted-foreground">No configuration blockers were detected. This does not prove live availability.</p> : null}
        </div>
      </section>

      <section className="border-t border-line py-7 md:py-9">
        <div className="mb-4 flex items-center gap-2">
          <Pulse className="size-5 text-brand" weight="bold" />
          <h2 className="font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground">Support and trust</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-t border-line pt-4">
            <p className="text-sm font-semibold text-foreground">Support</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Need help with billing, restore, or product issues? Email support@recruiterinyourpocket.com.
            </p>
          </div>
          <div className="border-t border-line pt-4">
            <p className="text-sm font-semibold text-foreground">Security and privacy</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Our public trust pages explain data handling, security posture, retention, and deletion before you run a report.
            </p>
          </div>
        </div>
      </section>
    </LegalShell>
  );
}
