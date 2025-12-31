/**
 * AuthPrompt Component — Premium Edition
 * 
 * Elegant auth prompt with Google OAuth button matching web app's auth flow.
 */

interface AuthPromptProps {
    onLogin: () => void;
}

export default function AuthPrompt({ onLogin }: AuthPromptProps) {
    function handleGoogleLogin() {
        // Open Google OAuth in popup window
        const width = 500;
        const height = 600;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        const popup = window.open(
            'http://localhost:3000/auth/google?from=extension',
            'riyp-auth',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for auth completion
        const checkAuth = setInterval(async () => {
            try {
                if (popup?.closed) {
                    clearInterval(checkAuth);
                    // Check if auth succeeded
                    const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
                    if (response.success && response.data?.authenticated) {
                        window.location.reload();
                    }
                }
            } catch {
                // Popup still open or error
            }
        }, 500);
    }

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

            <h2 className="auth-title">Sign in to unlock</h2>
            <p className="auth-description">
                Connect your RIYP account to save jobs across devices and get personalized match scores.
            </p>

            <div className="auth-buttons">
                <button className="btn btn-google" onClick={handleGoogleLogin}>
                    <svg viewBox="0 0 24 24" className="google-icon">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <button className="btn btn-secondary" onClick={onLogin}>
                    Sign in with Email
                </button>
            </div>

            <p className="auth-footer">
                Don&apos;t have an account? <a href="http://localhost:3000/signup" target="_blank" rel="noopener noreferrer">Sign up free</a>
            </p>
        </div>
    );
}
