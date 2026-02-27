'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    FileText,
    RefreshCcw,
    ShieldCheck,
    Hash,
    Scale,
    ChevronRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    MapPin,
    ArrowUpRight,
    Gavel
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const complianceServices = [
    {
        id: 'license-renewal',
        title: 'License Renewal',
        description: 'Auto-processing for annual vehicle papers and hackney permits.',
        icon: RefreshCcw,
        status: '24h Processing',
        price: 12500,
        type: 'Renewal'
    },
    {
        id: 'roadworthiness',
        title: 'Roadworthiness',
        description: 'LACVIS inspection scheduling and digital certificate issuance.',
        icon: CheckCircle2,
        status: 'Terminal Visit Req.',
        price: 8500,
        type: 'Inspection'
    },
    {
        id: 'insurance',
        title: 'Insurance (NIID)',
        description: '3rd Party or Comprehensive coverage with instant NIID upload.',
        icon: ShieldCheck,
        status: 'Instant Approval',
        price: 15000,
        type: 'Protection'
    },
    {
        id: 'number-plates',
        title: 'Number Plates',
        description: 'Order replacement plates or customized vanity identifiers.',
        icon: Hash,
        status: '5-7 Working Days',
        price: 45000,
        type: 'Logistics'
    },
    {
        id: 'fines-clearing',
        title: 'Fines Clearing',
        description: 'Official settlement of VIO, FRSC, and Police traffic tickets.',
        icon: Scale,
        status: 'Direct Payment',
        price: 0, // Varies
        type: 'Legal'
    }
];

export default function RegistrationHub() {
    const { token } = useAuth();
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
                    <div className="flex items-center space-x-3 text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-3">
                        <FileText size={16} />
                        <span>Compliance Vault</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Registration Hub.</h1>
                    <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                        Secure Nigerian legal documents, plate identifiers, and insurance protection for your assets.
                    </p>
                </header>

                {/* Step 1: Vehicle Selection */}
                {!selectedVehicle && (
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Authenticate Asset</h2>
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <LoadingSpinner className="animate-spin text-emerald-500" size={32} />
                            </div>
                        ) : vehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map((v) => (
                                    <motion.div
                                        key={v.id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedVehicle(v)}
                                        className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-500/30 transition-all border border-slate-100"
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
                                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium italic">No assets available for registration.</p>
                                <Link href="/dashboard/garage" className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] mt-4 block hover:underline">
                                    Register a Vehicle First
                                </Link>
                            </div>
                        )}
                    </section>
                )}

                {/* Step 2: Compliance Protocols */}
                <AnimatePresence>
                    {selectedVehicle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Asset Status Bar */}
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                                    <img src={selectedVehicle.images?.[0]} className="w-full h-full object-cover" alt="Selected" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                                    </h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg"><Hash size={10} /> {selectedVehicle.license_plate || 'UNREGISTERED'}</span>
                                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={10} /> Verified Title</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedVehicle(null)}
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    Switch Asset
                                </button>
                            </div>

                            {/* Services Grid */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Compliance Protocols</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {complianceServices.map((s) => (
                                        <motion.div
                                            key={s.id}
                                            whileHover={{ scale: 1.01 }}
                                            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group cursor-pointer border-slate-100 hover:border-emerald-500/30 transition-all shadow-sm"
                                        >
                                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                                <s.icon size={24} />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-4 mb-1">
                                                    <h4 className="text-lg font-heading font-extrabold text-slate-900 uppercase tracking-widest">{s.title}</h4>
                                                    <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded text-slate-500">{s.status}</span>
                                                </div>
                                                <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic">{s.description}</p>
                                            </div>
                                            <div className="text-center md:text-right shrink-0">
                                                <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
                                                    {s.price > 0 ? `₦${s.price.toLocaleString()}` : 'Price on Quote'}
                                                </p>
                                                <div className="mt-2 flex items-center justify-center md:justify-end text-[9px] font-black uppercase tracking-widest text-emerald-500 group-hover:gap-2 transition-all">
                                                    Deploy <ArrowUpRight size={14} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Trusted by Authorities section */}
                            <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300">
                                    <Scale size={32} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Electronic Title Protection</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">All registration papers are valid with LASG, FRSC, and NIA databases. Digital copies are archived in your Vault permanently.</p>
                                </div>
                                <Link href="/support/compliance" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors underline decoration-slate-200">
                                    Legal Framework
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function LoadingSpinner({ className, size }: { className?: string, size?: number }) {
    return <RefreshCcw className={`${className} animate-spin`} size={size} />
}
