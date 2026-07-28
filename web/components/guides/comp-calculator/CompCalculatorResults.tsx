"use client";

import { Info } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";
import type { OfferData } from "@/lib/compensation-model";
import {
  formatCompactCurrency,
  formatCurrency,
  getFourYearComponents,
  getFourYearTotal,
  getYearBreakdown,
  isComparableOffer,
} from "@/lib/compensation-model";
import { offerName, offerStyle } from "./presentation";

function ModelAssumptions() {
  return (
    <section aria-labelledby="model-assumptions-title" className="border-l-2 border-cyan-bright bg-surface-sky px-4 py-4">
      <h3 id="model-assumptions-title" className="text-xs font-semibold uppercase riyp-track-010 text-ink">Assumptions in this model</h3>
      <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
        <li>Target bonus is shown at 100% of target in every year.</li>
        <li>Equity uses the grant value, vesting schedule, and growth rate you enter. Liquidity and taxes are not modeled.</li>
        <li>Signing and relocation payments appear in year one. Repayment terms are not modeled.</li>
      </ul>
    </section>
  );
}

function Summary({ offers }: { offers: OfferData[] }) {
  const comparable = offers.filter(isComparableOffer);
  if (comparable.length === 0) return null;
  const sorted = [...comparable].sort((left, right) => getFourYearTotal(right) - getFourYearTotal(left));
  const highestTotal = getFourYearTotal(sorted[0]);

  return (
    <section aria-labelledby="modeled-ranking-title">
      <h3 id="modeled-ranking-title" className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Modeled four-year comparison</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">The first row has the highest modeled value under the assumptions shown here. It is not a recommendation.</p>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {sorted.map((offer, index) => {
          const total = getFourYearTotal(offer);
          const components = getFourYearComponents(offer);
          const difference = highestTotal - total;
          const style = offerStyle(offer);
          const sourceIndex = offers.findIndex((candidate) => candidate.id === offer.id);

          return (
            <article key={offer.id} className="relative py-5">
              <span aria-hidden="true" className={`absolute bottom-0 left-0 top-0 w-1 ${style.bar}`} />
              <div className="pl-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{offerName(offer, sourceIndex)}</h4>
                    {index === 0 && comparable.length > 1 ? <p className="mt-1 text-xs font-semibold uppercase riyp-track-010 text-ink">Highest modeled value</p> : null}
                  </div>
                  <div className="sm:text-right">
                    <p className={`font-display text-2xl font-semibold ${style.text}`}>{formatCurrency(total)}</p>
                    {difference > 0 ? <p className="mt-1 text-xs text-muted-foreground">{formatCompactCurrency(difference)} below the highest modeled value</p> : null}
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-4">
                  <div><dt className="text-muted-foreground">Guaranteed base</dt><dd className="mt-1 font-semibold text-foreground">{formatCurrency(components.guaranteedBase)}</dd></div>
                  <div><dt className="text-muted-foreground">Target bonus</dt><dd className="mt-1 font-semibold text-foreground">{formatCurrency(components.targetBonus)}</dd></div>
                  <div><dt className="text-muted-foreground">Modeled equity</dt><dd className="mt-1 font-semibold text-foreground">{formatCurrency(components.modeledEquity)}</dd></div>
                  <div><dt className="text-muted-foreground">One-time cash</dt><dd className="mt-1 font-semibold text-foreground">{formatCurrency(components.oneTimeCash)}</dd></div>
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function YearChart({ offers }: { offers: OfferData[] }) {
  const reduceMotion = useReducedMotion();
  const comparable = offers.filter(isComparableOffer);
  if (comparable.length === 0) return null;
  const totals = comparable.flatMap((offer) => [1, 2, 3, 4].map((year) => getYearBreakdown(offer, year).total));
  const maxValue = Math.max(...totals, 1);

  return (
    <figure className="hidden md:block" aria-labelledby="year-chart-title">
      <figcaption id="year-chart-title" className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Modeled value by year</figcaption>
      <div aria-hidden="true" className="mt-4 flex items-end gap-3">
        {[1, 2, 3, 4].map((year) => (
          <div key={year} className="flex-1 space-y-2">
            <div className="flex h-40 items-end gap-1">
              {comparable.map((offer) => {
                const breakdown = getYearBreakdown(offer, year);
                const height = (breakdown.total / maxValue) * 100;
                const baseHeight = (breakdown.base / Math.max(breakdown.total, 1)) * 100;
                const equityHeight = (breakdown.stock / Math.max(breakdown.total, 1)) * 100;
                const style = offerStyle(offer);
                return (
                  <motion.div
                    key={offer.id}
                    className="flex flex-1 flex-col-reverse overflow-hidden"
                    initial={reduceMotion ? false : { height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
                  >
                    <div className={style.wash} style={{ height: `${100 - baseHeight - equityHeight}%` }} />
                    <div className={`${style.bar} opacity-60`} style={{ height: `${equityHeight}%` }} />
                    <div className={style.bar} style={{ height: `${baseHeight}%` }} />
                  </motion.div>
                );
              })}
            </div>
            <div className="text-center text-xs tabular-nums text-muted-foreground">Year {year}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3">
        {comparable.map((offer) => {
          const sourceIndex = offers.findIndex((candidate) => candidate.id === offer.id);
          return <div key={offer.id} className="flex items-center gap-2 text-xs text-foreground"><span aria-hidden="true" className={`h-3 w-1 ${offerStyle(offer).bar}`} />{offerName(offer, sourceIndex)}</div>;
        })}
      </div>
    </figure>
  );
}

function YearBreakdown({ offers }: { offers: OfferData[] }) {
  const comparable = offers.filter(isComparableOffer);
  if (comparable.length === 0) return null;

  return (
    <section aria-labelledby="year-breakdown-title">
      <h3 id="year-breakdown-title" className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Year-by-year values</h3>
      <div className="mt-3 space-y-4 md:hidden">
        {comparable.map((offer) => {
          const sourceIndex = offers.findIndex((candidate) => candidate.id === offer.id);
          return (
            <article key={offer.id} className="border-y border-line py-4">
              <h4 className="font-semibold text-foreground">{offerName(offer, sourceIndex)}</h4>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {[1, 2, 3, 4].map((year) => <div key={year}><dt className="text-xs text-muted-foreground">Year {year}</dt><dd className="mt-1 font-semibold text-foreground">{formatCurrency(getYearBreakdown(offer, year).total)}</dd></div>)}
              </dl>
            </article>
          );
        })}
      </div>
      <table className="mt-3 hidden w-full border-collapse text-sm md:table">
        <caption className="sr-only">Modeled compensation by offer and year</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="py-3 text-left text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Year</th>
            {comparable.map((offer) => {
              const sourceIndex = offers.findIndex((candidate) => candidate.id === offer.id);
              return <th scope="col" key={offer.id} className="py-3 text-right text-xs font-semibold uppercase riyp-track-010 text-foreground">{offerName(offer, sourceIndex)}</th>;
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {[1, 2, 3, 4].map((year) => (
            <tr key={year}>
              <th scope="row" className="py-3 text-left font-normal text-muted-foreground">Year {year}</th>
              {comparable.map((offer) => <td key={offer.id} className="py-3 text-right font-medium tabular-nums text-foreground">{formatCurrency(getYearBreakdown(offer, year).total)}</td>)}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-foreground">
            <th scope="row" className="py-3 text-left font-semibold text-foreground">Four-year total</th>
            {comparable.map((offer) => <td key={offer.id} className="py-3 text-right font-display font-semibold tabular-nums text-foreground">{formatCurrency(getFourYearTotal(offer))}</td>)}
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

function BenefitsAndRiskNote() {
  return (
    <aside className="border-y border-line bg-paper-muted p-4" aria-labelledby="outside-model-title">
      <div className="flex items-start gap-3">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" weight="fill" />
        <div>
          <h3 id="outside-model-title" className="text-sm font-semibold text-foreground">Keep the decision outside the ranking</h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Health coverage, retirement matching, paid time off, severance, taxes, liquidity, role scope, and personal priorities are not included. Compare the actual terms separately.</p>
        </div>
      </div>
    </aside>
  );
}

export function CompCalculatorResults({ offers, hasInvalidVesting }: { offers: OfferData[]; hasInvalidVesting: boolean }) {
  const comparable = offers.filter(isComparableOffer);

  return (
    <div className="space-y-7 border-y border-line bg-background p-5 sm:p-6">
      {hasInvalidVesting ? <div role="alert" className="border-l-2 border-warning bg-warning/10 px-3 py-2 text-sm leading-6 text-warning-foreground">Fix each equity vesting schedule so its four years total 100%. Offers with invalid schedules are left out of the comparison.</div> : null}
      <ModelAssumptions />
      {comparable.length > 0 ? (
        <>
          <Summary offers={offers} />
          <YearChart offers={offers} />
          <YearBreakdown offers={offers} />
        </>
      ) : <p className="text-sm leading-6 text-muted-foreground">Results will appear after at least one offer has a base salary and, when equity is included, a valid vesting schedule.</p>}
      <BenefitsAndRiskNote />
    </div>
  );
}
