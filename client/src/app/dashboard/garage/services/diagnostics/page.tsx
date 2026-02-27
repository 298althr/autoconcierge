'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Activity,
    Monitor,
    History,
    ChevronRight,
    Terminal,
    ShieldAlert,
    Clock,
    Zap,
    ArrowUpRight,
    MapPin,
    CheckCircle2,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const protocols = [
    {
        id: 'engine-scan',
        title: 'Engine Scan',
        description: 'Live OBD-II fault detection and clearing via neural diagnostics.',
        icon: Terminal,
        status: 'Ready in 15 Mins',
        price: 25000,
        type: 'Mobile'
    },
    {
        id: 'inspection',
        title: '120-Point Audit',
        description: 'Comprehensive mechanical, structural, and electrical health check.',
        icon: Monitor,
        status: 'Terminal Booking Required',
        price: 65000,
        type: 'Workshop'
    },
    {
        id: 'vin-audit',
        title: 'Dossier / VIN Check',
        description: 'Global auction records, accident history, and mileage verification.',
        icon: History,
        status: 'Instant Access',
        price: 15000,
        type: 'Digital'
    }
];

export default function DiagnosticsHub() {
    const { token, user } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                        <Activity size={16} />
                        <span>Service Tier 1</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Diagnostics Hub.</h1>
                    <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                        Identify mechanical vulnerabilities with precision AI scanning and structural audits.
                    </p>
                </header>

                {/* Step 1: Vehicle Selection if not selected */}
                {!selectedVehicle && (
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Select Target Asset</h2>
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <LoadingSpinner className="animate-spin text-blue-500" size={32} />
                            </div>
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
                                <ShieldAlert className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium italic">No assets found in your vault to scan.</p>
                                <Link href="/dashboard/garage" className="text-blue-500 font-bold uppercase tracking-widest text-[10px] mt-4 block hover:underline">
                                    Register a Vehicle First
                                </Link>
                            </div>
                        )}
                    </section>
                )}

                {/* Step 2: Protocols if Vehicle is selected */}
                <AnimatePresence>
                    {selectedVehicle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Target Dashboard */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-slate-900/20">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 shrink-0">
                                    <img src={selectedVehicle.images?.[0]} className="w-full h-full object-cover" alt="Target" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Target Linked</p>
                                    </div>
                                    <h3 className="text-2xl font-heading font-extrabold italic text-white tracking-tight">
                                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                                    </h3>
                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><MapPin size={10} /> Local Terminal</span>
                                        <span className="flex items-center gap-1"><Zap size={10} /> ECU Sync Ready</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedVehicle(null)}
                                    className="px-4 py-2 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                                >
                                    Switch Asset
                                </button>
                            </div>

                            {/* Protocols Grid */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Select Scanning Protocol</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {protocols.map((p) => (
                                        <motion.div
                                            key={p.id}
                                            whileHover={{ x: 10 }}
                                            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group cursor-pointer border-slate-100 hover:border-blue-500/30 transition-all shadow-sm"
                                        >
                                            <div className="w-14 h-14 bg-white shadow-inner rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                                <p.icon size={28} />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                                    <h4 className="text-xl font-heading font-extrabold text-slate-900 uppercase tracking-widest leading-none">{p.title}</h4>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest">{p.type}</span>
                                                </div>
                                                <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{p.description}</p>
                                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-2">{p.status}</p>
                                            </div>
                                            <div className="text-center md:text-right shrink-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Fee</p>
                                                <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">₦{p.price.toLocaleString()}</p>
                                                <div className="mt-3 flex items-center justify-center md:justify-end text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 group-hover:translate-x-1 transition-transform">
                                                    Initiate <ChevronRight size={14} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Protocol Workflow */}
                            <div className="bg-white/80 border border-slate-100 rounded-[2.5rem] p-10 mt-12">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-heading font-extrabold text-slate-900 leading-none">Scanning Engine.</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tier-1 Logical Sequence</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 hidden md:block" />

                                    {[
                                        { step: 1, title: 'ECU Handshake', desc: 'Secure OBD-II pairing with encrypted data stream.' },
                                        { step: 2, title: 'DTC Decomposition', desc: 'Fault code mapping to mechanical health nodes.' },
                                        { step: 3, title: 'Repair Intelligence', desc: 'Automated cost estimation and workshop rollout.' }
                                    ].map((s) => (
                                        <div key={s.step} className="relative z-10 bg-white md:bg-transparent pr-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black mb-4 shadow-lg shadow-blue-500/20">
                                                {s.step}
                                            </div>
                                            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-2">{s.title}</h5>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide">{s.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function LoadingSpinner({ className, size }: { className?: string, size?: number }) {
    return <Activity className={className} size={size} />
}
