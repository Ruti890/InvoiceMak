'use client';

/**
 * StatusBadge — Badge de estado premium con efecto cristal teñido
 * @param {string} status - Estado (paid|pending|sent|overdue|draft|active|inactive|generating|borrador|enviada|pagada|vencida|activo|inactivo)
 * @param {string} label - Texto a mostrar (opcional, usa el status por defecto)
 */
const STATUS_MAP = {
    // Facturas — inglés
    paid:       { label: 'Pagada',    cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    pending:    { label: 'Pendiente', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    sent:       { label: 'Enviada',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    overdue:    { label: 'Vencida',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
    draft:      { label: 'Borrador',  cls: 'text-[#888] bg-[#2a2a2a] border-[#3a3a3a]' },
    // Facturas — español
    pagada:     { label: 'Pagada',    cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    pendiente:  { label: 'Pendiente', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    enviada:    { label: 'Enviada',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    vencida:    { label: 'Vencida',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
    borrador:   { label: 'Borrador',  cls: 'text-[#888] bg-[#2a2a2a] border-[#3a3a3a]' },
    // Clientes
    active:     { label: 'Activo',    cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    inactive:   { label: 'Inactivo',  cls: 'text-[#888] bg-[#2a2a2a] border-[#3a3a3a]' },
    activo:     { label: 'Activo',    cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    inactivo:   { label: 'Inactivo',  cls: 'text-[#888] bg-[#2a2a2a] border-[#3a3a3a]' },
    // Reportes
    generating: { label: 'Generando...', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    generando:  { label: 'Generando...', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    // Won/Lost (pipeline)
    won:        { label: 'Ganado',    cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    lost:       { label: 'Perdido',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export default function StatusBadge({ status = '', label }) {
    const key = status.toLowerCase();
    const config = STATUS_MAP[key] || { label: status, cls: 'text-[#888] bg-[#2a2a2a] border-[#3a3a3a]' };
    const displayLabel = label || config.label;
    const isGenerating = key === 'generating' || key === 'generando';

    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-[6px] border ${config.cls}`}>
            {isGenerating && (
                <span className="w-3 h-3 spinner-amber inline-block" />
            )}
            {displayLabel}
        </span>
    );
}
