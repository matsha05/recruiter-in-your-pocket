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
