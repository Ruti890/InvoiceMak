'use client';

import { useState, useEffect } from 'react';
import {
    BarChart2, FileText, Users, Package, TrendingUp,
    Receipt, Download, RefreshCw, DollarSign, CheckSquare, Calendar
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import MetricCard from '@/components/ui/MetricCard';
import PageHeader from '@/components/ui/PageHeader';

const REPORT_TYPES = [
    {
        id: 'monthly-income',
        icon: BarChart2,
        name: 'Resumen mensual de ingresos',
        description: 'Vista consolidada de todos los ingresos facturados en el período seleccionado.',
        category: 'Finanzas',
        categoryColor: 'text-green-400 bg-green-500/10 border-green-500/20',
        status: 'ready',
    },
    {
        id: 'overdue-invoices',
        icon: Receipt,
        name: 'Facturas vencidas y por vencer',
        description: 'Listado de facturas en mora y próximas a vencer con alertas de seguimiento.',
        category: 'Facturación',
        categoryColor: 'text-red-400 bg-red-500/10 border-red-500/20',
        status: 'ready',
    },
    {
        id: 'top-clients',
        icon: Users,
        name: 'Clientes con mayor volumen',
        description: 'Ranking de clientes ordenados por monto total facturado en el período.',
        category: 'Clientes',
        categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        status: 'ready',
    },
    {
        id: 'top-products',
        icon: Package,
        name: 'Productos más vendidos',
        description: 'Análisis de los productos y servicios más facturados durante el período.',
        category: 'Productos',
        categoryColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        status: 'ready',
    },
    {
        id: 'cash-flow',
        icon: TrendingUp,
        name: 'Flujo de caja estimado',
        description: 'Proyección del flujo de caja basada en facturas emitidas y fechas de vencimiento.',
        category: 'Finanzas',
        categoryColor: 'text-green-400 bg-green-500/10 border-green-500/20',
        status: 'ready',
    },
    {
        id: 'tax-report',
        icon: FileText,
        name: 'Reporte de impuestos del período',
        description: 'Consolidado de IVA y retenciones para declaración de impuestos (DIAN).',
        category: 'Impuestos',
        categoryColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        status: 'ready',
    },
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nunca generado';

const MONTHS = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
];

export default function Reports() {
    const [generating, setGenerating] = useState({});
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchReportData();
    }, [selectedMonth, selectedYear]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard/reports?month=${selectedMonth}&year=${selectedYear}`);
            if (res.ok) {
                const data = await res.json();
                setReportData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = (id) => {
        setGenerating(prev => ({ ...prev, [id]: true }));
        // Simulate generation
        setTimeout(() => {
            setGenerating(prev => ({ ...prev, [id]: false }));
        }, 3000);
    };

    const fmt = (n) => {
        if (!n || isNaN(n)) return '$0';
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
        return `$${parseFloat(n).toFixed(0)}`;
    };

    const monthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || '';

    return (
        <div className="p-5 lg:p-6 max-w-[1600px] mx-auto">
            <PageHeader
                title="Reportes"
                subtitle="Genera y descarga informes de tu negocio"
            />

            {/* Month Filter */}
            <div className="mb-6 flex items-center gap-3">
                <label className="text-[12px] font-medium text-[#888]">Filtrar por mes:</label>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] text-[12px] text-white px-3 py-2 rounded-[6px] outline-none focus:border-green-500/40 transition-all"
                >
                    {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>{m.label} {selectedYear}</option>
                    ))}
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <MetricCard
                    index={0}
                    title="Ingresos del Período"
                    value={loading ? '—' : fmt(reportData?.totalRevenue || 0)}
                    delta={reportData?.emittedCount ? `+${reportData.emittedCount}` : '0'}
                    deltaPositive={reportData?.emittedCount > 0}
                    icon={DollarSign}
                    iconColor="text-green-400"
                    iconBg="bg-green-500/10"
                    subtitle={`${monthLabel} ${selectedYear}`}
                />
                <MetricCard
                    index={1}
                    title="Facturas Emitidas"
                    value={loading ? '—' : reportData?.emittedCount || 0}
                    delta={reportData?.emittedCount ? `${reportData.emittedCount} total` : '0'}
                    deltaPositive={reportData?.emittedCount > 0}
                    icon={FileText}
                    iconColor="text-blue-400"
                    iconBg="bg-blue-500/10"
                    subtitle="Este período"
                />
                <MetricCard
                    index={2}
                    title="Tasa de Cobro"
                    value={loading ? '—' : `${reportData?.collectionRate || 0}%`}
                    delta={reportData?.collectionRate ? `${reportData.collectionRate}%` : '0%'}
                    deltaPositive={reportData?.collectionRate > 0}
                    icon={CheckSquare}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-500/10"
                    subtitle="Promedio período"
                />
            </div>

            {/* Reports List */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
                    <div>
                        <h2 className="text-[14px] font-semibold text-white">Reportes Disponibles</h2>
                        <p className="text-[11px] text-[#555] mt-0.5">Genera o descarga informes de tu operación</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#555]">
                        <Calendar size={12} />
                        <span>{monthLabel} {selectedYear}</span>
                    </div>
                </div>

                {/* Report rows */}
                <div className="divide-y divide-[#1a1a1a]">
                    {REPORT_TYPES.map((report, i) => {
                        const isGenerating = generating[report.id] || report.status === 'generating';
                        const Icon = report.icon;

                        return (
                            <div key={report.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-[#111] transition-colors border-b border-[#111] last:border-0 fade-in-up"
                                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                                {/* Icon + Info */}
                                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-[6px] bg-[#222] border border-[#2a2a2a] flex items-center justify-center shrink-0 mt-0.5">
                                        <Icon size={16} className="text-[#888]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="text-[13px] font-semibold text-[#ddd]">{report.name}</h3>
                                            <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] border ${report.categoryColor}`}>
                                                {report.category}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#555] leading-relaxed">{report.description}</p>
                                        <p className="text-[10px] text-[#444] mt-1.5 flex items-center gap-1">
                                            <Calendar size={10} />
                                            Período: {monthLabel} {selectedYear}
                                        </p>
                                    </div>
                                </div>

                                {/* Status + Actions */}
                                <div className="flex items-center gap-2 shrink-0 sm:justify-end">
                                    {isGenerating && (
                                        <StatusBadge status="generating" />
                                    )}

                                    <button
                                        onClick={() => handleGenerate(report.id)}
                                        disabled={isGenerating}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-[6px] border transition-all ${
                                            isGenerating
                                                ? 'border-[#2a2a2a] text-[#444] cursor-not-allowed'
                                                : 'border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#3a3a3a] hover:bg-[#222]'
                                        }`}>
                                        <RefreshCw size={12} className={isGenerating ? 'animate-spin text-amber-400' : ''} />
                                        {isGenerating ? 'Generando...' : 'Generar nuevo'}
                                    </button>

                                    <button
                                        disabled={isGenerating}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-[6px] transition-all ${
                                            isGenerating
                                                ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed border border-[#222]'
                                                : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                                        }`}>
                                        <Download size={12} />
                                        Descargar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
