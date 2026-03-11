"use client";

import Link from "next/link";
import { ArrowRight, Check, Chrome, Lock, ShieldCheck } from "lucide-react";
import Footer from "@/components/landing/Footer";
import {
  extensionStoreContent,
  getChromeWebStoreUrl,
} from "@/lib/extension/storeContent";
import { extensionDisclosureMessage } from "@/lib/trust/messages";

const storeUrl = getChromeWebStoreUrl();

const trustIcons = [Chrome, ShieldCheck, Lock] as const;
const browserDots = [
  "hsl(12 65% 62%)",
  "hsl(42 72% 63%)",
  "hsl(145 34% 52%)",
] as const;
const flowSteps = [
  {
    number: "01",
    title: "Save the role while you're looking at it",
    copy:
      "Use the popup on a supported LinkedIn or Indeed page and keep the job without opening a second workflow.",
  },
  {
    number: "02",
    title: "Keep the important context close",
    copy:
      "The extension gives you enough context to triage quickly, then gets out of the way while you compare roles.",
  },
  {
    number: "03",
    title: "Open the full workspace when it matters",
    copy:
      "Come back for the full report, rewrites, and deeper fit work only when you actually need them.",
  },
] as const;

export default function ExtensionPageClient() {
  const installReady = Boolean(storeUrl);
  const ctaHref = installReady ? storeUrl : extensionStoreContent.privacyHref;
  const primaryCtaLabel = installReady
    ? extensionStoreContent.page.primaryCta
    : "Read privacy";
  const secondaryCtaLabel = installReady
    ? extensionStoreContent.page.fallbackCta
    : "Read security";
  const secondaryCtaHref = installReady ? extensionStoreContent.privacyHref : "/security";

  return (
    <>
      <main
        data-visual-anchor="extension-page"
        className="bg-paper pt-28 text-slate-900 selection:bg-brand/15 md:pt-36"
      >
        <section className="px-6 pb-14 md:px-8 md:pb-16">
          <div className="mx-auto grid max-w-[var(--page-max)] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <p className="editorial-kicker text-slate-400">
                {extensionStoreContent.page.eyebrow}
              </p>
              <h1
                className="font-display text-slate-900"
                style={{
                  fontSize: "clamp(2.9rem, 7vw, 5.4rem)",
                  lineHeight: 0.97,
                  letterSpacing: "-0.045em",
                  fontWeight: 400,
                }}
              >
                {extensionStoreContent.page.title}
              </h1>
              <p
                className="max-w-[35rem] leading-8 text-slate-500"
                style={{ fontSize: "clamp(1.05rem, 2vw, 1.125rem)" }}
              >
                {extensionStoreContent.page.description}
              </p>

              <div
                className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-400"
                style={{ fontSize: "13px" }}
              >
                {["Supported LinkedIn pages", "Supported Indeed pages", "Sync only if you want it"].map(
                  (item, index) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: browserDots[index] ?? "hsl(var(--brand))" }}
                      />
                      {item}
                    </span>
                  ),
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={ctaHref}
                  target={installReady ? "_blank" : undefined}
                  rel={installReady ? "noopener noreferrer" : undefined}
                  className="landing-btn-primary"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={secondaryCtaHref} className="landing-btn-secondary">
                  {secondaryCtaLabel}
                </Link>
              </div>

              <div className="max-w-[37rem] space-y-3 border-t border-slate-200/80 pt-4">
                <p className="text-sm leading-6 text-slate-600">
                  {extensionStoreContent.page.disclosure}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                  <Link href="/privacy" className="transition-colors hover:text-slate-600">
                    Privacy
                  </Link>
                  <Link href="/security" className="transition-colors hover:text-slate-600">
                    Security
                  </Link>
                  <Link href="/trust" className="transition-colors hover:text-slate-600">
                    Trust
                  </Link>
                  <Link href="/jobs" className="transition-colors hover:text-slate-600">
                    Saved jobs
                  </Link>
                </div>
              </div>

              {!installReady ? (
                <p className="text-sm text-slate-500">
                  The Chrome Web Store link is not wired up yet, so this page currently routes
                  people to the privacy docs first.
                </p>
              ) : null}
            </div>

            <div
              className="border border-slate-200 bg-white/95 p-4 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.42)] md:p-5"
              style={{ borderRadius: "32px" }}
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <p className="editorial-kicker text-slate-400">Extension preview</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Built to save the role fast, then get out of the way.
                  </p>
                </div>
                <span className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 font-medium text-brand" style={{ fontSize: "11px" }}>
                  LinkedIn + Indeed
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
                <div className="bg-paper border border-slate-200 p-4 md:p-5" style={{ borderRadius: "28px" }}>
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        {browserDots.map((color) => (
                          <span
                            key={color}
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span
                        className="font-medium uppercase text-slate-400"
                        style={{ fontSize: "11px", letterSpacing: "0.18em" }}
                      >
                        Supported job page
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Job saved locally first</span>
                  </div>

                  <div className="mt-5 border border-slate-200 bg-white p-4 md:p-5" style={{ borderRadius: "22px" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className="font-semibold uppercase text-slate-400"
                          style={{ fontSize: "11px", letterSpacing: "0.18em" }}
                        >
                          Example role
                        </p>
                        <h2
                          className="mt-2 font-display tracking-tight text-slate-900"
                          style={{ fontSize: "1.8rem", lineHeight: 1.02 }}
                        >
                          Senior Product Designer
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                          Mercury · San Francisco · Hybrid
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white" style={{ fontSize: "11px" }}>
                        Saveable
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {["B2B product", "Systems thinking", "0-1 design"].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="h-2.5 w-[88%] rounded-full bg-slate-200" />
                      <div className="h-2.5 w-full rounded-full bg-slate-100" />
                      <div className="h-2.5 w-[92%] rounded-full bg-slate-100" />
                      <div className="h-2.5 w-[74%] rounded-full bg-slate-100" />
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-200/80 pt-4">
                      <div>
                        <p className="text-xs font-medium text-slate-700">Save this role and keep moving.</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Compare it later in the full workspace.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                        Save job
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-slate-900 p-5 text-white shadow-[0_22px_44px_-30px_rgba(15,23,42,0.55)] lg:-ml-10 lg:mt-10"
                  style={{ borderRadius: "26px" }}
                >
                  <p
                    className="font-semibold uppercase text-white/45"
                    style={{ fontSize: "11px", letterSpacing: "0.18em" }}
                  >
                    RIYP popup
                  </p>
                  <h3 className="mt-2 font-display leading-none tracking-tight" style={{ fontSize: "2.1rem" }}>
                    Saved.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    Enough context to triage the role now. The deeper report can wait until it matters.
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {extensionStoreContent.page.highlights.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2.5 border-t border-white/10 pt-2.5 text-sm text-white/80 first:border-t-0 first:pt-0"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs font-medium text-white/85">Open the full report when you need the real work.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-slate-200/80 pt-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Chrome className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Only on supported job pages</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      No always-on browser clutter.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Nothing happens in the background</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      You choose when a role gets captured.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Sign in only if you want sync</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      The local flow works on its own.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/80 pt-4">
                <p className="text-sm leading-6 text-slate-600">
                  {extensionDisclosureMessage}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 px-6 py-14 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-[var(--page-max)] gap-12 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="space-y-4">
              <p className="editorial-kicker text-slate-400">How it works</p>
              <h2
                className="font-display tracking-tight text-slate-900"
                style={{ fontSize: "clamp(2.2rem, 4.2vw, 2.8rem)", lineHeight: 1.02 }}
              >
                Save it fast. Decide later.
              </h2>
              <p className="max-w-[24rem] text-base leading-8 text-slate-500">
                The extension should feel like a quiet handoff, not a second product with a second
                learning curve.
              </p>
            </div>

            <div className="border-t border-slate-200/80">
              {flowSteps.map((step) => (
                <div
                  key={step.number}
                  className="grid gap-4 border-b border-slate-200/80 py-6 md:grid-cols-[72px_1fr]"
                >
                  <div className="font-semibold uppercase text-slate-300" style={{ fontSize: "11px", letterSpacing: "0.2em" }}>
                    {step.number}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium tracking-tight text-slate-900">
                      {step.title}
                    </h3>
                    <p
                      className="max-w-[40rem] leading-7 text-slate-500"
                      style={{ fontSize: "clamp(0.875rem, 1.8vw, 0.9375rem)" }}
                    >
                      {step.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 px-6 py-12 md:px-8 md:py-14">
          <div className="mx-auto grid max-w-[var(--page-max)] gap-10 lg:grid-cols-[0.58fr_0.42fr]">
            <div className="space-y-4">
              <p className="editorial-kicker text-slate-400">Trust</p>
              <h2
                className="font-display tracking-tight text-slate-900"
                style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", lineHeight: 1.03 }}
              >
                Clear about what it can access.
              </h2>
              <p className="max-w-[39rem] text-base leading-8 text-slate-500">
                The extension does one narrow job well. The boundaries should feel obvious before
                anyone installs it.
              </p>
            </div>

            <div className="space-y-5">
              {extensionStoreContent.page.trustPoints.map((item, index) => {
                const Icon = trustIcons[index] ?? ShieldCheck;
                return (
                  <div key={item} className="flex items-start gap-3 border-t border-slate-200/80 pt-4 first:border-t-0 first:pt-0">
                    <Icon className="mt-1 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {index === 0
                          ? "It only works on supported job pages, not everywhere you browse."
                          : index === 1
                            ? "Nothing is pulled in the background. You have to ask it to capture a role."
                            : "You can use the capture flow locally. Sign in only if you want history across devices."}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-slate-200/80 pt-4 text-sm leading-6 text-slate-500">
                <span className="text-slate-700">Need the details?</span> Privacy, security, and
                support links stay visible from install through use.
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
