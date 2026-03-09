'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingBag, FileText, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) setStats(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-white p-8">Loading dashboard...</div>;

    const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
        <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 shadow-lg hover:border-gray-700 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                    <Icon size={24} className={`${color.replace('bg-', 'text-')}`} />
                </div>
                {subValue && (
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center">
                        <TrendingUp size={12} className="mr-1" /> {subValue}
                    </span>
                )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );

    const chartData = stats?.recentInvoices?.map(inv => ({
        name: `Inv #${inv.number}`,
        amount: parseFloat(inv.total)
    })).reverse() || [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome back, here&apos;s what&apos;s happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value={`$${isNaN(stats?.totalRevenue) ? '0.00' : stats?.totalRevenue?.toFixed(2)}`} icon={DollarSign} color="bg-green-500" subValue="+12.5%" />
                <StatCard title="Total Invoices" value={stats?.totalInvoices || 0} icon={FileText} color="bg-blue-500" />
                <StatCard title="Active Clients" value={stats?.totalClients || 0} icon={Users} color="bg-purple-500" />
                <StatCard title="Products" value={stats?.totalProducts || 0} icon={ShoppingBag} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#111] p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-6">Revenue Analytics</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} cursor={{ fill: '#ffffff0a' }} />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-6">Recent Invoices</h2>
                    <div className="space-y-4">
                        {stats?.recentInvoices?.length > 0 ? (
                            stats.recentInvoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-900/50 rounded-xl transition-colors border border-transparent hover:border-gray-800">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mr-3">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Invoice #{invoice.number}</p>
                                            <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">${parseFloat(invoice.total).toFixed(2)}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Paid</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent invoices</p>
                        )}
                    </div>
                    <Link href="/invoices" className="block w-full mt-6 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors text-center">
                        View All Invoices →
                    </Link>
                </div>
            </div>
        </div>
    );
}
