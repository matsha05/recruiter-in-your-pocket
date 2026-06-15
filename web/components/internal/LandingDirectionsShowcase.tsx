"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Binary,
  Blend,
  BookOpenText,
  Braces,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Compass,
  LayoutPanelTop,
  Palette,
  Sparkles,
  SquareStack,
  WandSparkles,
} from "lucide-react";
import { PocketMark } from "@/components/icons";
import { cn } from "@/lib/utils";

type DirectionId =
  | "recruiter-slate"
  | "paper-trail"
  | "signal-grid"
  | "quiet-authority"
  | "portrait-proof"
  | "product-workbench"
  | "motion-brief"
  | "method-deck"
  | "brass-compass"
  | "brutalist-intercept";

type Direction = {
  id: DirectionId;
  name: string;
  shortName: string;
  influence: string;
  thesis: string;
  bestFor: string;
  risk: string;
  palette: string;
  icon: LucideIcon;
  preview: DirectionId;
  headline: string;
  subheadline: string;
  callouts: string[];
  stats: Array<{ value: string; label: string }>;
  notes: string[];
  scores: {
    trust: number;
    distinction: number;
    conversion: number;
    feasibility: number;
  };
};

const directions: Direction[] = [
  {
    id: "recruiter-slate",
    name: "01. Recruiter Slate",
    shortName: "Recruiter Slate",
    influence: "redesign-skill",
    thesis: "Keep the current recruiter-sharp foundation, but make it more exact, darker, and more undeniable.",
    bestFor: "The safest premium evolution if we want to ship quickly without losing clarity.",
    risk: "It could feel close to the current direction if we do not push composition hard enough.",
    palette: "Ink, mineral teal, cool paper",
    icon: BriefcaseBusiness,
    preview: "recruiter-slate",
    headline: "See what a recruiter decides before they ever read to the bottom.",
    subheadline:
      "A composed, high-trust landing page that leads with the 7.4-second truth, then shows the report as the proof.",
    callouts: ["Most shippable", "High trust", "Closest to brand context"],
    stats: [
      { value: "7.4s", label: "first impression window" },
      { value: "3 fixes", label: "tonight, not next month" },
      { value: "0 fluff", label: "all proof, no startup fog" },
    ],
    notes: [
      "Product artifact is the hero, not decoration.",
      "Dark shell makes teal feel more surgical and authored.",
      "Best if we want sharp confidence over novelty.",
    ],
    scores: { trust: 5, distinction: 4, conversion: 5, feasibility: 5 },
  },
  {
    id: "paper-trail",
    name: "02. Paper Trail",
    shortName: "Paper Trail",
    influence: "taste-skill",
    thesis: "Turn the landing page into a marked-up document desk: notes, edits, recruiter commentary, and human judgment.",
    bestFor: "A warmer, more tactile page that still feels smart and premium.",
    risk: "Too much paper texture could drift into editorial instead of product.",
    palette: "Warm paper, graphite, pine teal",
    icon: Palette,
    preview: "paper-trail",
    headline: "Get the kind of margin notes most candidates never hear out loud.",
    subheadline:
      "A more tactile concept with paper surfaces, handwritten cues, and a report that feels reviewed instead of generated.",
    callouts: ["Human", "Tactile", "Warmest option"],
    stats: [
      { value: "1 line", label: "holding you back" },
      { value: "4 signals", label: "re-scored with context" },
      { value: "Tonight", label: "not after a funnel" },
    ],
    notes: [
      "The page feels like a recruiter's desk, not SaaS chrome.",
      "Useful if we want more emotional pull without getting cute.",
      "Could pair well with softer testimonials and sample edits.",
    ],
    scores: { trust: 5, distinction: 4, conversion: 4, feasibility: 4 },
  },
  {
    id: "signal-grid",
    name: "03. Signal Grid",
    shortName: "Signal Grid",
    influence: "gpt-tasteskill",
    thesis: "Push the product into a data-led, signal-first system that feels powerful, fast, and brutally legible.",
    bestFor: "A bolder page that makes the product feel proprietary and category-defining.",
    risk: "If the copy is not disciplined, it could read a little too intense.",
    palette: "Midnight, frost, electric teal",
    icon: Binary,
    preview: "signal-grid",
    headline: "Your resume already sends a signal. The question is whether it is the right one.",
    subheadline:
      "A denser, punchier system built around evidence blocks, ranked signals, and a more analytical sense of momentum.",
    callouts: ["Bold", "Systematic", "Proprietary-feeling"],
    stats: [
      { value: "92", label: "story signal target" },
      { value: "4", label: "scan dimensions" },
      { value: "<10s", label: "to understand the value" },
    ],
    notes: [
      "This feels like a real hiring intelligence engine.",
      "Best for standing out from generic resume tools fast.",
      "We would need very disciplined motion and spacing to keep it premium.",
    ],
    scores: { trust: 4, distinction: 5, conversion: 4, feasibility: 4 },
  },
  {
    id: "quiet-authority",
    name: "04. Quiet Authority",
    shortName: "Quiet Authority",
    influence: "soft-skill",
    thesis: "Make it feel expensive, calm, and human, like a luxury service led by sharp judgment rather than speed.",
    bestFor: "A softer, more intimate direction that still feels premium and serious.",
    risk: "It may underplay urgency if we do not anchor enough hard proof.",
    palette: "Bone, stone, muted evergreen",
    icon: Sparkles,
    preview: "quiet-authority",
    headline: "A calmer way to hear the truth about how you read on paper.",
    subheadline:
      "More whitespace. Softer surfaces. Less product noise. The trust comes from restraint and a more personal tone.",
    callouts: ["Calm", "Luxury", "Service-led"],
    stats: [
      { value: "7.4 seconds", label: "of recruiter attention" },
      { value: "One page", label: "one impression" },
      { value: "Clear next move", label: "before you apply" },
    ],
    notes: [
      "This could help the brand feel more premium and less technical.",
      "Strong if we want a richer emotional tone for anxious job seekers.",
      "We would need to preserve recruiter sharpness so it does not become vague wellness energy.",
    ],
    scores: { trust: 5, distinction: 4, conversion: 4, feasibility: 4 },
  },
  {
    id: "portrait-proof",
    name: "05. Portrait Proof",
    shortName: "Portrait Proof",
    influence: "images-taste-skill",
    thesis: "Lead with a more image-driven, human-centered story where the candidate presence and recruiter reality coexist.",
    bestFor: "A more brand-forward homepage with stronger emotional resonance and memorability.",
    risk: "Requires very strong art direction to avoid looking like stock-photo SaaS.",
    palette: "Deep spruce, fog, skin-tone copper",
    icon: Blend,
    preview: "portrait-proof",
    headline: "The strongest candidate in the room still loses if their resume undersells them.",
    subheadline:
      "An image-led direction with portrait framing, layered proof, and a more human story around first impressions.",
    callouts: ["Image-led", "Emotional", "Campaign-ready"],
    stats: [
      { value: "250+", label: "applicants you are stacked against" },
      { value: "1 read", label: "to earn another look" },
      { value: "Zero guesswork", label: "when the report lands" },
    ],
    notes: [
      "The right photography or illustration could make this very strong.",
      "Good option if we want ads, social, and landing to share a visual world.",
      "The mockup uses abstract portrait framing so we can evaluate the structure first.",
    ],
    scores: { trust: 4, distinction: 5, conversion: 4, feasibility: 3 },
  },
  {
    id: "product-workbench",
    name: "06. Product Workbench",
    shortName: "Product Workbench",
    influence: "minimalist-skill",
    thesis: "Let the product UI do the selling. Reduce mood, increase clarity, and make the report workflow immediately legible.",
    bestFor: "A cleaner product-forward page where utility wins and the app feels real.",
    risk: "Could be too quiet if we do not add one memorable brand move.",
    palette: "Cloud, slate, precise teal",
    icon: LayoutPanelTop,
    preview: "product-workbench",
    headline: "Open the tool. See the report. Know what changes first.",
    subheadline:
      "A stripped-back, product-led landing page with a clearer task flow and less ornamental framing.",
    callouts: ["Product-first", "Sharp", "Least decorative"],
    stats: [
      { value: "Upload", label: "resume or LinkedIn" },
      { value: "Scan", label: "what reads first" },
      { value: "Rewrite", label: "the weakest proof line" },
    ],
    notes: [
      "The cleanest way to communicate usefulness immediately.",
      "This probably converts well if the screenshot/report experience is strong.",
      "Best if we want to feel more like a serious tool than a campaign page.",
    ],
    scores: { trust: 5, distinction: 3, conversion: 5, feasibility: 5 },
  },
  {
    id: "motion-brief",
    name: "07. Motion Brief",
    shortName: "Motion Brief",
    influence: "gpt-tasteskill",
    thesis: "Introduce more speed, cuts, and contrast so the page feels urgent, current, and unmistakably opinionated.",
    bestFor: "A stronger launch statement if we want the brand to feel more modern and forceful.",
    risk: "Easy to overdo. It needs discipline to stay premium instead of flashy.",
    palette: "Graphite, ice, vivid teal",
    icon: WandSparkles,
    preview: "motion-brief",
    headline: "They are not reading slowly. Your landing page should not feel slow either.",
    subheadline:
      "A higher-energy system with slashes, staged emphasis, and stronger directional motion built into the composition.",
    callouts: ["Kinetic", "Opinionated", "Launch energy"],
    stats: [
      { value: "Fast", label: "reads in one sweep" },
      { value: "Hard proof", label: "without a wall of copy" },
      { value: "One CTA", label: "clear from frame one" },
    ],
    notes: [
      "This is the most launch-campaign feeling direction outside the brutalist route.",
      "We would translate the motion into real sequencing instead of gimmicks.",
      "Strong candidate if you want a bolder brand posture.",
    ],
    scores: { trust: 4, distinction: 5, conversion: 4, feasibility: 3 },
  },
  {
    id: "method-deck",
    name: "08. Method Deck",
    shortName: "Method Deck",
    influence: "stitch-skill",
    thesis: "Structure the whole page like a rigorous briefing deck: methodology first, proof second, product third.",
    bestFor: "A high-trust audience that wants to believe the method before they believe the marketing.",
    risk: "Could skew too serious if we do not give the CTA enough lift.",
    palette: "Ivory, navy, library teal",
    icon: BookOpenText,
    preview: "method-deck",
    headline: "A better resume is not guesswork. It is pattern recognition with standards.",
    subheadline:
      "More structured, more explicit, and more architecture-minded. This version sells the methodology as the product moat.",
    callouts: ["Research-led", "Structured", "High-credibility"],
    stats: [
      { value: "25+", label: "research notes already live" },
      { value: "4 signals", label: "behind every score" },
      { value: "1 report", label: "free before account friction" },
    ],
    notes: [
      "This plays especially well with your research library and methodology pages.",
      "It could make the whole brand feel more defensible.",
      "Best for an audience skeptical of generic AI claims.",
    ],
    scores: { trust: 5, distinction: 4, conversion: 4, feasibility: 4 },
  },
  {
    id: "brass-compass",
    name: "09. Brass Compass",
    shortName: "Brass Compass",
    influence: "soft-skill + taste-skill",
    thesis: "A richer premium direction with darker surfaces, brass highlights, and a more directional sense of mentorship.",
    bestFor: "A more expensive-feeling brand expression without abandoning seriousness.",
    risk: "Gold accents can go cheesy if they are not tightly controlled.",
    palette: "Deep tide, brass, vellum",
    icon: Compass,
    preview: "brass-compass",
    headline: "For candidates who do not want another optimizer. They want better judgment.",
    subheadline:
      "A premium mentorship frame with darker surfaces, directional cues, and a sense of guided precision rather than hustle.",
    callouts: ["Premium", "Mentorship", "Memorable"],
    stats: [
      { value: "Guided", label: "not generic" },
      { value: "Specific", label: "not motivational" },
      { value: "Sharper", label: "before you apply" },
    ],
    notes: [
      "This is the most overtly premium direction without going loud.",
      "It could pair well with paid positioning and lifetime offers.",
      "The restraint on brass matters a lot here.",
    ],
    scores: { trust: 4, distinction: 5, conversion: 4, feasibility: 3 },
  },
  {
    id: "brutalist-intercept",
    name: "10. Brutalist Intercept",
    shortName: "Brutalist Intercept",
    influence: "brutalist-skill",
    thesis: "Confront the user with the hiring truth immediately. Raw type, sharp edges, and almost no attempt to soothe.",
    bestFor: "An intentionally edgy experiment if we want strong visual character and instant memorability.",
    risk: "It is polarizing by design and probably too aggressive for a default homepage.",
    palette: "Bone, blackout, acid teal",
    icon: Braces,
    preview: "brutalist-intercept",
    headline: "Recruiters are making snap judgments. Pretending otherwise is not helping you.",
    subheadline:
      "A hard-edged concept with stark hierarchy and almost no smoothing. More manifesto, less polished brochure.",
    callouts: ["Experimental", "Polarizing", "Most distinct"],
    stats: [
      { value: "0 padding", label: "for vague copy" },
      { value: "1 truth", label: "make the first read stronger" },
      { value: "10/10", label: "visual character" },
    ],
    notes: [
      "This is probably not the default direction, but it may contain moves we steal.",
      "Useful as an outer bound for how opinionated we want the brand to feel.",
      "Could be incredible for campaigns or an alt launch page.",
    ],
    scores: { trust: 3, distinction: 5, conversion: 3, feasibility: 3 },
  },
];

