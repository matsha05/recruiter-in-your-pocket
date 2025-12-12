"use client";

interface StudySnapshotProps {
    whatItStudied: string;
    methods: string[];
    sample: string;
    keyFinding: string;
    soWhat: string;
    sourceUrl: string;
    sourceName: string;
}

export default function StudySnapshot({
    whatItStudied,
    methods,
    sample,
    keyFinding,
    soWhat,
    sourceUrl,
    sourceName,
}: StudySnapshotProps) {
    return (
        <div className="study-snapshot">
            <div className="study-snapshot-header">
                <span className="study-snapshot-label">Study Snapshot</span>
                <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="study-snapshot-source"
                >
                    View primary source →
                </a>
            </div>
            <div className="study-snapshot-grid">
                <div className="study-snapshot-item">
                    <span className="study-snapshot-item-label">What it studied</span>
                    <span className="study-snapshot-item-value">{whatItStudied}</span>
                </div>
                <div className="study-snapshot-item">
                    <span className="study-snapshot-item-label">Method</span>
                    <div className="method-chips">
                        {methods.map((method) => (
                            <span key={method} className="method-chip">
                                {method}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="study-snapshot-item">
                    <span className="study-snapshot-item-label">Sample</span>
                    <span className="study-snapshot-item-value">{sample}</span>
                </div>
                <div className="study-snapshot-item">
                    <span className="study-snapshot-item-label">Key finding</span>
                    <span className="study-snapshot-item-value">
                        <strong>{keyFinding}</strong>
                    </span>
                </div>
                <div className="study-snapshot-item" style={{ gridColumn: "1 / -1" }}>
                    <span className="study-snapshot-item-label">So what for resumes</span>
                    <span className="study-snapshot-item-value">{soWhat}</span>
                </div>
            </div>
        </div>
    );
}
