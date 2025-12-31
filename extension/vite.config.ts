import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyDirBeforeWrite: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/index.html'),
                'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
                'content-script-linkedin': resolve(__dirname, 'src/content/linkedin.ts'),
                'content-script-indeed': resolve(__dirname, 'src/content/indeed.ts'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'popup') {
                        return 'popup.js';
                    }
                    return '[name].js';
                },
                chunkFileNames: 'chunks/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        if (assetInfo.name.includes('content')) {
                            return 'content-styles.css';
                        }
                        return 'popup.css';
                    }
                    return 'assets/[name].[ext]';
                },
            },
        },
        target: 'esnext',
        minify: false,
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    publicDir: 'public',
});
