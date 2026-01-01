"use client";

/**
 * LinkedIn vs Resume Comparison Diagram (v4)
 * 
 * Design improvements:
 * - Remove jargon ("cold outreach" → clearer language)
 * - Emphasize they work TOGETHER (hand-in-hand)
 * - Stress importance of having LinkedIn profile
 * - Keep the two-list format user liked
 */
export function LinkedInResumeFlow() {
    return (
        <figure className="w-full max-w-lg mx-auto my-8">
            <div className="border border-border/30 bg-background p-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center mb-6">
                    Better together
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h3 className="font-display text-lg font-medium text-foreground">LinkedIn</h3>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            How they find you
                        </p>
                        <div className="space-y-2">
                            {[
                                "Recruiters search here first",
                                "Shows you are a real person",
                                "Displays your network",
                                "Interviewers check it too",
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-foreground/30" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-display text-lg font-medium text-foreground">Resume</h3>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            How they evaluate you
                        </p>
                        <div className="space-y-2">
                            {[
                                "Shows depth of experience",
                                "Details accomplishments",
                                "Tailored per application",
                                "The interview prep document",
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-foreground/30" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border/20">
                    <div className="bg-brand/5 p-4 text-center">
                        <p className="text-sm text-foreground font-medium mb-1">You need both.</p>
                        <p className="text-xs text-muted-foreground">
                            Without LinkedIn, recruiters cannot find you. Without a strong resume, they cannot evaluate you.
                        </p>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    LinkedIn drives discovery, resumes drive evaluation.
                </span>
            </figcaption>
        </figure>
    );
}
