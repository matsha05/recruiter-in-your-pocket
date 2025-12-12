"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface ExpandCollapseProps {
    title: string;
    children: ReactNode;
    defaultExpanded?: boolean;
}

export default function ExpandCollapse({
    title,
    children,
    defaultExpanded = false,
}: ExpandCollapseProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className="expand-collapse" data-expanded={expanded}>
            <button
                className="expand-collapse-trigger"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
            >
                <span>{title}</span>
                <span className="expand-collapse-icon">▼</span>
            </button>
            <div className="expand-collapse-content">{children}</div>
        </div>
    );
}
