/**
 * Onboarding Component — Premium Edition
 * 
 * First-run experience with refined visual hierarchy and custom icons.
 */

import { popupContent } from "../content";

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    return (
        <div className="onboarding">
            <div className="onboarding-hero">
                <div className="onboarding-icon">
                    {/* Custom target icon with brand styling */}
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hero-icon-svg"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </svg>
                </div>
                <h2 className="onboarding-title">{popupContent.onboarding.title}</h2>
                <p className="onboarding-subtitle">
                    {popupContent.onboarding.subtitle}
                </p>
            </div>

            <div className="onboarding-features">
                <div className="onboarding-feature">
                    <span className="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </span>
                    <div>
                        <strong>{popupContent.onboarding.primaryFeature.title}</strong>
                        <p>{popupContent.onboarding.primaryFeature.body}</p>
                    </div>
                </div>

                {popupContent.onboarding.supportingFeatures.map((feature, index) => (
                    <div key={feature.title} className="onboarding-feature">
                        <span className="feature-icon">
                            {index === 0 ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                </svg>
                            )}
                        </span>
                        <div>
                            <strong>{feature.title}</strong>
                            <p>{feature.body}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn btn-primary onboarding-cta" onClick={onComplete}>
                {popupContent.onboarding.cta}
                <span className="btn-arrow">→</span>
            </button>
        </div>
    );
}
