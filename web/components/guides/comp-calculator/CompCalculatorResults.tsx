"use client";

import type { OfferData } from "@/lib/compensation-model";
import {
  formatCompactCurrency,
  formatCurrency,
  getFourYearComponents,
  getFourYearTotal,
  getYearBreakdown,
  isComparableOffer,
} from "@/lib/compensation-model";
import { COMPONENTS, type ComponentKey, offerName } from "./presentation";
import styles from "../GuidePresentation";
import motionStyles from "./CompCalculatorMotion.module.css";

const YEARS = [1, 2, 3, 4] as const;

type NamedOffer = { offer: OfferData; name: string };

function yearParts(offer: OfferData, year: number): Record<ComponentKey, number> & { total: number } {
  const breakdown = getYearBreakdown(offer, year);
  return {
    base: breakdown.base,
    stock: breakdown.stock,
    bonus: breakdown.bonus,
    oneTime: breakdown.signing + breakdown.relocation,
    total: breakdown.total,
  };
}

function fourYearParts(offer: OfferData): Record<ComponentKey, number> {
  const components = getFourYearComponents(offer);
  return {
    base: components.guaranteedBase,
    stock: components.modeledEquity,
    bonus: components.targetBonus,
    oneTime: components.oneTimeCash,
  };
}

