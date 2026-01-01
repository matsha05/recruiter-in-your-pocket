"use client";

export function TrustChoiceGrid() {
    return (
        <figure className="riyp-figure w-full max-w-xl mx-auto my-10">
            <div className="riyp-figure-kicker mb-6">
                Error penalty curve
            </div>

            <div className="riyp-figure-frame p-6">
                <svg viewBox="0 0 240 160" className="w-full h-44">
                    <defs>
                        <linearGradient id="humanLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.4" />
                        </linearGradient>
                        <linearGradient id="algoLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>
                    <line x1="20" y1="140" x2="220" y2="140" stroke="hsl(var(--border))" strokeWidth="1" />
                    <line x1="20" y1="140" x2="20" y2="20" stroke="hsl(var(--border))" strokeWidth="1" />
                    <path d="M20 40 L120 40 L220 90" fill="none" stroke="url(#humanLine)" strokeWidth="3" />
                    <path d="M20 50 L120 50 L220 120" fill="none" stroke="url(#algoLine)" strokeWidth="3" />
                    <text x="24" y="155" fontSize="8" fill="hsl(var(--muted-foreground))">Before error</text>
                    <text x="155" y="155" fontSize="8" fill="hsl(var(--muted-foreground))">After error</text>
                    <text x="0" y="60" fontSize="8" fill="hsl(var(--muted-foreground))" transform="rotate(-90 8 60)">
                        Trust
                    </text>
                    <text x="30" y="30" fontSize="8" fill="hsl(var(--muted-foreground))">Human</text>
                    <text x="30" y="70" fontSize="8" fill="hsl(var(--muted-foreground))">Algorithm</text>
                </svg>
            </div>

            <figcaption className="mt-4">
                <span className="block riyp-figure-kicker">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Trust declines more sharply after algorithm errors than human errors in the study.
                </span>
            </figcaption>
        </figure>
    );
}
