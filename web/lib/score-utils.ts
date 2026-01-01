/**
 * Score Color Utilities
 * 
 * Centralized score-to-color mapping for consistent semantic colors across the app.
 * Based on the design philosophy scoring thresholds:
 * - 85+ (Exceptional): Success green
 * - 70-84 (Strong): Premium gold
 * - <70 (Needs Work): Destructive red
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
export function getScoreBorder(score: number): string {
    if (score >= 85) return "border-success/30";
    if (score >= 70) return "border-premium/30";
    return "border-destructive/30";
}

/**
 * Returns a score label based on the score value
 */
export function getScoreLabel(score: number): string {
    if (score >= 85) return "Exceptional";
    if (score >= 70) return "Strong";
    return "Needs Work";
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
export function getJobMatchBand(score: number): JobMatchBand {
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
export function getJobMatchLabel(score: number): string {
    return getJobMatchBand(score).label;
}

/**
 * Get the color classes for a job match score
 */
export function getJobMatchColors(score: number): { bg: string; border: string; text: string } {
    const band = getJobMatchBand(score);
    return {
        bg: band.colorClass.split(' ')[0],
        border: band.colorClass.split(' ')[1] || '',
        text: band.textColor,
    };
}
