"use client";

export function TrustChoiceGrid() {
    return (
        <figure className="w-full max-w-xl mx-auto my-10">
            <div className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-6">
                Recruiter trust matrix
            </div>

            <div className="relative">
                <div className="flex justify-center mb-4">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md pl-20">
                        <div className="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">Human</div>
                        <div className="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">Algorithm</div>
                    </div>
                </div>

                <div className="flex">
                    <div className="flex flex-col justify-around pr-4 w-20 shrink-0">
                        <div className="text-[10px] font-mono uppercase text-muted-foreground text-right py-8">Consistent</div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground text-right py-8">Inconsistent</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="border border-brand/30 bg-brand/5 p-5 text-center flex flex-col items-center justify-center h-28">
                            <span className="text-lg font-display text-brand">High Trust</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Most preferred</span>
                        </div>

                        <div className="border border-border/30 bg-background p-5 text-center flex flex-col items-center justify-center h-28">
                            <span className="font-medium text-muted-foreground">Accepted</span>
                            <span className="text-xs text-muted-foreground">Utility function</span>
                        </div>

                        <div className="border border-border/30 bg-background p-5 text-center flex flex-col items-center justify-center h-28">
                            <span className="font-medium text-muted-foreground">Forgiven</span>
                            <span className="text-xs text-muted-foreground">Humans make mistakes</span>
                        </div>

                        <div className="border border-border/30 bg-background p-5 text-center flex flex-col items-center justify-center h-28">
                            <span className="font-medium text-muted-foreground">Rejected</span>
                            <span className="text-xs text-muted-foreground">Broken system</span>
                        </div>
                    </div>
                </div>
            </div>

            <figcaption className="mt-4 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Recruiters trust consistent human judgment more than automated decisions.
                </span>
            </figcaption>
        </figure>
    );
}
