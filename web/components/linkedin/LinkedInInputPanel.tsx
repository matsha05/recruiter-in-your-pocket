'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Linkedin, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
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
        const membership = user?.membership;
        if (membership === 'monthly' || membership === 'lifetime') return 'Paid access active';
        if (membership === 'credit') {
            const paid = Number(user?.paidUsesLeft || 0);
            return `${paid} paid report${paid === 1 ? '' : 's'} remaining`;
        }
        if (freeUsesRemaining > 0) return '1 free report available';
        return 'Upgrade to continue';
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-border/45 bg-white shadow-[0_20px_48px_-40px_rgba(15,23,42,0.18)] dark:bg-card">
            <div className="gap-y-6 p-6 md:gap-y-7 md:p-8">
                {!pdfFile ? (
                    <div className="gap-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="gap-y-1">
                                <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                                    Upload LinkedIn PDF
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Export it from LinkedIn, then upload it here.
                                </div>
                            </div>
                            <Button
                                variant="brand"
                                size="sm"
                                onClick={openFileDialog}
                                disabled={isLoading}
                                className="min-h-11 min-w-[6.5rem] rounded-lg px-4"
                            >
                                Select file
                            </Button>
                        </div>

                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={openFileDialog}
                            className={cn(
                                'group relative flex min-h-[11.5rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-5 py-8 text-center transition-all duration-300',
                                isDragging
                                    ? 'border-brand/45 bg-brand/5'
                                    : 'border-border/45 hover:border-brand/35 hover:bg-brand/5',
                                isLoading && 'cursor-not-allowed opacity-50'
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

                            <div
                                className={cn(
                                    'flex size-14 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-all duration-300',
                                    isDragging && 'border-brand/35 bg-brand/10 text-brand'
                                )}
                            >
                                <Linkedin className="size-7" strokeWidth={1.5} />
                            </div>

                            <div className="gap-y-1.5">
                                <div className="text-base font-medium text-foreground">Drop your LinkedIn PDF here</div>
                                <div className="text-sm text-muted-foreground">LinkedIn &gt; Resources &gt; Save to PDF</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between rounded-xl border border-brand/15 bg-brand/5 p-4">
                        <span className="flex items-center gap-3 text-sm font-medium text-brand">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
                                <FileText className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block max-w-[220px] truncate text-foreground">{pdfFile.name}</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {isParsing ? (
                                        'Parsing your export...'
                                    ) : (
                                        <span className="flex items-center gap-1 text-success">
                                            <CheckCircle2 className="size-3" />
                                            Ready
                                        </span>
                                    )}
                                </span>
                            </div>
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-lg px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={handleRemoveFile}
                        >
                            Remove
                        </Button>
                    </div>
                )}

                {parseError && (
                    <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                        {parseError}
                    </p>
                )}

                {!pdfFile && (
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-1">
                        <a
                            href="https://www.linkedin.com/in/me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border/45 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/35 hover:bg-brand/5 hover:text-foreground"
                        >
                            Open your LinkedIn profile
                            <ExternalLink className="size-3.5" />
                        </a>
                        {onSampleReport && (
                            <button type="button"
                                onClick={onSampleReport}
                                className="inline-flex min-h-11 items-center gap-2 px-3 py-2 text-sm font-medium text-brand transition-colors hover:text-brand/80"
                            >
                                <FileText className="size-4" />
                                See example report
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="border-t border-border/40 bg-secondary/20 p-6 md:p-8">
                <Button
                    variant="brand"
                    size="lg"
                    className="h-12 w-full text-base font-medium transition-transform active:scale-[0.99] disabled:opacity-75"
                    onClick={handlePdfRun}
                    disabled={!canSubmitPdf}
                    isLoading={isLoading}
                >
                    {isLoading ? (
                        'Running Analysis...'
                    ) : (
                        <span className="flex items-center gap-2">
                            See What They See <ArrowRight className="size-4" />
                        </span>
                    )}
                </Button>

                <div className="mt-4 flex flex-col items-center gap-2.5 text-center">
                    <TrustBadges variant="inline" className="flex-wrap justify-center gap-x-3 gap-y-1 text-xs" />
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                        {getRunHint()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <Link href="/security" className="underline underline-offset-4 hover:text-foreground">
                            Data handling
                        </Link>
                        {' · '}
                        <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">
                            Scoring methodology
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
