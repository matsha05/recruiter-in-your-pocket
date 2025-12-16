"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Mic, Play, MessageSquare, CheckCircle2 } from "lucide-react";
import { streamResumeFeedback } from "@/lib/api";

type CoachResult = {
    scorecard: {
        clarity: number;
        ownership: number;
        impact: number;
        concision: number;
    };
    feedback_summary: string;
    missing_signals: string[];
    follow_up_questions: string[];
    improved_answer: {
        headline: string;
        structure_fix: string;
        tightened_transcript: string;
    };
    micro_drills: { drill: string; why: string }[];
};

export function InterviewCoach({ roleTitle, companyName }: { roleTitle: string; companyName: string }) {
    const [question, setQuestion] = useState("");
    const [transcript, setTranscript] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<CoachResult | null>(null);

    const handleAnalyze = async () => {
        if (!question || !transcript) return;
        setIsAnalyzing(true);

        const context = `User is practicing for a role: ${roleTitle} at ${companyName || "unknown company"}.\nQuestion Asked: "${question}"`;

        try {
            const res = await streamResumeFeedback(transcript, context, () => { }, "case_interview");
            if (res.ok && res.report) {
                setResult(res.report);
            } else {
                alert("Analysis failed. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (result) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-medium">Coach Feedback</h2>
                    <Button variant="outline" onClick={() => setResult(null)}>Practice Another</Button>
                </div>

                {/* Scorecard */}
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(result.scorecard).map(([key, score]) => (
                        <Card key={key} className="bg-card border-border">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold mb-1 text-foreground">{score}</div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground">{key}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary */}
                <Card className="bg-indigo-500/5 border-indigo-500/20">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Recruiter Read</h3>
                        <p className="text-lg font-serif text-foreground">"{result.feedback_summary}"</p>
                    </CardContent>
                </Card>

                {/* Improved Answer */}
                <div className="space-y-4">
                    <h3 className="font-serif text-xl font-medium">Restructured Answer</h3>
                    <Card className="bg-card border-border">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Headline Hook</h4>
                                <p className="font-medium text-foreground">{result.improved_answer.headline}</p>
                            </div>
                            <div className="grid md:grid-cols-[200px_1fr] gap-6 pt-4 border-t border-border/50">
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Structure Fix</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{result.improved_answer.structure_fix}</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <h4 className="text-xs font-bold uppercase text-success mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" /> Tightened Version
                                    </h4>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap font-serif leading-relaxed">
                                        {result.improved_answer.tightened_transcript}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Follow Ups */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-serif text-xl font-medium">Follow-Up Questions</h3>
                        <ul className="space-y-2">
                            {result.follow_up_questions.map((q, i) => (
                                <li key={i} className="flex gap-3 items-start p-3 bg-secondary/20 rounded-lg text-sm">
                                    <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                    <span>{q}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-serif text-xl font-medium">Micro-Drills</h3>
                        <ul className="space-y-2">
                            {result.micro_drills.map((drill, i) => (
                                <li key={i} className="p-3 bg-premium/5 border border-premium/20 rounded-lg text-sm">
                                    <div className="font-medium text-foreground mb-1">{drill.drill}</div>
                                    <div className="text-muted-foreground text-xs">{drill.why}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-2">Interview Simulator</h2>
                <p className="text-muted-foreground text-sm">Test your stories against a simulated hiring manager.</p>
            </header>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">The Question</label>
                        <Input
                            placeholder="e.g. Tell me about a time you handled a conflict..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your Answer (Transcript)</label>
                        <Textarea
                            placeholder="Paste your spoken answer transcript here..."
                            className="h-40 font-mono text-sm"
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={!question || !transcript || isAnalyzing}
                            onClick={handleAnalyze}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Analyzing Speech Patterns...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" /> Evaluate Answer
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
