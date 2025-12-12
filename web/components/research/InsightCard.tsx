import type { ReactNode } from "react";

interface InsightCardProps {
    icon: ReactNode;
    title: string;
    research: string;
    riyp: string;
}

export default function InsightCard({ icon, title, research, riyp }: InsightCardProps) {
    return (
        <div className="insight-card">
            <div className="insight-card-icon">{icon}</div>
            <h3 className="insight-card-title">{title}</h3>
            <p className="insight-card-research">{research}</p>
            <p className="insight-card-riyp">RIYP: {riyp}</p>
        </div>
    );
}
