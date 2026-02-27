'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Palette,
    Sparkles,
    Scissors,
    Waves,
    ChevronRight,
    ArrowUpRight,
    Box,
    Droplets,
    Camera,
    Maximize,
    Loader2,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const options = [
    {
        id: 'repaint',
        title: 'Baking Oven Repaint',
        description: 'Multi-stage computer-matched hues with a 24-month high-gloss warranty.',
        icon: Palette,
        status: 'AI Color Preview',
        price: 350000,
        type: 'STYLING'
    },
    {
        id: 'deep-clean',
        title: 'Deep Restoration',
        description: 'Full interior/exterior steam detailing, upholstery extraction, and polishing.',
        icon: Sparkles,
        status: 'Ready in 8h',
        price: 45000,
        type: 'DETAIL'
    },
    {
        id: 'ceramic-coat',
        title: 'Ceramic Shield',
        description: '9H hardness nano-coating for 3-year paint protection & hydrophobic finish.',
        icon: Droplets,
        status: 'Premium Grade',
        price: 120000,
        type: 'PROTECT'
    }
];

export default function RefurbishmentHub() {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [vClass, setVClass] = useState('sedan');
    const [tier, setTier] = useState<'standard' | 'premium'>('standard');

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

    const calculateQuote = () => {
        let base = vClass === 'sedan' ? 350000 : vClass === 'suv' ? 450000 : 600000;
        if (tier === 'premium') base += 150000;
        const comm = base * 0.15;
        return { base, comm, total: base + comm };
    };

    const quote = calculateQuote();

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
                    <div className="flex items-center space-x-3 text-violet-500 font-black uppercase tracking-widest text-[10px] mb-3">
                        <Palette size={16} />
                        <span>Refurbishment Lab</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Refurbishment.</h1>
                    <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                        Restore aesthetic integrity through precision repainting and professional detailing protocols.
                    </p>
                </header>

                {/* Step 1: Vehicle Selection */}
                {!selectedVehicle && (
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Select Asset for Restoration</h2>
                        {loading ? (
                            <div className="py-12 flex justify-center italic text-slate-400">Loading Vault...</div>
                        ) : vehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map((v) => (
                                    <motion.div
                                        key={v.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setSelectedVehicle(v)}
                                        className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-violet-500/30 transition-all border border-slate-100 shadow-sm"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                            <img src={v.images?.[0]} className="w-full h-full object-cover" alt={v.model} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-bold text-slate-900 text-sm">{v.year} {v.make} {v.model}</h3>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{v.license_plate || 'No Plate'}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/60 p-12 rounded-[2.5rem] border border-slate-100 text-center">
                                <Box className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium italic">No assets available for restoration.</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Step 2: Refurbishment Protocols */}
                <AnimatePresence>
                    {selectedVehicle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Quote Builder Shortcut */}
                            <motion.div
                                onClick={() => setIsQuoteOpen(true)}
                                whileHover={{ scale: 1.01 }}
                                className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-slate-900/40 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px]" />
                                <div className="w-16 h-16 bg-violet-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-500/20">
                                    <Maximize size={32} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-heading font-extrabold tracking-tight">Paint Quote Builder.</h3>
                                    <p className="text-slate-400 text-sm font-medium">Configure finish tiers and class pricing for {selectedVehicle.model}.</p>
                                </div>
                                <PremiumButton variant="secondary" onClick={() => setIsQuoteOpen(true)}>
                                    Configure Quote
                                </PremiumButton>
                            </motion.div>

                            {/* Service protocols */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Restoration Items</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {options.map((o) => (
                                        <motion.div
                                            key={o.id}
                                            whileHover={{ y: -5 }}
                                            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group cursor-pointer border-slate-100 hover:border-violet-500/30 transition-all shadow-sm"
                                        >
                                            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                                                <o.icon size={26} />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-4 mb-1">
                                                    <h4 className="text-lg font-heading font-extrabold text-slate-900 uppercase tracking-widest">{o.title}</h4>
                                                    <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-violet-100 rounded text-violet-600">{o.type}</span>
                                                </div>
                                                <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic">{o.description}</p>
                                                <p className="text-[9px] text-violet-500 font-bold uppercase tracking-widest mt-2">{o.status}</p>
                                            </div>
                                            <div className="text-center md:text-right shrink-0">
                                                <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight italic">
                                                    ₦{o.price.toLocaleString()}
                                                </p>
                                                <div className="mt-2 flex items-center justify-center md:justify-end text-[9px] font-black uppercase tracking-widest text-violet-500 group-hover:translate-x-1 transition-transform">
                                                    Initiate <ChevronRight size={14} />
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

            {/* Quote Modal */}
            <AnimatePresence>
                {isQuoteOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsQuoteOpen(false)}
                            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white rounded-t-[3.5rem] p-10 pb-16 z-10 border-t border-slate-200"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />

                            <h2 className="text-3xl font-heading font-extrabold text-slate-900 italic tracking-tight mb-2">Restoration Quote.</h2>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-10">Select finish tiers for a precision terminal estimate.</p>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Vehicle Classification</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['sedan', 'suv', 'truck'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setVClass(c)}
                                                className={`py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${vClass === c ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Paint Quality Tier</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setTier('standard')}
                                            className={`py-5 rounded-3xl border transition-all flex flex-col items-center gap-1 ${tier === 'standard' ? 'bg-violet-50 border-violet-500 text-violet-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            <span className="text-xs font-black uppercase">Standard Gloss</span>
                                            <span className="text-[7px] font-bold opacity-70">Solid/Metallic Oven</span>
                                        </button>
                                        <button
                                            onClick={() => setTier('premium')}
                                            className={`py-5 rounded-3xl border transition-all flex flex-col items-center gap-1 ${tier === 'premium' ? 'bg-violet-50 border-violet-500 text-violet-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            <span className="text-xs font-black uppercase">Premium Tint</span>
                                            <span className="text-[7px] font-bold opacity-70">Custom Pearl/Candy</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-4 border border-slate-100">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Baking Oven Labor</span>
                                        <span className="text-slate-900 tracking-tight italic">₦{quote.base.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-violet-500">
                                        <span>Terminal Management (15%)</span>
                                        <span className="tracking-tight italic">₦{quote.comm.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">Final Estimate</span>
                                        <span className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight italic">₦{quote.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <PremiumButton className="w-full" icon={ArrowUpRight}>
                                    Secure Restoration Slot
                                </PremiumButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}

function LoadingSpinner({ className, size }: { className?: string, size?: number }) {
    return <Palette className={`${className} animate-pulse`} size={size} />
}
