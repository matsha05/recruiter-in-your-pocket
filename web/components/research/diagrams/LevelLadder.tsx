"use client";

export function LevelLadder() {
    const levels = [
        { name: "L3", title: "Junior", scope: "Tasks", comp: "1.0x", h: 16 },
        { name: "L4", title: "Mid-Level", scope: "Features", comp: "1.3x", h: 24 },
        { name: "L5", title: "Senior", scope: "Strategy", comp: "1.8x", h: 32 },
        { name: "L6", title: "Staff", scope: "Direction", comp: "2.5x", h: 40 },
    ];

    return (
        <figure className="riyp-figure w-full max-w-2xl mx-auto my-10">
            <div className="riyp-figure-frame p-6">
                <div className="flex items-end justify-center gap-4 h-64 border-b border-border pb-4 relative">
                    {levels.map((lvl) => (
                        <div key={lvl.name} className="flex flex-col items-center w-1/4">
                            <div
                                className="w-full bg-foreground/5 border border-border/30 rounded-sm"
                                style={{ height: `${lvl.h * 4}px` }}
                            />
                            <div className="mt-3 text-center">
                                <span className="block text-sm font-medium text-foreground">{lvl.name}</span>
                                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{lvl.title}</span>
                                <span className="block text-[10px] text-muted-foreground">{lvl.scope} • {lvl.comp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <figcaption className="mt-4 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Compensation increases step with role scope and level.
                </span>
            </figcaption>
        </figure>
    );
}
