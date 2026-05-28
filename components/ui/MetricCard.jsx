'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricCard — KPI Card premium
 * @param {string} title - Etiqueta de la métrica
 * @param {string} value - Valor principal a mostrar
 * @param {string|number} delta - Variación (ej. "+12.5%" o "+8")
 * @param {boolean} deltaPositive - Si el delta es positivo (verde) o negativo (rojo)
 * @param {React.ElementType} icon - Icono de Lucide React
 * @param {string} iconColor - Clase de color del icono (ej. "text-green-400")
 * @param {string} iconBg - Clase de fondo del icono (ej. "bg-green-500/10")
 * @param {string} subtitle - Texto descriptivo secundario (ej. "vs. mes anterior")
 * @param {number} index - Índice para animación de entrada escalonada
 */
export default function MetricCard({
    title,
    value,
    delta,
    deltaPositive = true,
    icon: Icon,
    iconColor = 'text-green-400',
    iconBg = 'bg-green-500/10',
    subtitle = 'vs. mes anterior',
    index = 0,
}) {
    const isNeutral = delta === undefined || delta === null;

    return (
        <div
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] p-5 hover:border-[#3a3a3a] transition-all duration-200 group fade-in-up"
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
        >
            <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-[6px] ${iconBg} flex items-center justify-center shrink-0`}>
                    {Icon && <Icon size={17} className={iconColor} />}
                </div>

                {/* Delta badge */}
                {!isNeutral && (
                    <span className={`
                        inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
                        ${deltaPositive
                            ? 'text-green-400 bg-green-500/10'
                            : 'text-red-400 bg-red-500/10'
                        }
                    `}>
                        {deltaPositive
                            ? <TrendingUp size={11} />
                            : <TrendingDown size={11} />
                        }
                        {delta}
                    </span>
                )}
            </div>

            {/* Title */}
            <p className="text-[11px] font-medium text-[#666] uppercase tracking-wider mb-1.5">{title}</p>

            {/* Value */}
            <p className="text-[26px] font-bold text-white leading-none tracking-tight">{value}</p>

            {/* Subtitle */}
            {subtitle && (
                <p className="text-[11px] text-[#555] mt-2">{subtitle}</p>
            )}
        </div>
    );
}
