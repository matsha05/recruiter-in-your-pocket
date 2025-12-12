interface Source {
    name: string;
    url: string;
    date?: string;
}

interface SourcesNotesProps {
    sources: Source[];
    methodology: string[];
    limitations?: string;
}

export default function SourcesNotes({
    sources,
    methodology,
    limitations,
}: SourcesNotesProps) {
    return (
        <div className="sources-notes">
            <h3 className="sources-notes-title">Sources &amp; Notes</h3>
            <div className="sources-notes-grid">
                <div className="sources-notes-section">
                    <h4>Primary Sources</h4>
                    <ul>
                        {sources.map((source, i) => (
                            <li key={i}>
                                <a href={source.url} target="_blank" rel="noopener noreferrer">
                                    {source.name}
                                </a>
                                {source.date && <span> ({source.date})</span>}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="sources-notes-section">
                    <h4>Methodology</h4>
                    <ul>
                        {methodology.map((note, i) => (
                            <li key={i}>{note}</li>
                        ))}
                    </ul>
                </div>
                {limitations && (
                    <p className="sources-notes-limitation">
                        <strong>Limitations:</strong> {limitations}
                    </p>
                )}
            </div>
        </div>
    );
}
