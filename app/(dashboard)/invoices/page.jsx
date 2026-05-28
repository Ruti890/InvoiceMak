'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Download, MoreHorizontal, FileText } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

const FILTERS = [
    { label: 'Todas',     value: 'all' },
    { label: 'Pagadas',   value: 'paid' },
    { label: 'Pendientes',value: 'pending' },
    { label: 'Enviadas',  value: 'sent' },
    { label: 'Vencidas',  value: 'overdue' },
    { label: 'Borrador',  value: 'draft' },
];

export default function Invoices() {
    const router = useRouter();
    const [invoices, setInvoices]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [filter, setFilter]       = useState('all');
    const [menuOpen, setMenuOpen]   = useState(null);

    useEffect(() => { fetchInvoices(); }, []);
    useEffect(() => {
        const close = () => setMenuOpen(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/invoices');
            if (res.ok) setInvoices(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta factura?')) return;
        await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
        fetchInvoices();
        setMenuOpen(null);
    };

    const handleDownload = async (id, number) => {
        try {
            const res = await fetch(`/api/invoices/${id}/download`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `factura-${number}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
        } catch { alert('Error al descargar el PDF'); }
    };

    const clientName = (inv) => inv.clients?.name || 'Sin cliente';

    const filtered = invoices.filter(inv => {
        const matchSearch = inv.number?.toString().includes(search) ||
            clientName(inv).toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || inv.status?.toLowerCase() === filter;
        return matchSearch && matchFilter;
    });

    const fmt = (v) => {
        const n = parseFloat(v) || 0;
        return `$${n.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const columns = ['# Factura', 'Cliente', 'Valor', 'Estado', 'Emisión', 'Vencimiento', ''];

    return (
        <div className="p-5 lg:p-6 max-w-[1600px] mx-auto">
            <PageHeader
                title="Facturas"
                subtitle="Administra y rastrea todas tus facturas"
                action={
                    <Link href="/invoices/create"
                        className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] transition-all shadow-lg shadow-green-500/20">
                        <Plus size={14} /> Nueva Factura
                    </Link>
                }
            />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Filters */}
                <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] p-1 overflow-x-auto">
                    {FILTERS.map(f => (
                        <button key={f.value} onClick={() => setFilter(f.value)}
                            className={`px-2.5 py-1.5 text-[11px] font-medium rounded-[4px] whitespace-nowrap transition-all ${
                                filter === f.value
                                    ? 'bg-[#2a2a2a] text-white'
                                    : 'text-[#666] hover:text-[#aaa]'
                            }`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                    <input
                        type="text"
                        placeholder="Buscar por número o cliente..."
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[12px] text-white placeholder-[#444] pl-8 pr-3 py-2 rounded-[6px] outline-none focus:border-green-500/40 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="sm:ml-auto text-[11px] text-[#555] flex items-center">
                    {loading ? '' : `${filtered.length} factura${filtered.length !== 1 ? 's' : ''}`}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-[#1e1e1e]">
                                {columns.map((col, i) => (
                                    <th key={i} className="text-left text-[10px] font-semibold text-[#555] uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 7 }).map((_, i) => (
                                    <tr key={i} className="border-b border-[#111]">
                                        {columns.map((_, j) => (
                                            <td key={j} className="px-4 py-3.5">
                                                <div className="h-4 shimmer rounded" style={{ width: `${50 + Math.random() * 35}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length}>
                                        <EmptyState
                                            icon={FileText}
                                            title="Sin facturas"
                                            description={search || filter !== 'all' ? 'No hay facturas con ese criterio.' : 'Crea tu primera factura para comenzar.'}
                                            action={
                                                !search && filter === 'all' && (
                                                    <Link href="/invoices/create"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] transition-all mx-auto">
                                                        <Plus size={13} /> Nueva Factura
                                                    </Link>
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(inv => (
                                    <tr key={inv.id} className="border-b border-[#111] hover:bg-[#111] transition-colors group">
                                        {/* # Factura */}
                                        <td className="px-4 py-3">
                                            <span className="text-[12px] font-mono font-medium text-[#aaa]">#{inv.number}</span>
                                        </td>
                                        {/* Cliente */}
                                        <td className="px-4 py-3">
                                            <span className="text-[13px] font-medium text-[#ddd]">{clientName(inv)}</span>
                                        </td>
                                        {/* Valor */}
                                        <td className="px-4 py-3">
                                            <span className="text-[13px] font-semibold text-white">{fmt(inv.total)}</span>
                                        </td>
                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            <StatusBadge status={inv.status} />
                                        </td>
                                        {/* Emisión */}
                                        <td className="px-4 py-3">
                                            <span className="text-[12px] text-[#888]">{fmtDate(inv.date)}</span>
                                        </td>
                                        {/* Vencimiento */}
                                        <td className="px-4 py-3">
                                            <span className={`text-[12px] ${inv.status === 'overdue' ? 'text-red-400' : 'text-[#888]'}`}>
                                                {fmtDate(inv.due_date)}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="relative flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleDownload(inv.id, inv.number)}
                                                    title="Descargar PDF"
                                                    className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-blue-400 hover:bg-blue-500/10 rounded-[4px] transition-all opacity-0 group-hover:opacity-100">
                                                    <Download size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === inv.id ? null : inv.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] rounded-[4px] transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal size={15} />
                                                </button>
                                                {menuOpen === inv.id && (
                                                    <div className="absolute right-0 top-8 z-50 w-36 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] shadow-xl overflow-hidden fade-in-up">
                                                        <button onClick={() => { router.push(`/invoices/edit/${inv.id}`); setMenuOpen(null); }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#aaa] hover:text-white hover:bg-[#222] transition-colors">
                                                            <Edit2 size={13} /> Editar
                                                        </button>
                                                        <button onClick={() => handleDownload(inv.id, inv.number)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#aaa] hover:text-white hover:bg-[#222] transition-colors">
                                                            <Download size={13} /> Descargar PDF
                                                        </button>
                                                        <button onClick={() => handleDelete(inv.id)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors border-t border-[#1e1e1e]">
                                                            <Trash2 size={13} /> Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
