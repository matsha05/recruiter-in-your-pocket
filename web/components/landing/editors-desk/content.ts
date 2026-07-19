import { Receipt, ShieldCheck, Trash2, type LucideIcon } from "lucide-react";

export type TrustPoint = {
    icon: LucideIcon;
    title: string;
    copy: string;
};

export const trustPoints: TrustPoint[] = [
    {
        icon: ShieldCheck,
        title: "Your facts stay intact",
        copy: "Suggested rewrites use the resume in front of us. When a useful detail is missing, the report asks instead of inventing it.",
    },
    {
        icon: Trash2,
        title: "Private by default",
        copy: "Anonymous reports are not attached to an account. If you save a report, you can remove it later.",
    },
    {
        icon: Receipt,
        title: "The price is not a reveal",
        copy: "The first in-browser report is free. The $29 Job Search Pass adds five reports for 30 days, with no automatic renewal.",
    },
];

export const reportPreview = {
    role: "Senior Software Engineer",
    date: "Feb 2025",
    verdict: "The recent roles read as senior. Their outcomes are harder to find.",
    score: 72,
    band: "Solid foundation",
    gap: "The last two roles describe responsibilities, but they do not say what changed because of the work.",
    original: "Responsible for managing service deployments",
    rewrite: "Led cross-functional migration across 4 services, reducing deploy time by 40% and cutting incidents 3×",
    subscores: [
        { label: "Story", score: 68 },
        { label: "Impact", score: 74 },
        { label: "Clarity", score: 81 },
        { label: "Brevity", score: 65 },
    ],
} as const;

export const reportSections = [
    "Likely takeaway",
    "What the resume shows",
    "Details to add",
    "Fit for the role",
] as const;
