'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, ShoppingBag, FileText, Settings, LogOut, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
    const { logout, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/clients', icon: Users, label: 'Clients' },
        { path: '/products', icon: ShoppingBag, label: 'Products' },
        { path: '/invoices', icon: FileText, label: 'Invoices' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Lexis
                    </h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                                flex items-center p-3 rounded-xl transition-all duration-200
                                ${isActive(item.path)
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                                }
                            `}
                        >
                            <item.icon size={20} className={`mr-3 ${isActive(item.path) ? 'text-blue-400' : ''}`} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}

                    {user?.role === 'admin' && (
                        <Link
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                                flex items-center p-3 rounded-xl transition-all duration-200
                                ${isActive('/admin')
                                    ? 'bg-red-600/10 text-red-400 border border-red-600/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                                }
                            `}
                        >
                            <Shield size={20} className={`mr-3 ${isActive('/admin') ? 'text-red-400' : ''}`} />
                            <span className="font-medium">Admin Panel</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center mb-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-200 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={20} className="mr-2" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden bg-[#111] border-b border-gray-800 p-4 flex items-center justify-between z-30">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-400">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-100">Lexis</span>
                    <div className="w-6" />
                </header>

                <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px]"></div>
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px]"></div>
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
