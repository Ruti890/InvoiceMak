'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    DollarSign, FileText, Users, TrendingUp, ArrowUpRight,
    MoreHorizontal, CheckCircle2, Clock, XCircle, FileMinus
} from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    Tooltip, CartesianGrid, Area, AreaChart
} from 'recharts';
import MetricCard from '@/components/ui/MetricCard';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import PageHeader from '@/components/ui/PageHeader';

// ── Mocked trend data (12 months) ──────────────────────────────────────────
const trendData = [
    { mes: 'Ene', real: 1200000, meta: 1500000 },
    { mes: 'Feb', real: 1850000, meta: 1600000 },
    { mes: 'Mar', real: 1400000, meta: 1700000 },
    { mes: 'Abr', real: 2100000, meta: 1800000 },
    { mes: 'May', real: 1900000, meta: 1900000 },
    { mes: 'Jun', real: 2400000, meta: 2000000 },
    { mes: 'Jul', real: 2200000, meta: 2100000 },
    { mes: 'Ago', real: 2800000, meta: 2200000 },
    { mes: 'Sep', real: 2600000, meta: 2300000 },
    { mes: 'Oct', real: 3100000, meta: 2400000 },
    { mes: 'Nov', real: 2900000, meta: 2500000 },
    { mes: 'Dic', real: 3400000, meta: 2600000 },
];

// ── Pipeline stages ─────────────────────────────────────────────────────────
const pipelineStages = [
    { label: 'Pagadas',  count: 0, color: '#22c55e', pct: 0, icon: CheckCircle2 },
    { label: 'Enviadas', count: 0, color: '#3b82f6', pct: 0, icon: ArrowUpRight },
    { label: 'Pendiente',count: 0, color: '#f59e0b', pct: 0, icon: Clock },
    { label: 'Vencidas', count: 0, color: '#ef4444', pct: 0, icon: XCircle },
    { label: 'Borrador', count: 0, color: '#555',    pct: 0, icon: FileMinus },
];

// ── Custom tooltip for chart ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const fmt = (v) => `$${(v / 1000000).toFixed(2)}M`;
    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] px-3 py-2.5 shadow-xl text-[12px]">
            <p className="text-[#888] mb-1.5 font-medium">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-[#aaa]">{p.name === 'real' ? 'Real' : 'Meta'}: </span>
                    <span className="text-white font-semibold">{fmt(p.value)}</span>
                </div>
            ))}
        </div>
    );
};

