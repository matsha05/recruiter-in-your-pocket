"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Browser,
  Check,
  LockKey,
  ShieldCheck,
} from "@phosphor-icons/react";
import Footer from "@/components/landing/Footer";
import {
  extensionStoreContent,
  getChromeWebStoreUrl,
} from "@/lib/extension/storeContent";
import { extensionDisclosureMessage } from "@/lib/trust/messages";

const storeUrl = getChromeWebStoreUrl();

const flowSteps = [
  {
    number: "01",
    title: "Save a job while you browse",
    copy: "Choose Save job on a supported LinkedIn or Indeed page. RIYP reads the posting when you ask it to.",
  },
  {
    number: "02",
    title: "Return to the details later",
    copy: "The saved job includes the company, title, link, and posting text. You can look through your saved jobs from the extension.",
  },
  {
    number: "03",
    title: "Check your resume against the job",
    copy: "Open a saved job in your workspace to get a resume report for that role. The job description is already there.",
  },
] as const;

const trustPoints = [
  {
    icon: Browser,
    title: "Limited to supported job pages",
    copy: "The extension does not ask for access to every site you visit.",
  },
  {
    icon: ShieldCheck,
    title: "You choose what to save",
    copy: "There is no hidden scraping, automatic saving, or background job collection.",
  },
  {
    icon: LockKey,
    title: "Account sync is optional",
    copy: "Sign in before saving to sync jobs to your account. Jobs saved while signed out stay in this browser.",
  },
] as const;

export default function ExtensionPageClient() {
  const installReady = Boolean(storeUrl);
  const primaryHref = installReady ? storeUrl : "#preview";
  const primaryLabel = installReady
    ? extensionStoreContent.page.primaryCta
    : "See how it works";

  return (
    <>
      <div
        data-visual-anchor="extension-page"
        className="bg-paper pt-28 text-foreground selection:bg-brand/15 md:pt-36"
      >
        <section className="px-5 pb-16 md:px-8 md:pb-24">
          <div className="mx-auto grid max-w-[var(--page-max)] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div className="border-t border-line pt-6">
              <p className="editorial-kicker text-brand">
                {extensionStoreContent.page.eyebrow}
              </p>
              <h1 className="mt-7 max-w-[11ch] font-display text-[clamp(3.25rem,7.4vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.055em] riyp-stretch-91">
                Save a job. Come back to it later.
              </h1>
              <p className="mt-8 max-w-[34rem] text-lg leading-8 text-muted-foreground">
                Save a LinkedIn or Indeed job posting while you browse. Open it in
                RIYP when you want to check your resume against the role.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryHref}
                  target={installReady ? "_blank" : undefined}
                  rel={installReady ? "noopener noreferrer" : undefined}
                  className="landing-btn-primary"
                >
                  {primaryLabel}
                  <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                </Link>
                <Link href="/privacy" className="landing-btn-secondary">
                  Read the privacy policy
                </Link>
              </div>

              {!installReady ? (
                <p className="mt-5 max-w-[34rem] text-sm leading-6 text-muted-foreground">
                  The extension is not available to install yet. You can see how it
                  works below, or paste a job description into your workspace now.
                </p>
              ) : null}
            </div>

            <figure id="preview" className="border border-line bg-background p-2 md:p-3">
              <Image
                src="/assets/chrome-web-store/capture-context.png"
                alt="RIYP extension on a LinkedIn job page with a button for saving the job"
                width={1280}
                height={800}
                priority
                className="h-auto w-full"
              />
              <figcaption className="flex flex-col gap-2 border-t border-line px-3 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>Saving a job from LinkedIn</span>
                <span className="font-medium text-foreground">Saved only when you choose</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-foreground px-5 py-6 text-background md:px-8">
          <div className="mx-auto grid max-w-[var(--page-max)] gap-px bg-white/15 md:grid-cols-3">
            {extensionStoreContent.page.highlights.slice(0, 3).map((item) => (
              <div key={item} className="flex min-h-24 items-start gap-3 bg-foreground px-5 py-6 md:px-7">
                <Check className="mt-0.5 size-5 shrink-0 text-citron" weight="bold" aria-hidden="true" />
                <p className="text-sm font-medium leading-6 text-white/85">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-[var(--page-max)]">
            <div className="grid gap-10 border-t border-line pt-6 lg:grid-cols-[0.36fr_0.64fr]">
              <div>
                <p className="editorial-kicker text-brand">How it works</p>
                <h2 className="mt-6 max-w-[9ch] font-display text-[clamp(2.6rem,5vw,4.6rem)] font-semibold leading-[0.94] tracking-[-0.045em] riyp-stretch-91">
                  From job posting to resume report.
                </h2>
              </div>
              <div className="border-t border-line">
                {flowSteps.map((step) => (
                  <article key={step.number} className="grid gap-4 border-b border-line py-7 sm:grid-cols-[4rem_1fr] sm:gap-7">
                    <p className="font-mono text-xs font-semibold text-brand">{step.number}</p>
                    <div>
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">{step.title}</h3>
                      <p className="mt-3 max-w-[42rem] leading-7 text-muted-foreground">{step.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-16 grid gap-5 lg:grid-cols-2">
              <figure className="border border-line bg-background p-2">
                <Image
                  src="/assets/chrome-web-store/popup-jobs.png"
                  alt="RIYP extension saved-jobs view with two captured roles and explicit sync status"
                  width={1280}
                  height={800}
                  className="h-auto w-full"
                />
                <figcaption className="border-t border-line px-3 py-4 text-sm text-muted-foreground">
                  Browse saved jobs in the extension and remove any you no longer want.
                </figcaption>
              </figure>
              <figure className="border border-line bg-background p-2">
                <Image
                  src="/assets/chrome-web-store/workspace-return.png"
                  alt="A saved job open in the RIYP workspace with its job description and resume report options"
                  width={1280}
                  height={800}
                  className="h-auto w-full"
                />
                <figcaption className="border-t border-line px-3 py-4 text-sm text-muted-foreground">
                  Open a saved job in your workspace with the job description already filled in.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-paper-muted px-5 py-20 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-[var(--page-max)] gap-12 lg:grid-cols-[0.42fr_0.58fr]">
            <div>
              <p className="editorial-kicker text-brand">Permissions and privacy</p>
              <h2 className="mt-6 max-w-[11ch] font-display text-[clamp(2.5rem,4.8vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.045em] riyp-stretch-91">
                What the extension can read.
              </h2>
              <p className="mt-6 max-w-[34rem] text-base leading-8 text-muted-foreground">
                {extensionDisclosureMessage}
              </p>
            </div>
            <div className="border-t border-line">
              {trustPoints.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="grid gap-4 border-b border-line py-6 sm:grid-cols-[3rem_1fr] sm:gap-5">
                  <div className="flex size-11 items-center justify-center border border-cyan-bright/45 bg-surface-sky text-brand">
                    <Icon className="size-5" weight="bold" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                  </div>
                </article>
              ))}
              <div className="flex flex-wrap gap-x-5 gap-y-3 pt-6 text-sm font-medium">
                <Link href="/privacy" className="text-brand hover:text-brand-strong">Privacy</Link>
                <Link href="/security" className="text-brand hover:text-brand-strong">Security</Link>
                <Link href="/support" className="text-brand hover:text-brand-strong">Support</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
