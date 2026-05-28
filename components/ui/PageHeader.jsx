'use client';

import { Calendar } from 'lucide-react';

/**
 * PageHeader — Encabezado principal de página
 * @param {string} title - Título de la página
 * @param {string} subtitle - Subtítulo descriptivo
 * @param {React.ReactNode} action - Botón/acción derecha
 * @param {boolean} showDateRange - Mostrar selector de rango de fecha
 */
export default function PageHeader({ title, subtitle, action, showDateRange = true }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
                <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight">{title}</h1>
                {subtitle && <p className="text-[12px] text-[#555] mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {showDateRange && (
                    <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] px-3 h-8 text-[12px] text-[#888] hover:text-white hover:border-[#3a3a3a] transition-all cursor-pointer">
                        <Calendar size={13} className="text-[#555]" />
                        <span>Últimos 30 días</span>
                    </div>
                )}
                {action}
            </div>
        </div>
    );
}
