'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Save, User, Mail, Shield, Building } from 'lucide-react';

export default function Settings() {
    const { user, login } = useAuth(); // We'll just re-fetch /me to get updated session data if needed, or update locally
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
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccessMsg('Profile updated successfully!');
            // Since the AuthContext needs to know the new name for the Sidebar:
            // The simplest approach is to force a page reload or trigger a re-fetch in AuthContext.
            // For now, reloading the page will cleanly pull the new user data from Supabase.
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
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account and profile preferences.</p>
            </div>

            <div className="bg-[#111] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <User className="mr-2 text-blue-500" size={24} />
                        Profile Information
                    </h2>
                </div>

                <div className="p-6">
                    {successMsg && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl mb-6 flex items-center">
                            {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 flex items-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Profile Name (Editable) */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Address (Read-only for now) */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-500 pl-10 p-3 rounded-xl cursor-not-allowed"
                                        value={user?.email || ''}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Email address cannot be changed currently.</p>
                            </div>

                            {/* Account Role (Read-only) */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">Account Role</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-400 pl-10 p-3 rounded-xl cursor-not-allowed capitalize"
                                        value={user?.role || 'User'}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Optional: Company Name (Future Feature) */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">Company Name (Coming Soon)</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-[#1a1a1a]/50 border border-gray-800 text-gray-600 pl-10 p-3 rounded-xl cursor-not-allowed"
                                        placeholder="Your Company Inc."
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        <Save size={20} className="mr-2" />
                                        Save Changes
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
