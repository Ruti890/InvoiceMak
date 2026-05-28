'use client';

import { FileSearch } from 'lucide-react';

/**
 * EmptyState — Vista premium cuando no hay datos
 * @param {string} title - Título del estado vacío
 * @param {string} description - Descripción motivacional
 * @param {React.ReactNode} action - Botón de llamada a la acción
 * @param {React.ElementType} icon - Icono Lucide opcional
 */
export default function EmptyState({
    title = 'Sin resultados',
    description = 'No hay datos para mostrar en este momento.',
    action,
    icon: Icon = FileSearch,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-[8px] bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
                <Icon size={24} className="text-[#444]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#aaa] mb-1.5">{title}</h3>
            <p className="text-[12px] text-[#555] max-w-xs leading-relaxed">{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
