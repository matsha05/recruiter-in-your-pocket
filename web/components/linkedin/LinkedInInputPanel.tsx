'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { ArrowRight, Linkedin, FileText, X, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LinkedInInputPanelProps {
    onUrlSubmit: (url: string) => void;
    onPdfSubmit: (text: string) => void;
    isLoading: boolean;
    freeUsesRemaining: number;
}

export function LinkedInInputPanel({
    onUrlSubmit,
    onPdfSubmit,
    isLoading,
    freeUsesRemaining,
}: LinkedInInputPanelProps) {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfText, setPdfText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canSubmitPdf = pdfText.length > 100 && !isLoading;

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleFile(file);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            await handleFile(file);
        } else {
            setParseError('Please upload a PDF file.');
        }
    };

    const handleFile = async (file: File) => {
        setPdfFile(file);
        setParseError(null);
        setIsParsing(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'linkedin');

            const res = await fetch('/api/parse-resume', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.ok && data.text) {
                setPdfText(data.text);
            } else {
                setParseError(data.message || 'Failed to parse PDF');
                setPdfFile(null);
            }
        } catch {
            setParseError('Failed to parse PDF. Please try again.');
            setPdfFile(null);
        } finally {
            setIsParsing(false);
        }
    };

    const handleRemoveFile = () => {
        setPdfFile(null);
        setPdfText('');
        setParseError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePdfRun = () => {
        if (canSubmitPdf) {
            onPdfSubmit(pdfText);
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Section - Emotional Hook */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 text-brand text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Recruiter-Eye Analysis</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Most people never see what a recruiter sees in those first 3 seconds.
                    We&apos;ll show you exactly what&apos;s working and what&apos;s hiding your best work.
                </p>
            </div>

            {/* Single-Step Flow: Upload PDF */}
            {!pdfFile ? (
                <div className="space-y-4">
                    {/* Premium Dropzone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "group relative rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
                            "bg-gradient-to-b from-muted/30 to-muted/10",
                            "border border-border/60",
                            "hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5",
                            isDragging && "border-brand bg-brand/5 scale-[1.02]",
                            isLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isLoading}
                        />

                        {/* Icon with subtle animation */}
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300",
                            "bg-brand/10 text-brand",
                            "group-hover:bg-brand/15 group-hover:scale-110",
                            isDragging && "bg-brand/20 scale-110"
                        )}>
                            <Linkedin className="w-8 h-8" />
                        </div>

                        <p className="text-lg font-semibold text-foreground mb-1">
                            Drop your LinkedIn PDF
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            or click to browse
                        </p>

                        {/* Inline guide - not a separate help box */}
                        <div className="text-xs text-muted-foreground/80 pt-4 border-t border-border/50">
                            <p className="mb-2">
                                <span className="font-medium text-muted-foreground">Quick export:</span>
                                {' '}LinkedIn profile → Resources → Save to PDF
                            </p>
                            <a
                                href="https://www.linkedin.com/in/me"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-brand hover:underline"
                            >
                                Open your profile
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {parseError && (
                        <p className="text-sm text-destructive text-center">{parseError}</p>
                    )}
                </div>
            ) : (
                /* File Loaded State */
                <div className="space-y-6">
                    {/* Success State Card */}
                    <div className={cn(
                        "rounded-xl p-5 transition-all",
                        "bg-gradient-to-b from-success/10 to-success/5",
                        "border border-success/20"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground truncate max-w-[280px]">
                                        {pdfFile.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        {isParsing ? (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                Parsing profile...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                                Ready for analysis
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleRemoveFile}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                disabled={isLoading}
                                aria-label="Remove file"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* What We'll Analyze - Preview Hook */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Headline', desc: 'Is it searchable?' },
                            { label: 'First Impression', desc: '3-second verdict' },
                            { label: 'About Hook', desc: 'Does it grab?' },
                            { label: 'Visibility', desc: 'Will recruiters find you?' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="p-3 rounded-lg bg-muted/30 border border-border/50"
                            >
                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                        onClick={handlePdfRun}
                        disabled={!canSubmitPdf}
                        variant="brand"
                        size="lg"
                        className="w-full py-6 text-base font-semibold shadow-lg shadow-brand/20 hover:shadow-brand/30 transition-shadow"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing...
                            </span>
                        ) : (
                            <>
                                See What Recruiters See
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>

                    {/* Trust Indicator */}
                    <p className="text-xs text-muted-foreground text-center">
                        {freeUsesRemaining > 0 ? (
                            <span className="flex items-center justify-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                Your free review
                            </span>
                        ) : (
                            'Uses 1 credit'
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
