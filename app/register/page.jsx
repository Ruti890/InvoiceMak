'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const inputCls = 'w-full bg-[#111] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] pl-10 p-3 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all';
const labelCls = 'block text-[11px] font-medium text-[#555] uppercase tracking-wide mb-1.5';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const result = await register(name, email, password);
            if (result && result.verified) {
                router.push('/dashboard');
            } else {
                setSuccess(true);
                // Optional: Clear form
                setPassword('');
            }
        } catch (err) {
            setError(err.message || 'Error al registrarse. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-[Inter]">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-[8px] shadow-2xl w-full max-w-md z-10 fade-in-up">
                <div className="text-center mb-8">
                    {/* Logo mark */}
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/10 mx-auto mb-4">
                        L
                    </div>
                    <h2 className="text-[22px] font-bold text-white tracking-tight">Crear una Cuenta</h2>
                    <p className="text-[12px] text-[#555] mt-1">Regístrate gratis para comenzar a facturar con Lexis</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-[6px] mb-6 text-[12px] text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-[6px] mb-6 text-[12px] text-center flex flex-col items-center">
                        <Mail className="mb-2 text-green-400" size={20} />
                        <p className="font-bold text-[13px] mb-1">¡Registro exitoso!</p>
                        <p className="text-[#aaa] leading-relaxed">Por favor, verifica tu correo electrónico para activar tu cuenta.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelCls}>Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={15} />
                            <input
                                type="text"
                                className={inputCls}
                                placeholder="Tu nombre completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={15} />
                            <input
                                type="email"
                                className={inputCls}
                                placeholder="tu@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={15} />
                            <input
                                type="password"
                                className={inputCls}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold p-3 rounded-[6px] transition-all shadow-lg shadow-green-500/20 flex items-center justify-center text-[13px] disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 spinner-amber border-black/20 border-t-black inline-block animate-spin" />
                                Creando cuenta...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <UserPlus size={15} />
                                Registrarse
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[#555] text-[12px]">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors ml-0.5">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
