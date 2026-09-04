/**
 * AuthPrompt Component
 *
 * Uses the web app's single secure auth entry point so extension auth stays
 * aligned with the product's real sign-in flow.
 */

import { getLoginUrl } from '../../background/api';
import { popupContent } from '../content';

interface AuthPromptProps {
    onLogin: () => void;
}

export default function AuthPrompt({ onLogin }: AuthPromptProps) {
    const signupUrl = getLoginUrl();

    return (
        <div className="auth-prompt">
            <div className="auth-icon">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
            </div>

            <h2 className="auth-title">{popupContent.auth.title}</h2>
            <p className="auth-description">
                {popupContent.auth.description}
            </p>
            <p className="auth-support">{popupContent.auth.supportLine}</p>

            <div className="auth-buttons">
                <button type="button" className="btn btn-primary" onClick={onLogin}>
                    {popupContent.auth.primaryCta}
                </button>
            </div>

            <p className="auth-footer">
                {popupContent.auth.footer} <a href={signupUrl} target="_blank" rel="noopener noreferrer">Create one free</a>
            </p>
        </div>
    );
}
