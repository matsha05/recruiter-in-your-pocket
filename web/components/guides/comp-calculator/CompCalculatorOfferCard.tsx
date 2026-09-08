"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CaretDown, CaretUp, X } from "@phosphor-icons/react";
import type { OfferData } from "@/lib/compensation-model";
import {
  formatCurrency,
  getFourYearTotal,
  isVestingScheduleValid,
  offerHasValidVesting,
} from "@/lib/compensation-model";
import { offerName, offerStyle } from "./presentation";
import styles from "../GuidePresentation";

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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className={`${styles.label} text-muted-foreground`}>
        {label}
      </label>
      <div className="relative">
        {prefix ? <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">{prefix}</span> : null}
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={editing ? draft : value === 0 ? "" : value.toLocaleString("en-US", { maximumFractionDigits: 10 })}
          onFocus={() => {
            setDraft(value === 0 ? "" : String(value));
            setEditing(true);
          }}
          onBlur={() => setEditing(false)}
          onChange={(event) => {
            const next = event.target.value.replaceAll(",", "").replace(/^\$/, "").trim();
            if (!/^\d*(?:\.\d*)?$/.test(next)) return;
            const amount = next === "" || next === "." ? 0 : Number(next);
            if (!Number.isFinite(amount)) return;
            setDraft(next);
            onChange(amount);
          }}
          readOnly={readOnly}
          aria-describedby={hint ? hintId : undefined}
          className={`${styles.field} px-3 py-2.5 text-lg font-normal tabular-nums placeholder:text-muted-foreground/70 ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
          placeholder="0"
        />
        {suffix ? <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">{suffix}</span> : null}
      </div>
      {hint ? <p id={hintId} className="text-data text-muted-foreground">{hint}</p> : null}
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
        className="focus-ring flex min-h-12 flex-wrap items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className={styles.label}>Vesting</span>
        <span className="font-medium text-foreground">{schedule.join(" / ")}</span>
        {open ? <CaretUp aria-hidden="true" className="size-3" weight="bold" /> : <CaretDown aria-hidden="true" className="size-3" weight="bold" />}
      </button>
      {open ? (
        <div id={panelId} className={`${styles.inset} grid grid-cols-2 gap-3 p-4 sm:grid-cols-4`}>
          {[1, 2, 3, 4].map((year, index) => {
            const inputId = `${panelId}-year-${year}`;
            return (
              <div key={year} className="space-y-1">
                <label htmlFor={inputId} className={`${styles.label} text-muted-foreground`}>Year {year} %</label>
                <input
                  id={inputId}
                  type="number"
                  value={schedule[index] ?? 0}
                  min={0}
                  max={100}
                  step="any"
                  readOnly={readOnly}
                  aria-invalid={!valid}
                  aria-describedby={!valid ? errorId : undefined}
                  onChange={(event) => {
                    const next = [...schedule];
                    next[index] = Number.parseFloat(event.target.value) || 0;
                    onChange(next);
                  }}
                  className={`${styles.field} px-2 py-2 text-center text-sm tabular-nums`}
                />
              </div>
            );
          })}
          {!valid ? <p id={errorId} role="alert" className="col-span-2 border-l-2 border-warning pl-3 text-data text-warning-foreground sm:col-span-4">The four years must total 100%. Current total: {total}%.</p> : null}
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
        className="focus-ring flex min-h-12 flex-wrap items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? <CaretUp aria-hidden="true" className="size-3.5" weight="bold" /> : <CaretDown aria-hidden="true" className="size-3.5" weight="bold" />}
        <span className="font-medium">Advanced assumptions</span>
        {hasAdvanced && !open ? <span className={`${styles.label} rounded-full bg-accent px-2.5 py-1 text-brand`}>Changed</span> : null}
      </button>
      {open ? (
        <div id={panelId} className="space-y-6 pt-4">
          <NumberInput label="Relocation payment" value={offer.relocationBonus} onChange={(value) => onChange({ ...offer, relocationBonus: value })} readOnly={readOnly} />
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor={growthId} className={`${styles.label} text-muted-foreground`}>Modeled annual equity growth</label>
              {!readOnly && offer.stockGrowth !== 0 ? <button type="button" onClick={() => onChange({ ...offer, stockGrowth: 0 })} className="focus-ring min-h-11 rounded-md px-2 text-xs font-semibold text-foreground">Reset</button> : null}
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
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-input accent-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-default disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>-20%</span>
              <output htmlFor={growthId} className="text-lg font-medium tabular-nums text-foreground">{offer.stockGrowth > 0 ? "+" : ""}{offer.stockGrowth}% per year</output>
              <span>+30%</span>
            </div>
            <p id={growthHintId} className="text-data text-muted-foreground">Applied to the entered grant value after year one. This is an assumption, not a forecast.</p>
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
      className={`${styles.sheet} relative p-5 sm:p-6`}
    >
      <span aria-hidden="true" className={`absolute left-5 top-0 h-1 w-12 rounded-b-full sm:left-6 ${style.bar}`} />
      <div className="mb-5 flex min-h-11 items-center justify-between gap-4">
        <div className={`${styles.label} flex flex-wrap items-center gap-3 text-muted-foreground`}>
          <span>{offer.isCurrentJob ? "Current job" : `Offer ${String(index + 1).padStart(2, "0")}`}</span>
          {readOnly ? <span className="rounded-full bg-accent px-2.5 py-1 text-brand">Example</span> : null}
        </div>
        {canRemove ? (
          <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
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
        className={`${styles.field} mb-5 px-3 py-2.5 text-xl font-medium placeholder:text-muted-foreground`}
        placeholder={offer.isCurrentJob ? "Current job" : "Company or role"}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <NumberInput label="Annual base salary" value={offer.baseSalary} onChange={(value) => onChange({ ...offer, baseSalary: value })} readOnly={readOnly} />
        <NumberInput label="Annual target bonus" value={offer.bonusPercent} onChange={(value) => onChange({ ...offer, bonusPercent: value })} prefix="" suffix="%" hint="Modeled at 100% of target each year" readOnly={readOnly} />
        <NumberInput label="Equity grant value" value={offer.stockTotal} onChange={(value) => onChange({ ...offer, stockTotal: value })} hint="Total grant value across the four-year schedule" readOnly={readOnly} />
        <NumberInput label="Signing payment" value={offer.signingBonus} onChange={(value) => onChange({ ...offer, signingBonus: value })} hint="Included in year one; check repayment terms" readOnly={readOnly} />
      </div>

      <VestingEditor schedule={offer.vestingSchedule} onChange={(schedule) => onChange({ ...offer, vestingSchedule: schedule })} readOnly={readOnly} />
      <AdvancedOptions offer={offer} onChange={onChange} readOnly={readOnly} />

      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-baseline sm:justify-between">
        <span className={`${styles.label} text-muted-foreground`}>Modeled four-year value</span>
        <span className={`text-report-title tabular-nums ${style.text}`}>{valid ? formatCurrency(total) : "Fix vesting"}</span>
      </div>
    </motion.section>
  );
}
