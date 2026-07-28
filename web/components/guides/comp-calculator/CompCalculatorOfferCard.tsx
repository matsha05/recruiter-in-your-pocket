"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CaretDown, CaretUp, X } from "@phosphor-icons/react";
import type { OfferData } from "@/lib/compensation-model";
import {
  formatCurrency,
  getFourYearTotal,
  isVestingScheduleValid,
  offerHasValidVesting,
} from "@/lib/compensation-model";
import { offerName, offerStyle } from "./presentation";

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  readOnly?: boolean;
};

function NumberInput({
  label,
  value,
  onChange,
  prefix = "$",
  suffix,
  hint,
  readOnly = false,
}: NumberInputProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {prefix ? <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">{prefix}</span> : null}
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString()}
          onChange={(event) => onChange(Number.parseInt(event.target.value.replace(/[^0-9]/g, ""), 10) || 0)}
          readOnly={readOnly}
          aria-describedby={hint ? hintId : undefined}
          className={`min-h-12 w-full rounded-sm border border-line bg-background px-3 py-2.5 font-display text-xl font-medium text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 read-only:cursor-default read-only:bg-paper-muted read-only:text-muted-foreground ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
          placeholder="0"
        />
        {suffix ? <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">{suffix}</span> : null}
      </div>
      {hint ? <p id={hintId} className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function VestingEditor({ schedule, onChange, readOnly }: {
  schedule: number[];
  onChange: (schedule: number[]) => void;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const errorId = `${panelId}-error`;
  const total = schedule.reduce((sum, value) => sum + value, 0);
  const valid = isVestingScheduleValid(schedule);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="focus-ring flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="text-xs font-semibold uppercase riyp-track-010">Vesting</span>
        <span className="font-medium text-foreground">{schedule.join(" / ")}</span>
        {open ? <CaretUp aria-hidden="true" className="size-3" weight="bold" /> : <CaretDown aria-hidden="true" className="size-3" weight="bold" />}
      </button>
      {open ? (
        <div id={panelId} className="grid grid-cols-2 gap-3 border-y border-line bg-paper-muted p-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((year, index) => {
            const inputId = `${panelId}-year-${year}`;
            return (
              <div key={year} className="space-y-1">
                <label htmlFor={inputId} className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Year {year} %</label>
                <input
                  id={inputId}
                  type="number"
                  value={schedule[index] ?? 0}
                  min={0}
                  max={100}
                  readOnly={readOnly}
                  aria-invalid={!valid}
                  aria-describedby={!valid ? errorId : undefined}
                  onChange={(event) => {
                    const next = [...schedule];
                    next[index] = Number.parseInt(event.target.value, 10) || 0;
                    onChange(next);
                  }}
                  className="min-h-11 w-full rounded-sm border border-line bg-background px-2 py-2 text-center text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 read-only:cursor-default read-only:bg-paper-muted"
                />
              </div>
            );
          })}
          {!valid ? <p id={errorId} role="alert" className="col-span-2 border-l-2 border-warning pl-3 text-xs leading-5 text-warning-foreground sm:col-span-4">The four years must total 100%. Current total: {total}%.</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function AdvancedOptions({ offer, onChange, readOnly }: {
  offer: OfferData;
  onChange: (offer: OfferData) => void;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const relocationId = `${panelId}-relocation`;
  const growthId = `${panelId}-growth`;
  const growthHintId = `${growthId}-hint`;
  const hasAdvanced = offer.relocationBonus > 0 || offer.stockGrowth !== 0;

  return (
    <div className="mt-4 border-t border-line pt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="focus-ring flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? <CaretUp aria-hidden="true" className="size-3.5" weight="bold" /> : <CaretDown aria-hidden="true" className="size-3.5" weight="bold" />}
        <span className="font-medium">Advanced assumptions</span>
        {hasAdvanced && !open ? <span className="border-l-2 border-cyan-bright pl-2 text-xs font-semibold uppercase riyp-track-010 text-ink">Changed</span> : null}
      </button>
      {open ? (
        <div id={panelId} className="space-y-6 pt-4">
          <div className="space-y-1.5">
            <label htmlFor={relocationId} className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Relocation payment</label>
            <div className="relative">
              <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                id={relocationId}
                type="text"
                inputMode="numeric"
                value={offer.relocationBonus === 0 ? "" : offer.relocationBonus.toLocaleString()}
                readOnly={readOnly}
                onChange={(event) => onChange({ ...offer, relocationBonus: Number.parseInt(event.target.value.replace(/[^0-9]/g, ""), 10) || 0 })}
                className="min-h-11 w-full rounded-sm border border-line bg-background py-2 pl-7 pr-3 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 read-only:cursor-default read-only:bg-paper-muted"
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor={growthId} className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Modeled annual equity growth</label>
              {!readOnly && offer.stockGrowth !== 0 ? <button type="button" onClick={() => onChange({ ...offer, stockGrowth: 0 })} className="focus-ring min-h-11 rounded-sm px-2 text-xs font-semibold text-ink">Reset</button> : null}
            </div>
            <input
              id={growthId}
              type="range"
              min="-20"
              max="30"
              value={offer.stockGrowth}
              disabled={readOnly}
              aria-describedby={growthHintId}
              onChange={(event) => onChange({ ...offer, stockGrowth: Number.parseInt(event.target.value, 10) })}
              className="h-2 w-full cursor-pointer appearance-none bg-line accent-brand disabled:cursor-default disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>-20%</span>
              <output htmlFor={growthId} className="font-display text-lg font-semibold text-foreground">{offer.stockGrowth > 0 ? "+" : ""}{offer.stockGrowth}% per year</output>
              <span>+30%</span>
            </div>
            <p id={growthHintId} className="text-xs leading-5 text-muted-foreground">Applied to the entered grant value after year one. This is an assumption, not a forecast.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CompCalculatorOfferCard({ offer, index, onChange, onRemove, canRemove, readOnly }: {
  offer: OfferData;
  index: number;
  onChange: (offer: OfferData) => void;
  onRemove: () => void;
  canRemove: boolean;
  readOnly: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const style = offerStyle(offer);
  const name = offerName(offer, index);
  const total = getFourYearTotal(offer);
  const valid = offerHasValidVesting(offer);

  return (
    <motion.section
      layout={!reduceMotion}
      initial={reduceMotion ? false : { y: 8 }}
      animate={{ y: 0 }}
      aria-label={`${name} details`}
      className="relative border border-line bg-background p-5 sm:p-6"
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${style.bar}`} />
      <div className="mb-5 flex min-h-11 items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">
          <span>{offer.isCurrentJob ? "Current job" : `Offer ${String(index + 1).padStart(2, "0")}`}</span>
          {readOnly ? <span className="border-l-2 border-cyan-bright pl-3 text-ink">Example</span> : null}
        </div>
        {canRemove ? (
          <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="focus-ring inline-flex size-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-paper-muted hover:text-foreground">
            <X aria-hidden="true" className="size-4" weight="bold" />
          </button>
        ) : null}
      </div>

      <label htmlFor={`${offer.id}-company`} className="sr-only">Company or role label</label>
      <input
        id={`${offer.id}-company`}
        type="text"
        value={offer.companyName}
        onChange={(event) => onChange({ ...offer, companyName: event.target.value })}
        readOnly={readOnly}
        className="mb-5 min-h-12 w-full rounded-sm border-b border-line bg-transparent font-display text-xl font-medium text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none read-only:cursor-default read-only:text-muted-foreground"
        placeholder={offer.isCurrentJob ? "Current job" : "Company or role"}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <NumberInput label="Guaranteed annual base" value={offer.baseSalary} onChange={(value) => onChange({ ...offer, baseSalary: value })} readOnly={readOnly} />
        <NumberInput label="Annual target bonus" value={offer.bonusPercent} onChange={(value) => onChange({ ...offer, bonusPercent: value })} prefix="" suffix="%" hint="Modeled at 100% of target each year" readOnly={readOnly} />
        <NumberInput label="Equity grant value" value={offer.stockTotal} onChange={(value) => onChange({ ...offer, stockTotal: value })} hint="Value entered before growth assumptions" readOnly={readOnly} />
        <NumberInput label="Signing payment" value={offer.signingBonus} onChange={(value) => onChange({ ...offer, signingBonus: value })} hint="Included in year one; check repayment terms" readOnly={readOnly} />
      </div>

      <VestingEditor schedule={offer.vestingSchedule} onChange={(schedule) => onChange({ ...offer, vestingSchedule: schedule })} readOnly={readOnly} />
      <AdvancedOptions offer={offer} onChange={onChange} readOnly={readOnly} />

      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Modeled four-year value</span>
        <span className={`font-display text-2xl font-semibold ${style.text}`}>{valid ? formatCurrency(total) : "Fix vesting"}</span>
      </div>
    </motion.section>
  );
}
