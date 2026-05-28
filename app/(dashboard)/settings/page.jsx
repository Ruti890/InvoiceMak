'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Save, User, Mail, Shield, Building } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const inputCls = 'w-full bg-[#111] border border-[#2a2a2a] text-[13px] text-white placeholder-[#444] px-3 py-2.5 pl-10 rounded-[6px] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all';
const labelCls = 'block text-[11px] font-medium text-[#555] uppercase tracking-wide mb-1.5';

export default function Settings() {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'No se pudo actualizar el perfil');
            }

            setSuccessMsg('¡Perfil actualizado correctamente!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 lg:p-6 max-w-4xl mx-auto">
            <PageHeader
                title="Configuración"
                subtitle="Administra tu cuenta y preferencias de perfil"
            />

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[8px] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1e1e1e] bg-[#171717]">
                    <h2 className="text-[14px] font-semibold text-white flex items-center gap-2">
                        <User className="text-green-400" size={16} />
                        Información del Perfil
                    </h2>
                </div>

                <div className="p-5">
                    {successMsg && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-[12px] px-4 py-3 rounded-[6px] mb-5">
                            {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] px-4 py-3 rounded-[6px] mb-5">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Profile Name (Editable) */}
                            <div>
                                <label className={labelCls}>Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={15} />
                                    <input
                                        type="text"
                                        className={inputCls}
                                        placeholder="Tu nombre"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Address (Read-only for now) */}
                            <div>
                                <label className={labelCls}>Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={15} />
                                    <input
                                        type="email"
                                        className="w-full bg-[#111] border border-[#2a2a2a] text-[13px] text-[#666] px-3 py-2.5 pl-10 rounded-[6px] cursor-not-allowed outline-none"
                                        value={user?.email || ''}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <p className="text-[10px] text-[#444] mt-1.5">La dirección de correo no se puede cambiar actualmente.</p>
                            </div>

                            {/* Account Role (Read-only) */}
                            <div>
                                <label className={labelCls}>Rol de Cuenta</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={15} />
                                    <input
                                        type="text"
                                        className="w-full bg-[#111] border border-[#2a2a2a] text-[13px] text-[#666] px-3 py-2.5 pl-10 rounded-[6px] cursor-not-allowed outline-none capitalize"
                                        value={user?.role || 'Usuario'}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Optional: Company Name (Coming Soon) */}
                            <div>
                                <label className={labelCls}>Nombre de Empresa (Próximamente)</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333]" size={15} />
                                    <input
                                        type="text"
                                        className="w-full bg-[#111]/50 border border-[#2a2a2a]/50 text-[#333] px-3 py-2.5 pl-10 rounded-[6px] cursor-not-allowed outline-none"
                                        placeholder="Tu Empresa S.A.S."
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#1e1e1e] flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold text-black bg-green-500 hover:bg-green-400 rounded-[6px] disabled:opacity-50 transition-all shadow-lg shadow-green-500/20"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-3.5 h-3.5 spinner-amber border-black/20 border-t-black inline-block animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
