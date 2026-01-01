'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { ArrowRight, Linkedin, FileText, X, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrustBadges } from '@/components/shared/TrustBadges';
import { cn } from '@/lib/utils';

interface LinkedInInputPanelProps {
    onUrlSubmit: (url: string) => void;
    onPdfSubmit: (text: string) => void;
    isLoading: boolean;
    freeUsesRemaining: number;
    user?: any | null;
    onSampleReport?: () => void;
}

export function LinkedInInputPanel({
    onUrlSubmit,
    onPdfSubmit,
    isLoading,
    freeUsesRemaining,
    user,
    onSampleReport,
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

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const handlePdfRun = () => {
        if (canSubmitPdf) {
            onPdfSubmit(pdfText);
        }
    };

    const getRunHint = () => {
        if (!user) {
            // Logged out / Guest logic
            if (freeUsesRemaining >= 2) return "No login required";
            if (freeUsesRemaining === 1) return "Your first review is free";
            return "Upgrade to continue";
        } else {
            // Logged in user logic
            if (freeUsesRemaining > 0) return `${freeUsesRemaining} credit${freeUsesRemaining === 1 ? '' : 's'} remaining`;
            return "Upgrade to continue";
        }
    };

    return (
        <div className="bg-card border border-border/60 rounded overflow-hidden transition-colors hover:border-border/80">
            {/* Main Content Area */}
            <div className="p-6 md:p-8 space-y-6">

                {/* Dropzone */}
                {!pdfFile ? (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                    Upload LinkedIn PDF
                                </div>
                                <div className="text-xs text-muted-foreground">PDF only</div>
                            </div>
                            <Button
                                variant="brand"
                                size="sm"
                                onClick={openFileDialog}
                                disabled={isLoading}
                                className="px-3"
                            >
                                Select file
                            </Button>
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={openFileDialog}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-3 px-4 py-8 border border-dashed rounded cursor-pointer transition-all duration-300 group text-center",
                                isDragging
                                    ? "border-brand bg-brand/5"
                                    : "border-border/40 hover:border-brand/40 hover:bg-brand/5",
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

                            <div className={cn(
                                "w-12 h-12 rounded border border-border/60 flex items-center justify-center text-muted-foreground transition-colors",
                                isDragging && "border-brand/40 text-brand"
                            )}>
                                <Linkedin className="w-6 h-6" strokeWidth={1.5} />
                            </div>

                            <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">
                                    Drop your LinkedIn PDF here
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Exports from LinkedIn - Resources - Save to PDF
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* File Success State */
                    <div className="flex items-center justify-between p-3 bg-brand/5 border border-brand/10 rounded animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium text-brand flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-brand/10 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="block truncate max-w-[200px]">{pdfFile.name}</span>
                                <span className="block text-xs text-muted-foreground">
                                    {isParsing ? (
                                        'Parsing...'
                                    ) : (
                                        <span className="flex items-center gap-1 text-success">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Ready
                                        </span>
                                    )}
                                </span>
                            </div>
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive h-auto py-1 px-2 hover:bg-destructive/10"
                            onClick={handleRemoveFile}
                        >
                            Remove
                        </Button>
                    </div>
                )}

                {parseError && (
                    <p className="text-sm text-destructive text-center">{parseError}</p>
                )}

                {/* How to Export - Contextual Help */}
                {!pdfFile && (
                    <div className="text-center flex items-center justify-center gap-4 flex-wrap">
                        <a
                            href="https://www.linkedin.com/in/me"
                            target="_blank"
                            rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/40 hover:border-brand/40 hover:bg-brand/5"
                    >
                            Open your LinkedIn profile
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {onSampleReport && (
                            <button
                                onClick={onSampleReport}
                                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80 transition-colors px-3 py-1.5"
                            >
                                <FileText className="w-4 h-4" />
                                See example report
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="p-6 md:p-8 bg-secondary/30 border-t border-border/50">
                <Button
                    variant="brand"
                    size="lg"
                    className="w-full h-12 text-base font-medium transition-transform active:scale-[0.99]"
                    onClick={handlePdfRun}
                    disabled={!canSubmitPdf}
                    isLoading={isLoading}
                >
                    {isLoading ? "Running Analysis..." : (
                        <span className="flex items-center gap-2">
                            See What They See <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </Button>

                <div className="mt-4 flex flex-col items-center gap-2">
                    <TrustBadges variant="inline" />
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
                        {getRunHint()}
                    </p>
                </div>
            </div>
        </div>
    );
}
