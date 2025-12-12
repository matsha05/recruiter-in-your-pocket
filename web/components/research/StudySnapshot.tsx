"use client";

interface StudySnapshotProps {
    whatItStudied: string;
    methods: string[];
    sample: string;
    keyFinding: string;
    keyStat?: string;
    soWhat: string;
    sourceUrl?: string; // Made optional for practitioner analysis pages
    sourceName: string;
    year?: string | number;
}

/**
 * StudySnapshot - Research brief above the fold
 * 
 * Editorial design: Label + value rows, no chips, no badges.
 * Typography carries hierarchy. Quiet, authoritative.
 */
export default function StudySnapshot({
    whatItStudied,
    methods,
    sample,
    keyFinding,
    keyStat,
    soWhat,
    sourceUrl,
    sourceName,
    year,
}: StudySnapshotProps) {
    return (
        <div className="study-snapshot">
            <div className="study-snapshot-header">
                <span className="study-snapshot-label">Study Snapshot</span>
                {sourceUrl && (
                    <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="study-snapshot-source"
                    >
                        View source →
                    </a>
                )}
            </div>

            {/* Key stat - typographic, not decorated */}
            {keyStat && (
                <div className="study-snapshot-stat">
                    <span className="study-snapshot-stat-value">{keyStat}</span>
                </div>
            )}

            <dl className="study-snapshot-data">
                <div className="study-snapshot-row">
                    <dt>What it studied</dt>
                    <dd>{whatItStudied}</dd>
                </div>
                <div className="study-snapshot-row">
                    <dt>Method</dt>
                    <dd>{methods.join(" · ")}</dd>
                </div>
                <div className="study-snapshot-row">
                    <dt>Sample</dt>
                    <dd>{sample}</dd>
                </div>
                <div className="study-snapshot-row">
                    <dt>Key finding</dt>
                    <dd><strong>{keyFinding}</strong></dd>
                </div>
                <div className="study-snapshot-row study-snapshot-row--full">
                    <dt>Implication</dt>
                    <dd>{soWhat}</dd>
                </div>
            </dl>

            <div className="study-snapshot-footer">
                <span className="study-snapshot-attribution">
                    {sourceName}{year ? `, ${year}` : ""}
                </span>
            </div>
        </div>
    );
}
