"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  MagnifyingGlass,
  QuestionMark,
  SealCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/icons";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const palette = [
  { name: "Warm white", role: "Default field", className: "bg-paper text-foreground border-line" },
  { name: "Graphite", role: "Authority", className: "bg-foreground text-white border-foreground" },
  { name: "Iris", role: "Action and focus", className: "bg-iris text-white border-iris" },
  { name: "Pale sky", role: "Teaching", className: "bg-surface-sky text-foreground border-line" },
  { name: "Apricot", role: "Needs context", className: "bg-accent-apricot text-foreground border-accent-apricot" },
  { name: "Butter", role: "Evidence present", className: "bg-accent-butter text-foreground border-accent-butter" },
];

const evidenceCues = [
  {
    label: "Caught attention",
    title: "The action reads quickly.",
    body: "The recruiter can see what this person actually owned.",
    icon: Eye,
    tone: "text-brand",
  },
  {
    label: "Needs context",
    title: "The result is missing its scale.",
    body: "Add the team size, volume, budget, or decision rights that make the work legible.",
    icon: QuestionMark,
    tone: "text-foreground",
  },
  {
    label: "Evidence present",
    title: "There is proof behind the claim.",
    body: "A concrete result makes the line credible without making it louder.",
    icon: SealCheck,
    tone: "text-foreground",
  },
  {
    label: "Strongest next wording",
    title: "Lift the proof into the sentence.",
    body: "Nothing new is invented. The useful part becomes easier to find.",
    icon: Sparkle,
    tone: "text-brand-strong",
  },
];

const liftedTraceReference = [
  { label: "On the page", detail: "The exact words being reviewed" },
  { label: "Open question", detail: "The context a reader still needs" },
  { label: "Your fact", detail: "A detail only the candidate can supply" },
  { label: "Clearer wording", detail: "The same work, easier to understand" },
];

