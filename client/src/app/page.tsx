'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import VehicleCard from '@/components/VehicleCard';
import { ArrowRight, Zap, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
    const [liveVehicles, setLiveVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [headlineIndex, setHeadlineIndex] = useState(0);
    const headlines = ["SMARTER.", "FASTER.", "SAFER.", "TOGETHER."];

    useEffect(() => {
        async function fetchLive() {
            try {
                const response = await apiFetch('/vehicles?status=in_auction');
                setLiveVehicles(response.data.slice(0, 4));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchLive();

        const timer = setInterval(() => {
            setHeadlineIndex((prev) => (prev + 1) % headlines.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="min-h-screen bg-surface text-content-primary overflow-x-hidden selection:bg-burgundy selection:text-white pb-0">

            {/* MINIMALIST HERO SECTION (16:9 FULL SCREEN) */}
            <section className="relative w-full h-[calc(100dvh-4rem)] min-h-[600px] flex flex-col justify-between pt-10 md:pt-16 bg-surface-50 overflow-hidden">
                {/* Background Vector / Illustration */}
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80 pointer-events-none translate-y-[10vh] md:translate-y-0 scale-150 md:scale-100 origin-bottom md:origin-center mix-blend-multiply">
                    <Image
                        src="/hero-vector.png"
                        alt="Background Vector"
                        fill
                        className="object-contain md:object-right-bottom object-bottom max-w-[1200px] ml-auto mr-auto lg:mr-0 opacity-90 drop-shadow-xl"
                        priority
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface-50 to-transparent" />
                </div>

                {/* Hero Content - Top Left aligned for minimalism */}
                <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 pt-10 md:pt-[10dvh] flex flex-col items-center md:items-start text-center md:text-left h-full">

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-[3.5rem] leading-[1] md:text-[6rem] lg:text-[7.5rem] font-heading font-extrabold tracking-tighter text-content-primary">
                            RIDE <br />
                            <span className="inline-flex relative min-h-[60px] md:min-h-[140px] items-center">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={headlines[headlineIndex]}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="text-burgundy absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 whitespace-nowrap drop-shadow-sm"
                                    >
                                        {headlines[headlineIndex]}
                                    </motion.span>
                                </AnimatePresence>
                                <span className="invisible pointer-events-none">TOGETHER.</span>
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-6 md:mt-8 text-lg md:text-2xl text-content-secondary max-w-xl font-body leading-relaxed md:bg-white/40 md:p-4 rounded-2xl md:backdrop-blur-sm"
                    >
                        Experience Nigeria&apos;s clean, transparent vehicle marketplace. Fair valuations, forensic checks, zero noise.
                    </motion.p>
                </div>

                {/* Bottom Floating Dashboard/Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative z-20 w-full max-w-[1600px] mx-auto px-6 pb-8 md:pb-12"
                >
                    <div className="bg-white/90 backdrop-blur-xl border border-surface-200 p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-6 w-[95%] md:w-fit ml-auto mr-auto md:ml-0 md:mr-0 min-w-0 md:min-w-[600px]">
                        <div className="flex gap-8 md:gap-12 w-full md:w-auto px-2 md:px-4">
                            <div className="space-y-1">
                                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-content-muted">Find Your Next Asset</label>
                                <p className="text-base md:text-lg font-bold text-content-primary">Browse Inventory</p>
                            </div>
                            <div className="space-y-1 border-l border-surface-200 pl-8 hidden lg:block">
                                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-content-muted">Market Action</label>
                                <p className="text-base md:text-lg font-bold text-content-primary">Live Auctions Active</p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Link href="/vehicles" className="flex-1 md:flex-none btn-primary shadow-xl shadow-burgundy/10 hover:-translate-y-1 group flex items-center justify-center whitespace-nowrap">
                                Explore <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </Link>
                            <Link href="/valuation" className="bg-surface-50 border border-surface-200 hover:bg-surface-100 text-burgundy p-4 rounded-xl transition-all w-14 flex items-center justify-center flex-shrink-0 group">
                                <Zap size={20} className="group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* TRUST SECTION - Minimalist Grids */}
            <section className="py-24 md:py-32 bg-white flex justify-center border-t border-surface-100">
                <div className="max-w-[1400px] w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
                    <div className="text-center md:text-left p-6 md:p-0">
                        <div className="bg-surface-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm border border-surface-100">
                            <ShieldCheck size={28} className="text-burgundy" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 font-heading text-content-primary tracking-tight">Forensic Audits</h3>
                        <p className="text-content-secondary leading-relaxed font-body">No guesswork. Every listing undergoes a 250-point engineering assessment verified by local experts.</p>
                    </div>
                    <div className="text-center md:text-left p-6 md:p-0">
                        <div className="bg-surface-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm border border-surface-100">
                            <Zap size={28} className="text-burgundy" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 font-heading text-content-primary tracking-tight">AI Valuation</h3>
                        <p className="text-content-secondary leading-relaxed font-body">Instantly access fair-market valuations based on real-time local data, protecting you from inflated prices.</p>
                    </div>
                    <div className="text-center md:text-left p-6 md:p-0">
                        <div className="bg-surface-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm border border-surface-100">
                            <CheckCircle2 size={28} className="text-burgundy" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 font-heading text-content-primary tracking-tight">Zero Tolerance</h3>
                        <p className="text-content-secondary leading-relaxed font-body">Scam-free escrow payments. Funds are securely locked in your digital wallet until terms are fulfilled.</p>
                    </div>
                </div>
            </section>

            {/* LIVE AUCTIONS */}
            <section className="py-24 md:py-40 bg-surface-50 border-t border-surface-100">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                        <div>
                            <span className="text-sm font-bold uppercase tracking-widest text-burgundy block mb-4">Discover Deals</span>
                            <h2 className="text-4xl md:text-6xl font-heading font-extrabold text-content-primary tracking-tighter">Active Auctions.</h2>
                        </div>
                        <Link href="/vehicles?status=in_auction" className="text-burgundy font-bold hover:text-burgundy-light transition-colors flex items-center group uppercase tracking-widest text-sm">
                            View all items <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-[4/3] bg-surface-100 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {liveVehicles.map((v: any) => (
                                    <VehicleCard key={v.id} vehicle={v} />
                                ))}
                                {liveVehicles.length === 0 && (
                                    <div className="col-span-full py-24 text-center border-2 border-dashed border-surface-200 rounded-[2rem] bg-white">
                                        <p className="text-content-secondary text-lg font-bold">No active auctions at the moment.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* FOOTER CTA */}
            <section className="py-32 md:py-48 bg-white border-t border-surface-100 relative overflow-hidden">
                <div className="absolute inset-0 z-0 bg-surface-50 w-full rounded-[100%] scale-[2] translate-y-[80%] opacity-50" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-8xl font-heading font-extrabold tracking-tighter mb-8 text-content-primary">Start your journey.</h2>
                    <p className="text-lg md:text-xl text-content-secondary mb-12 max-w-2xl mx-auto leading-relaxed font-body">Join thousands of verified buyers and sellers experiencing the ultimate automotive trading platform.</p>
                    <Link href="/register" className="btn-primary inline-flex items-center text-lg px-10 py-5 shadow-2xl shadow-burgundy/20 hover:scale-105">
                        Create Free Account <ArrowRight size={20} className="ml-3" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
