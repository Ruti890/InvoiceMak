'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Package, X } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

function Modal({ open, onClose, onSubmit, formData, setFormData, editingId, saving }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111] border border-[#2a2a2a] rounded-[8px] shadow-2xl w-full max-w-md fade-in-up">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
                    <h2 className="text-[15px] font-semibold text-white">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onClose} className="text-[#555] hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-[11px] font-medium text-[#666] uppercase tracking-wide mb-1.5">Nombre</label>
                        <input type="text" required placeholder="Nombre del producto o servicio"
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-[#666] uppercase tracking-wide mb-1.5">Descripción</label>
                        <textarea rows={3} placeholder="Descripción opcional..."
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all resize-none"
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-medium text-[#666] uppercase tracking-wide mb-1.5">Precio (COP)</label>
                            <input type="number" step="0.01" required placeholder="0.00"
                                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                                value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-[#666] uppercase tracking-wide mb-1.5">Stock / Unidades</label>
                            <input type="number" required placeholder="0"
                                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                                value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-[12px] font-medium text-[#888] border border-[#2a2a2a] rounded-[6px] hover:bg-[#1a1a1a] hover:text-white transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-4 py-2 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] disabled:opacity-50 transition-all shadow-lg shadow-green-500/20">
                            {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Products() {
    const [products, setProducts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData]   = useState({ name: '', description: '', price: '', stock: '' });
    const [search, setSearch]       = useState('');
    const [menuOpen, setMenuOpen]   = useState(null);

    useEffect(() => { fetchProducts(); }, []);
    useEffect(() => {
        const close = () => setMenuOpen(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', stock: '' });
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditingId(p.id);
        setFormData({ name: p.name, description: p.description || '', price: p.price, stock: p.stock });
        setShowModal(true);
        setMenuOpen(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/products/${editingId}` : '/api/products';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            setShowModal(false); fetchProducts();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return;
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        fetchProducts(); setMenuOpen(null);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const fmt = (v) => `$${parseFloat(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

    const columns = ['Producto', 'Descripción', 'Precio', 'Stock', 'Estado', ''];

    return (
        <div className="p-5 lg:p-6 max-w-[1600px] mx-auto">
            <PageHeader
                title="Productos"
                subtitle="Catálogo de productos y servicios"
                action={
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] transition-all shadow-lg shadow-green-500/20">
                        <Plus size={14} /> Nuevo Producto
                    </button>
                }
            />

            {/* Search */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                    <input type="text" placeholder="Buscar productos..."
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[12px] text-white placeholder-[#444] pl-8 pr-3 py-2 rounded-[6px] outline-none focus:border-green-500/40 transition-all"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="ml-auto text-[11px] text-[#555]">
                    {loading ? '' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
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
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-[#111]">
                                        {columns.map((_, j) => (
                                            <td key={j} className="px-4 py-3.5">
                                                <div className="h-4 shimmer rounded" style={{ width: `${50 + Math.random() * 35}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={columns.length}>
                                    <EmptyState icon={Package} title="Sin productos"
                                        description={search ? 'No hay productos con ese nombre.' : 'Agrega tu primer producto o servicio.'}
                                        action={!search && (
                                            <button onClick={openCreate}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] transition-all mx-auto">
                                                <Plus size={13} /> Nuevo Producto
                                            </button>
                                        )}
                                    />
                                </td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="border-b border-[#111] hover:bg-[#111] transition-colors group">
                                        {/* Nombre */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-[6px] bg-amber-500/10 flex items-center justify-center shrink-0">
                                                    <Package size={13} className="text-amber-400" />
                                                </div>
                                                <span className="text-[13px] font-medium text-[#ddd]">{p.name}</span>
                                            </div>
                                        </td>
                                        {/* Descripción */}
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <span className="text-[12px] text-[#666] truncate block">{p.description || '—'}</span>
                                        </td>
                                        {/* Precio */}
                                        <td className="px-4 py-3">
                                            <span className="text-[13px] font-semibold text-green-400">{fmt(p.price)}</span>
                                        </td>
                                        {/* Stock */}
                                        <td className="px-4 py-3">
                                            <span className={`text-[12px] font-medium ${parseInt(p.stock) < 5 ? 'text-amber-400' : 'text-[#aaa]'}`}>
                                                {p.stock}
                                                {parseInt(p.stock) < 5 && <span className="ml-1 text-[10px] text-amber-400/60">⚠</span>}
                                            </span>
                                        </td>
                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            <StatusBadge status={parseInt(p.stock) > 0 ? 'active' : 'inactive'} />
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="relative" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] rounded-[4px] transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal size={15} />
                                                </button>
                                                {menuOpen === p.id && (
                                                    <div className="absolute right-0 top-8 z-50 w-36 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] shadow-xl overflow-hidden fade-in-up">
                                                        <button onClick={() => openEdit(p)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#aaa] hover:text-white hover:bg-[#222] transition-colors">
                                                            <Edit2 size={13} /> Editar
                                                        </button>
                                                        <button onClick={() => handleDelete(p.id)}
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

            <Modal open={showModal} onClose={() => setShowModal(false)} onSubmit={handleSubmit}
                formData={formData} setFormData={setFormData} editingId={editingId} saving={saving} />
        </div>
    );
}
