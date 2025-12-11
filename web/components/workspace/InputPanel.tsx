"use client";

import { useState, useRef, ChangeEvent } from "react";

interface InputPanelProps {
    resumeText: string;
    jobDescription: string;
    onResumeTextChange: (text: string) => void;
    onJobDescChange: (text: string) => void;
    onFileSelect: (file: File) => void;
    onRun: () => void;
    isLoading: boolean;
    freeUsesRemaining: number;
}

export default function InputPanel({
    resumeText,
    jobDescription,
    onResumeTextChange,
    onJobDescChange,
    onFileSelect,
    onRun,
    isLoading,
    freeUsesRemaining
}: InputPanelProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };

    const handleRemoveFile = () => {
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getRunHint = () => {
        if (freeUsesRemaining >= 2) {
            return "Your first 2 reports are free. No login required.";
        } else if (freeUsesRemaining === 1) {
            return "1 free report remaining";
        } else {
            return "Upgrade to keep analyzing";
        }
    };

    const charCount = resumeText.length;
    const isShortResume = charCount > 0 && charCount < 1500;

    return (
        <div className="bg-white p-6 flex flex-col gap-6 overflow-y-auto h-full">
            <div className="flex flex-col gap-6">
                {/* Resume Upload */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">Your Resume</span>
                        <span className="text-gray-500 text-xs">PDF, DOCX, or paste text</span>
                    </div>

                    {/* Dropzone */}
                    <div
                        className={`flex flex-col items-center justify-center gap-3 p-6
                            border-2 border-dashed rounded-xl cursor-pointer
                            transition-all duration-200
                            ${isDragOver
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30"
                            }`}
                        onClick={(e) => {
                            if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('input')) {
                                fileInputRef.current?.click();
                            }
                        }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="text-gray-900 text-sm font-medium">Drop your resume here or click to upload</div>
                        <div className="text-gray-500 text-xs">Supports PDF and DOCX files</div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* File info */}
                    {fileName && (
                        <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 rounded-lg">
                            <span className="text-indigo-600 font-medium text-sm">{fileName}</span>
                            <button
                                className="text-gray-500 hover:text-red-600 text-xs transition-colors"
                                onClick={handleRemoveFile}
                            >
                                ✕ Remove
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="text-center text-gray-400 text-sm py-2">
                        — or paste —
                    </div>

                    {/* Resume textarea */}
                    <textarea
                        value={resumeText}
                        onChange={(e) => onResumeTextChange(e.target.value)}
                        placeholder="Paste your resume text here..."
                        className="textarea min-h-[200px]"
                    />

                    {/* Short resume warning */}
                    {isShortResume && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="text-lg">⚠️</div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">Resume looks short</div>
                                <p className="text-gray-600 text-xs mt-1">
                                    We found {charCount} characters. Most resumes have 1,500+ characters. You might get limited feedback.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Job Description (Optional) */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">Job Description</span>
                        <span className="text-gray-500 text-xs">Optional — enables alignment analysis</span>
                    </div>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => onJobDescChange(e.target.value)}
                        className="textarea min-h-[120px]"
                        placeholder="Paste the job description to see how well your resume aligns..."
                    />
                </div>
            </div>

            {/* Run Button */}
            <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-200 mt-auto">
                <button
                    className="btn-primary w-full"
                    onClick={onRun}
                    disabled={isLoading || (!resumeText.trim() && !fileName)}
                >
                    <span>{isLoading ? "Analyzing..." : "See How Recruiters Read You"}</span>
                    <span>→</span>
                </button>
                <div className="text-gray-500 text-xs">{getRunHint()}</div>
            </div>
        </div>
    );
}
