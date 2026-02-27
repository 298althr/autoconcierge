/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        // We removed unoptimized: true to enable Next.js image optimization (resizing/chunking)
        // ensure sharp is installed in production for best performance.
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'exquisite-insight-production.up.railway.app',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.autoevolution.com',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '**.autoevolution.com',
                pathname: '/**',
            }
        ],
    },
};

module.exports = nextConfig;
