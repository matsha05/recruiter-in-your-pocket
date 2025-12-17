import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Recruiter in Your Pocket',
        short_name: 'Pocket',
        description: 'See what recruiters see. Get feedback on your resume in seconds.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAFAFA',
        theme_color: '#0D9488', // Brand teal
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
            {
                src: '/apple-icon',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    }
}
