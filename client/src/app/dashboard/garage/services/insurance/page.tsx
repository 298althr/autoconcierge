'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Zap,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Calculator,
    Lock,
    Eye,
    CheckCircle2,
    Info,
    Flame,
    Car,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const coverageTypes = [
    {
        id: 'third-party',
        title: 'Third-Party Only',
        price: '₦15,000 - ₦20,000',
        period: '/year',
        features: ['Property damage (up to ₦3M)', 'Bodily injury (unlimited)', 'Regulatory compliance'],
        exclusions: ['Own damage', 'Theft', 'Fire'],
        badge: 'Mandatory',
        color: 'slate'
    },
    {
        id: 'comprehensive',
        title: 'Comprehensive',
        price: '3.5% - 5%',
        period: ' of value',
        features: ['Third-party damage', 'Bodily injury', 'Accidental damage', 'Theft & Fire', 'Flood extension'],
        exclusions: [],
        badge: 'Recommended',
        color: 'emerald'
    }
];

const addOns = [
    { id: 'excess-buyback', name: 'Excess Buy-Back', price: 25000, icon: ShieldCheck },
    { id: 'flood', name: 'Flood & Storm Extension', price: 30000, icon: Flame },
    { id: 'tracking', name: 'Premium GPS Tracking', price: 45000, icon: Lock }
];

export default function InsuranceHub() {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('comprehensive');
    const [activeAddOns, setActiveAddOns] = useState<string[]>(['flood']);

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

    const calculatePremium = () => {
        if (!selectedVehicle) return { min: 0, max: 0 };
        const value = selectedVehicle.current_value || 5000000;
        let base = value * 0.035;
        const addOnsCost = addOns.filter(a => activeAddOns.includes(a.id)).reduce((acc, curr) => acc + curr.price, 0);

        const total = base + addOnsCost;
        return { min: total * 0.95, max: total * 1.05 };
    };

    const premium = calculatePremium();

    const toggleAddOn = (id: string) => {
        setActiveAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

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
                        <Shield size={16} />
                        <span>AutoGaard Protection</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Insurance.</h1>
                    <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                        Configure premium protection for your automotive assets with top-tier insurance partners.
                    </p>
                </header>

                {/* Step 1: Vehicle Selection */}
                {!selectedVehicle && (
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Insure An Asset</h2>
                        {loading ? (
                            <div className="py-12 flex justify-center italic text-slate-400">Verifying Vault...</div>
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
                                <Car className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium italic">No assets available for integration.</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Step 2: Protection Configuration */}
                <AnimatePresence>
                    {selectedVehicle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            {/* Coverage Grid */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Protection Tier</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {coverageTypes.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => setSelectedType(c.id)}
                                            className={`glass-card p-8 cursor-pointer transition-all border-2 ${selectedType === c.id ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100 hover:border-emerald-200'}`}
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{c.title}</h3>
                                                <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${c.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {c.badge}
                                                </span>
                                            </div>
                                            <div className="mb-6">
                                                <span className="text-3xl font-heading font-extrabold text-slate-900 italic">{c.price}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.period}</span>
                                            </div>
                                            <ul className="space-y-3">
                                                {c.features.map((f, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                        {f}
                                                    </li>
                                                ))}
                                                {c.exclusions.map((e, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider line-through">
                                                        <ShieldAlert size={12} />
                                                        {e}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add-ons Row */}
                            {selectedType === 'comprehensive' && (
                                <div className="space-y-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Critical Extensions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {addOns.map((a) => (
                                            <button
                                                key={a.id}
                                                onClick={() => toggleAddOn(a.id)}
                                                className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-4 ${activeAddOns.includes(a.id) ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <a.icon size={24} className={activeAddOns.includes(a.id) ? 'text-emerald-400' : 'text-slate-400'} />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">{a.name}</p>
                                                    <p className={`text-sm font-heading font-extrabold ${activeAddOns.includes(a.id) ? 'text-white' : 'text-slate-900'}`}>+₦{a.price.toLocaleString()}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Premium Analysis */}
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px]" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-2">Estimated Annual Premium</p>
                                        <div className="flex items-baseline gap-3">
                                            <h4 className="text-4xl md:text-5xl font-heading font-extrabold italic tracking-tight">
                                                ₦{selectedType === 'comprehensive' ? premium.min.toLocaleString() : '15,000'}
                                            </h4>
                                            <span className="text-sm font-bold opacity-70 uppercase tracking-widest">/ Per Year</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 text-[9px] font-black uppercase tracking-[0.2em]">
                                            <BadgeCheck size={14} className="text-emerald-300" />
                                            <span>Quotes from Leadway, AIICO & Axa Mansard</span>
                                        </div>
                                    </div>
                                    <PremiumButton variant="secondary" icon={ArrowUpRight} className="min-w-[200px]">
                                        Secure Protection
                                    </PremiumButton>
                                </div>
                            </div>

                            {/* Protocol Footer */}
                            <div className="flex items-center justify-center gap-8 py-6 opacity-40">
                                <ShieldCheck size={48} />
                                <Lock size={48} />
                                <Eye size={48} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function BadgeCheck({ className, size }: { className?: string, size?: number }) {
    return <CheckCircle2 className={className} size={size} />
}
