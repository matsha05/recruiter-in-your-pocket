/**
 * ResumeScanZones - Eye-tracking heatmap visualization
 * Shows where recruiters look first on a resume
 */

export default function ResumeScanZones() {
    return (
        <div className="hero-diagram">
            <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Resume background */}
                <rect
                    x="20"
                    y="20"
                    width="260"
                    height="360"
                    rx="4"
                    fill="var(--bg-card)"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                />

                {/* Header zone - HOTTEST */}
                <rect
                    x="35"
                    y="35"
                    width="230"
                    height="60"
                    rx="4"
                    fill="var(--accent)"
                    fillOpacity="0.25"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                />
                <circle cx="250" cy="45" r="14" fill="var(--accent)" />
                <text
                    x="250"
                    y="50"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="white"
                >
                    1
                </text>
                <text x="45" y="55" fontSize="10" fontWeight="600" fill="var(--accent)">
                    Name & Title
                </text>
                <text x="45" y="70" fontSize="8" fill="var(--text-muted)">
                    6 sec attention peak
                </text>

                {/* Current role zone - HOT */}
                <rect
                    x="35"
                    y="110"
                    width="230"
                    height="75"
                    rx="4"
                    fill="var(--accent)"
                    fillOpacity="0.18"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                />
                <circle cx="250" cy="120" r="14" fill="var(--accent)" fillOpacity="0.8" />
                <text
                    x="250"
                    y="125"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="white"
                >
                    2
                </text>
                <text x="45" y="130" fontSize="10" fontWeight="600" fill="var(--accent)">
                    Current Role
                </text>
                <rect x="45" y="140" width="180" height="6" rx="2" fill="var(--border-subtle)" />
                <rect x="45" y="152" width="140" height="6" rx="2" fill="var(--border-subtle)" />
                <rect x="45" y="164" width="160" height="6" rx="2" fill="var(--border-subtle)" />

                {/* Previous role zone - WARM */}
                <rect
                    x="35"
                    y="200"
                    width="230"
                    height="65"
                    rx="4"
                    fill="var(--accent)"
                    fillOpacity="0.10"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                />
                <circle cx="250" cy="210" r="14" fill="var(--accent)" fillOpacity="0.6" />
                <text
                    x="250"
                    y="215"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="white"
                >
                    3
                </text>
                <text x="45" y="220" fontSize="10" fontWeight="600" fill="var(--text-soft)">
                    Previous Role
                </text>
                <rect x="45" y="230" width="160" height="5" rx="2" fill="var(--border-subtle)" />
                <rect x="45" y="240" width="130" height="5" rx="2" fill="var(--border-subtle)" />
                <rect x="45" y="250" width="145" height="5" rx="2" fill="var(--border-subtle)" />

                {/* Skills zone - COOL */}
                <rect
                    x="35"
                    y="280"
                    width="110"
                    height="45"
                    rx="4"
                    fill="var(--text-muted)"
                    fillOpacity="0.08"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                />
                <circle cx="130" cy="290" r="12" fill="var(--text-muted)" fillOpacity="0.5" />
                <text
                    x="130"
                    y="294"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="white"
                >
                    4
                </text>
                <text x="45" y="300" fontSize="9" fontWeight="500" fill="var(--text-muted)">
                    Skills
                </text>
                <rect x="45" y="308" width="80" height="4" rx="2" fill="var(--border-subtle)" />

                {/* Education zone - COOLEST */}
                <rect
                    x="155"
                    y="280"
                    width="110"
                    height="45"
                    rx="4"
                    fill="var(--text-muted)"
                    fillOpacity="0.05"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                />
                <circle cx="250" cy="290" r="12" fill="var(--text-muted)" fillOpacity="0.3" />
                <text
                    x="250"
                    y="294"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="white"
                >
                    5
                </text>
                <text x="165" y="300" fontSize="9" fontWeight="500" fill="var(--text-muted)">
                    Education
                </text>
                <rect x="165" y="308" width="70" height="4" rx="2" fill="var(--border-subtle)" />

                {/* Footer placeholder */}
                <rect x="35" y="340" width="230" height="25" rx="4" fill="var(--border-subtle)" fillOpacity="0.3" />
                <text x="150" y="357" textAnchor="middle" fontSize="8" fill="var(--text-muted)">
                    Contact & links (scanned last)
                </text>
            </svg>
            <p className="hero-diagram-caption">
                Eye-tracking heatmap: Darker zones = more recruiter attention in the first 6 seconds
            </p>
        </div>
    );
}
