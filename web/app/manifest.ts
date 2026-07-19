import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Recruiter in Your Pocket',
        short_name: 'Pocket',
        description: 'See what stands out, what raises a question, and what to fix first.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FBFAF7',
        theme_color: '#4F46E5',
        icons: [
            {
                src: '/icon/small',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/icon/medium',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon/large',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
