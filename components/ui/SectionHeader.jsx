'use client';

/**
 * SectionHeader — Cabecera de sección con título, subtítulo y acción derecha
 */
export default function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-[14px] font-semibold text-white leading-tight">{title}</h2>
                {subtitle && <p className="text-[11px] text-[#555] mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
