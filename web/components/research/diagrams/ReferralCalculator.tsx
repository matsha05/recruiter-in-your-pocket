"use client";

import { useMemo, useState } from "react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatCount(value: number) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function calculateReferralComparison(salary: number, coldRate: number, referralRate: number, minutesPerApp: number) {
    const coldAppsNeeded = coldRate > 0 ? 100 / coldRate : null;
    const referralAppsNeeded = referralRate > 0 ? 100 / referralRate : null;
    const appsDifference = coldAppsNeeded !== null && referralAppsNeeded !== null ? coldAppsNeeded - referralAppsNeeded : null;
    const hoursDifference = appsDifference !== null ? appsDifference * minutesPerApp / 60 : null;
    const timeEquivalent = hoursDifference !== null ? hoursDifference * salary / 2080 : null;
    const maxApps = Math.max(coldAppsNeeded ?? 0, referralAppsNeeded ?? 0);
    const width = (applications: number | null) => applications !== null && maxApps > 0 ? `${applications / maxApps * 100}%` : "0%";
    return { coldAppsNeeded, referralAppsNeeded, appsDifference, hoursDifference, timeEquivalent, coldWidth: width(coldAppsNeeded), referralWidth: width(referralAppsNeeded) };
}

export function ReferralCalculator({ figureNumber = 1 }: { figureNumber?: number }) {
    const [salary, setSalary] = useState(120000);
    const [coldRate, setColdRate] = useState(2);
    const [referralRate, setReferralRate] = useState(40);
    const [minutesPerApp, setMinutesPerApp] = useState(45);

    const stats = useMemo(() => calculateReferralComparison(salary, coldRate, referralRate, minutesPerApp), [salary, coldRate, referralRate, minutesPerApp]);
    const timeLabel = stats.hoursDifference === null || stats.hoursDifference === 0 ? "Time difference" : stats.hoursDifference > 0 ? "Time saved with referral" : "Time added with referral";

    return (
        <DiagramFigure className="max-w-[50rem]" label="Calculator comparing applications per callback with and without a referral">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} label="Example calculator" title="Compare applications at different callback rates." note="The starting rates are examples, not research benchmarks. Change them to explore the arithmetic; this does not predict your results." />
                <div className="grid gap-10 px-5 py-7 md:grid-cols-[0.85fr_1.15fr] md:px-7 md:py-9">
                    <div className="space-y-6">
                        <RangeControl id="salary" label="Annual salary" value={salary} onChange={setSalary} min={30000} max={500000} step={5000} display={formatCurrency(salary)} />
                        <RangeControl id="minutes" label="Minutes per application" value={minutesPerApp} onChange={setMinutesPerApp} min={5} max={120} step={5} display={`${minutesPerApp} min`} />
                        <RangeControl id="cold-rate" label="Callback rate without referral" value={coldRate} onChange={setColdRate} min={0} max={90} step={0.5} display={`${coldRate}%`} />
                        <RangeControl id="referral-rate" label="Callback rate with referral" value={referralRate} onChange={setReferralRate} min={0} max={90} step={0.5} display={`${referralRate}%`} accent />
                    </div>

                    <div className="border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                        <div className="riyp-evidence-label text-muted-foreground">Average applications per callback</div>
                        <div className="mt-7 space-y-7">
                            <ModelBar label={`Without referral / ${coldRate}%`} value={stats.coldAppsNeeded === null ? "No callbacks" : formatCount(stats.coldAppsNeeded)} width={stats.coldWidth} />
                            <ModelBar label={`With referral / ${referralRate}%`} value={stats.referralAppsNeeded === null ? "No callbacks" : formatCount(stats.referralAppsNeeded)} width={stats.referralWidth} accent />
                        </div>
                        <dl className="mt-9 grid grid-cols-2 border-y border-line">
                            <div className="py-4 pr-4"><dt className="riyp-evidence-label text-muted-foreground">{timeLabel}</dt><dd className="mt-2 font-display text-3xl text-foreground">{stats.hoursDifference === null ? "No estimate" : `${formatCount(Math.abs(stats.hoursDifference))}h`}</dd></div>
                            <div className="border-l border-line py-4 pl-4"><dt className="riyp-evidence-label text-muted-foreground">Value of that time</dt><dd className="mt-2 font-display text-3xl text-foreground">{stats.timeEquivalent === null ? "No estimate" : formatCurrency(Math.abs(stats.timeEquivalent))}</dd></div>
                        </dl>
                        <p className="mt-4 text-xs leading-5 text-muted-foreground">{stats.appsDifference === null ? "A 0% rate means no expected callbacks, so there is no finite time comparison." : stats.appsDifference === 0 ? "Equal callback rates imply the same number of applications." : `At these rates, referrals imply about ${formatCount(Math.abs(stats.appsDifference))} ${stats.appsDifference > 0 ? "fewer" : "more"} applications per callback.`} The time value uses annual salary ÷ 2,080 hours. It is not money earned or saved and excludes time spent finding referrals.</p>
                    </div>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Example calculator`} title="An average describes repeated applications; it does not guarantee when a callback will arrive." />
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