function ScorePill({ label, value }: { label: string; value: number }) {
  const width = `${(value / 5) * 100}%`;

  return (
    <div className="gap-y-1.5">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
        <span>{label}</span>
        <span className="font-medium text-slate-500">{value}/5</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(61,214,195,0.45),rgba(215,183,105,0.88))]"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <div className="font-display text-2xl tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs leading-5 text-slate-300">{label}</div>
    </div>
  );
}

function MockTopBar({
  dark = false,
  accent = "bg-teal-400",
}: {
  dark?: boolean;
  accent?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b px-5 py-4",
        dark ? "border-white/10 text-white" : "border-slate-200 text-slate-900",
      )}
    >
      <div className="flex items-center gap-3">
        <PocketMark className={cn("size-5", dark ? "text-teal-300" : "text-brand")} />
        <div>
          <div className={cn("text-xs uppercase tracking-wide", dark ? "text-slate-400" : "text-slate-500")}>
            Recruiter in Your Pocket
          </div>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className={cn("rounded-full px-3 py-1 text-xs", dark ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-600")}>
          Methodology
        </span>
        <span className={cn("rounded-full px-3 py-1 text-xs", dark ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-600")}>
          Research
        </span>
        <span className={cn("rounded-full px-3 py-1 text-xs font-medium text-white", accent)}>Run free report</span>
      </div>
    </div>
  );
}

function PreviewButton({
  label,
  dark = false,
  primary = false,
}: {
  label: string;
  dark?: boolean;
  primary?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium",
        primary
          ? "bg-teal-500 text-white shadow-[0_14px_30px_rgba(13,148,136,0.28)]"
          : dark
            ? "border border-white/12 bg-white/8 text-slate-200"
            : "border border-slate-200 bg-white text-slate-700",
      )}
    >
      {label}
    </span>
  );
}

function PreviewShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[32px] border shadow-[0_24px_80px_rgba(2,8,23,0.2)]", className)}>
      {children}
    </div>
  );
}

function RecruiterSlatePreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-white/10 bg-[#07161b]">
      <MockTopBar dark accent="bg-teal-500" />
      <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-8">
        <div className="gap-y-6">
          <span className="inline-flex rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs uppercase tracking-wide text-teal-200">
            Recruiter truth, product first
          </span>
          <div className="gap-y-4">
            <h3 className="max-w-xl font-display text-5xl leading-[0.94] tracking-tight text-white">
              {direction.headline}
            </h3>
            <p className="max-w-xl text-base leading-7 text-slate-300">{direction.subheadline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PreviewButton label="Run free report" primary />
            <PreviewButton label="See methodology" dark />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {direction.stats.map((stat) => (
              <MiniStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-4">
          <div className="rounded-[24px] border border-white/10 bg-[#f5f7f8] p-5 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Free report preview</p>
                <p className="mt-1 font-display text-2xl tracking-tight">The first 7.4 seconds</p>
              </div>
              <div className="rounded-full bg-teal-50 px-4 py-2 text-right">
                <div className="font-display text-3xl text-teal-700">87</div>
                <div className="text-xs uppercase tracking-wide text-teal-700/80">score</div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">What stands out first</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Leadership signal is strong, but two bullets still read as task ownership instead of business effect.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#eef6f4] p-4">
                <p className="text-xs uppercase tracking-wide text-teal-700">Fix tonight</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Replace “managed deployments” with a line that shows scope, speed, and risk reduction.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Story 92", "Impact 78", "Clarity 85"].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function PaperTrailPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-[#d9cdb9] bg-[#f3ede3]">
      <MockTopBar accent="bg-[#245b51]" />
      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:py-8">
        <div className="gap-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d6c7af] bg-[#fbf7f0] px-3 py-1 text-xs uppercase tracking-wide text-[#5f695d]">
            Margin-note review
          </div>
          <h3 className="max-w-xl font-display text-5xl leading-[0.98] tracking-tight text-[#1f2f2d]">
            {direction.headline}
          </h3>
          <p className="max-w-lg text-[15px] leading-7 text-[#4e5c5a]">{direction.subheadline}</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-[#245b51] px-4 py-2 text-sm font-medium text-white">See your free notes</span>
            <span className="rounded-full border border-[#d6c7af] bg-[#fbf7f0] px-4 py-2 text-sm text-[#4e5c5a]">View a sample report</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {direction.stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-[#d6c7af] bg-[#fbf7f0] p-4">
                <div className="font-display text-2xl text-[#1f2f2d]">{stat.value}</div>
                <div className="mt-1 text-xs leading-5 text-[#66706b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-[28px] border border-[#d7cab5] bg-[#fffdf8] p-5 shadow-[0_30px_60px_rgba(82,68,44,0.16)]">
          <div className="flex items-center justify-between border-b border-dashed border-[#d7cab5] pb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#6b7468]">Recruiter markup</p>
              <p className="mt-1 font-display text-2xl text-[#1f2f2d]">Before you apply</p>
            </div>
            <span className="rounded-full bg-[#e6f1ed] px-3 py-1 text-xs font-medium text-[#245b51]">line-by-line clarity</span>
          </div>
          <div className="mt-5 gap-y-4 text-[15px] leading-7 text-[#394544]">
            <p>
              <span className="line-through decoration-[#cf9b8b] decoration-2">Responsible for managing service deployments</span>{" "}
              <span className="rounded-md bg-[#e5f1ef] px-1.5 py-0.5 text-[#245b51]">
                Led rollout across 4 services, reducing deploy time 40%.
              </span>
            </p>
            <p>
              <span className="rounded-md bg-[#fff5bf] px-1.5 py-0.5">This is where a recruiter starts leaning in.</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {["What stands out first", "What reads too generic", "What to quantify", "What to cut"].map((label) => (
                <div key={label} className="rounded-2xl border border-[#ded1bd] bg-[#f8f3ea] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#6a736b]">{label}</p>
                  <p className="mt-2 text-sm text-[#43514f]">Short, candid recruiter commentary instead of generalized tips.</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-3 top-10 rotate-6 rounded-full border border-[#d4c7b3] bg-[#245b51] px-4 py-2 text-xs uppercase tracking-wide text-white shadow-lg">
            honest, not harsh
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function SignalGridPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-white/10 bg-[#08121b]">
      <MockTopBar dark accent="bg-cyan-400 text-cyan-950" />
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="gap-y-6">
          <div className="inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-wide text-cyan-200">
            Signal-ranked landing
          </div>
          <h3 className="max-w-xl font-display text-5xl leading-[0.92] tracking-tight text-white">
            {direction.headline}
          </h3>
          <p className="max-w-lg text-[15px] leading-7 text-slate-300">{direction.subheadline}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {direction.stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="font-display text-3xl text-cyan-200">{stat.value}</div>
                <div className="mt-1 text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(7,24,33,0.96),rgba(7,17,25,0.96))] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-400">Ranked signal board</p>
              <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-medium text-cyan-950">live preview</span>
            </div>
            <div className="mt-5 gap-y-3">
              {[
                ["Story Signal", "92", "top third is clear and senior"],
                ["Impact Signal", "78", "quantify recent outcomes more aggressively"],
                ["Clarity Signal", "85", "title-to-scope ladder is working"],
                ["Readability Signal", "68", "dense mid-page bullets slow the scan"],
              ].map(([label, value, copy]) => (
                <div key={label} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[auto_1fr]">
                  <div className="font-display text-4xl text-white">{value}</div>
                  <div>
                    <p className="text-sm font-medium text-cyan-100">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Why it gets skipped", "What to rewrite first"].map((label) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Dense evidence tiles and sharper copy make the product feel like a defensible system.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function QuietAuthorityPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-[#dbd6cb] bg-[#efebe3]">
      <MockTopBar accent="bg-[#3a5d53]" />
      <div className="grid gap-10 px-6 py-10 lg:grid-cols-[1fr_0.9fr] lg:px-10">
        <div className="gap-y-8">
          <div className="inline-flex rounded-full border border-[#d4cfbf] bg-[#f5f2ec] px-3 py-1 text-xs uppercase tracking-wide text-[#6e776f]">
            Quiet authority
          </div>
          <h3 className="max-w-xl font-display text-[3.4rem] leading-[0.96] tracking-tight text-[#202828]">
            {direction.headline}
          </h3>
          <p className="max-w-lg text-[15px] leading-8 text-[#5c6663]">{direction.subheadline}</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-[#3a5d53] px-5 py-2.5 text-sm font-medium text-white">Start with a free report</span>
            <span className="rounded-full border border-[#d4cfbf] bg-[#f5f2ec] px-5 py-2.5 text-sm text-[#5c6663]">How the scoring works</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {direction.stats.map((stat) => (
              <div key={stat.label} className="border-l border-[#cfc8bb] pl-4">
                <div className="font-display text-2xl text-[#202828]">{stat.value}</div>
                <div className="mt-2 text-xs leading-5 text-[#6a726d]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <div className="w-full rounded-[34px] border border-[#d8d2c8] bg-[#faf8f4] p-6 shadow-[0_24px_60px_rgba(76,67,49,0.12)]">
            <p className="text-xs uppercase tracking-wide text-[#788079]">A gentler proof surface</p>
            <blockquote className="mt-5 max-w-md font-display text-3xl leading-[1.08] tracking-tight text-[#202828]">
              “This feels like someone finally explained why my resume was not landing.”
            </blockquote>
            <p className="mt-5 text-sm leading-7 text-[#5f6763]">
              Pair softer typography and generous spacing with a very concrete explanation of what stands out first, what gets missed, and what to change.
            </p>
            <div className="mt-6 rounded-[28px] border border-[#ddd7cb] bg-[#f1ede6] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#77807a]">First impression</p>
                  <p className="mt-1 font-display text-2xl text-[#202828]">Strong foundation, undersold impact</p>
                </div>
                <span className="rounded-full bg-[#e3eee8] px-3 py-1 text-xs font-medium text-[#3a5d53]">clear next move</span>
              </div>
              <div className="mt-4 gap-y-3">
                {["The top third reads senior.", "Two bullets still sound too managerial.", "One stronger metric changes the whole impression."].map((item) => (
                  <div key={item} className="rounded-2xl border border-[#d8d1c5] bg-[#fbf9f6] px-4 py-3 text-sm text-[#4d5955]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function PortraitProofPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-[#123136] bg-[#0d2025]">
      <MockTopBar dark accent="bg-[#d39a67]" />
      <div className="grid gap-8 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="relative min-h-[420px] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(211,154,103,0.44),transparent_33%),radial-gradient(circle_at_72%_24%,rgba(66,184,170,0.28),transparent_28%),linear-gradient(180deg,#16353b_0%,#0b171b_100%)]">
          <div className="absolute inset-8 rounded-[26px] border border-white/10 bg-white/[0.04]" />
          <div className="absolute bottom-0 left-1/2 h-[88%] w-[72%] -translate-x-1/2 rounded-t-[180px] bg-[linear-gradient(180deg,rgba(229,199,176,0.9),rgba(128,85,62,0.65))]" />
          <div className="absolute bottom-8 left-8 max-w-[230px] rounded-3xl border border-white/10 bg-[#f3eadf] p-4 text-slate-900 shadow-xl">
            <p className="text-xs uppercase tracking-wide text-slate-500">What the page says</p>
            <p className="mt-2 font-display text-2xl leading-tight">The human is strong. The document needs to catch up.</p>
          </div>
        </div>
        <div className="gap-y-6 py-2">
          <div className="inline-flex rounded-full border border-[#c98b61]/25 bg-[#d39a67]/12 px-3 py-1 text-xs uppercase tracking-wide text-[#efc39e]">
            Human-first campaign
          </div>
          <h3 className="max-w-xl font-display text-5xl leading-[0.95] tracking-tight text-white">
            {direction.headline}
          </h3>
          <p className="max-w-xl text-[15px] leading-7 text-slate-300">{direction.subheadline}</p>
          <div className="flex flex-wrap gap-3">
            <PreviewButton label="Run free report" primary />
            <PreviewButton label="See sample result" dark />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {direction.stats.map((stat) => (
              <MiniStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Layered proof</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Candidate story", "Recruiter reality", "Exact fix"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function ProductWorkbenchPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-slate-200 bg-[#eef2f4]">
      <MockTopBar accent="bg-teal-600" />
      <div className="grid gap-8 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="gap-y-6">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-wide text-slate-500">
            Minimalist workbench
          </div>
          <h3 className="max-w-xl font-display text-5xl leading-[0.94] tracking-tight text-slate-900">
            {direction.headline}
          </h3>
          <p className="max-w-lg text-[15px] leading-7 text-slate-600">{direction.subheadline}</p>
          <div className="flex flex-wrap gap-3">
            <PreviewButton label="Open workspace" primary />
            <PreviewButton label="Why this works" />
          </div>
          <div className="gap-y-3">
            {direction.stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-sm text-slate-600">{stat.label}</span>
                <span className="font-display text-2xl text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Workflow</p>
              <div className="mt-4 gap-y-3">
                {["1. Upload resume", "2. Optional job context", "3. Read first-impression report"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-teal-50 text-xs font-medium text-teal-700">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-[#f8fbfb] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Report preview</p>
                  <p className="mt-1 font-display text-2xl tracking-tight text-slate-900">First impression</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">ready in seconds</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Strongest signal</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Senior scope is visible quickly.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Weakest signal</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Recent bullets under-quantify outcomes.</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Rewrite suggestion</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Reframe operational ownership as measurable business effect and scope.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function MotionBriefPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-[#0f2831] bg-[#07141b]">
      <MockTopBar dark accent="bg-[#3ce0c4] text-[#07141b]" />
      <div className="relative overflow-hidden px-6 py-8 lg:px-8">
        <div className="absolute inset-y-0 right-[18%] hidden w-px bg-white/10 lg:block" />
        <div className="absolute right-[-6rem] top-16 size-56 rotate-12 rounded-[32px] border border-teal-300/25 bg-teal-300/10" />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="gap-y-6">
            <div className="inline-flex rounded-full border border-teal-300/15 bg-teal-300/10 px-3 py-1 text-xs uppercase tracking-wide text-teal-200">
              Kinetic narrative
            </div>
            <h3 className="max-w-xl font-display text-5xl leading-[0.9] tracking-tight text-white">
              {direction.headline}
            </h3>
            <p className="max-w-lg text-[15px] leading-7 text-slate-300">{direction.subheadline}</p>
            <div className="flex flex-wrap gap-3">
              <PreviewButton label="Run free report" primary />
              <PreviewButton label="Watch the scan" dark />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {direction.stats.map((stat) => (
                <MiniStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
          <div className="gap-y-3">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(17,34,43,0.98),rgba(6,15,21,0.98))] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-400">Motion sequence</p>
                <ArrowRight className="size-4 text-teal-300" />
              </div>
              <div className="mt-4 gap-y-3">
                {["They skim.", "They hesitate.", "We show exactly why.", "We rewrite the weak line."].map((item, index) => (
                  <div
                    key={item}
                    className={cn(
                      "rounded-[22px] border p-4 text-sm",
                      index === 2
                        ? "border-teal-300/25 bg-teal-300/10 text-teal-100"
                        : "border-white/10 bg-white/[0.04] text-slate-300",
                    )}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Scroll story", "Single CTA priority"].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function MethodDeckPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-[#d8dfe3] bg-[#edf2f3]">
      <MockTopBar accent="bg-[#163d4a]" />
      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="gap-y-6">
          <div className="inline-flex rounded-full border border-[#d4dde0] bg-white px-3 py-1 text-xs uppercase tracking-wide text-[#52616a]">
            Structured proof deck
          </div>
          <h3 className="max-w-xl font-display text-5xl leading-[0.95] tracking-tight text-[#102329]">
            {direction.headline}
          </h3>
          <p className="max-w-lg text-[15px] leading-7 text-[#55656c]">{direction.subheadline}</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-[#163d4a] px-4 py-2 text-sm font-medium text-white">Explore the method</span>
            <span className="rounded-full border border-[#d5dde0] bg-white px-4 py-2 text-sm text-[#55656c]">Run a free report</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {direction.stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-[#d6dfe2] bg-white p-4">
                <div className="font-display text-2xl text-[#102329]">{stat.value}</div>
                <div className="mt-1 text-xs leading-5 text-[#66767d]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {[
            ["01", "How recruiters actually scan", "Start with the top third, role signal, and what earns a second look."],
            ["02", "What the score is measuring", "Story, impact, clarity, and readability all ladder to recruiter behavior."],
            ["03", "How the report helps", "It identifies the exact line that weakens the first impression and rewrites it."],
          ].map(([number, title, copy], index) => (
            <div
              key={title}
              className={cn(
                "rounded-[28px] border p-5 shadow-[0_16px_32px_rgba(15,23,42,0.08)]",
                index === 0 ? "border-[#c3d1d6] bg-[#163d4a] text-white" : "border-[#d7dfe3] bg-white text-[#102329]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn("text-xs uppercase tracking-wide", index === 0 ? "text-[#a7c3cc]" : "text-[#6b7980]")}>
                    {number}
                  </p>
                  <p className="mt-2 font-display text-3xl tracking-tight">{title}</p>
                </div>
                <SquareStack className={cn("size-5", index === 0 ? "text-[#b8e2dc]" : "text-[#728088]")} />
              </div>
              <p className={cn("mt-3 max-w-md text-sm leading-7", index === 0 ? "text-[#d6e5ea]" : "text-[#5e6e75]")}>{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

function BrassCompassPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-[#294044] bg-[#08171b]">
      <MockTopBar dark accent="bg-[#c69a52]" />
      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1fr_0.95fr] lg:px-8">
        <div className="gap-y-6">
          <div className="inline-flex rounded-full border border-[#c69a52]/25 bg-[#c69a52]/12 px-3 py-1 text-xs uppercase tracking-wide text-[#e9cf9b]">
            Directional premium
          </div>
          <h3 className="max-w-xl font-display text-5xl leading-[0.94] tracking-tight text-[#f4efe7]">
            {direction.headline}
          </h3>
          <p className="max-w-lg text-[15px] leading-7 text-[#b8c5c7]">{direction.subheadline}</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-[#c69a52] px-4 py-2 text-sm font-medium text-[#0b171a]">Get your free read</span>
            <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-[#d2ddde]">See what changes first</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {direction.stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="font-display text-2xl text-[#f3e1bb]">{stat.value}</div>
                <div className="mt-1 text-xs leading-5 text-[#b3c2c4]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-[#294044] bg-[radial-gradient(circle_at_top,rgba(198,154,82,0.16),transparent_35%),linear-gradient(180deg,#10272b,#08171b)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-[#9fb2b4]">Guided reading compass</p>
            <Compass className="size-5 text-[#c69a52]" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-[#102529] p-5">
              <p className="text-xs uppercase tracking-wide text-[#98afb2]">North star</p>
              <p className="mt-2 font-display text-3xl leading-tight text-[#f4efe7]">Sharper judgment, not more noise.</p>
            </div>
            <div className="rounded-[26px] border border-[#c69a52]/20 bg-[#f2eadb] p-5 text-[#17272a]">
              <p className="text-xs uppercase tracking-wide text-[#7c6848]">Proof surface</p>
              <p className="mt-2 text-sm leading-6">
                Sample report artifact on vellum-toned paper to contrast with the dark exterior shell.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {["Trust", "Specificity", "Lift"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#d3ddde]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function BrutalistInterceptPreview({ direction }: { direction: Direction }) {
  return (
    <PreviewShell className="border-black bg-[#f6f2e8]">
      <div className="border-b-4 border-black bg-[#ebfff7] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PocketMark className="size-5 text-black" />
            <span className="text-xs font-semibold uppercase tracking-wide text-black">Recruiter in Your Pocket</span>
          </div>
          <span className="border-2 border-black bg-gray-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#ebfff7]">
            Free report
          </span>
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b-4 border-black p-6 lg:border-b-0 lg:border-r-4 lg:p-8">
          <div className="inline-flex border-2 border-black bg-[#10d3b0] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
            brutalist-skill
          </div>
          <h3 className="mt-6 max-w-xl font-display text-[3.5rem] leading-[0.88] tracking-[-0.04em] text-black">
            {direction.headline}
          </h3>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-black/75">{direction.subheadline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="border-2 border-black bg-gray-950 px-4 py-2 text-sm font-semibold text-[#ebfff7]">Start here</span>
            <span className="border-2 border-black bg-[#fff2b2] px-4 py-2 text-sm font-semibold text-black">Read the method</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {direction.stats.map((stat) => (
              <div key={stat.label} className="border-2 border-black bg-white p-4">
                <div className="font-display text-3xl text-black">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-black/65">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-950 p-6 text-[#ebfff7] lg:p-8">
          <div className="grid gap-3">
            {[
              "THEY DECIDE FAST",
              "MOST RESUMES SOUND THE SAME",
              "YOU ONLY NEED THE ONE LINE THAT MAKES THEM LEAN IN",
            ].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "border-2 border-[#ebfff7] p-4 text-lg font-semibold tracking-[-0.02em]",
                  index === 1 ? "bg-[#10d3b0] text-black" : "bg-gray-950 text-[#ebfff7]",
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 border-2 border-[#ebfff7] bg-[#f6f2e8] p-4 text-black">
            <p className="text-xs font-semibold uppercase tracking-wide">Sample output</p>
            <p className="mt-2 text-sm leading-7">
              “Responsible for customer onboarding” becomes “Onboarded 140+ enterprise users across three regions with 96% activation.”
            </p>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function DirectionPreview({ direction }: { direction: Direction }) {
  switch (direction.preview) {
    case "recruiter-slate":
      return <RecruiterSlatePreview direction={direction} />;
    case "paper-trail":
      return <PaperTrailPreview direction={direction} />;
    case "signal-grid":
      return <SignalGridPreview direction={direction} />;
    case "quiet-authority":
      return <QuietAuthorityPreview direction={direction} />;
    case "portrait-proof":
      return <PortraitProofPreview direction={direction} />;
    case "product-workbench":
      return <ProductWorkbenchPreview direction={direction} />;
    case "motion-brief":
      return <MotionBriefPreview direction={direction} />;
    case "method-deck":
      return <MethodDeckPreview direction={direction} />;
    case "brass-compass":
      return <BrassCompassPreview direction={direction} />;
    case "brutalist-intercept":
      return <BrutalistInterceptPreview direction={direction} />;
    default:
      return null;
  }
}

function DirectionSlide({
  direction,
  index,
  total,
}: {
  direction: Direction;
  index: number;
  total: number;
}) {
  const Icon = direction.icon;

  return (
    <section
      id={direction.id}
      data-direction-id={direction.id}
      className="flex min-h-[100dvh] snap-start items-center px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        <aside className="gap-y-5 rounded-[30px] border border-white/10 bg-gray-950/18 p-5 backdrop-blur-xl lg:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-teal-200">
            <Icon className="size-3.5" />
            {direction.influence}
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            <h2 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight text-white">{direction.shortName}</h2>
          </div>
          <p className="text-sm leading-7 text-slate-300">{direction.thesis}</p>
          <div className="gap-y-3 rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Best for</p>
            <p className="text-sm leading-7 text-slate-200">{direction.bestFor}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">Watch-out</p>
            <p className="text-sm leading-7 text-slate-300">{direction.risk}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">Palette</p>
            <p className="text-sm text-slate-200">{direction.palette}</p>
          </div>
          <div className="gap-y-3">
            <ScorePill label="Trust" value={direction.scores.trust} />
            <ScorePill label="Distinctiveness" value={direction.scores.distinction} />
            <ScorePill label="Conversion" value={direction.scores.conversion} />
            <ScorePill label="Feasibility" value={direction.scores.feasibility} />
          </div>
          <div className="flex flex-wrap gap-2">
            {direction.callouts.map((callout) => (
              <span key={callout} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {callout}
              </span>
            ))}
          </div>
        </aside>

        <div className="grid min-h-0 gap-4">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-3 shadow-[0_24px_80px_rgba(2,8,23,0.14)] lg:p-4">
            <DirectionPreview direction={direction} />
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {direction.notes.map((note) => (
              <div key={note} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingDirectionsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = (visible.target as HTMLElement).dataset.directionId;
        const nextIndex = directions.findIndex((direction) => direction.id === id);
        if (nextIndex >= 0) {
          setActiveIndex(nextIndex);
        }
      },
      {
        root,
        threshold: [0.45, 0.6, 0.8],
      },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scrollToIndex = (nextIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(directions.length - 1, nextIndex));
      const target = slideRefs.current[clampedIndex];
      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        scrollToIndex(activeIndex + 1);
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        scrollToIndex(activeIndex - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        scrollToIndex(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        scrollToIndex(directions.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const activeDirection = directions[activeIndex];
  const goToIndex = (index: number) => {
    const target = slideRefs.current[index];
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="relative bg-[radial-gradient(circle_at_top,rgba(34,197,170,0.18),transparent_28%),linear-gradient(180deg,#061014_0%,#09161d_32%,#061014_100%)] text-white">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#07131a]/80 p-2 backdrop-blur-xl">
              <PocketMark className="size-5 text-teal-300" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#07131a]/80 px-4 py-3 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-wide text-teal-200/80">Internal concept deck</p>
              <h1 className="font-display text-xl tracking-tight text-white">Recruiter in Your Pocket Landing Directions</h1>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <Link
              href="/internal/landing-options"
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 sm:inline-flex"
            >
              Existing options
            </Link>
            <Link
              href="/"
              className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_14px_28px_rgba(13,148,136,0.24)]"
            >
              View live landing
            </Link>
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        className="h-[100dvh] snap-y snap-mandatory overflow-y-auto scroll-smooth"
      >
        {directions.map((direction, index) => (
          <div
            key={direction.id}
            data-direction-id={direction.id}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
          >
            <DirectionSlide direction={direction} index={index} total={directions.length} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-4">
          <div className="pointer-events-auto hidden rounded-[28px] border border-white/10 bg-[#07131a]/80 p-3 backdrop-blur-xl md:flex md:items-center md:gap-2">
            {directions.map((direction, index) => (
              <button
                key={direction.id}
                type="button"
                onClick={() => goToIndex(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeIndex ? "w-10 bg-teal-300" : "w-2.5 bg-white/25 hover:bg-white/40",
                )}
                aria-label={`Go to ${direction.shortName}`}
              />
            ))}
          </div>

          <div className="pointer-events-auto ml-auto rounded-[28px] border border-white/10 bg-[#07131a]/80 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToIndex(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Previous direction"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="min-w-[180px]">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(directions.length).padStart(2, "0")} • use arrow keys
                </p>
                <p className="mt-1 font-display text-lg tracking-tight text-white">{activeDirection.shortName}</p>
              </div>
              <button
                type="button"
                onClick={() => goToIndex(activeIndex + 1)}
                disabled={activeIndex === directions.length - 1}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-teal-500 text-white transition disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Next direction"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
