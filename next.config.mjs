/** @type {import('next').NextConfig} */
const nextConfig = {
    // No CORS headers needed — frontend and API are on the same origin
    experimental: {
        serverComponentsExternalPackages: ['pdfkit'],
    },
    devIndicators: false,
};

export default nextConfig;