// ── Avatar letter helper ─────────────────────────────────────────────────────
const AvatarLetter = ({ name, size = 'sm', color = 'from-green-500 to-emerald-700' }) => {
    const sz = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-8 h-8 text-[12px]';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0`}>
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pipeline, setPipeline] = useState(pipelineStages);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);

                    // Build pipeline from real invoices
                    const invoices = data.recentInvoices || [];
                    const counts = { paid: 0, sent: 0, pending: 0, overdue: 0, draft: 0 };
                    invoices.forEach(inv => {
                        const s = inv.status?.toLowerCase();
                        if (s in counts) counts[s]++;
                    });
                    const total = invoices.length || 1;
                    setPipeline([
                        { label: 'Pagadas',   count: counts.paid,    color: '#22c55e', pct: Math.round(counts.paid    / total * 100), icon: CheckCircle2 },
                        { label: 'Enviadas',  count: counts.sent,    color: '#3b82f6', pct: Math.round(counts.sent    / total * 100), icon: ArrowUpRight },
                        { label: 'Pendiente', count: counts.pending,  color: '#f59e0b', pct: Math.round(counts.pending / total * 100), icon: Clock },
                        { label: 'Vencidas',  count: counts.overdue, color: '#ef4444', pct: Math.round(counts.overdue / total * 100), icon: XCircle },
                        { label: 'Borrador',  count: counts.draft,   color: '#555',    pct: Math.round(counts.draft   / total * 100), icon: FileMinus },
                    ]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const fmt = (n) => {
        if (!n || isNaN(n)) return '$0';
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
        return `$${parseFloat(n).toFixed(0)}`;
    };

    const totalRevenue = stats?.totalRevenue || 0;
    const totalInvoices = stats?.totalInvoices || 0;
    const totalClients = stats?.totalClients || 0;
    const recentInvoices = stats?.recentInvoices || [];

    // Top clients derived from invoices (group by client name)
    const topClients = recentInvoices.reduce((acc, inv) => {
        const name = inv.clients?.name || 'Cliente';
        const amt = parseFloat(inv.total) || 0;
        const existing = acc.find(c => c.name === name);
        if (existing) { existing.total += amt; existing.count++; }
        else acc.push({ name, total: amt, count: 1 });
        return acc;
    }, []).sort((a, b) => b.total - a.total).slice(0, 5);

    const avatarColors = [
        'from-green-500 to-emerald-700',
        'from-blue-500 to-indigo-700',
        'from-violet-500 to-purple-700',
        'from-amber-500 to-orange-600',
        'from-pink-500 to-rose-700',
    ];

    return (
        <div className="p-5 lg:p-6 max-w-[1600px] mx-auto">
            <PageHeader
                title="Dashboard"
                subtitle="Resumen general de tu negocio"
            />

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <MetricCard
                    index={0}
                    title="Ingresos Totales"
                    value={loading ? '—' : fmt(totalRevenue)}
                    delta="+12.5%"
                    deltaPositive={true}
                    icon={DollarSign}
                    iconColor="text-green-400"
                    iconBg="bg-green-500/10"
                    subtitle="vs. mes anterior"
                />
                <MetricCard
                    index={1}
                    title="Facturas Activas"
                    value={loading ? '—' : totalInvoices}
                    delta="+8"
                    deltaPositive={true}
                    icon={FileText}
                    iconColor="text-blue-400"
                    iconBg="bg-blue-500/10"
                    subtitle="vs. mes anterior"
                />
                <MetricCard
                    index={2}
                    title="Tasa de Cobro"
                    value={loading ? '—' : '98.4%'}
                    delta="+1.2%"
                    deltaPositive={true}
                    icon={TrendingUp}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-500/10"
                    subtitle="promedio período"
                />
                <MetricCard
                    index={3}
                    title="Clientes Nuevos"
                    value={loading ? '—' : totalClients}
                    delta="+18.3%"
                    deltaPositive={true}
                    icon={Users}
                    iconColor="text-violet-400"
                    iconBg="bg-violet-500/10"
                    subtitle="vs. mes anterior"
                />
            </div>

            {/* ── Middle row: Chart + Pipeline ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                {/* Revenue Trend Chart */}
                <div className="xl:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5">
                    <SectionHeader
                        title="Tendencia de Ingresos"
                        subtitle="Rendimiento mensual vs meta"
                        action={
                            <div className="flex items-center gap-4 text-[11px] text-[#888]">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-[2px] bg-green-500 inline-block rounded-full" />Real</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-[2px] bg-blue-500 inline-block rounded-full border-dashed" />Meta</span>
                            </div>
                        }
                    />
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradMeta" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#1e1e1e" vertical={false} />
                                <XAxis dataKey="mes" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2a2a', strokeWidth: 1 }} />
                                <Area type="monotone" dataKey="meta" stroke="#3b82f6" strokeWidth={1.5}
                                    strokeDasharray="4 3" fill="url(#gradMeta)" dot={false} />
                                <Area type="monotone" dataKey="real" stroke="#22c55e" strokeWidth={2}
                                    fill="url(#gradReal)" dot={false} activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pipeline stages */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5">
                    <SectionHeader
                        title="Etapas del Pipeline"
                        subtitle="Distribución por estado"
                    />
                    <div className="space-y-3.5 mt-1">
                        {pipeline.map((stage, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <stage.icon size={13} style={{ color: stage.color }} />
                                        <span className="text-[12px] text-[#aaa]">{stage.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-[#555]">{stage.count}</span>
                                        <span className="text-[11px] font-semibold" style={{ color: stage.color }}>{stage.pct}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${stage.pct || 0}%`, backgroundColor: stage.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-[#1e1e1e] flex items-center justify-between">
                        <span className="text-[11px] text-[#555]">Valor total del pipeline</span>
                        <span className="text-[13px] font-bold text-white">{fmt(totalRevenue)}</span>
                    </div>
                </div>
            </div>

            {/* ── Bottom row: Recent Invoices + Top Clients ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Recent Invoices */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5">
                    <SectionHeader
                        title="Facturas Recientes"
                        subtitle="Última actividad de facturación"
                        action={
                            <Link href="/dashboard/facturas"
                                className="text-[11px] text-green-400 hover:text-green-300 font-medium transition-colors flex items-center gap-1">
                                Ver todo <ArrowUpRight size={12} />
                            </Link>
                        }
                    />
                    <div className="mt-1">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2">
                                        <div className="w-7 h-7 rounded-full shimmer shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 w-32 shimmer rounded" />
                                            <div className="h-2.5 w-20 shimmer rounded" />
                                        </div>
                                        <div className="h-3 w-16 shimmer rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : recentInvoices.length === 0 ? (
                            <p className="text-[12px] text-[#555] py-8 text-center">No hay facturas recientes</p>
                        ) : (
                            <div className="divide-y divide-[#1e1e1e]">
                                {recentInvoices.slice(0, 6).map((inv, i) => (
                                    <div key={inv.id} className="flex items-center gap-3 py-2.5 hover:bg-[#111] -mx-1 px-1 rounded-[6px] transition-colors">
                                        <AvatarLetter name={inv.clients?.name || 'C'} color={avatarColors[i % avatarColors.length]} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-[#ddd] truncate">
                                                {inv.clients?.name || 'Cliente'}
                                            </p>
                                            <p className="text-[10px] text-[#555]">#{inv.number}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[12px] font-semibold text-white">
                                                ${parseFloat(inv.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                            </p>
                                            <StatusBadge status={inv.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Clients */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5">
                    <SectionHeader
                        title="Top Clientes"
                        subtitle="Mayor volumen del período"
                        action={
                            <Link href="/dashboard/clientes"
                                className="text-[11px] text-green-400 hover:text-green-300 font-medium transition-colors flex items-center gap-1">
                                Ver todos <ArrowUpRight size={12} />
                            </Link>
                        }
                    />
                    <div className="mt-1">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2">
                                        <div className="w-8 h-8 rounded-full shimmer shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 w-28 shimmer rounded" />
                                            <div className="h-2.5 w-16 shimmer rounded" />
                                        </div>
                                        <div className="h-3 w-14 shimmer rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : topClients.length === 0 ? (
                            <p className="text-[12px] text-[#555] py-8 text-center">Sin datos de clientes aún</p>
                        ) : (
                            <div className="divide-y divide-[#1e1e1e]">
                                {topClients.map((client, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2.5 hover:bg-[#111] -mx-1 px-1 rounded-[6px] transition-colors">
                                        <div className="relative">
                                            <AvatarLetter name={client.name} size="md" color={avatarColors[i % avatarColors.length]} />
                                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#111] rounded-full flex items-center justify-center text-[8px] font-bold text-[#888]">
                                                {i + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-[#ddd] truncate">{client.name}</p>
                                            <p className="text-[10px] text-[#555]">{client.count} factura{client.count !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[13px] font-semibold text-white">
                                                ${client.total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                            </p>
                                            <p className="text-[10px] text-green-400">+12%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
