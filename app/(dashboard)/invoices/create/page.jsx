'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, ArrowLeft, User, Package, FileText } from 'lucide-react';

// ── Shared select/input style ────────────────────────────────────────────────
const inputCls = 'w-full bg-[#111] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all';
const labelCls = 'block text-[11px] font-medium text-[#555] uppercase tracking-wide mb-1.5';

export default function InvoiceCreate({ params }) {
    const resolvedParams = use(params);
    const id = resolvedParams?.id;
    const isEditing = !!id;
    const router = useRouter();

    const [clients, setClients]     = useState([]);
    const [products, setProducts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        clientId: '', dueDate: '', taxRate: 0, notes: '', items: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, productsRes] = await Promise.all([
                    fetch('/api/clients'),
                    fetch('/api/products'),
                ]);
                const [clientsData, productsData] = await Promise.all([
                    clientsRes.json(), productsRes.json(),
                ]);
                setClients(clientsData);
                setProducts(productsData);

                if (isEditing) {
                    const invoiceRes = await fetch(`/api/invoices/${id}`);
                    const invoice = await invoiceRes.json();
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
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [id, isEditing]);

    const handleAddItem    = () => setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { productId: '', quantity: 1, price: 0 }] });
    const handleRemoveItem = (i) => setInvoiceData({ ...invoiceData, items: invoiceData.items.filter((_, idx) => idx !== i) });
    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceData.items];
        newItems[index][field] = value;
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) newItems[index].price = parseFloat(product.price);
        }
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const subtotal      = invoiceData.items.reduce((s, it) => s + it.quantity * it.price, 0);
    const tax           = subtotal * (invoiceData.taxRate / 100);
    const total         = subtotal + tax;
    const fmt           = (v) => `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invoiceData.clientId || invoiceData.items.length === 0) {
            alert('Selecciona un cliente y agrega al menos un ítem.');
            return;
        }
        setSaving(true);
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url    = isEditing ? `/api/invoices/${id}` : '/api/invoices';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData),
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Error al guardar'); }
            router.push('/invoices');
        } catch (err) { alert(`Error: ${err.message}`); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 spinner-amber" />
        </div>
    );

    return (
        <div className="p-5 lg:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.push('/invoices')}
                    className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#3a3a3a] transition-all">
                    <ArrowLeft size={15} />
                </button>
                <div>
                    <h1 className="text-[20px] font-bold text-white leading-tight">
                        {isEditing ? 'Editar Factura' : 'Nueva Factura'}
                    </h1>
                    <p className="text-[12px] text-[#555] mt-0.5">
                        {isEditing ? 'Actualiza los detalles de esta factura' : 'Genera una nueva factura para tu cliente'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ── Client & Date ── */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-[6px] bg-blue-500/10 flex items-center justify-center">
                            <User size={14} className="text-blue-400" />
                        </div>
                        <h2 className="text-[13px] font-semibold text-white">Información del Cliente</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Cliente *</label>
                            <select className={inputCls}
                                value={invoiceData.clientId}
                                onChange={e => setInvoiceData({ ...invoiceData, clientId: e.target.value })}
                                required>
                                <option value="">— Seleccionar cliente —</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Fecha de Vencimiento</label>
                            <input type="date" className={inputCls}
                                value={invoiceData.dueDate}
                                onChange={e => setInvoiceData({ ...invoiceData, dueDate: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* ── Items ── */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-[6px] bg-amber-500/10 flex items-center justify-center">
                                <Package size={14} className="text-amber-400" />
                            </div>
                            <h2 className="text-[13px] font-semibold text-white">Ítems de la Factura</h2>
                        </div>
                        <button type="button" onClick={handleAddItem}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-green-400 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 rounded-[6px] transition-all">
                            <Plus size={12} /> Agregar Ítem
                        </button>
                    </div>

                    {/* Table header */}
                    {invoiceData.items.length > 0 && (
                        <div className="hidden md:grid grid-cols-[1fr_80px_120px_100px_36px] gap-3 mb-2 px-1">
                            {['Producto', 'Cantidad', 'Precio Unit.', 'Total', ''].map((h, i) => (
                                <span key={i} className="text-[10px] font-semibold text-[#555] uppercase tracking-wider">{h}</span>
                            ))}
                        </div>
                    )}

                    <div className="space-y-2">
                        {invoiceData.items.length === 0 ? (
                            <div className="flex flex-col items-center py-10 text-center border border-dashed border-[#2a2a2a] rounded-[6px]">
                                <Package size={20} className="text-[#333] mb-2" />
                                <p className="text-[12px] text-[#555]">Sin ítems. Agrega productos para generar la factura.</p>
                                <button type="button" onClick={handleAddItem}
                                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-green-400 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 rounded-[6px] transition-all">
                                    <Plus size={12} /> Agregar primer ítem
                                </button>
                            </div>
                        ) : (
                            invoiceData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_100px_36px] gap-3 items-center bg-[#111] border border-[#1e1e1e] rounded-[6px] p-3">
                                    {/* Product select */}
                                    <div>
                                        <label className="block md:hidden text-[10px] text-[#555] mb-1">Producto</label>
                                        <select className={inputCls}
                                            value={item.productId}
                                            onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                            required>
                                            <option value="">Seleccionar producto</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    {/* Qty */}
                                    <div>
                                        <label className="block md:hidden text-[10px] text-[#555] mb-1">Cantidad</label>
                                        <input type="number" min="1" className={inputCls}
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                            required />
                                    </div>
                                    {/* Unit price */}
                                    <div>
                                        <label className="block md:hidden text-[10px] text-[#555] mb-1">Precio Unit.</label>
                                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#0a0a0a] border border-[#1e1e1e] rounded-[6px]">
                                            <span className="text-[12px] text-green-400 font-semibold">{fmt(item.price)}</span>
                                        </div>
                                    </div>
                                    {/* Line total */}
                                    <div>
                                        <label className="block md:hidden text-[10px] text-[#555] mb-1">Total</label>
                                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#0a0a0a] border border-[#1e1e1e] rounded-[6px]">
                                            <span className="text-[12px] text-white font-semibold">{fmt(item.quantity * item.price)}</span>
                                        </div>
                                    </div>
                                    {/* Remove */}
                                    <button type="button" onClick={() => handleRemoveItem(index)}
                                        className="w-8 h-8 flex items-center justify-center text-[#444] hover:text-red-400 hover:bg-red-500/10 rounded-[6px] transition-all mx-auto">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Totals */}
                    {invoiceData.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#1e1e1e] flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-8 text-[12px]">
                                <span className="text-[#666]">Subtotal</span>
                                <span className="text-[#aaa] font-medium w-28 text-right">{fmt(subtotal)}</span>
                            </div>
                            <div className="flex items-center gap-8 text-[12px]">
                                <span className="text-[#666]">IVA ({invoiceData.taxRate}%)</span>
                                <span className="text-[#aaa] font-medium w-28 text-right">{fmt(tax)}</span>
                            </div>
                            <div className="flex items-center gap-8 text-[13px] font-bold mt-1 pt-2 border-t border-[#1e1e1e]">
                                <span className="text-white">Total</span>
                                <span className="text-green-400 text-[16px] w-28 text-right">{fmt(total)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Notes ── */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-[6px] bg-[#222] flex items-center justify-center">
                            <FileText size={14} className="text-[#666]" />
                        </div>
                        <h2 className="text-[13px] font-semibold text-white">Notas / Observaciones</h2>
                    </div>
                    <textarea rows={3} placeholder="Condiciones de pago, instrucciones especiales, agradecimiento..."
                        className="w-full bg-[#111] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all resize-none"
                        value={invoiceData.notes}
                        onChange={e => setInvoiceData({ ...invoiceData, notes: e.target.value })} />
                </div>

                {/* ── Actions ── */}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => router.push('/invoices')}
                        className="px-4 py-2.5 text-[12px] font-medium text-[#888] border border-[#2a2a2a] rounded-[6px] hover:bg-[#1a1a1a] hover:text-white transition-all">
                        Cancelar
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] disabled:opacity-50 transition-all shadow-lg shadow-green-500/20">
                        {saving ? (
                            <><span className="w-3.5 h-3.5 spinner-amber border-black/20 border-t-black inline-block" /> Guardando...</>
                        ) : (
                            <><Save size={14} />{isEditing ? 'Actualizar Factura' : 'Crear Factura'}</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
