'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Package, DollarSign, Layers } from 'lucide-react';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/products/${editingId}` : '/api/products';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        setShowModal(false);
        setFormData({ name: '', description: '', price: '', stock: '' });
        setEditingId(null);
        fetchProducts();
    };

    const handleEdit = (p) => {
        setFormData({ name: p.name, description: p.description || '', price: p.price, stock: p.stock });
        setEditingId(p.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
                    <p className="text-gray-400">Manage your inventory</p>
                </div>
                <button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', stock: '' }); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={20} className="mr-2" /> Add Product
                </button>
            </div>

            <div className="bg-[#111] rounded-2xl shadow-lg border border-gray-800 mb-6 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input type="text" placeholder="Search products..."
                        className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-gray-400 py-8">Loading products...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">No products found</div>
                ) : filtered.map((product) => (
                    <div key={product.id} className="bg-[#111] rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all group shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                                <Package size={24} />
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(product)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash size={18} /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                            <div className="flex items-center text-green-400 font-bold text-lg">
                                <DollarSign size={18} className="mr-1" />{parseFloat(product.price).toFixed(2)}
                            </div>
                            <div className="flex items-center text-gray-400 text-sm bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                                <Layers size={14} className="mr-2" />{product.stock} in stock
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input type="text" className="w-full bg-[#1a1a1a] border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea className="w-full bg-[#1a1a1a] border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                                    <input type="number" step="0.01" className="w-full bg-[#1a1a1a] border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
                                    <input type="number" className="w-full bg-[#1a1a1a] border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
