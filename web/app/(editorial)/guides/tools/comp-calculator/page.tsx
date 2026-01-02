"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
// SiteHeader removed — layout handles navigation
import {
    Plus, X, ChevronRight, ChevronDown, ChevronUp,
    TrendingUp, Info, ExternalLink, Briefcase
} from "lucide-react";

/**
 * Premium Comp Calculator v3
 * 
 * Fixes:
 * - "See example" instead of "View Demo"
 * - Current Job optional via button (not forced)
 * - Benefits disclaimer cleaner
 */

interface OfferData {
    id: string;
    companyName: string;
    baseSalary: number;
    bonusPercent: number;
    stockTotal: number;
    vestingSchedule: number[];
    signingBonus: number;
    relocationBonus: number;
    stockGrowth: number;
    isCurrentJob: boolean;
}

interface YearBreakdown {
    base: number;
    stock: number;
    bonus: number;
    signing: number;
    relocation: number;
    total: number;
}

const OFFER_COLORS = [
    { primary: "#2563EB", light: "#93C5FD", name: "Offer A" },
    { primary: "#7C3AED", light: "#C4B5FD", name: "Offer B" },
    { primary: "#0D9488", light: "#5EEAD4", name: "Baseline" },
    { primary: "#059669", light: "#6EE7B7", name: "Offer C" },
    { primary: "#DC2626", light: "#FCA5A5", name: "Offer D" },
];

const DEFAULT_VESTING = [25, 25, 25, 25];

// Sample data for "See example"
const SAMPLE_OFFERS: OfferData[] = [
    {
        id: "sample-current",
        companyName: "Current Job",
        baseSalary: 180000,
        bonusPercent: 15,
        stockTotal: 120000,
        vestingSchedule: [25, 25, 25, 25],
        signingBonus: 0,
        relocationBonus: 0,
        stockGrowth: 0,
        isCurrentJob: true,
    },
    {
        id: "sample-a",
        companyName: "Company A",
        baseSalary: 200000,
        bonusPercent: 15,
        stockTotal: 400000,
        vestingSchedule: [25, 25, 25, 25],
        signingBonus: 50000,
        relocationBonus: 0,
        stockGrowth: 0,
        isCurrentJob: false,
    },
    {
        id: "sample-b",
        companyName: "Company B",
        baseSalary: 220000,
        bonusPercent: 20,
        stockTotal: 200000,
        vestingSchedule: [5, 15, 40, 40],
        signingBonus: 30000,
        relocationBonus: 15000,
        stockGrowth: 0,
        isCurrentJob: false,
    }
];

function createEmptyOffer(index: number, isCurrentJob = false): OfferData {
    return {
        id: `offer-${Date.now()}-${index}`,
        companyName: "",
        baseSalary: 0,
        bonusPercent: 0,
        stockTotal: 0,
        vestingSchedule: [...DEFAULT_VESTING],
        signingBonus: 0,
        relocationBonus: 0,
        stockGrowth: 0,
        isCurrentJob,
    };
}

function getYearBreakdown(offer: OfferData, year: number): YearBreakdown {
    const base = offer.baseSalary;
    const bonus = offer.baseSalary * (offer.bonusPercent / 100);
    const stockPercent = offer.vestingSchedule[year - 1] || 25;
    const growthMultiplier = Math.pow(1 + offer.stockGrowth / 100, year - 1);
    const stock = offer.stockTotal * (stockPercent / 100) * growthMultiplier;
    const signing = year === 1 ? offer.signingBonus : 0;
    const relocation = year === 1 ? offer.relocationBonus : 0;
    return { base, stock, bonus, signing, relocation, total: base + stock + bonus + signing + relocation };
}

function getFourYearTotal(offer: OfferData): number {
    return [1, 2, 3, 4].reduce((sum, year) => sum + getYearBreakdown(offer, year).total, 0);
}

