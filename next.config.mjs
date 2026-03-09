/** @type {import('next').NextConfig} */
const nextConfig = {
    // No CORS headers needed — frontend and API are on the same origin
    serverExternalPackages: ['pdfkit'],
    devIndicators: {
        buildActivity: false,
    },
};

export default nextConfig;
