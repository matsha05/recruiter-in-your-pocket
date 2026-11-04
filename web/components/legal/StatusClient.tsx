"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Pulse, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";
import { Button } from "@/components/ui/button";
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
      .then((res) => {
        if (!res.ok) throw new Error("Status request failed");
        return res.json();
      })
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
              title: "We could not check the configuration",
              message: "Try again, or contact support if you are having trouble using the site.",
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
  const unavailable = Boolean(payload && !payload.ok && services.length === 0);

  return (
    <LegalShell
      pageKey="status"
      title="Configuration checks"
      description="Whether the settings required to run Recruiter in Your Pocket are in place. These checks do not measure uptime."
    >
      <section className="rounded-xl border border-border bg-muted p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full ${summary?.status === "configured" ? "bg-success/10 text-success" : "bg-warning/10 text-warning-foreground"}`}>
            {!payload ? <Pulse className="size-5" weight="bold" /> : summary?.status === "configured" ? <CheckCircle className="size-5" weight="fill" /> : <WarningCircle className="size-5" weight="fill" />}
          </div>
          <div className="min-w-0 space-y-2">
            <h2 className="font-display text-heading text-foreground">
              {summary?.title || "Checking configuration..."}
            </h2>
            <p className="text-sm text-muted-foreground">
              {payload?.generatedAt && !unavailable
                ? `Last checked ${new Date(payload.generatedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}.`
                : unavailable ? "The latest check is unavailable." : null}
            </p>
            {summary?.message ? <p className="text-base text-muted-foreground">{summary.message}</p> : null}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {unavailable ? (
            <Button type="button" variant="primary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          ) : null}
          <Button asChild variant="secondary">
              <Link href="/help">
                Get help
              </Link>
          </Button>
          <Button asChild variant="secondary">
              <Link href="/privacy">
                Privacy and data
              </Link>
          </Button>
          {isLaunchFlagEnabled("extensionSync") && (
            <Button asChild variant="secondary">
                <Link href="/extension">
                  Chrome extension
                </Link>
            </Button>
          )}
        </div>
      </section>

      <section className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 md:py-9">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle className="size-5 text-brand" weight="bold" />
          <h2 className="font-display text-heading text-foreground">Checks by feature</h2>
        </div>
        <div className="border-y border-line">
          {services.map((service) => (
            <div key={service.name} className="grid gap-3 border-b border-line py-5 last:border-b-0 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(0,1.3fr)] sm:items-start">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{service.name}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-medium leading-5 ${
                  service.status === "configured"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning-foreground"
                }`}>
                  {service.status === "configured" ? "Configured" : "Needs attention"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{service.message}</p>
            </div>
          ))}
          {services.length === 0 ? <p className="py-5 text-sm text-muted-foreground">{payload ? "We could not load the feature checks." : "Loading feature checks..."}</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-muted px-5 py-6 md:px-6">
        <div className="mb-4 flex items-center gap-2">
          <WarningCircle className="size-5 shrink-0 text-warning-foreground" weight="fill" />
          <h2 className="font-display text-heading text-foreground">What needs attention</h2>
        </div>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident} className="border-l-2 border-warning/40 pl-4">
              <p className="text-sm text-foreground/85">{incident}</p>
            </div>
          ))}
          {incidents.length === 0 ? <p className="text-sm text-muted-foreground">{!payload ? "Waiting for the checks to finish." : unavailable ? "We cannot tell which settings need attention until the check succeeds." : payload.ok ? "The required configuration checks passed." : null}</p> : null}
        </div>
      </section>

    </LegalShell>
  );
}
