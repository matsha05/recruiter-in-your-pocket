"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LandingSectionTone = "hero" | "mist" | "paper" | "soft" | "ink";
type LandingSectionDensity = "hero" | "tight" | "default" | "relaxed";
type LandingSectionDivider = "none" | "top" | "bottom" | "both";

const TONE_CLASS: Record<LandingSectionTone, string> = {
    hero: "landing-frame-hero",
    mist: "landing-frame-mist",
    paper: "landing-frame-paper",
    soft: "landing-frame-soft",
    ink: "landing-frame-ink",
};

const DENSITY_CLASS: Record<LandingSectionDensity, string> = {
    hero: "landing-section-hero",
    tight: "landing-section-tight",
    default: "landing-section",
    relaxed: "landing-section-relaxed",
};

const DIVIDER_CLASS: Record<LandingSectionDivider, string> = {
    none: "",
    top: "landing-frame-divider-top",
    bottom: "landing-frame-divider-bottom",
    both: "landing-frame-divider-top landing-frame-divider-bottom",
};

type LandingSectionFrameProps = {
    children: ReactNode;
    className?: string;
    density?: LandingSectionDensity;
    divider?: LandingSectionDivider;
    id?: string;
    railClassName?: string;
    tone?: LandingSectionTone;
};

export function LandingSectionFrame({
    children,
    className,
    density = "default",
    divider = "none",
    id,
    railClassName,
    tone = "paper",
}: LandingSectionFrameProps) {
    return (
        <section
            id={id}
            className={cn(
                "landing-frame landing-section-pad",
                TONE_CLASS[tone],
                DENSITY_CLASS[density],
                DIVIDER_CLASS[divider],
                className
            )}
        >
            <div className={cn("landing-rail", railClassName)}>
                {children}
            </div>
        </section>
    );
}

type LandingSectionHeaderProps = {
    action?: ReactNode;
    className?: string;
    copy?: string;
    copyClassName?: string;
    kicker?: string;
    title: ReactNode;
    titleAs?: "h2" | "h3";
    titleClassName?: string;
};

export function LandingSectionHeader({
    action,
    className,
    copy,
    copyClassName,
    kicker,
    title,
    titleAs = "h2",
    titleClassName,
}: LandingSectionHeaderProps) {
    const TitleTag = titleAs;
    return (
        <div className={cn("landing-section-head", className)}>
            <div className="landing-flow-sm">
                {kicker ? <div className="landing-kicker">{kicker}</div> : null}
                <TitleTag className={cn("landing-title-xl", titleClassName)}>{title}</TitleTag>
                {copy ? <p className={cn("landing-copy-muted max-w-[42rem]", copyClassName)}>{copy}</p> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

export function LandingSectionBreak({ label }: { label: string }) {
    return (
        <div className="landing-break" aria-label={label}>
            <span className="landing-break-label">{label}</span>
        </div>
    );
}

export function LandingSectionTag({
    index,
    label,
    className,
}: {
    index: string;
    label: string;
    className?: string;
}) {
    return (
        <div className={cn("landing-section-tag", className)}>
            <span className="landing-section-tag-index">{index}</span>
            <span className="landing-section-tag-label">{label}</span>
        </div>
    );
}
