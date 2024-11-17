/** @type {import('next').NextConfig} */
export const images = {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: '**',  // Wildcard for all hostnames
        },
        {
            protocol: 'http',
            hostname: '**',  // Wildcard for http as well (optional if you need http)
        },
    ],
};

const nextConfig = {
    images,
};

export default nextConfig;