function formatCurrency(value: number): string {
    if (value === 0) return "$0";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatCompact(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return formatCurrency(value);
}

// Number input
function BigNumberInput({ label, value, onChange, prefix = "$", suffix, hint }: {
    label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</label>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{prefix}</span>}
                <input
                    type="text"
                    inputMode="numeric"
                    value={value === 0 ? "" : value.toLocaleString()}
                    onChange={(e) => onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                    className={`w-full px-3 py-3 bg-background border border-border/60 rounded-lg text-foreground text-xl font-display font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
                    placeholder="0"
                />
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{suffix}</span>}
            </div>
            {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
        </div>
    );
}

// Vesting editor
function VestingEditor({ schedule, onChange }: { schedule: number[]; onChange: (s: number[]) => void }) {
    const [open, setOpen] = useState(false);
    const total = schedule.reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-2">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-widest">Vesting:</span>
                <span className="font-medium text-foreground">{schedule.join("/")}</span>
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg">
                            {[1, 2, 3, 4].map((year, i) => (
                                <div key={year} className="space-y-1">
                                    <label className="text-[9px] font-mono uppercase text-muted-foreground">Y{year} %</label>
                                    <input
                                        type="number"
                                        value={schedule[i] || 0}
                                        onChange={(e) => { const s = [...schedule]; s[i] = parseInt(e.target.value) || 0; onChange(s); }}
                                        className="w-full px-2 py-1.5 bg-background border border-border/50 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-brand/30"
                                    />
                                </div>
                            ))}
                            {total !== 100 && <div className="col-span-4 text-xs text-amber-600 mt-1">Must equal 100% (currently {total}%)</div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Advanced options - sleeker slider-based design
function AdvancedOptions({ offer, onChange }: { offer: OfferData; onChange: (o: OfferData) => void }) {
    const [open, setOpen] = useState(false);
    const hasAdvanced = offer.relocationBonus > 0 || offer.stockGrowth > 0;

    return (
        <div className="border-t border-border/20 pt-4 mt-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span className="font-medium">Advanced</span>
                {hasAdvanced && !open && (
                    <span className="text-[10px] text-brand bg-brand/10 px-1.5 py-0.5 rounded">Active</span>
                )}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 space-y-5">
                            {/* Relocation */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Relocation bonus</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={offer.relocationBonus === 0 ? "" : offer.relocationBonus.toLocaleString()}
                                        onChange={(e) => onChange({ ...offer, relocationBonus: parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0 })}
                                        className="w-full pl-7 pr-3 py-2.5 bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Stock Growth Slider */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground">Expected stock growth</label>
                                    {offer.stockGrowth !== 0 && (
                                        <button
                                            onClick={() => onChange({ ...offer, stockGrowth: 0 })}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="-20"
                                        max="30"
                                        value={offer.stockGrowth}
                                        onChange={(e) => onChange({ ...offer, stockGrowth: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-brand [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-sm"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">-20%</span>
                                        <span className={`text-lg font-display font-semibold ${offer.stockGrowth > 0 ? 'text-success' : offer.stockGrowth < 0 ? 'text-destructive' : 'text-foreground'}`}>
                                            {offer.stockGrowth > 0 ? '+' : ''}{offer.stockGrowth}% / yr
                                        </span>
                                        <span className="text-xs text-muted-foreground">+30%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Simulates annual stock price changes. Affects equity value in years 2-4.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Offer card
function OfferInputCard({ offer, onChange, onRemove, colorIndex, canRemove }: {
    offer: OfferData; onChange: (o: OfferData) => void; onRemove: () => void; colorIndex: number; canRemove: boolean;
}) {
    const color = OFFER_COLORS[colorIndex % OFFER_COLORS.length];
    const fourYearTotal = getFourYearTotal(offer);

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="p-5 rounded-xl border border-border/40 bg-white dark:bg-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color.primary }} />
                    {offer.isCurrentJob && <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">Baseline</span>}
                </div>
                {canRemove && <button onClick={onRemove} className="text-muted-foreground/50 hover:text-destructive transition-colors p-1"><X className="w-4 h-4" /></button>}
            </div>
            <input
                type="text" value={offer.companyName}
                onChange={(e) => onChange({ ...offer, companyName: e.target.value })}
                className="w-full bg-transparent border-none text-lg font-display font-medium text-foreground focus:outline-none placeholder:text-muted-foreground/40 mb-4"
                placeholder={offer.isCurrentJob ? "Current Job" : "Company Name"}
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
                <BigNumberInput label="Base Salary" value={offer.baseSalary} onChange={(v) => onChange({ ...offer, baseSalary: v })} />
                <BigNumberInput label="Bonus %" value={offer.bonusPercent} onChange={(v) => onChange({ ...offer, bonusPercent: v })} prefix="" suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <BigNumberInput label="Total Equity (4yr)" value={offer.stockTotal} onChange={(v) => onChange({ ...offer, stockTotal: v })} hint="Total grant value" />
                <BigNumberInput label="Signing Bonus" value={offer.signingBonus} onChange={(v) => onChange({ ...offer, signingBonus: v })} />
            </div>
            <VestingEditor schedule={offer.vestingSchedule} onChange={(s) => onChange({ ...offer, vestingSchedule: s })} />
            <AdvancedOptions offer={offer} onChange={onChange} />
            <div className="mt-4 pt-4 border-t border-border/20">
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">4-Year Total</span>
                    <span className="text-2xl font-display font-semibold" style={{ color: color.primary }}>{formatCurrency(fourYearTotal)}</span>
                </div>
            </div>
        </motion.div>
    );
}

// Chart
function StackedBarChart({ offers }: { offers: OfferData[] }) {
    const validOffers = offers.filter(o => o.baseSalary > 0);
    if (validOffers.length === 0) return null;
    const allYearTotals = validOffers.flatMap(o => [1, 2, 3, 4].map(year => getYearBreakdown(o, year).total));
    const maxValue = Math.max(...allYearTotals, 1);

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Year-by-Year Breakdown</h3>
            <div className="flex items-end gap-2">
                {[1, 2, 3, 4].map((year) => (
                    <div key={year} className="flex-1 space-y-2">
                        <div className="flex gap-1 items-end h-40">
                            {validOffers.map((offer, i) => {
                                const breakdown = getYearBreakdown(offer, year);
                                const height = (breakdown.total / maxValue) * 100;
                                const color = OFFER_COLORS[i % OFFER_COLORS.length];
                                const baseH = (breakdown.base / Math.max(breakdown.total, 1)) * 100;
                                const stockH = (breakdown.stock / Math.max(breakdown.total, 1)) * 100;
                                return (
                                    <motion.div key={offer.id} className="flex-1 rounded-t-sm overflow-hidden flex flex-col-reverse cursor-pointer"
                                        style={{ height: `${height}%` }} initial={{ height: 0 }} animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.4, ease: "easeOut" }} title={`${offer.companyName || `Offer ${i + 1}`}: ${formatCurrency(breakdown.total)}`}>
                                        <div style={{ height: `${100 - baseH - stockH}%`, backgroundColor: color.light }} />
                                        <div style={{ height: `${stockH}%`, backgroundColor: color.primary, opacity: 0.6 }} />
                                        <div style={{ height: `${baseH}%`, backgroundColor: color.primary }} />
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="text-center text-xs font-mono text-muted-foreground">Y{year}</div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/20">
                {validOffers.map((offer, i) => (
                    <div key={offer.id} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: OFFER_COLORS[i % OFFER_COLORS.length].primary }} />
                        <span className="text-sm text-foreground">{offer.companyName || `Offer ${i + 1}`}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Data table
function DataTable({ offers }: { offers: OfferData[] }) {
    const validOffers = offers.filter(o => o.baseSalary > 0);
    if (validOffers.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Detailed Breakdown</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/30">
                            <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Year</th>
                            {validOffers.map((offer, i) => (
                                <th key={offer.id} className="text-right py-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: OFFER_COLORS[i].primary }}>
                                    {offer.companyName || `Offer ${i + 1}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4].map(year => (
                            <tr key={year} className="border-b border-border/10">
                                <td className="py-2 font-mono text-muted-foreground">Y{year}</td>
                                {validOffers.map((offer) => <td key={offer.id} className="text-right py-2 font-display font-medium">{formatCurrency(getYearBreakdown(offer, year).total)}</td>)}
                            </tr>
                        ))}
                        <tr className="font-semibold">
                            <td className="py-2 font-mono text-muted-foreground">Total</td>
                            {validOffers.map((offer, i) => <td key={offer.id} className="text-right py-2 font-display" style={{ color: OFFER_COLORS[i].primary }}>{formatCurrency(getFourYearTotal(offer))}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Clean benefits disclaimer
function BenefitsNote() {
    return (
        <div className="p-4 rounded-lg bg-muted/30 border border-border/20">
            <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium">Benefits add $10-30K+ in hidden value</p>
                    <p className="text-xs text-muted-foreground">
                        Health insurance, 401k matching, PTO, meals, and other perks aren't captured here but matter significantly.
                    </p>
                    <a href="https://www.levels.fyi/benefits/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline">
                        Compare benefits at levels.fyi <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}

// Summary ranking
function SummaryTable({ offers }: { offers: OfferData[] }) {
    const validOffers = offers.filter(o => o.baseSalary > 0);
    if (validOffers.length === 0) return null;
    const sorted = [...validOffers].sort((a, b) => getFourYearTotal(b) - getFourYearTotal(a));
    const maxTotal = getFourYearTotal(sorted[0]);

    return (
        <div className="space-y-3">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">4-Year Ranking</h3>
            <div className="space-y-2">
                {sorted.map((offer, i) => {
                    const total = getFourYearTotal(offer);
                    const color = OFFER_COLORS[offers.indexOf(offer) % OFFER_COLORS.length];
                    const percentage = (total / maxTotal) * 100;
                    const isWinner = i === 0;
                    const diff = maxTotal - total;
                    return (
                        <div key={offer.id} className="relative">
                            <div className="absolute inset-0 rounded-lg opacity-10" style={{ width: `${percentage}%`, backgroundColor: color.primary }} />
                            <div className="relative flex items-center justify-between p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color.primary }} />
                                    <span className="font-medium text-foreground">{offer.companyName || `Offer ${offers.indexOf(offer) + 1}`}</span>
                                    {offer.isCurrentJob && <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">Current</span>}
                                    {isWinner && validOffers.length > 1 && <span className="text-[9px] font-mono uppercase tracking-widest text-white bg-brand px-2 py-0.5 rounded">Best</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                    {!isWinner && diff > 0 && <span className="text-sm text-muted-foreground">-{formatCompact(diff)}</span>}
                                    <span className="text-lg font-display font-semibold" style={{ color: color.primary }}>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function CompCalculatorPage() {
    const [offers, setOffers] = useState<OfferData[]>([createEmptyOffer(0)]);
    const [showingSample, setShowingSample] = useState(false);

    const displayOffers = showingSample ? SAMPLE_OFFERS : offers;
    const hasCurrentJob = offers.some(o => o.isCurrentJob);

    const updateOffer = (id: string, updated: OfferData) => {
        if (showingSample) return;
        setOffers(offers.map(o => o.id === id ? updated : o));
    };

    const removeOffer = (id: string) => {
        if (showingSample || offers.length <= 1) return;
        setOffers(offers.filter(o => o.id !== id));
    };

    const addOffer = () => {
        if (showingSample || offers.length >= 5) return;
        setOffers([...offers, createEmptyOffer(offers.length)]);
    };

    const addCurrentJob = () => {
        if (showingSample || hasCurrentJob) return;
        const currentJobOffer = createEmptyOffer(offers.length, true);
        setOffers([currentJobOffer, ...offers]);
    };

    const loadSample = () => setShowingSample(true);
    const clearSample = () => setShowingSample(false);

    const hasData = displayOffers.some(o => o.baseSalary > 0);

    return (
        <>

            <div className="border-b border-border/20 bg-background">
                <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                        <span className="text-foreground font-medium">Offer Calculator</span>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center rounded-sm border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-semibold text-amber-600">Tool</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-foreground leading-tight mb-2">Total Compensation Calculator</h1>
                    <p className="text-muted-foreground max-w-xl">Compare offers side-by-side with custom vesting, stock growth simulation, and 4-year projections.</p>
                </header>

                <div className="grid lg:grid-cols-[1fr,420px] gap-6">
                    {/* Left: Offer Cards */}
                    <div className="space-y-4">
                        {showingSample && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-brand/5 border border-brand/20">
                                <span className="text-sm text-brand font-medium">Viewing sample data</span>
                                <button onClick={clearSample} className="text-sm text-brand hover:underline">Clear & start fresh</button>
                            </div>
                        )}

                        <AnimatePresence mode="popLayout">
                            {displayOffers.map((offer, i) => (
                                <OfferInputCard key={offer.id} offer={offer} onChange={(u) => updateOffer(offer.id, u)} onRemove={() => removeOffer(offer.id)}
                                    colorIndex={i} canRemove={!showingSample && offers.length > 1} />
                            ))}
                        </AnimatePresence>

                        {!showingSample && (
                            <div className="flex gap-3">
                                {!hasCurrentJob && (
                                    <motion.button layout onClick={addCurrentJob}
                                        className="flex-1 p-4 rounded-xl border-2 border-dashed border-border/40 hover:border-brand/40 hover:bg-brand/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-brand">
                                        <Briefcase className="w-4 h-4" /><span className="text-sm font-medium">Add current job</span>
                                    </motion.button>
                                )}
                                {offers.length < 5 && (
                                    <motion.button layout onClick={addOffer}
                                        className="flex-1 p-4 rounded-xl border-2 border-dashed border-border/40 hover:border-brand/40 hover:bg-brand/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-brand">
                                        <Plus className="w-4 h-4" /><span className="text-sm font-medium">Compare another offer</span>
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Results */}
                    <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                        {hasData ? (
                            <div className="p-5 rounded-xl border border-border/40 bg-white dark:bg-card space-y-6">
                                <SummaryTable offers={displayOffers} />
                                <StackedBarChart offers={displayOffers} />
                                <DataTable offers={displayOffers} />
                            </div>
                        ) : (
                            <div className="p-8 rounded-xl border border-border/30 bg-white dark:bg-card text-center">
                                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Enter offer details to see comparison</p>
                                <button onClick={loadSample} className="text-sm text-brand hover:underline">Or see an example →</button>
                            </div>
                        )}
                        <BenefitsNote />
                    </div>
                </div>

                <div className="mt-12 flex flex-wrap gap-4">
                    <Link href="/guides/tech-offer-negotiation"><Button variant="outline">Tech Negotiation Guide →</Button></Link>
                    <Link href="/guides/offer-negotiation"><Button variant="outline">All-Industries Guide →</Button></Link>
                </div>
            </main>
        </>
    );
}
