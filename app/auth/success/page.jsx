import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function AuthSuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-[#111] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10 backdrop-blur-xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-500/10 p-4 rounded-full border border-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        <CheckCircle size={48} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">Email Confirmado</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    ¡Tu dirección de correo electrónico ha sido confirmada con éxito! Ya puedes acceder a todas las funcionalidades de <span className="text-blue-400 font-semibold">Lexis</span>.
                </p>

                <div className="flex flex-col space-y-4">
                    <Link
                        href="/login"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold p-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20 flex items-center justify-center"
                    >
                        Ir a Iniciar Sesión
                    </Link>
                    <Link
                        href="/dashboard"
                        className="w-full bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 hover:bg-[#222] text-gray-300 font-bold p-3.5 rounded-xl transition-all flex items-center justify-center"
                    >
                        Ir al Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
