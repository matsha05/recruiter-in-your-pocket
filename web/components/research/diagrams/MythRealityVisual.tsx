/**
 * MythRealityVisual - ATS myth vs reality visualization
 * Shows the contrast between common myths and actual ATS behavior
 */

export default function MythRealityVisual() {
    return (
        <div className="hero-diagram">
            <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Myth side */}
                <rect x="10" y="20" width="180" height="160" rx="12" fill="rgba(239, 68, 68, 0.06)" stroke="rgba(239, 68, 68, 0.2)" />
                <text x="100" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="#DC2626">
                    THE MYTH
                </text>

                {/* Robot trash can icon */}
                <g transform="translate(60, 65)">
                    {/* Trash can body */}
                    <rect x="20" y="25" width="40" height="50" rx="4" fill="#DC2626" fillOpacity="0.2" stroke="#DC2626" strokeWidth="1.5" />
                    {/* Trash can lid */}
                    <rect x="15" y="18" width="50" height="8" rx="2" fill="#DC2626" fillOpacity="0.3" stroke="#DC2626" strokeWidth="1.5" />
                    {/* Handle */}
                    <rect x="35" y="10" width="10" height="10" rx="2" fill="#DC2626" fillOpacity="0.2" stroke="#DC2626" strokeWidth="1.5" />
                    {/* Robot eyes */}
                    <circle cx="32" cy="45" r="5" fill="#DC2626" />
                    <circle cx="48" cy="45" r="5" fill="#DC2626" />
                    <circle cx="32" cy="45" r="2" fill="white" />
                    <circle cx="48" cy="45" r="2" fill="white" />
                    {/* X crossed out */}
                    <line x1="5" y1="10" x2="75" y2="80" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
                    <line x1="75" y1="10" x2="5" y2="80" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
                </g>

                <text x="100" y="160" textAnchor="middle" fontSize="9" fill="#DC2626" fontWeight="500">
                    &quot;75% auto-deleted&quot;
                </text>

                {/* Divider */}
                <line x1="200" y1="40" x2="200" y2="160" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4 4" />
                <text x="200" y="100" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-muted)">
                    vs
                </text>

                {/* Reality side */}
                <rect x="210" y="20" width="180" height="160" rx="12" fill="rgba(34, 197, 94, 0.06)" stroke="rgba(34, 197, 94, 0.2)" />
                <text x="300" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16A34A">
                    THE REALITY
                </text>

                {/* Database with human icon */}
                <g transform="translate(260, 60)">
                    {/* Database */}
                    <ellipse cx="20" cy="10" rx="20" ry="8" fill="#16A34A" fillOpacity="0.2" stroke="#16A34A" strokeWidth="1.5" />
                    <path d="M0 10 V50 C0 55 9 60 20 60 C31 60 40 55 40 50 V10" fill="#16A34A" fillOpacity="0.15" stroke="#16A34A" strokeWidth="1.5" />
                    <ellipse cx="20" cy="30" rx="20" ry="6" fill="none" stroke="#16A34A" strokeWidth="1" strokeOpacity="0.5" />
                    <ellipse cx="20" cy="50" rx="20" ry="8" fill="#16A34A" fillOpacity="0.2" stroke="#16A34A" strokeWidth="1.5" />

                    {/* Arrow to human */}
                    <path d="M45 30 L55 30" stroke="#16A34A" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />

                    {/* Human reviewer */}
                    <circle cx="70" cy="25" r="10" fill="#16A34A" fillOpacity="0.3" stroke="#16A34A" strokeWidth="1.5" />
                    <circle cx="70" cy="20" r="4" fill="#16A34A" fillOpacity="0.5" />
                    <path d="M62 45 C62 38 70 35 70 35 C70 35 78 38 78 45" fill="#16A34A" fillOpacity="0.3" stroke="#16A34A" strokeWidth="1.5" />
                </g>

                <text x="300" y="145" textAnchor="middle" fontSize="9" fill="#16A34A" fontWeight="500">
                    Database → Search → Human
                </text>
                <text x="300" y="160" textAnchor="middle" fontSize="8" fill="var(--text-muted)">
                    Ranking, not rejection
                </text>

                {/* Arrow marker definition */}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#16A34A" />
                    </marker>
                </defs>
            </svg>
            <p className="hero-diagram-caption">
                ATS tools organize and rank resumes—they rarely auto-delete them
            </p>
        </div>
    );
}