export default function SystemLab() {
  return (
    <div className="min-h-screen bg-paper text-foreground">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex min-h-16 w-full max-w-[82rem] items-center justify-between gap-6 px-5 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Wordmark className="text-[1.05rem]" />
            <span className="hidden h-5 w-px bg-line sm:block" />
            <span className="hidden text-xs font-semibold text-muted-foreground sm:block">Lifted Line 1.1</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-xs font-semibold text-brand sm:flex">
              <Check weight="bold" className="size-3.5" /> Canonical
            </span>
            <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-line underline-offset-4 hover:decoration-brand" href="/">
              View product <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[82rem] px-5 py-12 md:px-8 md:py-20">
        <section className="grid gap-10 border-b border-line pb-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Production reference</p>
            <h1 className="mt-5 max-w-[11ch] text-balance font-display text-[clamp(3.6rem,8vw,7.8rem)] font-normal leading-[0.88] tracking-[-0.055em]">
              Good work, made easier to see.
            </h1>
          </div>
          <div className="border-t border-line pt-5">
            <p className="max-w-[38rem] text-lg leading-8 text-muted-foreground">
              Lifted Line is the shared visual and verbal system for marketing, Research, reports, and the product itself. The transformation is the brand: reveal the proof without inflating the person.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="brand" size="lg">Run free report <ArrowRight weight="bold" className="size-4" /></Button>
              <Button variant="outline" size="lg">See sample</Button>
            </div>
          </div>
        </section>

        <Section eyebrow="01 / Foundations" title="One palette. Two voices.">
          <div className="grid overflow-hidden border border-line sm:grid-cols-2 lg:grid-cols-3">
            {palette.map((color) => (
              <div key={color.name} className={`min-h-40 border-b border-r p-5 last:border-b-0 ${color.className}`}>
                <p className="font-display text-3xl tracking-[-0.025em]">{color.name}</p>
                <p className="mt-10 text-xs font-bold uppercase tracking-[0.1em] opacity-70">{color.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid border-y border-line lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-line py-8 lg:border-b-0 lg:border-r lg:pr-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">Space Grotesk / product voice</p>
              <p className="mt-6 max-w-[13ch] font-display text-5xl font-normal leading-[0.98] tracking-[-0.04em] md:text-7xl">
                You did the work. Let&apos;s make sure they see it.
              </p>
            </div>
            <div className="py-8 lg:pl-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">Instrument Sans / product clarity</p>
              <p className="mt-6 max-w-[42rem] text-lg leading-8 text-muted-foreground">
                Use Instrument Sans for navigation, controls, explanation, source details, and dense product information. It should make the next action feel obvious.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Input aria-label="Default field example" placeholder="Job title or company" />
                <Input aria-label="Error field example" placeholder="Email address" error />
              </div>
            </div>
          </div>
        </Section>

        <Section eyebrow="02 / Evidence grammar" title="Color follows meaning.">
          <div className="grid border-t border-line lg:grid-cols-2">
            {evidenceCues.map(({ label, title, body, icon: Icon, tone }, index) => (
              <article key={label} className={`border-b border-line py-8 lg:px-8 ${index % 2 === 0 ? "lg:border-r lg:pl-0" : "lg:pr-0"}`}>
                <div className={`flex items-center gap-3 ${tone}`}>
                  <span className="flex size-9 items-center justify-center rounded-full border border-current">
                    <Icon weight="bold" className="size-4" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.11em]">{label}</p>
                </div>
                <h3 className="mt-6 max-w-[18ch] font-display text-4xl font-normal leading-tight tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 max-w-[33rem] leading-7 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="03 / The lifted line" title="The product idea in one move.">
          <div className="grid border border-line lg:grid-cols-2">
            <div className="border-b border-line p-7 lg:border-b-0 lg:border-r lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Before</p>
              <p className="mt-12 max-w-[18ch] font-display text-4xl leading-[1.08] tracking-[-0.03em] text-muted-foreground md:text-5xl">
                Led strategic initiatives across multiple cross-functional teams.
              </p>
              <div className="mt-12 flex items-center gap-3 border-t border-line pt-5 text-sm text-muted-foreground">
                <MagnifyingGlass className="size-4" /> The scope and result are hard to find.
              </div>
            </div>
            <div className="bg-surface-sky p-7 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">After</p>
              <p className="mt-12 max-w-[19ch] font-display text-4xl leading-[1.08] tracking-[-0.03em] md:text-5xl">
                Cut onboarding time <span className="shadow-[inset_0_-0.14em_0_hsl(var(--brand-tint))]">32%</span> by aligning product, sales, and support.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-5 text-xs font-semibold">
                <span>Owned action</span><span>Specific proof</span><span>Business result</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-y border-line bg-proof px-5 py-7 md:px-8">
            <div className="mb-7 grid gap-3 md:grid-cols-[12rem_1fr] md:items-baseline">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">Signature behavior</p>
              <p className="max-w-[44rem] text-sm leading-6 text-muted-foreground">The trace carries a claim from the page to the missing fact and the wording that resolves it. Segments lift only when the state is real.</p>
            </div>
            <LiftedTrace
              items={liftedTraceReference}
              progress={82}
              ariaLabel="Reference state for the Lifted Trace provenance system"
            />
          </div>
        </Section>

        <Section eyebrow="04 / Cross-surface contract" title="Same brand. Different density.">
          <div className="grid border-y border-line md:grid-cols-2 lg:grid-cols-4">
            <Surface name="Homepage" copy="One memorable transformation and one dominant action." />
            <Surface name="Research" copy="Concrete claims, useful visuals, visible sources, honest limits." />
            <Surface name="Report" copy="Likely takeaway, exact evidence, and the next useful edit." />
            <Surface name="Workspace" copy="Calm orientation, clear states, and no mystery about what happens next." />
          </div>
        </Section>

        <Section eyebrow="05 / Interaction contract" title="Quiet controls. Generous targets.">
          <div className="grid border-y border-line lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-line py-8 lg:border-b-0 lg:border-r lg:pr-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">Minimum target</p>
              <p className="mt-4 font-display text-6xl tracking-[-0.04em]">44px</p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Buttons, icon controls, report tabs, and mobile navigation keep a reliable touch target even when the visual treatment stays restrained.</p>
            </div>
            <div className="py-8 lg:pl-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">Reference controls</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button variant="brand">Primary action</Button>
                <Button variant="outline">Secondary action</Button>
                <Button variant="ghost" size="sm">Quiet action</Button>
              </div>
              <p className="mt-7 max-w-xl text-sm leading-6 text-muted-foreground">On small screens, wide data tables become labeled disclosure rows. Auth and purchase entry points use real forms, visible focus, and browser-supported autocomplete.</p>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-16 md:py-24">
      <div className="mb-10 grid gap-5 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
        <h2 className="max-w-[13ch] text-balance font-display text-5xl font-normal leading-[0.95] tracking-[-0.04em] md:text-7xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Surface({ name, copy }: { name: string; copy: string }) {
  return (
    <article className="border-b border-line py-7 md:px-6 md:odd:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
      <p className="font-display text-3xl tracking-[-0.025em]">{name}</p>
      <p className="mt-4 max-w-[17rem] text-sm leading-6 text-muted-foreground">{copy}</p>
    </article>
  );
}