/** The answer first: one total, or a ranked list when there is something to compare. */
function Answer({ named }: { named: NamedOffer[] }) {
  if (named.length === 1) {
    const { offer } = named[0];
    const total = getFourYearTotal(offer);
    const parts = fourYearParts(offer);
    return (
      <section aria-labelledby="four-year-answer">
        <h3 id="four-year-answer" className={`${styles.label} text-muted-foreground`}>Modeled four-year total</h3>
        <p className="mt-2 font-display text-title tabular-nums text-foreground">{formatCurrency(total)}</p>
        <p className="mt-2 text-sm text-muted-foreground">About {formatCompactCurrency(total / 4)} a year, before tax.</p>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {COMPONENTS.map((component) => (
            <div key={component.key}>
              <dt className="flex items-center gap-2 text-muted-foreground"><span aria-hidden="true" className={`size-2.5 rounded-full ${component.swatch}`} />{component.label}</dt>
              <dd className="mt-1 font-medium tabular-nums text-foreground">{formatCurrency(parts[component.key])}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  const ranked = [...named].sort((left, right) => getFourYearTotal(right.offer) - getFourYearTotal(left.offer));
  const highest = getFourYearTotal(ranked[0].offer);
  return (
    <section aria-labelledby="four-year-answer">
      <h3 id="four-year-answer" className={`${styles.label} text-muted-foreground`}>Modeled four-year totals</h3>
      <ol className="mt-3 divide-y divide-line border-y border-line">
        {ranked.map(({ offer, name }, index) => {
          const total = getFourYearTotal(offer);
          const gap = highest - total;
          return (
            <li key={offer.id} className="flex items-baseline justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {index === 0 ? "Highest modeled value" : `${formatCompactCurrency(gap)} less over four years`}
                </p>
              </div>
              <p className={`shrink-0 tabular-nums text-foreground ${index === 0 ? "text-report-title" : "text-lg font-medium"}`}>{formatCurrency(total)}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-sm text-muted-foreground">Ranked by modeled value only. It is not a recommendation.</p>
    </section>
  );
}

/** One row of four stacked bars per offer, on a shared scale, colored by the kind of money. */
function YearChart({ named }: { named: NamedOffer[] }) {
  const maxYear = Math.max(1, ...named.flatMap(({ offer }) => YEARS.map((year) => yearParts(offer, year).total)));
  const present = COMPONENTS.filter((component) =>
    named.some(({ offer }) => YEARS.some((year) => yearParts(offer, year)[component.key] > 0))
  );

  return (
    <figure aria-labelledby="year-chart-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <figcaption id="year-chart-title" className={`${styles.label} text-muted-foreground`}>Each year, by kind of pay</figcaption>
        {present.length > 1 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground" aria-label="Legend">
            {present.map((component) => (
              <li key={component.key} className="flex items-center gap-1.5"><span aria-hidden="true" className={`size-2.5 rounded-full ${component.swatch}`} />{component.label}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {/* The table below is the accessible view of the same numbers. */}
      <div aria-hidden="true" className="mt-4 space-y-6">
        {named.map(({ offer, name }) => (
          <div key={offer.id}>
            {named.length > 1 ? <p className="mb-2 truncate text-sm font-medium text-foreground">{name}</p> : null}
            <div className="grid grid-cols-4 gap-3 border-b border-line">
              {YEARS.map((year) => {
                const parts = yearParts(offer, year);
                const share = parts.total / maxYear;
                return (
                  <div key={year} className="group relative flex h-36 flex-col items-center justify-end">
                    <span className="mb-1.5 text-sm tabular-nums text-foreground">{formatCompactCurrency(parts.total)}</span>
                    <div
                      className={`flex w-full max-w-11 flex-col-reverse gap-[2px] overflow-hidden rounded-t-[4px] ${motionStyles.yearBar}`}
                      style={{ height: `calc((100% - 1.75rem) * ${share})` }}
                    >
                      {COMPONENTS.map((component) => parts[component.key] > 0 ? (
                        <div key={component.key} className={`${component.swatch} shrink-0`} style={{ flexGrow: parts[component.key], flexBasis: 0 }} />
                      ) : null)}
                    </div>
                    <div className={`pointer-events-none invisible absolute bottom-full z-10 mb-1 hidden w-52 rounded-lg border border-line bg-card p-3 text-data opacity-0 shadow-sm transition-opacity duration-fast group-hover:visible group-hover:opacity-100 md:block ${year === 1 ? "left-0" : year === 4 ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
                      <p className="font-medium text-foreground">Year {year}</p>
                      <dl className="mt-2 space-y-1">
                        {COMPONENTS.filter((component) => parts[component.key] > 0).map((component) => (
                          <div key={component.key} className="flex items-center justify-between gap-3">
                            <dt className="flex items-center gap-1.5 text-muted-foreground"><span className={`size-2 rounded-full ${component.swatch}`} />{component.label}</dt>
                            <dd className="tabular-nums text-foreground">{formatCompactCurrency(parts[component.key])}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-3 text-center text-sm text-muted-foreground">
              {YEARS.map((year) => <span key={year}>Year {year}</span>)}
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}

function YearTable({ named }: { named: NamedOffer[] }) {
  const single = named.length === 1;
  const cell = "whitespace-nowrap px-2 py-2.5 text-right tabular-nums";
  return (
    <section aria-labelledby="year-breakdown-title">
      <h3 id="year-breakdown-title" className={`${styles.label} text-muted-foreground`}>Year by year</h3>
      {/* Phones get a list that fits; wider screens get the full table. */}
      <dl className="mt-3 divide-y divide-line border-y border-line sm:hidden">
        {YEARS.map((year) => (
          <div key={year} className="py-2.5">
            <dt className="text-data text-muted-foreground">Year {year}</dt>
            <dd className="mt-1 space-y-0.5">
              {named.map(({ offer, name }) => (
                <p key={offer.id} className="flex justify-between gap-3 text-sm">
                  {single ? null : <span className="truncate text-muted-foreground">{name}</span>}
                  <span className="font-medium tabular-nums text-foreground">{formatCurrency(yearParts(offer, year).total)}</span>
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-data">
          <caption className="sr-only">Modeled compensation by year</caption>
          <thead>
            <tr className="border-b border-line text-muted-foreground">
              <th scope="col" className="px-2 py-2.5 text-left font-medium">Year</th>
              {single
                ? <>{COMPONENTS.map((component) => <th key={component.key} scope="col" className={`${cell} font-medium`}>{component.label}</th>)}<th scope="col" className={`${cell} font-medium text-foreground`}>Total</th></>
                : named.map(({ offer, name }) => <th key={offer.id} scope="col" className={`${cell} max-w-[8rem] truncate font-medium text-foreground`}>{name}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {YEARS.map((year) => (
              <tr key={year}>
                <th scope="row" className="px-2 py-2.5 text-left font-normal text-muted-foreground">{year}</th>
                {single
                  ? <>{COMPONENTS.map((component) => <td key={component.key} className={`${cell} text-muted-foreground`}>{formatCurrency(yearParts(named[0].offer, year)[component.key])}</td>)}<td className={`${cell} font-medium text-foreground`}>{formatCurrency(yearParts(named[0].offer, year).total)}</td></>
                  : named.map(({ offer }) => <td key={offer.id} className={`${cell} font-medium text-foreground`}>{formatCurrency(yearParts(offer, year).total)}</td>)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-foreground">
              <th scope="row" className="px-2 py-2.5 text-left font-semibold text-foreground">4 yrs</th>
              {single
                ? <>{COMPONENTS.map((component) => <td key={component.key} className={`${cell} text-foreground`}>{formatCurrency(fourYearParts(named[0].offer)[component.key])}</td>)}<td className={`${cell} font-semibold text-foreground`}>{formatCurrency(getFourYearTotal(named[0].offer))}</td></>
                : named.map(({ offer }) => <td key={offer.id} className={`${cell} font-semibold text-foreground`}>{formatCurrency(getFourYearTotal(offer))}</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

/** What the model assumes and leaves out, after the answer instead of before it. */
function ModelNotes() {
  return (
    <section aria-labelledby="model-notes-title" className="border-t border-line pt-5">
      <h3 id="model-notes-title" className="text-sm font-semibold text-foreground">How this is modeled</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>Base salary holds steady for four full years. Raises, unpaid leave, and leaving early aren&apos;t modeled.</li>
        <li>Bonus is shown at 100% of target every year.</li>
        <li>Equity uses the grant value, vesting schedule, and growth rate you enter. Exercise costs, liquidity, and taxes aren&apos;t modeled.</li>
        <li>Signing and relocation payments land in year one. Repayment terms aren&apos;t modeled.</li>
        <li>Health coverage, retirement matching, paid time off, severance, role scope, and your own priorities aren&apos;t included. Compare those terms separately.</li>
      </ul>
    </section>
  );
}

export function CompCalculatorResults({ offers, hasInvalidVesting }: { offers: OfferData[]; hasInvalidVesting: boolean }) {
  const named: NamedOffer[] = offers
    .map((offer, index) => ({ offer, name: offerName(offer, index) }))
    .filter(({ offer }) => isComparableOffer(offer));

  return (
    <div className={`${styles.sheet} space-y-7 p-5 sm:p-6`}>
      {hasInvalidVesting ? <div role="alert" className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-3 text-sm text-warning-foreground">Fix each equity vesting schedule so its four years total 100%. Offers with invalid schedules are left out of the comparison.</div> : null}
      {named.length > 0 ? (
        <>
          <Answer named={named} />
          <YearChart named={named} />
          <YearTable named={named} />
        </>
      ) : <p className="text-sm text-muted-foreground">Results will appear after at least one offer has a base salary and, when equity is included, a valid vesting schedule.</p>}
      <ModelNotes />
    </div>
  );
}
