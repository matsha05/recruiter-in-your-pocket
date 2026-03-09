"use client";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Chrome,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";
import { extensionStoreContent } from "@/lib/extension/storeContent";
import { extensionDisclosureMessage } from "@/lib/trust/messages";

const popupJobs = [
  {
    company: "Notion",
    role: "Senior Product Designer",
    source: "LinkedIn",
    sync: "Synced to RIYP",
    score: "84 match",
  },
  {
    company: "Ramp",
    role: "Product Marketing Manager",
    source: "Indeed",
    sync: "Saved locally",
    score: "Strong rewrite candidate",
  },
];

const screenshotCards = [
  {
    id: "popup-jobs",
    title: "Saved jobs, one obvious next step",
    eyebrow: "Popup view",
    scene: <PopupJobsScene />,
  },
  {
    id: "popup-auth",
    title: "Secure sign-in only when sync matters",
    eyebrow: "Popup auth",
    scene: <PopupAuthScene />,
  },
  {
    id: "workspace-return",
    title: "Saved role back in the studio",
    eyebrow: "Studio handoff",
    scene: <WorkspaceReturnScene />,
  },
  {
    id: "install-disclosure",
    title: "Install with honest disclosure in-path",
    eyebrow: "Install page",
    scene: <InstallDisclosureScene />,
  },
  {
    id: "capture-context",
    title: "Capture on the supported page in context",
    eyebrow: "Capture flow",
    scene: <CaptureContextScene />,
  },
];

