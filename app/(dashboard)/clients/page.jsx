'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Mail, Phone, MapPin, FileText } from 'lucide-react';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchClients(); }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients');
            if (res.ok) setClients(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/clients/${editingId}` : '/api/clients';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
        setEditingId(null);
        fetchClients();
    };

    const handleEdit = (client) => {
        setFormData({ name: client.name, email: client.email, phone: client.phone || '', address: client.address || '' });
        setEditingId(client.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            await fetch(`/api/clients/${id}`, { method: 'DELETE' });
            fetchClients();
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
                    <p className="text-gray-400">Manage your client base</p>
                </div>
                <button onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', address: '' }); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={20} className="mr-2" /> Add Client
                </button>
            </div>

            <div className="bg-[#111] rounded-2xl shadow-lg border border-gray-800 mb-6 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input type="text" placeholder="Search clients by name or email..."
                        className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-gray-400 py-8">Loading clients...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">No clients found</div>
                ) : filteredClients.map((client) => (
                    <div key={client.id} className="bg-[#111] rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all group shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {client.name.charAt(0)}
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(client)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(client.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash size={18} /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center"><FileText size={14} className="mr-1" /> ID: {client.nit}</p>
                        <div className="space-y-2">
                            <div className="flex items-center text-gray-400 text-sm"><Mail size={16} className="mr-2 text-gray-600" />{client.email}</div>
                            <div className="flex items-center text-gray-400 text-sm"><Phone size={16} className="mr-2 text-gray-600" />{client.phone}</div>
                            <div className="flex items-center text-gray-400 text-sm"><MapPin size={16} className="mr-2 text-gray-600" />{client.address}</div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Client' : 'Add Client'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {['name', 'email', 'phone', 'address'].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-400 mb-1 capitalize">{field}</label>
                                    <input type={field === 'email' ? 'email' : 'text'}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                        required={field === 'name' || field === 'email'} />
                                </div>
                            ))}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Save Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
