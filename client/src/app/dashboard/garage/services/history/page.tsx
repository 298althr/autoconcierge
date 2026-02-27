'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    History,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Filter,
    ArrowUpRight,
    Download,
    Eye,
    Star,
    ShieldCheck,
    TrendingUp,
    LayoutGrid,
    ChevronRight,
    SearchX
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';

const statusMap: Record<string, any> = {
    'completed': { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Secured' },
    'in-progress': { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Clock, label: 'Active' },
    'pending': { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertCircle, label: 'Queued' },
    'awaiting-payment': { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle, label: 'Unpaid' }
};

export default function ServiceHistory() {
    const { token } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (token) {
            // Simulated fetch for MVP
            setTimeout(() => {
                setRecords([
                    {
                        id: 'SR-7721',
                        title: 'Sequential CNG Conversion',
                        type: 'upgrade',
                        status: 'completed',
                        date: '2024-05-12',
                        amount: 750000,
                        partner: 'AutoCraft Terminal',
                        impact: 1200000,
                        rating: 5
                    },
                    {
                        id: 'SR-7720',
                        title: '120-Point Audit',
                        type: 'diagnostic',
                        status: 'completed',
                        date: '2024-05-10',
                        amount: 35000,
                        partner: 'AutoGaard HQ',
                        impact: 200000,
                        rating: 4
                    },
                    {
                        id: 'SR-7719',
                        title: 'License Renewal',
                        type: 'registration',
                        status: 'in-progress',
                        date: '2024-05-15',
                        amount: 25000,
                        partner: 'MVAA Lagos',
                        impact: 0
                    }
                ]);
                setLoading(false);
            }, 800);
        }
    }, [token]);

    const filteredRecords = records.filter(r => {
        const matchesFilter = filter === 'all' || r.status === filter;
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: records.length,
        completed: records.filter(r => r.status === 'completed').length,
        totalSpent: records.reduce((acc, r) => acc + r.amount, 0),
        valueUnlocked: records.reduce((acc, r) => acc + r.impact, 0)
    };

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-8 pb-20 px-6">

            <div className="max-w-5xl mx-auto relative z-10">
                <header className="mb-12">
                    <Link
                        href="/dashboard/garage"
                        className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] mb-4 transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Workshop</span>
                    </Link>
                    <div className="flex items-center space-x-3 text-slate-900 font-black uppercase tracking-widest text-[10px] mb-3">
                        <History size={16} />
                        <span>Asset Intervention Log</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Service Dossier.</h1>
                            <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                                Universal ledger of all historical interventions, value enhancements, and regulatory filings.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stats Ledger */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: 'Total Files', value: stats.total, icon: FileText, color: 'text-slate-900' },
                        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
                        { label: 'Deployment', value: `₦${(stats.totalSpent / 1000).toFixed(0)}k`, icon: Clock, color: 'text-blue-500' },
                        { label: 'Unlocked Val.', value: `₦${(stats.valueUnlocked / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-emerald-500' }
                    ].map((s, i) => (
                        <div key={i} className="glass-card p-6 border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <s.icon size={18} className={s.color} />
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Ledger</span>
                            </div>
                            <p className="text-2xl font-heading font-extrabold text-slate-900 leading-none">{s.value}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">{s.label}</p>
                        </div>
                    ))}
                </section>

                {/* Controls */}
                <section className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Identify specific protocol or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-slate-300 transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['all', 'completed', 'in-progress', 'pending'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                            >
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Records Timeline */}
                <section className="space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center opacity-30 italic font-medium text-slate-900">
                            <History size={48} className="animate-spin mb-4" />
                            <p>Analyzing Ledger...</p>
                        </div>
                    ) : filteredRecords.length > 0 ? (
                        filteredRecords.map((r, i) => {
                            const st = statusMap[r.status] || statusMap.pending;
                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-slate-300 transition-all shadow-sm border-slate-100"
                                >
                                    <div className={`w-14 h-14 ${st.bg} ${st.color} rounded-2xl flex items-center justify-center shrink-0`}>
                                        <st.icon size={26} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                            <h4 className="text-lg font-heading font-extrabold text-slate-900 uppercase tracking-widest truncate">{r.title}</h4>
                                            <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded text-slate-400">{r.id}</span>
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                                            <span>{r.date}</span>
                                            <span>•</span>
                                            <span className="text-slate-900 font-bold">{r.partner}</span>
                                        </div>
                                        {r.rating && (
                                            <div className="flex items-center justify-center md:justify-start gap-0.5 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-6 md:gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Investment</p>
                                            <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">₦{r.amount.toLocaleString()}</p>
                                        </div>
                                        {r.impact > 0 && (
                                            <div className="text-right">
                                                <p className="text-[8px] font-black tracking-widest text-emerald-500 uppercase flex items-center justify-end gap-1">
                                                    <TrendingUp size={10} /> +₦{r.impact.toLocaleString()} Val.
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all cursor-pointer">
                                            Folder <Eye size={12} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                                <SearchX size={32} />
                            </div>
                            <h3 className="text-lg font-heading font-extrabold text-slate-900 uppercase tracking-widest">No matching records.</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Refine your audit or identify a specific intervention.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
