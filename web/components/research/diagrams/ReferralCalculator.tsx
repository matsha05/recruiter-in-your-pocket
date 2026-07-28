"use client";

import { useMemo, useState } from "react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function ReferralCalculator({ figureNumber = 1 }: { figureNumber?: number }) {
    const [salary, setSalary] = useState(120000);
    const [coldRate, setColdRate] = useState(2);
    const [referralRate, setReferralRate] = useState(40);
    const [minutesPerApp, setMinutesPerApp] = useState(45);

    const stats = useMemo(() => {
        const coldAppsNeeded = Math.round(1 / (Math.max(coldRate, 0.1) / 100));
        const referralAppsNeeded = Math.round(1 / (Math.max(referralRate, 0.1) / 100));
        const appsSaved = Math.max(coldAppsNeeded - referralAppsNeeded, 0);
        const hoursSaved = Math.round((appsSaved * minutesPerApp) / 60);
        const timeEquivalent = Math.round(hoursSaved * (salary / 2080));
        const maxApps = Math.max(coldAppsNeeded, referralAppsNeeded);
        return { coldAppsNeeded, referralAppsNeeded, appsSaved, hoursSaved, timeEquivalent, coldWidth: `${(coldAppsNeeded / maxApps) * 100}%`, referralWidth: `${(referralAppsNeeded / maxApps) * 100}%` };
    }, [salary, coldRate, referralRate, minutesPerApp]);

    return (
        <DiagramFigure className="max-w-[50rem]" label="Calculator comparing applications per callback with and without a referral">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} label="Example calculator" title="Try different response rates and see how many applications they imply." note="This is simple arithmetic, not a forecast. Use rates that fit your role, market, and referral strength." />
                <div className="grid gap-10 px-5 py-7 md:grid-cols-[0.85fr_1.15fr] md:px-7 md:py-9">
                    <div className="space-y-6">
                        <RangeControl id="salary" label="Annual salary" value={salary} onChange={setSalary} min={30000} max={500000} step={5000} display={formatCurrency(salary)} />
                        <RangeControl id="minutes" label="Minutes per application" value={minutesPerApp} onChange={setMinutesPerApp} min={5} max={120} step={5} display={`${minutesPerApp} min`} />
                        <RangeControl id="cold-rate" label="Cold callback rate" value={coldRate} onChange={setColdRate} min={0.5} max={20} step={0.5} display={`${coldRate}%`} />
                        <RangeControl id="referral-rate" label="Referral callback rate" value={referralRate} onChange={setReferralRate} min={10} max={90} step={5} display={`${referralRate}%`} accent />
                    </div>

                    <div className="border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                        <div className="riyp-evidence-label text-muted-foreground">Applications per callback</div>
                        <div className="mt-7 space-y-7">
                            <ModelBar label={`Cold / ${coldRate}%`} value={`${stats.coldAppsNeeded}`} width={stats.coldWidth} />
                            <ModelBar label={`Referred / ${referralRate}%`} value={`${stats.referralAppsNeeded}`} width={stats.referralWidth} accent />
                        </div>
                        <dl className="mt-9 grid grid-cols-2 border-y border-line">
                            <div className="py-4 pr-4"><dt className="riyp-evidence-label text-muted-foreground">Time difference</dt><dd className="mt-2 font-display text-3xl text-foreground">{stats.hoursSaved}h</dd></div>
                            <div className="border-l border-line py-4 pl-4"><dt className="riyp-evidence-label text-muted-foreground">Time equivalent</dt><dd className="mt-2 font-display text-3xl text-foreground">{formatCurrency(stats.timeEquivalent)}</dd></div>
                        </dl>
                        <p className="mt-4 text-xs leading-5 text-muted-foreground">At these assumptions, the model avoids {stats.appsSaved} applications. “Time equivalent” values the modeled hours at salary ÷ 2,080; it is not money earned or saved.</p>
                    </div>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Example calculator`} title="Even a small change in response rate can change how many applications you need." />
        </DiagramFigure>
    );
}

function RangeControl({ id, label, value, onChange, min, max, step, display, accent }: { id: string; label: string; value: number; onChange: (value: number) => void; min: number; max: number; step: number; display: string; accent?: boolean }) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-4"><label htmlFor={id} className="text-sm font-medium text-foreground/80">{label}</label><output htmlFor={id} className={accent ? "text-xs font-bold text-brand tabular-nums" : "text-xs font-bold text-muted-foreground tabular-nums"}>{display}</output></div>
            <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 h-2 w-full cursor-pointer appearance-none bg-line accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2" />
        </div>
    );
}

function ModelBar({ label, value, width, accent }: { label: string; value: string; width: string; accent?: boolean }) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-4 text-xs"><span className={accent ? "font-semibold text-brand" : "text-muted-foreground"}>{label}</span><span className="font-display text-2xl text-foreground">{value}</span></div>
            <div className="mt-2 h-2 w-full bg-line"><div className={accent ? "h-full bg-cyan-bright transition-[width] duration-200 ease-out" : "h-full bg-muted-foreground transition-[width] duration-200 ease-out"} style={{ width }} /></div>
        </div>
    );
}
