export default function Loading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-[#1e1e1e]"></div>
                <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-[15px] font-semibold text-white mb-1">Cargando...</h2>
            <p className="text-[#555] text-[12px]">Obteniendo los datos más recientes...</p>
        </div>
    );
}
