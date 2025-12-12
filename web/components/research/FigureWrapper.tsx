import type { ReactNode } from "react";

interface FigureWrapperProps {
    figureNumber: number;
    title: string;
    caption: string;
    children: ReactNode;
}

/**
 * FigureWrapper - Consistent figure labeling for research diagrams
 * Adds "Figure N: Title" header and structured caption
 */
export default function FigureWrapper({
    figureNumber,
    title,
    caption,
    children,
}: FigureWrapperProps) {
    return (
        <figure className="research-figure">
            <div className="research-figure-header">
                <span className="research-figure-number">Figure {figureNumber}</span>
                <span className="research-figure-title">{title}</span>
            </div>
            <div className="research-figure-content">{children}</div>
            <figcaption className="research-figure-caption">{caption}</figcaption>
        </figure>
    );
}
