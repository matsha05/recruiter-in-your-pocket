"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreDialProps {
    score: number;
    label?: string;
}

export default function ScoreDial({ score, label = "Score" }: ScoreDialProps) {
    const progressRef = useRef<SVGCircleElement>(null);
    const [displayedScore, setDisplayedScore] = useState(0);
    const animationRef = useRef<number | null>(null);

    // Circle parameters
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    // Calculate color class based on score
    const getScoreColorClass = (s: number) => {
        if (s >= 90) return "score-exceptional";
        if (s >= 85) return "score-strong";
        if (s >= 80) return "score-good";
        if (s >= 70) return "score-needs-work";
        return "score-risk";
    };

    // Calculate color value based on score
    const getScoreColor = (s: number) => {
        if (s >= 90) return "var(--score-exceptional)";
        if (s >= 85) return "var(--score-strong)";
        if (s >= 80) return "var(--success)";
        if (s >= 70) return "var(--warning)";
        return "var(--error)";
    };

    // Animate both the number and the dial progress
    useEffect(() => {
        if (!score || score <= 0) {
            setDisplayedScore(0);
            if (progressRef.current) {
                progressRef.current.style.strokeDashoffset = String(circumference);
            }
            return;
        }

        const duration = 1200; // 1.2 seconds
        const startTime = Date.now();
        const startScore = 0;
        const targetScore = score;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic: 1 - (1 - x)^3
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentScore = Math.round(startScore + (targetScore - startScore) * eased);
            setDisplayedScore(currentScore);

            // Also animate the dial progress
            if (progressRef.current) {
                const currentProgress = currentScore / 100;
                const offset = circumference - (currentProgress * circumference);
                progressRef.current.style.strokeDashoffset = String(offset);
                progressRef.current.style.stroke = getScoreColor(currentScore);
            }

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Ensure final values are exact
                setDisplayedScore(targetScore);
                if (progressRef.current) {
                    const finalOffset = circumference - ((targetScore / 100) * circumference);
                    progressRef.current.style.strokeDashoffset = String(finalOffset);
                    progressRef.current.style.stroke = getScoreColor(targetScore);
                }
            }
        };

        // Start animation after a small delay for visual effect
        const timeoutId = setTimeout(() => {
            animationRef.current = requestAnimationFrame(animate);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [score, circumference]);

    const colorClass = getScoreColorClass(score);

    return (
        <div
            className={`score-dial-container ${colorClass}`}
            style={{
                // DEBUG: Bright background to confirm rendering
                background: 'rgba(255,0,0,0.2)',
                border: '3px solid red',
                minWidth: '150px',
                minHeight: '150px'
            }}
        >
            <div className="score-dial">
                <svg viewBox="0 0 120 120">
                    <circle className="score-dial-bg" cx="60" cy="60" r={radius} />
                    <circle
                        ref={progressRef}
                        className="score-dial-progress"
                        cx="60"
                        cy="60"
                        r={radius}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: circumference
                        }}
                    />
                </svg>
                <div className="score-dial-number">{displayedScore || "—"}</div>
            </div>
            <div className="score-dial-label">{label}</div>
        </div>
    );
}
