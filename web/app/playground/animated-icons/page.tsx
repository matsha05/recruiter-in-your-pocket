"use client";

import { Settings, Check, Download, Sun, Moon, FileCheck, CloudUpload } from "lucide-react";
import { SettingsIcon } from "@/components/ui/settings";
import { CheckIcon } from "@/components/ui/check";
import { DownloadIcon } from "@/components/ui/download";
import { SunIcon } from "@/components/ui/sun";
import { MoonIcon } from "@/components/ui/moon";
import { FileCheckIcon } from "@/components/ui/file-check";
import { CloudUploadIcon } from "@/components/ui/cloud-upload";

export default function AnimatedIconsPlayground() {
    return (
        <div className="min-h-screen bg-background p-12">
            <div className="max-w-3xl mx-auto space-y-12">
                <div>
                    <h1 className="text-3xl font-semibold font-display mb-4">
                        Lucide Animated Icons Prototype
                    </h1>
                    <p className="text-muted-foreground">
                        Hover over each icon to see the animation. Compare with static Lucide icons.
                    </p>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Static Column */}
                    <div className="space-y-6">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Static (Lucide)
                        </h2>
                        <div className="space-y-3">
                            <IconRow label="Settings">
                                <Settings size={24} strokeWidth={1.5} />
                            </IconRow>
                            <IconRow label="Check">
                                <Check size={24} strokeWidth={1.5} />
                            </IconRow>
                            <IconRow label="Download">
                                <Download size={24} strokeWidth={1.5} />
                            </IconRow>
                            <IconRow label="Sun">
                                <Sun size={24} strokeWidth={1.5} />
                            </IconRow>
                            <IconRow label="Moon">
                                <Moon size={24} strokeWidth={1.5} />
                            </IconRow>
                            <IconRow label="FileCheck">
                                <FileCheck size={24} strokeWidth={1.5} />
                            </IconRow>
                            <IconRow label="CloudUpload">
                                <CloudUpload size={24} strokeWidth={1.5} />
                            </IconRow>
                        </div>
                    </div>

                    {/* Animated Column */}
                    <div className="space-y-6">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Animated (Hover me)
                        </h2>
                        <div className="space-y-3">
                            <IconRow label="Settings" highlight>
                                <SettingsIcon size={24} className="cursor-pointer" />
                            </IconRow>
                            <IconRow label="Check" highlight>
                                <CheckIcon size={24} className="cursor-pointer" />
                            </IconRow>
                            <IconRow label="Download" highlight>
                                <DownloadIcon size={24} className="cursor-pointer" />
                            </IconRow>
                            <IconRow label="Sun" highlight>
                                <SunIcon size={24} className="cursor-pointer" />
                            </IconRow>
                            <IconRow label="Moon" highlight>
                                <MoonIcon size={24} className="cursor-pointer" />
                            </IconRow>
                            <IconRow label="FileCheck" highlight>
                                <FileCheckIcon size={24} className="cursor-pointer" />
                            </IconRow>
                            <IconRow label="CloudUpload" highlight>
                                <CloudUploadIcon size={24} className="cursor-pointer" />
                            </IconRow>
                        </div>
                    </div>
                </div>

                {/* Use Case Demos */}
                <div className="space-y-8 pt-8 border-t border-border/40">
                    <h2 className="text-xl font-display font-medium">Proposed Use Cases</h2>

                    {/* Theme Toggle */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">ThemeToggle.tsx</h3>
                        <div className="flex gap-4">
                            <button className="p-2 rounded-full border border-border/60 hover:bg-accent/10 transition-colors">
                                <Sun size={18} strokeWidth={1.5} />
                            </button>
                            <button className="p-2 rounded-full border border-border/60 hover:bg-accent/10 transition-colors">
                                <SunIcon size={18} />
                            </button>
                            <button className="p-2 rounded-full border border-border/60 hover:bg-accent/10 transition-colors bg-slate-900 text-white">
                                <Moon size={18} strokeWidth={1.5} />
                            </button>
                            <button className="p-2 rounded-full border border-border/60 hover:bg-accent/10 transition-colors bg-slate-900 text-white">
                                <MoonIcon size={18} />
                            </button>
                        </div>
                    </div>

                    {/* UserNav Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">UserNav.tsx — Settings dropdown item</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/10 transition-colors cursor-pointer">
                                <Settings size={16} strokeWidth={1.5} />
                                <span className="text-sm">Settings (static)</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/10 transition-colors cursor-pointer">
                                <SettingsIcon size={16} />
                                <span className="text-sm">Settings (animated)</span>
                            </div>
                        </div>
                    </div>

                    {/* RedPenCard Copy Confirmation */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">RedPenCard.tsx — Copy confirmation</h3>
                        <div className="flex gap-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                <Check size={14} strokeWidth={2} />
                                Copied (static)
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                <CheckIcon size={14} />
                                Copied (animated)
                            </span>
                        </div>
                    </div>

                    {/* ReportPanel Download */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">ReportPanel.tsx — Export PDF button</h3>
                        <div className="flex gap-4">
                            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors">
                                <Download size={16} strokeWidth={1.5} />
                                <span className="text-sm font-medium">Export PDF (static)</span>
                            </button>
                            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors">
                                <DownloadIcon size={16} />
                                <span className="text-sm font-medium">Export PDF (animated)</span>
                            </button>
                        </div>
                    </div>

                    {/* ResumeDropzone Upload Success */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">ResumeDropzone.tsx — File accepted state</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                                <FileCheck size={20} strokeWidth={1.5} className="text-green-600 dark:text-green-400" />
                                <span className="text-sm text-green-700 dark:text-green-400">resume_v3.pdf (static)</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                                <FileCheckIcon size={20} className="text-green-600 dark:text-green-400" />
                                <span className="text-sm text-green-700 dark:text-green-400">resume_v3.pdf (animated)</span>
                            </div>
                        </div>
                    </div>

                    {/* Upload CTA */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">ResumeDropzone.tsx — Upload prompt</h3>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border/60 hover:border-brand/40 transition-colors cursor-pointer">
                                <CloudUpload size={28} strokeWidth={1.5} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Drop resume (static)</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border/60 hover:border-brand/40 transition-colors cursor-pointer">
                                <CloudUploadIcon size={28} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Drop resume (animated)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IconRow({ label, children, highlight }: { label: string; children: React.ReactNode; highlight?: boolean }) {
    return (
        <div className={`flex items-center gap-4 p-3 rounded border transition-colors ${highlight ? "border-brand/30 bg-brand/5 hover:border-brand/50" : "border-border/40 hover:border-border/60"}`}>
            {children}
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    );
}
