"use client";

import Link from "next/link";
import { useState } from "react";
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
  { name: "Canvas", role: "Warm page field", className: "bg-background text-foreground border-line" },
  { name: "Sheet", role: "Report and form surface", className: "bg-card text-foreground border-line" },
  { name: "Inset", role: "Contained evidence", className: "bg-secondary text-foreground border-line" },
  { name: "Ink", role: "Text and primary action", className: "bg-foreground text-background border-foreground" },
  { name: "Aqua", role: "Links, focus, selection", className: "bg-brand text-white border-brand" },
  { name: "Aqua surface", role: "Explanatory grouping", className: "bg-surface-sky text-foreground border-line" },
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
  const [selectedMode, setSelectedMode] = useState("upload");

  return (
    <div className="min-h-screen bg-paper text-foreground">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex min-h-16 w-full max-w-[1360px] items-center justify-between gap-6 px-5 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Wordmark className="text-[1.05rem]" />
            <span className="hidden h-5 w-px bg-line sm:block" />
            <span className="hidden text-xs font-semibold text-muted-foreground sm:block">Alpine 1.0 · product reference</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-xs font-semibold text-brand sm:flex">
              <Check weight="bold" className="size-3.5" /> Approved direction
            </span>
            <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-line underline-offset-4 hover:decoration-brand" href="/">
              View product <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1360px] px-5 py-12 md:px-8 md:py-20">
        <section className="grid gap-10 border-b border-line pb-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Shared product reference</p>
            <h1 className="mt-5 max-w-[14ch] text-balance font-display text-[clamp(2.5rem,5vw,3.5rem)] font-normal leading-[1.04] tracking-[-0.035em]">
              Good work, made easier to see.
            </h1>
          </div>
          <div className="border-t border-line pt-5">
            <p className="max-w-[38rem] text-lg leading-8 text-muted-foreground">
              Alpine gives marketing, Research, reports, and the workspace one shared visual system. Warm surfaces, regular titles, dark pill actions, and restrained aqua support different reading and task densities.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="brand" size="lg">Run free report <ArrowRight weight="bold" className="size-4" /></Button>
              <Button variant="outline" size="lg">See sample</Button>
            </div>
          </div>
        </section>

        <Section eyebrow="01 / Foundations" title="One palette. Shared typography.">
          <div className="grid overflow-hidden rounded-2xl border border-line sm:grid-cols-2 md:rounded-[24px] lg:grid-cols-3">
            {palette.map((color) => (
              <div key={color.name} className={`min-h-40 border-b border-r p-5 last:border-b-0 ${color.className}`}>
                <p className="font-display text-3xl tracking-[-0.025em]">{color.name}</p>
                <p className="mt-10 text-xs font-semibold uppercase tracking-[0.1em] opacity-70">{color.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid border-y border-line lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-line py-8 lg:border-b-0 lg:border-r lg:pr-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Instrument Sans / display</p>
              <p className="mt-6 max-w-[15ch] font-display text-[40px] font-normal leading-[44px] tracking-[-0.035em]">
                You did the work. Let&apos;s make sure they see it.
              </p>
            </div>
            <div className="py-8 lg:pl-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Instrument Sans / interface</p>
              <p className="mt-6 max-w-[42rem] text-base leading-[25px] text-muted-foreground">
                Instrument Sans uses 400 for display and body, and 600 for controls and labels. Reports use 16px/25px body text. Research uses 18px/30px prose. Source Serif 4 is reserved for selected short verdicts.
              </p>
              <p className="mt-6 font-[family-name:var(--font-editorial)] text-[28px] font-normal leading-[36px]">Your operations experience is clear.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="lab-default-field" className="text-sm font-semibold">Job title</label>
                  <Input id="lab-default-field" placeholder="Operations manager" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lab-error-field" className="text-sm font-semibold">Email address</label>
                  <Input id="lab-error-field" type="email" defaultValue="name@" error aria-describedby="lab-email-error" />
                  <p id="lab-email-error" className="text-sm text-destructive">Enter a complete email address.</p>
                </div>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.11em]">{label}</p>
                </div>
                <h3 className="mt-6 max-w-[18ch] font-display text-2xl font-medium leading-[30px] tracking-[-0.025em]">{title}</h3>
                <p className="mt-3 max-w-[33rem] leading-7 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="03 / The lifted line" title="The product idea in one move.">
          <div className="grid overflow-hidden rounded-2xl border border-line bg-card md:rounded-[24px] lg:grid-cols-2">
            <div className="border-b border-line p-7 lg:border-b-0 lg:border-r lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Illustrative example / before</p>
              <p className="mt-8 max-w-[42ch] text-base leading-[25px] text-muted-foreground">
                Led strategic initiatives across multiple cross-functional teams.
              </p>
              <div className="mt-12 flex items-center gap-3 border-t border-line pt-5 text-sm text-muted-foreground">
                <MagnifyingGlass className="size-4" /> The scope and result are hard to find.
              </div>
            </div>
            <div className="bg-surface-sky p-7 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-strong">With the candidate&apos;s facts / after</p>
              <p className="mt-8 max-w-[42ch] text-base leading-[25px]">
                Cut onboarding time <span className="shadow-[inset_0_-0.14em_0_hsl(var(--brand-tint))]">32%</span> by aligning product, sales, and support.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-5 text-xs font-semibold">
                <span>Owned action</span><span>Specific proof</span><span>Business result</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-y border-line bg-proof px-5 py-7 md:px-8">
            <div className="mb-7 grid gap-3 md:grid-cols-[12rem_1fr] md:items-baseline">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Signature behavior</p>
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
            <Surface name="Homepage" copy="Approved Alpine artwork, regular headline, dark pill action, and a preview of the report." />
            <Surface name="Research" copy="Concrete claims, useful visuals, visible sources, honest limits." />
            <Surface name="Report" copy="Likely takeaway, exact evidence, and the next useful edit." />
            <Surface name="Workspace" copy="Calm orientation, clear states, and no mystery about what happens next." />
          </div>
        </Section>

        <Section eyebrow="05 / Interaction contract" title="Quiet controls. Generous targets.">
          <div className="grid border-y border-line lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-line py-8 lg:border-b-0 lg:border-r lg:pr-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Minimum target</p>
              <p className="mt-4 font-display text-6xl tracking-[-0.04em]">44px</p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Buttons, icon controls, report tabs, and mobile navigation keep a reliable touch target even when the visual treatment stays restrained.</p>
            </div>
            <div className="py-8 lg:pl-10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Reference controls</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button variant="brand">Primary action</Button>
                <Button variant="outline">Secondary action</Button>
                <Button variant="ghost" size="sm">Quiet action</Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button variant="brand" isLoading>Loading example</Button>
                <Button variant="outline" disabled>Disabled action</Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Tab through these controls to inspect actual focus. Loading and disabled examples cannot be activated.</p>
              <p className="mt-7 max-w-xl text-sm leading-6 text-muted-foreground">On small screens, wide data tables become labeled disclosure rows. Auth and purchase entry points use real forms, visible focus, and browser-supported autocomplete.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-line bg-card p-6 md:rounded-[24px]">
              <h3 className="text-2xl font-medium leading-[30px]">Selection and disabled input</h3>
              <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label="Example input mode">
                <Button variant={selectedMode === "upload" ? "brand" : "outline"} aria-pressed={selectedMode === "upload"} onClick={() => setSelectedMode("upload")}>Upload file</Button>
                <Button variant={selectedMode === "paste" ? "brand" : "outline"} aria-pressed={selectedMode === "paste"} onClick={() => setSelectedMode("paste")}>Paste text</Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">Selected example: {selectedMode === "upload" ? "Upload file" : "Paste text"}.</p>
              <div className="mt-6 space-y-2">
                <label htmlFor="lab-disabled-field" className="text-sm font-semibold">Disabled field</label>
                <Input id="lab-disabled-field" defaultValue="Operations manager" disabled />
              </div>
            </article>
            <article className="rounded-2xl border border-line bg-card p-6 md:rounded-[24px]">
              <h3 className="text-2xl font-medium leading-[30px]">Empty and recovery states</h3>
              <div className="mt-5 rounded-xl bg-secondary p-5">
                <p className="font-semibold">No saved reports</p>
                <p className="mt-2 text-base leading-[25px] text-muted-foreground">Your saved reports will appear here.</p>
              </div>
              <div className="mt-5 rounded-xl border border-destructive/50 bg-destructive/5 p-5" role="note" aria-label="Example recoverable error">
                <p className="font-semibold text-destructive">The report could not load.</p>
                <p className="mt-2 text-base leading-[25px]">Try again. Your resume text is still here.</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">These are labeled reference states. Operational errors remain separate from findings about a resume.</p>
            </article>
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
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
        <h2 className="max-w-[20ch] text-balance font-display text-4xl font-normal leading-[1.1] tracking-[-0.035em] md:text-[40px]">{title}</h2>
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
