"use client";

import Link from "next/link";
import { ArrowRight, Chrome, Lock, ShieldCheck, Wand2 } from "lucide-react";
import Footer from "@/components/landing/Footer";
import {
  extensionStoreContent,
  getChromeWebStoreUrl,
} from "@/lib/extension/storeContent";
import { extensionDisclosureMessage } from "@/lib/trust/messages";

const storeUrl = getChromeWebStoreUrl();

const trustIcons = [Chrome, ShieldCheck, Lock] as const;

export default function ExtensionPageClient() {
  const installReady = Boolean(storeUrl);
  const ctaHref = installReady ? storeUrl : extensionStoreContent.privacyHref;
  const primaryCtaLabel = installReady
    ? extensionStoreContent.page.primaryCta
    : "Review privacy and data handling";
  const secondaryCtaLabel = installReady
    ? extensionStoreContent.page.fallbackCta
    : "Read extension permissions";
  const secondaryCtaHref = "/security";

  return (
    <>
      <main
        data-visual-anchor="extension-page"
        className="bg-paper pt-28 text-slate-900 selection:bg-brand/15 md:pt-36"
      >
        <section className="px-6 pb-10 md:px-8 md:pb-14">
          <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-5">
              <p className="editorial-kicker text-slate-300">
                {extensionStoreContent.page.eyebrow}
              </p>
              <h1
                className="font-display text-slate-900"
                style={{
                  fontSize: "clamp(2.4rem, 6vw, 4rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.04em",
                  fontWeight: 400,
                }}
              >
                {extensionStoreContent.page.title}
              </h1>
              <p className="max-w-[38rem] text-base leading-8 text-slate-500 md:text-lg">
                {extensionStoreContent.page.description}
              </p>

              <div className="rounded-2xl border border-border/60 bg-white/95 p-5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.24)]">
                <p className="text-sm leading-6 text-slate-600">
                  {extensionStoreContent.page.disclosure}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {extensionDisclosureMessage}
                </p>
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

              {!installReady ? (
                <p className="text-sm text-slate-500">
                  The Chrome Web Store URL is not configured yet. This page is ready for the
                  live listing the moment the listing URL is available.
                </p>
              ) : null}
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_70px_-48px_rgba(15,23,42,0.35)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Popup promise
                    </p>
                    <h2 className="mt-2 font-display text-2xl tracking-tight text-slate-900">
                      One obvious next step
                    </h2>
                  </div>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                    Supported sites only
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {extensionStoreContent.page.highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                    >
                      <span className="mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand/12 text-[11px] font-semibold text-brand">
                        <Wand2 className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {extensionStoreContent.page.trustPoints.map((item, index) => {
                  const Icon = trustIcons[index] ?? ShieldCheck;
                  return (
                    <div
                      key={item}
                      className="rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.22)]"
                    >
                      <Icon className="h-4 w-4 text-brand" />
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.22)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Store listing source of truth
                </p>
                <div className="mt-4 space-y-3">
                  {extensionStoreContent.screenshots.map((shot) => (
                    <div key={shot.id} className="rounded-xl border border-slate-100 px-4 py-3">
                      <div className="text-sm font-medium text-slate-800">{shot.title}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{shot.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