export default function ChromeWebStoreAssetStudio() {
  return (
    <main className="min-h-screen bg-[#f6f0e7] px-10 py-10 text-slate-900">
      <div className="mx-auto max-w-[1560px]">
        <header className="rounded-[32px] border border-black/8 bg-white/90 px-8 py-7 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.35)]">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[720px]">
              <div className="flex items-center gap-3">
                <PocketMark className="h-7 w-7 text-brand" />
                <span className="rounded-full border border-brand/15 bg-brand/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
                  Chrome Web Store assets
                </span>
              </div>
              <h1 className="mt-5 font-display text-5xl tracking-[-0.05em] text-slate-900">
                Launch-ready screenshots with the real RIYP story.
              </h1>
              <p className="mt-4 max-w-[64ch] text-base leading-8 text-slate-600">
                Every frame keeps the same promise: capture a supported job when it matters,
                understand what sync unlocks, and return to the studio only when you want the
                full recruiter-grade review.
              </p>
            </div>
            <div className="w-[320px] rounded-[28px] border border-black/8 bg-[#faf6f1] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Export checklist
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>5 screenshots at 1280×800</li>
                <li>1 promo tile at 440×280</li>
                <li>Honest captions pulled from source-of-truth copy</li>
                <li>Editorial look that matches the website and popup</li>
              </ul>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-8">
          {screenshotCards.map((card) => (
            <article key={card.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {card.title}
                  </h2>
                </div>
                <div className="max-w-[460px] rounded-full border border-black/8 bg-white/75 px-4 py-2 text-right text-sm text-slate-500">
                  {
                    extensionStoreContent.screenshots.find((shot) => shot.id === card.id)
                      ?.caption
                  }
                </div>
              </div>
              {card.scene}
            </article>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Promo tile
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Product-real, not ad-like
            </h2>
          </div>
          <PromoTileScene />
        </section>
      </div>
    </main>
  );
}

function AssetFrame({
  assetId,
  className,
  children,
}: {
  assetId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-store-asset={assetId}
      className={`relative overflow-hidden rounded-[36px] border border-black/8 bg-[#f6f0e7] shadow-[0_40px_120px_-80px_rgba(15,23,42,0.4)] ${className || ""}`}
    >
      {children}
    </div>
  );
}

function StudioHeader({ pill }: { pill: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/6 px-8 py-5">
      <div className="flex items-center gap-3">
        <PocketMark className="h-7 w-7 text-brand" />
        <Wordmark className="h-4 text-slate-900" />
      </div>
      <span className="rounded-full border border-brand/12 bg-brand/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
        {pill}
      </span>
    </div>
  );
}

function BrowserChrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-black/6 px-5 py-3 text-sm text-slate-500">
      <div className="flex gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#f59f9f]" />
        <span className="h-3 w-3 rounded-full bg-[#f4cf7f]" />
        <span className="h-3 w-3 rounded-full bg-[#94d3a2]" />
      </div>
      <div className="flex-1 rounded-full border border-black/8 bg-white/85 px-4 py-2 text-xs text-slate-400">
        {label}
      </div>
    </div>
  );
}

function PopupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[364px] rounded-[30px] border border-black/8 bg-[#fbf8f3] shadow-[0_26px_100px_-70px_rgba(15,23,42,0.55)]">
      <div className="border-b border-black/6 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PocketMark className="h-6 w-6 text-brand" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Recruiter in Your Pocket</div>
              <div className="text-xs text-slate-500">Chrome extension</div>
            </div>
          </div>
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
            Supported sites
          </span>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function PopupJobsScene() {
  return (
    <AssetFrame assetId="popup-jobs" className="h-[800px] w-[1280px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(38,166,154,0.14),_transparent_36%),linear-gradient(180deg,#faf6f1_0%,#f3ece2_100%)]" />
      <div className="relative flex h-full">
        <div className="flex w-[56%] flex-col justify-between px-10 py-10">
          <div className="max-w-[540px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Screenshot 1
            </p>
            <h3 className="mt-4 font-display text-5xl tracking-[-0.05em] text-slate-900">
              Save the job, then choose the next step with confidence.
            </h3>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The popup stays simple: captured roles, sync visibility, and one clear path back to
              the studio when you want the deeper pass.
            </p>
          </div>

          <div className="grid max-w-[560px] gap-4">
            <InfoStrip
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Sync stays explicit"
              body="Saved-job history follows your account only after sign-in."
            />
            <InfoStrip
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Purpose-bound capture"
              body="Capture is initiated from supported LinkedIn and Indeed job pages."
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center pr-10">
          <PopupShell>
            <div className="rounded-[22px] border border-black/6 bg-white px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Saved jobs
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">2 roles in view</div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Sync ready
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {popupJobs.map((job) => (
                  <div
                    key={`${job.company}-${job.role}`}
                    className="rounded-2xl border border-slate-100 bg-[#fbfaf7] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{job.role}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {job.company} · {job.source}
                        </div>
                      </div>
                      <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                        {job.score}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{job.sync}</span>
                      <span>Saved 4m ago</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_38px_-22px_rgba(15,23,42,0.5)]">
                Open saved jobs in studio
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </PopupShell>
        </div>
      </div>
    </AssetFrame>
  );
}

function PopupAuthScene() {
  return (
    <AssetFrame assetId="popup-auth" className="h-[800px] w-[1280px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(38,166,154,0.16),_transparent_38%),linear-gradient(180deg,#f7f0e6_0%,#f3ece2_100%)]" />
      <div className="relative flex h-full">
        <div className="flex w-[52%] flex-col justify-between px-10 py-10">
          <div className="max-w-[520px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Screenshot 2
            </p>
            <h3 className="mt-4 font-display text-5xl tracking-[-0.05em] text-slate-900">
              Sign in only if you want saved jobs across devices.
            </h3>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The popup stays honest about what sign-in unlocks, what still works locally, and
              why the account matters.
            </p>
          </div>

          <div className="grid max-w-[540px] gap-4">
            <InfoStrip
              icon={<Lock className="h-4 w-4" />}
              title="Secure sign-in"
              body="Passwordless auth keeps extension and web flows aligned."
            />
            <InfoStrip
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              title="Local use first"
              body="You can still capture supported roles without committing to sync."
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center pr-10">
          <PopupShell>
            <div className="rounded-[22px] border border-black/6 bg-white px-5 py-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-center text-xl font-semibold text-slate-900">
                Sign in for synced saved jobs
              </h4>
              <p className="mt-3 text-center text-sm leading-6 text-slate-600">
                Keep saved roles across devices, reopen them in the studio, and attach extension
                history to the right account.
              </p>
              <div className="mt-5 rounded-2xl border border-slate-100 bg-[#fbfaf7] px-4 py-4 text-sm leading-6 text-slate-600">
                You can still use the extension locally. Sign-in is only required for synced
                history and personalized context.
              </div>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_38px_-22px_rgba(15,23,42,0.5)]">
                Open secure sign-in
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Open in browser instead
              </button>
            </div>
          </PopupShell>
        </div>
      </div>
    </AssetFrame>
  );
}

function WorkspaceReturnScene() {
  return (
    <AssetFrame assetId="workspace-return" className="h-[800px] w-[1280px]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f6f0e7_0%,#f9f6f1_60%,#f3ece2_100%)]" />
      <div className="relative flex h-full flex-col">
        <StudioHeader pill="Saved job reopened" />
        <div className="grid flex-1 grid-cols-[320px_1fr] gap-8 px-8 py-8">
          <aside className="rounded-[28px] border border-black/8 bg-white/90 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.34)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Saved role
            </p>
            <h4 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Senior Product Designer
            </h4>
            <p className="mt-2 text-sm text-slate-500">Notion · LinkedIn capture</p>
            <div className="mt-6 space-y-3">
              <MetricCard label="First impression" value="Strong strategic framing" />
              <MetricCard label="Resume match" value="84 / 100" />
              <MetricCard label="Best next move" value="Refine leadership bullets" />
            </div>
            <button className="mt-6 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm font-medium text-slate-700">
              Return to saved jobs
            </button>
          </aside>

          <section className="rounded-[30px] border border-black/8 bg-white/94 p-8 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.34)]">
            <div className="flex items-start justify-between gap-6 border-b border-black/6 pb-6">
              <div className="max-w-[600px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Recruiter-grade review
                </p>
                <h3 className="mt-3 font-display text-[2.7rem] tracking-[-0.05em] text-slate-900">
                  Studio handoff keeps the job context intact.
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Saved jobs do not stop at capture. The studio carries the role back into a
                  deeper review with clearer suggestions, stronger bullets, and export-ready next
                  steps.
                </p>
              </div>
              <div className="rounded-[26px] border border-brand/15 bg-brand/8 px-6 py-5 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                  Match signal
                </div>
                <div className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
                  84
                </div>
                <div className="mt-2 text-sm text-slate-500">strong fit with rewrite upside</div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <ReportCard
                title="What reads strongly"
                body="Leadership, systems thinking, and product-shaping language show up fast."
              />
              <ReportCard
                title="What gets lost"
                body="The strongest outcomes sit too low, so the six-second read underweights scope."
              />
              <ReportCard
                title="Rewrite direction"
                body="Lead with shipped outcomes, clarify team span, and tighten the top three bullets."
              />
              <ReportCard
                title="Next step"
                body="Export the updated version, then compare against similar design leadership roles."
              />
            </div>
          </section>
        </div>
      </div>
    </AssetFrame>
  );
}

function InstallDisclosureScene() {
  return (
    <AssetFrame assetId="install-disclosure" className="h-[800px] w-[1280px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(38,166,154,0.14),_transparent_34%),linear-gradient(180deg,#f9f4ed_0%,#f6f0e7_100%)]" />
      <div className="relative flex h-full flex-col">
        <StudioHeader pill="Website install flow" />
        <div className="grid flex-1 grid-cols-[1.02fr_0.98fr] gap-8 px-8 py-8">
          <section className="rounded-[30px] border border-black/8 bg-white/94 p-8 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.34)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Chrome extension
            </p>
            <h3 className="mt-3 font-display text-[3rem] tracking-[-0.05em] text-slate-900">
              Save the job while it’s in front of you.
            </h3>
            <p className="mt-4 max-w-[60ch] text-base leading-8 text-slate-600">
              Capture supported LinkedIn and Indeed roles, keep your saved jobs in view, and jump
              into the studio when you want the full recruiter-grade review.
            </p>

            <div className="mt-6 rounded-[24px] border border-black/8 bg-[#fbfaf7] p-5">
              <p className="text-sm leading-7 text-slate-700">
                {extensionStoreContent.page.disclosure}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {extensionDisclosureMessage}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_38px_-22px_rgba(15,23,42,0.5)]">
                <Chrome className="h-4 w-4" />
                Install on Chrome
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
                Review privacy and data handling
              </button>
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[28px] border border-black/8 bg-white/94 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.34)]">
              <div className="flex items-center justify-between border-b border-black/6 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    One obvious next step
                  </p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    Supported sites only
                  </h4>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Purpose-bound
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {extensionStoreContent.page.highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#fbfaf7] px-4 py-4"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {extensionStoreContent.page.trustPoints.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-black/8 bg-white/94 px-5 py-4 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.34)]"
                >
                  {index === 0 ? (
                    <Chrome className="h-4 w-4 text-brand" />
                  ) : index === 1 ? (
                    <Lock className="h-4 w-4 text-brand" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-brand" />
                  )}
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AssetFrame>
  );
}

function CaptureContextScene() {
  return (
    <AssetFrame assetId="capture-context" className="h-[800px] w-[1280px]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f2ea_0%,#f1eadf_100%)]" />
      <div className="relative flex h-full flex-col">
        <BrowserChrome label="www.linkedin.com/jobs/view/riyp-product-designer" />
        <div className="grid flex-1 grid-cols-[1.08fr_0.92fr] gap-8 px-8 py-8">
          <section className="rounded-[30px] border border-black/8 bg-white/94 p-8 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.34)]">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                LinkedIn role
              </span>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                Supported page
              </span>
            </div>
            <h3 className="mt-5 font-display text-[2.8rem] tracking-[-0.05em] text-slate-900">
              Staff Product Designer
            </h3>
            <p className="mt-2 text-base text-slate-500">Linear · Remote · Full-time</p>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <ReportCard
                title="Role signal"
                body="Design systems leadership, product craft, and strong cross-functional ownership."
              />
              <ReportCard
                title="Why capture now"
                body="This role is worth reopening in the studio while the context is still fresh."
              />
            </div>

            <div className="mt-7 rounded-[24px] border border-black/8 bg-[#fbfaf7] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Purpose-bound access
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The extension reads supported job pages only when needed for user-initiated job
                capture. No hidden scraping, no all-sites access, and no automatic save behavior.
              </p>
            </div>
          </section>

          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[40px] bg-brand/10 blur-3xl" />
              <PopupShell>
                <div className="rounded-[22px] border border-black/6 bg-white px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Target className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Capture this role
                      </div>
                      <div className="text-xs text-slate-500">Supported LinkedIn page</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-[#fbfaf7] px-4 py-4 text-sm leading-6 text-slate-600">
                    Save this posting while it matters, then reopen it later for match context and
                    the full recruiter-grade review.
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_38px_-22px_rgba(15,23,42,0.5)]">
                    Save this job
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                    Open studio for deeper review
                  </button>
                </div>
              </PopupShell>
            </div>
          </div>
        </div>
      </div>
    </AssetFrame>
  );
}

function PromoTileScene() {
  return (
    <AssetFrame assetId="promo-tile" className="h-[280px] w-[440px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(38,166,154,0.16),_transparent_38%),linear-gradient(180deg,#fbf7f2_0%,#f2eade_100%)]" />
      <div className="relative flex h-full flex-col justify-between p-7">
        <div className="flex items-center gap-3">
          <PocketMark className="h-8 w-8 text-brand" />
          <Wordmark className="h-5 text-slate-900" />
        </div>
        <div>
          <h3 className="max-w-[240px] font-display text-[2.2rem] leading-[0.95] tracking-[-0.05em] text-slate-900">
            Save the job before it disappears.
          </h3>
          <p className="mt-3 max-w-[290px] text-sm leading-6 text-slate-600">
            Capture supported LinkedIn and Indeed roles, then reopen them in the studio for the
            recruiter-grade pass.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
            Chrome extension
          </span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </AssetFrame>
  );
}

function InfoStrip({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[24px] border border-black/8 bg-white/85 px-5 py-4 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.34)]">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#fbfaf7] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function ReportCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-[#fbfaf7] px-5 py-5">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
