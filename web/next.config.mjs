import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Keep Next's root inside web/ even with a monorepo lockfile.
    root: fileURLToPath(new URL(".", import.meta.url))
  },
  images: {
    qualities: [75, 100]
  }
};

export default nextConfig;






