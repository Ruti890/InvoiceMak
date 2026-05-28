/** @type {import('next').NextConfig} */
const nextConfig = {
    // No CORS headers needed — frontend and API are on the same origin
    serverExternalPackages: ['pdfkit'],
    devIndicators: {
        buildActivity: false,
    },
    async rewrites() {
        return [
            { source: '/dashboard/clientes', destination: '/clients' },
            { source: '/dashboard/clientes/:path*', destination: '/clients/:path*' },
            { source: '/dashboard/facturas', destination: '/invoices' },
            { source: '/dashboard/facturas/crear', destination: '/invoices/create' },
            { source: '/dashboard/facturas/editar/:id', destination: '/invoices/edit/:id' },
            { source: '/dashboard/productos', destination: '/products' },
            { source: '/dashboard/reportes', destination: '/reports' },
            { source: '/dashboard/configuracion', destination: '/settings' },
        ];
    },
};

export default nextConfig;
