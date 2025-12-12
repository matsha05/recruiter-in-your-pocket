interface InsightCardProps {
    /** Typographic marker like "01", "F-PATTERN", "KEY" */
    marker?: string;
    /** Insight index for auto-numbering if no marker provided */
    index?: number;
    title: string;
    research: string;
    riyp: string;
}

/**
 * InsightCard - Research insight block with typographic markers
 * 
 * Design: Internal research memo feel, not feature cards.
 * Uses text-only markers that are visually secondary to headlines.
 */
export default function InsightCard({
    marker,
    index,
    title,
    research,
    riyp
}: InsightCardProps) {
    // Generate marker: explicit marker > padded index > fallback
    const displayMarker = marker || (index !== undefined ? String(index + 1).padStart(2, "0") : "—");

    return (
        <div className="insight-card">
            <span className="insight-card-marker">{displayMarker}</span>
            <h3 className="insight-card-title">{title}</h3>
            <p className="insight-card-research">{research}</p>
            <p className="insight-card-riyp">{riyp}</p>
        </div>
    );
}
