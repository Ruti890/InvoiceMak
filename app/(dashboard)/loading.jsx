export default function Loading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
            <p className="text-gray-400 text-sm">Cargando los datos más recientes...</p>
        </div>
    );
}
