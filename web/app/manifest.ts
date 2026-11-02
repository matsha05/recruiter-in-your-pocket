import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Recruiter in Your Pocket',
        short_name: 'RIYP',
        description: 'See what a recruiter sees: your Verdict, where your resume stands, and what to fix first.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f4f4f1',
        theme_color: '#111513',
        // Favicon C2, "The Noted R" (Matt, Nov 1, 2026), built by scripts/brand-assets.mjs.
        icons: [
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
            { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    }
}
