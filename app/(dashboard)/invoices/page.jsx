'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Search, FileText, Calendar, DollarSign, Edit, Download } from 'lucide-react';

export default function Invoices() {
    const router = useRouter();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoices');
            if (res.ok) setInvoices(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
            fetchInvoices();
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await fetch(`/api/invoices/${id}/download`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error downloading PDF');
        }
    };

    const clientName = (invoice) =>
        invoice.clients?.name || 'Unknown Client';

    const filtered = invoices.filter(inv =>
        inv.number?.toString().includes(searchTerm) ||
        clientName(inv).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColor = (status) => {
        const map = { paid: 'text-green-500 bg-green-500/10 border-green-500/20', sent: 'text-blue-500 bg-blue-500/10 border-blue-500/20', draft: 'text-gray-400 bg-gray-500/10 border-gray-500/20', overdue: 'text-red-500 bg-red-500/10 border-red-500/20' };
        return map[status] || map.draft;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
                    <p className="text-gray-400">Manage and track your invoices</p>
                </div>
                <Link href="/invoices/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={20} className="mr-2" /> Create Invoice
                </Link>
            </div>

            <div className="bg-[#111] rounded-2xl shadow-lg border border-gray-800 mb-6 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input type="text" placeholder="Search invoices by number or client..."
                        className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-gray-400 py-8">Loading invoices...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No invoices found</div>
                ) : filtered.map((invoice) => (
                    <div key={invoice.id} className="bg-[#111] rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all shadow-lg flex flex-col md:flex-row items-center justify-between group">
                        <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mr-4">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Invoice #{invoice.number}</h3>
                                <p className="text-gray-400 text-sm">{clientName(invoice)}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="flex items-center text-gray-400 text-sm">
                                <Calendar size={16} className="mr-2" />
                                {new Date(invoice.date).toLocaleDateString()}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(invoice.status)} capitalize`}>
                                {invoice.status}
                            </span>
                            <div className="flex items-center text-white font-bold">
                                <DollarSign size={16} className="mr-1 text-green-500" />
                                {isNaN(parseFloat(invoice.total)) ? '0.00' : parseFloat(invoice.total).toFixed(2)}
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => router.push(`/invoices/edit/${invoice.id}`)}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Invoice">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDownload(invoice.id)}
                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Download PDF">
                                    <Download size={20} />
                                </button>
                                <button onClick={() => handleDelete(invoice.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Invoice">
                                    <Trash size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
