'use client';

/**
 * DataTable — Tabla premium reutilizable
 * @param {string[]} columns - Etiquetas de columnas
 * @param {React.ReactNode[]} rows - Array de <tr> elements
 * @param {boolean} loading - Estado de carga
 * @param {React.ReactNode} emptyState - Componente cuando no hay datos
 */
export default function DataTable({ columns = [], rows = [], loading = false, emptyState }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-[#1e1e1e]">
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className="text-left text-[11px] font-semibold text-[#555] uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        // Skeleton rows
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-[#1a1a1a]">
                                {columns.map((_, j) => (
                                    <td key={j} className="px-4 py-3.5">
                                        <div className="h-4 rounded-[4px] shimmer" style={{ width: `${60 + Math.random() * 30}%` }} />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : rows.length > 0 ? (
                        rows
                    ) : (
                        <tr>
                            <td colSpan={columns.length}>
                                {emptyState}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
