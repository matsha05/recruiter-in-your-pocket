import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './public/manifest.json';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const developmentOrigin = mode === 'development'
        ? new URL(env.VITE_WEBAPP_URL || 'http://localhost:3000').origin
        : null;
    const buildManifest = developmentOrigin
        ? { ...manifest, host_permissions: [...manifest.host_permissions, `${developmentOrigin}/*`] }
        : manifest;

    return {
    plugins: [
        react(),
        crx({ manifest: buildManifest }),
    ],
    build: {
        outDir: 'dist',
        emptyDirBeforeWrite: true,
        target: 'esnext',
        minify: false,
        sourcemap: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/index.html'),
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            port: 5173,
        },
    },
    };
});
