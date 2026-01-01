"use client";

export function CompStack() {
    const stack = [
        { label: "Level and title", value: "Multi-year trajectory", sub: "Scope promise" },
        { label: "Sign-on bonus", value: "$20k - $50k", sub: "Flexible lever", highlight: true },
        { label: "Equity / RSUs", value: "$100k / 4yr", sub: "High variance" },
        { label: "Annual bonus", value: "15% target", sub: "Performance tied" },
        { label: "Base salary", value: "$165k", sub: "Hardest to move" },
    ];

    return (
        <figure className="w-full max-w-sm mx-auto my-10">
            <div className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-6">
                The compensation stack
            </div>

            <div className="flex flex-col">
                {stack.map((item, i) => (
                    <div
                        key={item.label}
                        className={`border border-border/30 px-4 py-3 ${i === 0 ? "border-t" : "-mt-px"} ${item.highlight ? "bg-brand/5 border-brand/30" : "bg-background"}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className={`text-sm font-medium ${item.highlight ? "text-brand" : "text-foreground"}`}>
                                    {item.label}
                                </div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {item.sub}
                                </div>
                            </div>
                            <div className={`text-xs font-mono ${item.highlight ? "text-brand" : "text-muted-foreground"}`}>
                                {item.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <figcaption className="mt-4 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Trade up the stack rather than negotiating base downward.
                </span>
            </figcaption>
        </figure>
    );
}
