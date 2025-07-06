/** @type {import('next').NextConfig} */
const nextConfig = {
    // Fast development configuration
    images: {
        unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in dev for speed
        formats: ['image/webp'],
        deviceSizes: [640, 828, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },

    // Disable SWC minification in development for faster compilation
    swcMinify: process.env.NODE_ENV === 'production',

    // Minimal experimental features for speed
    experimental: {
        // Only essential optimizations
        optimizePackageImports: ['lucide-react'],
        // Enable faster builds
        webVitalsAttribution: ['CLS', 'LCP'],
    },

    // Development-specific optimizations
    ...(process.env.NODE_ENV === 'development' && {
        // Faster builds in development
        generateBuildId: () => 'dev',
        // Disable type checking in development for speed
        typescript: {
            ignoreBuildErrors: true,
        },
        // Disable ESLint during builds for speed
        eslint: {
            ignoreDuringBuilds: true,
        },
    }),

    // Optimized headers for fast development
    async headers() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/(.*)',
                    headers: [
                        {
                            key: 'Cache-Control',
                            value: 'no-cache, no-store, must-revalidate, max-age=0',
                        },
                        {
                            key: 'Pragma',
                            value: 'no-cache',
                        },
                        {
                            key: 'Expires',
                            value: '0',
                        },
                        // Enable fast refresh
                        {
                            key: 'X-Content-Type-Options',
                            value: 'nosniff',
                        },
                    ],
                },
            ];
        }

        // Production headers
        return [
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
