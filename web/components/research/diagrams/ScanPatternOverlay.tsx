/**
 * ScanPatternOverlay - F-pattern and spotted pattern visualization
 * Shows how eyes move when scanning a resume
 */

export default function ScanPatternOverlay() {
    return (
        <div className="hero-diagram">
            <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background document */}
                <rect
                    x="20"
                    y="20"
                    width="200"
                    height="240"
                    rx="4"
                    fill="var(--bg-card)"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                />

                {/* Content placeholder lines */}
                <rect x="35" y="40" width="150" height="8" rx="2" fill="var(--border-subtle)" />
                <rect x="35" y="55" width="120" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.6" />
                <rect x="35" y="75" width="170" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.5" />
                <rect x="35" y="85" width="140" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.4" />
                <rect x="35" y="95" width="160" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.3" />
                <rect x="35" y="115" width="130" height="6" rx="2" fill="var(--border-subtle)" />
                <rect x="35" y="130" width="165" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.5" />
                <rect x="35" y="140" width="145" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.4" />
                <rect x="35" y="150" width="155" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.3" />
                <rect x="35" y="170" width="120" height="6" rx="2" fill="var(--border-subtle)" />
                <rect x="35" y="185" width="150" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.4" />
                <rect x="35" y="195" width="135" height="5" rx="1" fill="var(--border-subtle)" fillOpacity="0.3" />
                <rect x="35" y="215" width="100" height="5" rx="2" fill="var(--border-subtle)" fillOpacity="0.5" />
                <rect x="35" y="230" width="80" height="4" rx="1" fill="var(--border-subtle)" fillOpacity="0.3" />

                {/* F-Pattern overlay */}
                {/* Top horizontal bar - strongest */}
                <rect
                    x="30"
                    y="35"
                    width="160"
                    height="35"
                    rx="4"
                    fill="var(--accent)"
                    fillOpacity="0.3"
                />
                {/* Second horizontal bar */}
                <rect
                    x="30"
                    y="110"
                    width="100"
                    height="25"
                    rx="4"
                    fill="var(--accent)"
                    fillOpacity="0.2"
                />
                {/* Left vertical bar */}
                <rect
                    x="30"
                    y="35"
                    width="25"
                    height="200"
                    rx="4"
                    fill="var(--accent)"
                    fillOpacity="0.15"
                />

                {/* Eye movement path */}
                <path
                    d="M45 50 H170 M170 50 C175 50 175 55 170 60 L45 80 M45 80 V120 H130 M130 120 C135 120 135 125 130 130 L45 145 M45 145 V180 H100"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                    fill="none"
                />

                {/* Eye dots at key positions */}
                <circle cx="45" cy="50" r="6" fill="var(--accent)" />
                <circle cx="170" cy="50" r="5" fill="var(--accent)" fillOpacity="0.8" />
                <circle cx="45" cy="80" r="5" fill="var(--accent)" fillOpacity="0.7" />
                <circle cx="130" cy="120" r="5" fill="var(--accent)" fillOpacity="0.6" />
                <circle cx="45" cy="145" r="4" fill="var(--accent)" fillOpacity="0.5" />
                <circle cx="100" cy="180" r="4" fill="var(--accent)" fillOpacity="0.4" />

                {/* Legend */}
                <rect x="240" y="30" width="90" height="90" rx="8" fill="var(--bg-card-alt)" stroke="var(--border-subtle)" />
                <text x="250" y="50" fontSize="10" fontWeight="700" fill="var(--text-main)">
                    F-Pattern
                </text>
                <rect x="250" y="60" width="12" height="8" rx="2" fill="var(--accent)" fillOpacity="0.3" />
                <text x="268" y="67" fontSize="8" fill="var(--text-soft)">High focus</text>
                <rect x="250" y="75" width="12" height="8" rx="2" fill="var(--accent)" fillOpacity="0.15" />
                <text x="268" y="82" fontSize="8" fill="var(--text-soft)">Skim zone</text>
                <circle cx="256" cy="100" r="4" fill="var(--accent)" />
                <text x="268" y="103" fontSize="8" fill="var(--text-soft)">Fixation</text>

                {/* Spotted pattern callouts */}
                <rect x="240" y="135" width="90" height="120" rx="8" fill="var(--bg-card-alt)" stroke="var(--border-subtle)" />
                <text x="250" y="155" fontSize="10" fontWeight="700" fill="var(--text-main)">
                    Eyes spot:
                </text>
                <text x="250" y="175" fontSize="9" fill="var(--accent)">• Numbers</text>
                <text x="250" y="190" fontSize="9" fill="var(--accent)">• Names</text>
                <text x="250" y="205" fontSize="9" fill="var(--accent)">• Titles</text>
                <text x="250" y="220" fontSize="9" fill="var(--accent)">• Dates</text>
                <text x="250" y="235" fontSize="9" fill="var(--accent)">• Keywords</text>
            </svg>
            <p className="hero-diagram-caption">
                The F-pattern: Eyes sweep horizontally at top, then scan the left side looking for anchors
            </p>
        </div>
    );
}
