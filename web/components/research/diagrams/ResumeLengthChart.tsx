"use client";

/**
 * Signal Density vs Scan Cost Diagram
 * Conceptual curve showing how clarity and density affect first-pass scanning.
 */
export function ResumeLengthChart() {
    return (
        <figure className="riyp-figure w-full max-w-md mx-auto my-8">
            <div className="riyp-figure-frame relative p-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4 text-center">
                    Signal density vs scan cost
                </div>
                <svg viewBox="0 0 240 160" className="w-full h-40">
                    <defs>
                        <linearGradient id="scanCurve" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0.9" />
                        </linearGradient>
                    </defs>
                    <line x1="20" y1="140" x2="220" y2="140" stroke="hsl(var(--border))" strokeWidth="1" />
                    <line x1="20" y1="140" x2="20" y2="20" stroke="hsl(var(--border))" strokeWidth="1" />
                    <path
                        d="M20 120 C 60 40, 140 30, 220 60"
                        fill="none"
                        stroke="url(#scanCurve)"
                        strokeWidth="3"
                    />
                    <circle cx="170" cy="46" r="3" fill="hsl(var(--brand))" />
                    <text x="22" y="155" fontSize="8" fill="hsl(var(--muted-foreground))">Low scan cost</text>
                    <text x="160" y="155" fontSize="8" fill="hsl(var(--muted-foreground))">High scan cost</text>
                    <text x="0" y="50" fontSize="8" fill="hsl(var(--muted-foreground))" transform="rotate(-90 8 50)">
                        Signal recovered
                    </text>
                </svg>
                <div className="mt-4 text-xs text-muted-foreground">
                    Clear structure raises signal quickly. Dense or cluttered layouts add scan cost without adding signal.
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Conceptual curve showing how scan cost can outpace signal.
                </span>
            </figcaption>
        </figure>
    );
}
