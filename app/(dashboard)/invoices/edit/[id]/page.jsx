'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Save, ArrowLeft, User, Package } from 'lucide-react';

export default function InvoiceEdit({ params }) {
    const resolvedParams = use(params);
    const id = resolvedParams?.id;
    const isEditing = true;
    const router = useRouter();

    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoiceData, setInvoiceData] = useState({
        clientId: '', dueDate: '', taxRate: 0, notes: '', items: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, productsRes, invoiceRes] = await Promise.all([
                    fetch('/api/clients'),
                    fetch('/api/products'),
                    fetch(`/api/invoices/${id}`),
                ]);
                const [clientsData, productsData, invoice] = await Promise.all([
                    clientsRes.json(), productsRes.json(), invoiceRes.json(),
                ]);
                setClients(clientsData);
                setProducts(productsData);

                const mappedItems = invoice.invoice_items?.map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: parseFloat(item.price)
                })) || [];

                setInvoiceData({
                    clientId: invoice.client_id,
                    dueDate: invoice.due_date || '',
                    taxRate: 0,
                    notes: invoice.notes || '',
                    items: mappedItems,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddItem = () => setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { productId: '', quantity: 1, price: 0 }] });
    const handleRemoveItem = (index) => setInvoiceData({ ...invoiceData, items: invoiceData.items.filter((_, i) => i !== index) });
    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceData.items];
        newItems[index][field] = value;
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) newItems[index].price = parseFloat(product.price);
        }
        setInvoiceData({ ...invoiceData, items: newItems });
    };
    const calculateTotal = () => invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invoiceData.clientId || invoiceData.items.length === 0) {
            alert('Please select a client and add at least one item.');
            return;
        }
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData),
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Error saving invoice'); }
            router.push('/invoices');
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    if (loading) return <div className="text-center text-gray-400 py-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <button onClick={() => router.push('/invoices')} className="mr-4 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Edit Invoice</h1>
                    <p className="text-gray-400">Update invoice details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center"><User size={20} className="mr-2 text-blue-500" />Client Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Select Client</label>
                            <select className="w-full bg-[#1a1a1a] border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={invoiceData.clientId} onChange={(e) => setInvoiceData({ ...invoiceData, clientId: e.target.value })} required>
                                <option value="">-- Select Client --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                            <input type="date" className="w-full bg-[#1a1a1a] border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={invoiceData.dueDate} onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center"><Package size={20} className="mr-2 text-orange-500" />Invoice Items</h2>
                        <button type="button" onClick={handleAddItem} className="text-sm bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/20 transition-colors flex items-center">
                            <Plus size={16} className="mr-1" /> Add Item
                        </button>
                    </div>
                    <div className="space-y-4">
                        {invoiceData.items.length === 0 && <p className="text-gray-500 text-center py-4 italic">No items added yet.</p>}
                        {invoiceData.items.map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                                    <select className="w-full bg-[#111] border border-gray-700 text-white p-2 rounded-lg" value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} required>
                                        <option value="">Select Product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                    <input type="number" min="1" className="w-full bg-[#111] border border-gray-700 text-white p-2 rounded-lg" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} required />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                                    <input type="number" step="0.01" className="w-full bg-[#111] border border-gray-700 text-white p-2 rounded-lg" value={item.price} readOnly />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                                    <div className="w-full bg-[#111] border border-gray-700 text-gray-300 p-2 rounded-lg">${(item.quantity * item.price).toFixed(2)}</div>
                                </div>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mb-[1px]"><Trash size={20} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end items-center border-t border-gray-800 pt-4">
                        <span className="text-gray-400 mr-4">Total Amount:</span>
                        <span className="text-2xl font-bold text-white">${calculateTotal().toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => router.push('/invoices')} className="px-6 py-3 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors font-medium">Cancel</button>
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 font-bold flex items-center">
                        <Save size={20} className="mr-2" />Update Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}
