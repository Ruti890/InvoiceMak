'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Users, ShoppingBag, FileText, Settings,
    LogOut, ChevronLeft, ChevronRight, Bell, Search,
    BarChart2, X, Menu, Shield, TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/dashboard/clientes', icon: Users, label: 'Clientes' },
    { path: '/dashboard/facturas', icon: FileText, label: 'Facturas' },
    { path: '/dashboard/productos', icon: ShoppingBag, label: 'Productos' },
    { path: '/dashboard/reportes', icon: BarChart2, label: 'Reportes' },
    { path: '/dashboard/configuracion', icon: Settings, label: 'Configuración' },
];

export default function DashboardLayout({ children }) {
    const { logout, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Persist sidebar state
    useEffect(() => {
        const saved = localStorage.getItem('lexis_sidebar_collapsed');
        if (saved !== null) setCollapsed(saved === 'true');
    }, []);
    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('lexis_sidebar_collapsed', String(next));
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const isActive = (item) => {
        if (item.exact) return pathname === item.path;
        // handle rewrites: /dashboard/clientes shows as /clients internally
        const rewriteMap = {
            '/dashboard/clientes': '/clients',
            '/dashboard/facturas': '/invoices',
            '/dashboard/productos': '/products',
            '/dashboard/reportes': '/reports',
            '/dashboard/configuracion': '/settings',
        };
        const alt = rewriteMap[item.path];
        return pathname.startsWith(item.path) || (alt && pathname.startsWith(alt));
    };

    const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
    const userName = user?.name || user?.email?.split('@')[0] || 'Usuario';

    return (
        <div className="flex h-screen bg-[#0a0a0a] overflow-hidden font-[Inter]">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`
                fixed lg:relative inset-y-0 left-0 z-50 flex flex-col
                bg-[#111111] border-r border-[#1e1e1e]
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-[60px]' : 'w-[240px]'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className={`flex items-center h-14 border-b border-[#1e1e1e] shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
                    {collapsed ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            L
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                L
                            </div>
                            <span className="font-semibold text-white tracking-tight text-[15px]">Lexis</span>
                        </div>
                    )}
                    {/* Mobile close */}
                    {!collapsed && (
                        <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-[#666] hover:text-white">
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.label : undefined}
                                className={`
                                    relative flex items-center h-10 mx-2 my-0.5 rounded-[6px]
                                    transition-all duration-200 group
                                    ${collapsed ? 'justify-center px-0' : 'px-3'}
                                    ${active
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a]'
                                    }
                                `}
                            >
                                {/* Green left border indicator */}
                                {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-green-500 rounded-r-full" />
                                )}
                                <item.icon
                                    size={16}
                                    className={`shrink-0 ${active ? 'text-green-400' : 'text-[#555] group-hover:text-[#aaa]'} transition-colors`}
                                />
                                {!collapsed && (
                                    <span className="ml-2.5 text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                                )}
                                {/* Tooltip for collapsed */}
                                {collapsed && (
                                    <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Admin link */}
                    {user?.role === 'admin' && (
                        <Link
                            href="/admin"
                            title={collapsed ? 'Admin' : undefined}
                            className={`
                                relative flex items-center h-10 mx-2 my-0.5 rounded-[6px]
                                transition-all duration-200 group
                                ${collapsed ? 'justify-center px-0' : 'px-3'}
                                ${pathname.startsWith('/admin') ? 'bg-red-500/10 text-red-400' : 'text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a]'}
                            `}
                        >
                            {pathname.startsWith('/admin') && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-red-500 rounded-r-full" />
                            )}
                            <Shield size={16} className="shrink-0" />
                            {!collapsed && <span className="ml-2.5 text-[13px] font-medium">Admin</span>}
                        </Link>
                    )}
                </nav>

                {/* User + Collapse */}
                <div className="border-t border-[#1e1e1e] shrink-0">
                    {/* User info */}
                    {!collapsed && (
                        <div className="px-3 py-2.5 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                {userInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-medium text-[#ddd] truncate leading-tight">{userName}</p>
                                <p className="text-[10px] text-[#555] truncate leading-tight">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Cerrar sesión"
                                className="ml-auto text-[#555] hover:text-red-400 transition-colors shrink-0"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    )}

                    {/* Collapse toggle */}
                    <button
                        onClick={toggleCollapsed}
                        className={`w-full flex items-center justify-center h-9 border-t border-[#1e1e1e] text-[#444] hover:text-[#aaa] hover:bg-[#1a1a1a] transition-all`}
                    >
                        {collapsed ? <ChevronRight size={14} /> : (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium">
                                <ChevronLeft size={14} />
                                Contraer
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* ── TOP HEADER ── */}
                <header className="h-14 bg-[#111111] border-b border-[#1e1e1e] flex items-center gap-3 px-4 lg:px-5 shrink-0 z-30">
                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[#666] hover:text-white transition-colors">
                        <Menu size={20} />
                    </button>

                    {/* Page title from pathname */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[#555] text-[12px]">
                        <span>Lexis</span>
                        <span>/</span>
                        <span className="text-[#aaa] capitalize">
                            {pathname === '/dashboard' ? 'Dashboard' :
                             pathname.startsWith('/dashboard/clientes') || pathname.startsWith('/clients') ? 'Clientes' :
                             pathname.startsWith('/dashboard/facturas') || pathname.startsWith('/invoices') ? 'Facturas' :
                             pathname.startsWith('/dashboard/productos') || pathname.startsWith('/products') ? 'Productos' :
                             pathname.startsWith('/dashboard/reportes') || pathname.startsWith('/reports') ? 'Reportes' :
                             pathname.startsWith('/dashboard/configuracion') || pathname.startsWith('/settings') ? 'Configuración' :
                             'Panel'}
                        </span>
                    </div>

                    {/* Search */}
                    <div className={`relative ml-auto transition-all duration-300 ${searchOpen ? 'w-56 sm:w-72' : 'w-8'}`}>
                        {searchOpen ? (
                            <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] px-2.5 h-8">
                                <Search size={13} className="text-[#555] shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Buscar..."
                                    className="flex-1 bg-transparent text-[13px] text-white placeholder-[#555] ml-2 outline-none"
                                    onBlur={() => setSearchOpen(false)}
                                />
                                <button onClick={() => setSearchOpen(false)} className="text-[#555] hover:text-white ml-1">
                                    <X size={13} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1a1a1a] rounded-[6px] transition-all"
                            >
                                <Search size={15} />
                            </button>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                            className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1a1a1a] rounded-[6px] transition-all relative"
                        >
                            <Bell size={15} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                        </button>
                        {notifOpen && (
                            <div className="absolute right-0 top-10 w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] shadow-2xl z-50 overflow-hidden fade-in-up">
                                <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
                                    <span className="text-[13px] font-semibold text-white">Notificaciones</span>
                                    <span className="text-[10px] text-green-400 font-medium">2 nuevas</span>
                                </div>
                                {[
                                    { msg: 'Factura #1045 marcada como pagada', time: 'Hace 10 min', dot: 'bg-green-500' },
                                    { msg: 'Factura #1042 está vencida', time: 'Hace 2 horas', dot: 'bg-red-500' },
                                    { msg: 'Nuevo cliente registrado', time: 'Ayer', dot: 'bg-blue-500' },
                                ].map((n, i) => (
                                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#222] transition-colors cursor-pointer border-b border-[#1e1e1e] last:border-0">
                                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${n.dot}`} />
                                        <div>
                                            <p className="text-[12px] text-[#ccc] leading-snug">{n.msg}</p>
                                            <p className="text-[10px] text-[#555] mt-0.5">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Avatar / Profile */}
                    <div className="relative">
                        <button
                            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-[11px] font-bold hover:ring-2 hover:ring-green-500/40 transition-all"
                        >
                            {userInitial}
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 top-10 w-52 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] shadow-2xl z-50 overflow-hidden fade-in-up">
                                <div className="px-4 py-3 border-b border-[#2a2a2a]">
                                    <p className="text-[13px] font-semibold text-white truncate">{userName}</p>
                                    <p className="text-[11px] text-[#555] truncate">{user?.email}</p>
                                </div>
                                <Link
                                    href="/dashboard/configuracion"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-[#999] hover:text-white hover:bg-[#222] transition-colors"
                                >
                                    <Settings size={13} /> Configuración
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors border-t border-[#1e1e1e]"
                                >
                                    <LogOut size={13} /> Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── PAGE CONTENT ── */}
                <main className="flex-1 overflow-auto bg-[#0a0a0a]">
                    <div className="h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
