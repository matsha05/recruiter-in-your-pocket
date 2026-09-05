"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, CaretRight, Plus, TrendUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { OfferData } from "@/lib/compensation-model";
import { createEmptyOffer, offerHasValidVesting } from "@/lib/compensation-model";
import { CompCalculatorOfferCard } from "./CompCalculatorOfferCard";
import { CompCalculatorResults } from "./CompCalculatorResults";

const SAMPLE_OFFERS: OfferData[] = [
  {
    ...createEmptyOffer("sample-current", true, 0),
    companyName: "Current job",
    baseSalary: 180_000,
    bonusPercent: 15,
    stockTotal: 120_000,
  },
  {
    ...createEmptyOffer("sample-a", false, 1),
    companyName: "Company A",
    baseSalary: 200_000,
    bonusPercent: 15,
    stockTotal: 400_000,
    signingBonus: 50_000,
  },
  {
    ...createEmptyOffer("sample-b", false, 2),
    companyName: "Company B",
    baseSalary: 220_000,
    bonusPercent: 20,
    stockTotal: 200_000,
    vestingSchedule: [5, 15, 40, 40],
    signingBonus: 30_000,
    relocationBonus: 15_000,
  },
];

export function CompCalculatorClient() {
  const reduceMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);
  const [offers, setOffers] = useState<OfferData[]>([createEmptyOffer("offer-1", false, 0)]);
  const [showingSample, setShowingSample] = useState(false);
  const nextOfferId = useRef(2);
  const nextStyleIndex = useRef(1);
  const displayOffers = showingSample ? SAMPLE_OFFERS : offers;
  const hasCurrentJob = offers.some((offer) => offer.isCurrentJob);
  const hasData = displayOffers.some((offer) => offer.baseSalary > 0);
  const hasInvalidVesting = displayOffers.some((offer) => offer.baseSalary > 0 && !offerHasValidVesting(offer));

  useEffect(() => setIsHydrated(true), []);

  function updateOffer(id: string, updated: OfferData) {
    if (showingSample) return;
    setOffers((current) => current.map((offer) => offer.id === id ? updated : offer));
  }

  function removeOffer(id: string) {
    if (showingSample) return;
    setOffers((current) => current.length > 1 ? current.filter((offer) => offer.id !== id) : current);
  }

  function nextOffer(isCurrentJob = false) {
    const id = `offer-${nextOfferId.current++}`;
    const styleIndex = nextStyleIndex.current++;
    return createEmptyOffer(id, isCurrentJob, styleIndex);
  }

  function addOffer() {
    if (showingSample) return;
    setOffers((current) => current.length < 5 ? [...current, nextOffer()] : current);
  }

  function addCurrentJob() {
    if (showingSample || hasCurrentJob) return;
    setOffers((current) => current.length < 5 ? [...current, nextOffer(true)] : current);
  }

  return (
    <div data-calculator-hydrated={isHydrated ? "true" : "false"} className="bg-paper text-foreground selection:bg-brand/15">
      <div className="border-b border-line bg-background">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-4 text-sm sm:px-8">
          <Link href="/resources" className="focus-ring min-h-11 rounded-sm py-3 text-muted-foreground transition-colors hover:text-foreground">Resources</Link>
          <CaretRight aria-hidden="true" className="size-3 text-muted-foreground" weight="bold" />
          <span className="font-medium text-foreground">Offer calculator</span>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-20">
        <header className="mb-12 grid gap-8 border-b border-line pb-12 lg:grid-cols-3 lg:items-end lg:gap-14">
          <h1 className="max-w-4xl font-display text-5xl riyp-weight-540 leading-none tracking-tight text-foreground riyp-stretch-92 sm:text-6xl lg:col-span-2 lg:text-7xl">
            Compare your offers over four years.
          </h1>
          <div>
            <p className="text-lg leading-8 text-muted-foreground">See how base salary, bonus, equity, and one-time payments add up each year. Amounts are in US dollars, before tax.</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">No account required. This page does not save the numbers you enter.</p>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-5 xl:items-start">
          <section aria-labelledby="offers-heading" className="xl:col-span-3">
            <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="offers-heading" className="font-display text-3xl riyp-weight-560 tracking-tight text-foreground">Offer details</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter the terms from each offer. Unknown amounts left at zero are excluded, so the comparison will be incomplete until you confirm them.</p>
              </div>
              {!showingSample && !hasData ? <button type="button" onClick={() => setShowingSample(true)} className="focus-ring min-h-11 rounded-sm px-2 text-sm font-semibold text-ink underline decoration-brand/30 underline-offset-4 hover:decoration-brand">See a read-only example</button> : null}
            </div>

            {showingSample ? (
              <div className="mb-4 flex flex-col gap-3 border-l-2 border-cyan-bright bg-surface-sky px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-foreground"><strong>Read-only example.</strong> Exit it to enter your own numbers.</p>
                <button type="button" onClick={() => setShowingSample(false)} className="focus-ring min-h-11 shrink-0 rounded-sm px-2 text-sm font-semibold text-ink underline decoration-brand/30 underline-offset-4 hover:decoration-brand">Exit example</button>
              </div>
            ) : null}

            <div className="space-y-4">
              {displayOffers.map((offer, index) => (
                <CompCalculatorOfferCard
                  key={offer.id}
                  offer={offer}
                  index={index}
                  onChange={(updated) => updateOffer(offer.id, updated)}
                  onRemove={() => removeOffer(offer.id)}
                  canRemove={!showingSample && offers.length > 1}
                  readOnly={showingSample}
                />
              ))}
            </div>

            {!showingSample ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {!hasCurrentJob && offers.length < 5 ? (
                  <motion.button layout={!reduceMotion} type="button" onClick={addCurrentJob} className="focus-ring flex min-h-14 items-center justify-center gap-2 rounded-sm border border-dashed border-line px-4 py-3 text-muted-foreground transition-colors hover:border-cyan-bright hover:bg-surface-sky hover:text-foreground">
                    <Briefcase aria-hidden="true" className="size-4" weight="duotone" />
                    <span className="text-sm font-semibold">Add current job</span>
                  </motion.button>
                ) : null}
                {offers.length < 5 ? (
                  <motion.button layout={!reduceMotion} type="button" onClick={addOffer} className="focus-ring flex min-h-14 items-center justify-center gap-2 rounded-sm border border-dashed border-line px-4 py-3 text-muted-foreground transition-colors hover:border-cyan-bright hover:bg-surface-sky hover:text-foreground">
                    <Plus aria-hidden="true" className="size-4" weight="bold" />
                    <span className="text-sm font-semibold">Compare another offer</span>
                  </motion.button>
                ) : null}
              </div>
            ) : null}
          </section>

          <aside aria-label="Modeled comparison" className="space-y-6 xl:col-span-2 xl:sticky xl:top-24">
            {hasData ? (
              <CompCalculatorResults offers={displayOffers} hasInvalidVesting={hasInvalidVesting} />
            ) : (
              <div className="border-y border-line bg-background p-8 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center border border-line bg-paper-muted">
                  <TrendUp aria-hidden="true" className="size-5 text-brand" weight="duotone" />
                </div>
                <h2 className="font-display text-xl riyp-weight-560 text-foreground">Your comparison starts here</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter a base salary to see a modeled four-year breakdown.</p>
              </div>
            )}
          </aside>
        </div>

        <nav aria-label="Related offer guides" className="mt-14 flex flex-wrap gap-3 border-t border-line pt-8">
          <Button asChild variant="outline"><Link href="/resources/tech-offer-negotiation">Read the tech offer guide</Link></Button>
          <Button asChild variant="outline"><Link href="/resources/offer-negotiation">Build a counter</Link></Button>
        </nav>
      </div>
    </div>
  );
}
