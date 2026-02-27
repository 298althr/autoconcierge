'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Truck,
    Calculator,
    ShieldCheck,
    Ship,
    ChevronRight,
    ArrowUpRight,
    Globe,
    BarChart3,
    Clock,
    MapPin,
    AlertCircle,
    BadgeCheck,
    Navigation
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const transportProtocols = [
    {
        id: 'port-clearing',
        title: 'Port Clearing',
        description: 'Fast-track terminal release and duty payment at PTML/Tin Can.',
        icon: Ship,
        status: 'Priority Access',
        price: 0,
        type: 'CUSTOMS'
    },
    {
        id: 'haulage',
        title: 'Secure Haulage',
        description: 'Interstate vehicle transport via secured flatbed or closed containers.',
        icon: Truck,
        status: 'Real-time GPS',
        price: 150000,
        type: 'LOGISTICS'
    },
    {
        id: 'valuation',
        title: 'Exit Valuation',
        description: 'AI-driven resale audit and guaranteed buy-back appraisal.',
        icon: BarChart3,
        status: 'Digital Audit',
        price: 35000,
        type: 'FINANCIAL'
    }
];

export default function LogisticsHub() {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCalcOpen, setIsCalcOpen] = useState(false);

    // Calculator State
    const [fob, setFob] = useState<number>(5000);
    const [rate, setRate] = useState<number>(1625);
    const [engineType, setEngineType] = useState('ice');

    useEffect(() => {
        if (token) {
            apiFetch('/me/garage', { token })
                .then((res: any) => {
                    setVehicles(res.data || []);
                    setLoading(false);
                })
                .catch((err: any) => {
                    console.error('Error fetching vehicles:', err);
                    setLoading(false);
                });
        }
    }, [token]);

    const calculateDuty = () => {
        const cif = fob * rate * 1.15; // Rough estim
        const dutyPct = engineType === 'ev' ? 0.05 : 0.20;
        const totalDuty = cif * dutyPct;
        const comm = totalDuty * 0.15;
        return { totalDuty, comm, grandTotal: totalDuty + comm };
    };

    const dutyResult = calculateDuty();

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20 px-6">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12">
                    <Link
                        href="/dashboard/garage"
                        className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] mb-4 transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Workshop</span>
                    </Link>
                    <div className="flex items-center space-x-3 text-blue-500 font-black uppercase tracking-widest text-[10px] mb-3">
                        <Globe size={16} />
                        <span>Global Logistics Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Logistics.</h1>
                    <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                        Streamline terminal clearing, interstate haulage, and asset valuation protocols.
                    </p>
                </header>

                {/* Step 1: Vehicle Selection */}
                {!selectedVehicle && (
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Select Target for Move</h2>
                        {loading ? (
                            <div className="py-12 flex justify-center italic text-slate-400">Syncing Fleet...</div>
                        ) : vehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map((v) => (
                                    <motion.div
                                        key={v.id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedVehicle(v)}
                                        className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-blue-500/30 transition-all border border-slate-100"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                            <img src={v.images?.[0]} className="w-full h-full object-cover" alt={v.model} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-sm">{v.year} {v.make} {v.model}</h3>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{v.license_plate || 'No Plate'}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/60 p-12 rounded-[2.5rem] border border-slate-100 text-center">
                                <Navigation className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium italic">No assets available for logistics.</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Step 2: Protocols */}
                <AnimatePresence>
                    {selectedVehicle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Duties Calculator Shortcut */}
                            <motion.div
                                onClick={() => setIsCalcOpen(true)}
                                whileHover={{ scale: 1.01 }}
                                className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-600/20"
                            >
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Calculator size={32} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-heading font-extrabold tracking-tight italic">Duties Calculator.</h3>
                                    <p className="text-blue-100 text-sm font-medium">Estimate terminal release & clearing costs for {selectedVehicle.model}.</p>
                                </div>
                                <PremiumButton variant="secondary" onClick={() => setIsCalcOpen(true)}>
                                    Analyze Duties
                                </PremiumButton>
                            </motion.div>

                            {/* Protocols Grid */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Movement Protocols</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {transportProtocols.map((p) => (
                                        <motion.div
                                            key={p.id}
                                            whileHover={{ x: 10 }}
                                            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group cursor-pointer border-slate-100 hover:border-blue-500/30 transition-all shadow-sm"
                                        >
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                                <p.icon size={28} />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-4 mb-1">
                                                    <h4 className="text-lg font-heading font-extrabold text-slate-900 uppercase tracking-widest leading-none">{p.title}</h4>
                                                    <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-100 rounded text-blue-700">{p.type}</span>
                                                </div>
                                                <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic">{p.description}</p>
                                                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-2">{p.status}</p>
                                            </div>
                                            <div className="text-center md:text-right shrink-0">
                                                <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight italic">
                                                    {p.price > 0 ? `₦${p.price.toLocaleString()}` : 'Live Rate'}
                                                </p>
                                                <div className="mt-3 flex items-center justify-center md:justify-end text-[9px] font-black uppercase tracking-widest text-blue-600 group-hover:gap-2 transition-all">
                                                    Deploy <ChevronRight size={14} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Calc Modal */}
            <AnimatePresence>
                {isCalcOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCalcOpen(false)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-2xl bg-white rounded-t-[3.5rem] p-10 pb-16 z-10 border-t border-slate-200"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />

                            <h2 className="text-3xl font-heading font-extrabold text-slate-900 italic tracking-tight mb-2">Duties Analysis.</h2>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-10">Determine terminal clearing and terminal release costs.</p>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">FOB Value (USD)</label>
                                        <input
                                            type="number"
                                            value={fob}
                                            onChange={(e) => setFob(Number(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Exchange Rate</label>
                                        <input
                                            type="number"
                                            value={rate}
                                            onChange={(e) => setRate(Number(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Engine Type</label>
                                    <div className="flex gap-4">
                                        {['ice', 'ev'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setEngineType(t)}
                                                className={`flex-1 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${engineType === t ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                            >
                                                {t === 'ice' ? 'Internal Combustion' : 'Electric Vehicle'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-4 border border-slate-100">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Official Duty Estimate</span>
                                        <span className="text-slate-900 tracking-tight italic">₦{dutyResult.totalDuty.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                        <span>Management (15%)</span>
                                        <span className="tracking-tight italic">₦{dutyResult.comm.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">Final Package</span>
                                        <span className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight italic">₦{dutyResult.grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <PremiumButton className="w-full" icon={BadgeCheck}>
                                    Initiate Port Clearing
                                </PremiumButton>

                                <p className="text-[8px] text-slate-400 font-medium uppercase text-center tracking-widest">
                                    Final duty subject to terminal appraisal and official customs valuation.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}

function LoadingSpinner({ className, size }: { className?: string, size?: number }) {
    return <Globe className={`${className} animate-spin`} size={size} />
}
