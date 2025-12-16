/**
 * Wordmark Component
 * 
 * The "pocket" wordmark in Fraunces-inspired serif letterforms.
 * Path-based for consistent rendering without font dependencies.
 * 
 * Usage: <Wordmark className="h-6 text-foreground" />
 */

interface WordmarkProps {
    className?: string;
}

export function Wordmark({ className = "" }: WordmarkProps) {
    return (
        <svg
            viewBox="0 0 280 64"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="pocket"
            role="img"
        >
            {/* p */}
            <path d="M8 16 L8 56 L14 56 L14 42 C16 44 20 46 26 46 C36 46 44 38 44 30 C44 22 36 14 26 14 C20 14 16 16 14 18 L14 16 L8 16 Z M14 24 C16 21 20 20 25 20 C32 20 38 24 38 30 C38 36 32 40 25 40 C20 40 16 39 14 36 L14 24 Z" />

            {/* o */}
            <path d="M66 14 C52 14 46 24 46 30 C46 36 52 46 66 46 C80 46 86 36 86 30 C86 24 80 14 66 14 Z M66 20 C76 20 80 25 80 30 C80 35 76 40 66 40 C56 40 52 35 52 30 C52 25 56 20 66 20 Z" />

            {/* c */}
            <path d="M108 14 C94 14 88 24 88 30 C88 36 94 46 108 46 C116 46 122 42 126 38 L122 34 C119 37 115 40 108 40 C98 40 94 35 94 30 C94 25 98 20 108 20 C115 20 119 23 122 26 L126 22 C122 18 116 14 108 14 Z" />

            {/* k */}
            <path d="M130 8 L130 56 L136 56 L136 34 L156 56 L164 56 L144 34 L162 14 L154 14 L136 32 L136 8 L130 8 Z" />

            {/* e */}
            <path d="M186 14 C172 14 166 24 166 30 C166 36 172 46 186 46 C196 46 202 40 206 36 L202 32 C199 35 195 40 186 40 C177 40 172 36 172 31 L206 31 C206 30 206 29 206 28 C206 22 200 14 186 14 Z M186 20 C195 20 200 24 200 28 L172 28 C172 24 177 20 186 20 Z" />

            {/* t */}
            <path d="M210 8 L210 14 L218 14 L218 40 C218 44 220 46 226 46 C230 46 234 44 236 42 L234 38 C232 39 230 40 228 40 C225 40 224 39 224 36 L224 14 L238 14 L238 8 L224 8 L224 0 L218 2 L218 8 L210 8 Z" />
        </svg>
    );
}
