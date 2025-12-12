type CalloutType = "myth" | "reality" | "recruiter" | "do" | "dont" | "confidence";
type ConfidenceLevel = "high" | "medium" | "early";

interface CalloutStripProps {
    type: CalloutType;
    label?: string;
    content: string;
    confidence?: ConfidenceLevel;
}

const defaultLabels: Record<CalloutType, string> = {
    myth: "Myth",
    reality: "Reality",
    recruiter: "Recruiter Lens",
    do: "Do this",
    dont: "Not that",
    confidence: "Confidence",
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
    high: "High",
    medium: "Medium",
    early: "Early signal",
};

export default function CalloutStrip({
    type,
    label,
    content,
    confidence,
}: CalloutStripProps) {
    const displayLabel = label || defaultLabels[type];

    return (
        <div className={`callout-strip callout-strip--${type}`}>
            <div className="callout-strip-label">
                {type === "confidence" && confidence ? (
                    <>
                        <span className={`confidence-badge confidence-badge--${confidence}`}>
                            {confidenceLabels[confidence]}
                        </span>
                    </>
                ) : (
                    displayLabel
                )}
            </div>
            <div className="callout-strip-content">{content}</div>
        </div>
    );
}
