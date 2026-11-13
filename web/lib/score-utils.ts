/**
 * Score Color Utilities
 * 
 * Centralized score-to-color mapping for consistent semantic colors across the app.
 * Canonical first-read score bands:
 * - 85+ Clear and specific
 * - 70-84 Mostly clear
 * - <70 Needs more context
 */

/**
 * Returns the text color class for a given score
 */
export function getScoreColor(score: number): string {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-premium";
    return "text-destructive";
}

/**
 * Returns the background color class for a given score (subtle backgrounds)
 */
export function getScoreBg(score: number): string {
    if (score >= 85) return "bg-success/10";
    if (score >= 70) return "bg-premium/10";
    return "bg-destructive/10";
}

/**
 * Returns the border color class for a given score
 */
function getScoreBorder(score: number): string {
    if (score >= 85) return "border-success/30";
    if (score >= 70) return "border-premium/30";
    return "border-destructive/30";
}

/**
 * Returns a score label based on the score value
 */
export function getScoreLabel(score: number): string {
    if (score >= 85) return "Clear and specific";
    if (score >= 70) return "Mostly clear";
    return "Needs more context";
}

/**
 * How far apart two reads of a page nobody changed can land. The model scores the page on every read, and its
 * number is not fixed: on November 13, 2026 ten synthetic resumes were each read four times on the shipped
 * prompt, and of the 60 pairs of reads 30% gave the same score, 73% sat within 2, and none sat more than 5
 * apart (docs/audits/2026-11-score-reread.md). A difference this size between two reports is not evidence that
 * the page changed, so nothing announces it as a change.
 */
export const SCORE_REREAD_SPREAD = 5;

/** Whether the difference between two reports' scores is more than reading the same page twice produces. */
export function scoreMoved(delta: number): boolean {
    return Math.abs(delta) > SCORE_REREAD_SPREAD;
}

/** At or above this, a worklist report is on the top band, which it earns only when no line needs work (Matt, Nov 6, 2026). */
export const READY_TO_SEND_SCORE = 93;
/** A worklist report with no line that needs work never sits below this. */
export const NOTHING_TO_FIX_FLOOR = 90;

/**
 * The worklist report's label (Nov 6, 2026): the v2 labels plus a fifth at the top, "Ready to send", for the
 * page with nothing left to fix. v2 reports keep the four of getScoreLabel.
 */
export function getWorklistScoreLabel(score: number): string {
    if (score >= READY_TO_SEND_SCORE) return "Ready to send";
    return getScoreLabel(score);
}

/**
 * Returns the HSL stroke color for score dials (SVG inline stroke)
 */
export function getDialStrokeColor(score: number): string {
    if (score >= 85) return 'hsl(var(--success))';
    if (score >= 70) return 'hsl(var(--premium))';
    return 'hsl(var(--destructive))';
}

// ================== JOB MATCHING SCORE BANDS ==================
// Used for job-to-resume alignment scoring in the Chrome extension
// Per implementation plan:
// - Not a Match (0-15): Hard gating prevents false positives
// - Career Stretch (16-40): Different domain or missing key requirements
// - Plausible Fit (41-70): Reasonable alignment with some gaps
// - Strong Match (71-85): Good alignment, minor gaps
// - Excellent Fit (86-100): Near-perfect alignment

export interface JobMatchBand {
    label: string;
    score_range: [number, number];
    colorClass: string;
    textColor: string;
    description: string;
}

const JOB_MATCH_BANDS: JobMatchBand[] = [
    {
        label: 'Excellent Fit',
        score_range: [86, 100],
        colorClass: 'bg-success/10 border-success/20',
        textColor: 'text-success',
        description: 'Near-perfect alignment with requirements'
    },
    {
        label: 'Strong Match',
        score_range: [71, 85],
        colorClass: 'bg-premium/10 border-premium/20',
        textColor: 'text-premium',
        description: 'Good alignment with minor gaps'
    },
    {
        label: 'Plausible Fit',
        score_range: [41, 70],
        colorClass: 'bg-foreground/5 border-foreground/10',
        textColor: 'text-foreground',
        description: 'Reasonable alignment, some gaps'
    },
    {
        label: 'Career Stretch',
        score_range: [16, 40],
        colorClass: 'bg-muted/50 border-muted',
        textColor: 'text-muted-foreground',
        description: 'Different domain or missing key requirements'
    },
    {
        label: 'Not a Match',
        score_range: [0, 15],
        colorClass: 'bg-destructive/10 border-destructive/20',
        textColor: 'text-destructive',
        description: 'Fundamentally different role'
    },
];

/**
 * Get the job matching score band for a given score
 */
function getJobMatchBand(score: number): JobMatchBand {
    for (const band of JOB_MATCH_BANDS) {
        if (score >= band.score_range[0] && score <= band.score_range[1]) {
            return band;
        }
    }
    return JOB_MATCH_BANDS[JOB_MATCH_BANDS.length - 1]; // Default to lowest band
}

/**
 * Get just the label for a job match score
 */
function getJobMatchLabel(score: number): string {
    return getJobMatchBand(score).label;
}

/**
 * Get the color classes for a job match score
 */
function getJobMatchColors(score: number): { bg: string; border: string; text: string } {
    const band = getJobMatchBand(score);
    return {
        bg: band.colorClass.split(' ')[0],
        border: band.colorClass.split(' ')[1] || '',
        text: band.textColor,
    };
}
