'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Mail, Phone, FileText, Users, X } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

const FILTERS = ['Todos', 'Activos', 'Inactivos'];

const avatarColors = [
    'from-green-500 to-emerald-700',
    'from-blue-500 to-indigo-700',
    'from-violet-500 to-purple-700',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-700',
    'from-cyan-500 to-teal-700',
    'from-red-500 to-rose-700',
];

function AvatarLetter({ name, idx = 0 }) {
    return (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}>
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
}

function Modal({ open, onClose, onSubmit, formData, setFormData, editingId, loading }) {
    if (!open) return null;
    const fields = [
        { key: 'name',    label: 'Nombre',    type: 'text',  required: true,  placeholder: 'Empresa o persona' },
        { key: 'email',   label: 'Email',      type: 'email', required: true,  placeholder: 'correo@ejemplo.com' },
        { key: 'phone',   label: 'Teléfono',   type: 'text',  required: false, placeholder: '+57 300 000 0000' },
        { key: 'address', label: 'Dirección',  type: 'text',  required: false, placeholder: 'Ciudad, Colombia' },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111] border border-[#2a2a2a] rounded-[8px] shadow-2xl w-full max-w-md fade-in-up">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
                    <h2 className="text-[15px] font-semibold text-white">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    {fields.map(f => (
                        <div key={f.key}>
                            <label className="block text-[11px] font-medium text-[#666] uppercase tracking-wide mb-1.5">{f.label}</label>
                            <input
                                type={f.type}
                                placeholder={f.placeholder}
                                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                                value={formData[f.key]}
                                onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                required={f.required}
                            />
                        </div>
                    ))}
                    <div className="flex justify-end gap-2.5 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-[12px] font-medium text-[#888] border border-[#2a2a2a] rounded-[6px] hover:bg-[#1a1a1a] hover:text-white transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-4 py-2 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] disabled:opacity-50 transition-all shadow-lg shadow-green-500/20">
                            {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Clients() {
    const [clients, setClients]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData]   = useState({ name: '', email: '', phone: '', address: '' });
    const [search, setSearch]       = useState('');
    const [filter, setFilter]       = useState('Todos');
    const [menuOpen, setMenuOpen]   = useState(null);

    useEffect(() => { fetchClients(); }, []);
    useEffect(() => {
        const close = () => setMenuOpen(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients');
            if (res.ok) setClients(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditingId(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
        setShowModal(true);
    };

    const openEdit = (client) => {
        setEditingId(client.id);
        setFormData({ name: client.name, email: client.email, phone: client.phone || '', address: client.address || '' });
        setShowModal(true);
        setMenuOpen(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/clients/${editingId}` : '/api/clients';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            setShowModal(false);
            fetchClients();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este cliente?')) return;
        await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        fetchClients();
        setMenuOpen(null);
    };

    const filtered = clients.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'Todos' ? true :
            filter === 'Activos' ? c.active !== false :
            c.active === false;
        return matchSearch && matchFilter;
    });

    const columns = ['Cliente', 'Email', 'Teléfono', 'NIT / ID', 'Dirección', 'Estado', ''];

    return (
        <div className="p-5 lg:p-6 max-w-[1600px] mx-auto">
            <PageHeader
                title="Clientes"
                subtitle="Gestiona tu base de clientes"
                action={
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] transition-all shadow-lg shadow-green-500/20">
                        <Plus size={14} /> Nuevo Cliente
                    </button>
                }
            />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Filter pills */}
                <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] p-1">
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-[4px] transition-all ${
                                filter === f
                                    ? 'bg-[#2a2a2a] text-white'
                                    : 'text-[#666] hover:text-[#aaa]'
                            }`}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[12px] text-white placeholder-[#444] pl-8 pr-3 py-2 rounded-[6px] outline-none focus:border-green-500/40 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="sm:ml-auto text-[11px] text-[#555] flex items-center">
                    {loading ? '' : `${filtered.length} cliente${filtered.length !== 1 ? 's' : ''}`}
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
                                                <div className="h-4 shimmer rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length}>
                                        <EmptyState
                                            icon={Users}
                                            title="Sin clientes"
                                            description={search ? 'No se encontraron clientes con ese criterio.' : 'Agrega tu primer cliente para comenzar.'}
                                            action={
                                                !search && (
                                                    <button onClick={openCreate}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] transition-all mx-auto">
                                                        <Plus size={13} /> Nuevo Cliente
                                                    </button>
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((client, idx) => (
                                    <tr key={client.id} className="border-b border-[#111] hover:bg-[#111] transition-colors group">
                                        {/* Cliente */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                                                    {client.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="text-[13px] font-medium text-[#ddd]">{client.name}</span>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className="px-4 py-3">
                                            <span className="text-[12px] text-[#888]">{client.email || '—'}</span>
                                        </td>
                                        {/* Teléfono */}
                                        <td className="px-4 py-3">
                                            <span className="text-[12px] text-[#888]">{client.phone || '—'}</span>
                                        </td>
                                        {/* NIT */}
                                        <td className="px-4 py-3">
                                            <span className="text-[12px] text-[#666]">{client.nit || '—'}</span>
                                        </td>
                                        {/* Dirección */}
                                        <td className="px-4 py-3 max-w-[160px]">
                                            <span className="text-[12px] text-[#666] truncate block">{client.address || '—'}</span>
                                        </td>
                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            <StatusBadge status={client.active === false ? 'inactive' : 'active'} />
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="relative" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] rounded-[4px] transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal size={15} />
                                                </button>
                                                {menuOpen === client.id && (
                                                    <div className="absolute right-0 top-8 z-50 w-36 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] shadow-xl overflow-hidden fade-in-up">
                                                        <button onClick={() => openEdit(client)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#aaa] hover:text-white hover:bg-[#222] transition-colors">
                                                            <Edit2 size={13} /> Editar
                                                        </button>
                                                        <button onClick={() => handleDelete(client.id)}
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

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                editingId={editingId}
                loading={saving}
            />
        </div>
    );
}
