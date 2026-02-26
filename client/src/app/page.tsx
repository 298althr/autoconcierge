'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, Target, Layers, Cpu, TrendingUp, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';
import MotionBackground from '@/components/landing/MotionBackground';
import PillHeader from '@/components/landing/PillHeader';
import FeatureCard from '@/components/landing/FeatureCard';
import AILoader from '@/components/landing/AILoader';
import { apiFetch } from '@/lib/api';
import VehicleCard from '@/components/VehicleCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [liveVehicles, setLiveVehicles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [headlineIndex, setHeadlineIndex] = React.useState(0);
    const headlines = ["VALUATIONS", "LIQUIDITY", "AUCTIONS"];
    const subtexts = ["IN 60 SECONDS.", "IN 60 SECONDS.", "IN REAL-TIME."];

    React.useEffect(() => {
        if (!isLoading && user) {
            if (user.kyc_status === 'none') {
                router.replace('/onboarding');
            } else {
                router.replace('/dashboard');
            }
        }
    }, [user, isLoading, router]);

    React.useEffect(() => {
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
        }, 3000);
        return () => clearInterval(timer);
    }, [headlines.length]);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden">
            <MotionBackground />
            <PillHeader />

            {/* Hero Section - Product First */}
            <section
                className="relative pt-32 pb-20 md:pt-60 md:pb-40 px-6 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('https://res.cloudinary.com/dt6n4pnjb/image/upload/v1771840184/modern-background-with-white-round-lines_wuz5nm.jpg')` }}
            >
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>

                <div className="max-w-screen-xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-block py-1 px-4 rounded-full bg-slate-900/5 text-slate-900 text-[10px] font-bold tracking-widest uppercase mb-8 border border-slate-900/10">
                            The Next Evolution of Car Commerce
                        </span>

                        <div className="relative h-[120px] md:h-[240px] flex items-center justify-center overflow-hidden mb-8">
                            <AnimatePresence mode="wait">
                                <motion.h1
                                    key={headlineIndex}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -40 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-[2.75rem] md:text-[7.5rem] font-extrabold tracking-tighter leading-[0.9] text-slate-900 absolute"
                                >
                                    {headlines[headlineIndex]} <br />
                                    <span className="text-slate-400">{subtexts[headlineIndex]}</span>
                                </motion.h1>
                            </AnimatePresence>
                        </div>

                        <p className="relative z-10 max-w-xl mx-auto text-base md:text-xl text-slate-500 font-body leading-relaxed mb-12">
                            Autogaard leverages deep-learning AI to provide forensic-level valuations. No calls. No friction. Just precise liquidity.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link href="/valuation" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-full font-subheading font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center group shadow-2xl shadow-slate-900/20 active:scale-95">
                                Get Instant Value <Zap className="ml-2 group-hover:scale-110 transition-transform fill-current" size={20} />
                            </Link>
                            <Link href="/vehicles" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-full font-subheading font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center group active:scale-95">
                                Browse Marketplace <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Minimalist Tech Preview Widget */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="mt-20 md:mt-32 max-w-4xl mx-auto rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden hidden md:block"
                    >
                        <div className="p-3 border-b border-slate-100/50 flex items-center gap-2 px-8">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                            </div>
                            <div className="mx-auto text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Engine Performance v2.0</div>
                        </div>
                        <div className="p-12 flex items-center justify-between gap-12 text-left">
                            <div className="space-y-6 flex-1">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-burgundy uppercase tracking-widest flex items-center gap-2">
                                        Processing <AILoader />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">Nigeria Localized Dataset</div>
                                </div>
                                <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-900/5 font-mono text-[10px] text-slate-400 leading-relaxed">
                                    {`ValuationAnalysis({ 
  vin: "JH23...92",
  market_delta: 1.04,
  liquidity_rating: "A+"
})`}
                                </div>
                            </div>
                            <div className="w-px h-24 bg-slate-100" />
                            <div className="flex-1 text-center">
                                <div className="text-5xl font-heading font-extrabold text-slate-900 mb-1 tracking-tighter">98.4%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Valuation Accuracy</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* LIVE AUCTIONS */}
            <section className="py-24 md:py-40 bg-white border-t border-slate-100">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                        <motion.div {...fadeInUp}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy block mb-4">Discover Deals</span>
                            <h2 className="text-4xl md:text-6xl font-heading font-extrabold text-slate-900 tracking-tighter">Active Auctions.</h2>
                        </motion.div>
                        <Link href="/vehicles?status=in_auction" className="text-burgundy font-bold hover:text-burgundy-light transition-colors flex items-center group uppercase tracking-widest text-[10px]">
                            View all items <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-[4/3] bg-slate-100 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {liveVehicles.map((v: any) => (
                                    <VehicleCard key={v.id} vehicle={v} />
                                ))}
                                {liveVehicles.length === 0 && (
                                    <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
                                        <p className="text-slate-500 text-lg font-bold">No active auctions at the moment.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Product Narrative - Minimalist Grid */}
            <section className="py-24 md:py-40 px-6">
                <div className="max-w-screen-xl mx-auto">
                    <motion.div
                        {...fadeInUp}
                        className="mb-16 md:mb-24 max-w-2xl"
                    >
                        <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tighter text-slate-900 mb-6 leading-[1.1]">
                            The first automotive <br />
                            <span className="text-slate-400">operating system.</span>
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed font-body">
                            We didn't build just another classifieds site. We built a high-frequency engine that handles the forensic, financial, and legal friction of trading vehicles.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        <FeatureCard
                            title="Escrow Protocol"
                            description="Your funds remain locked in your digital wallet until you approve the inspection. Zero-risk transactions between verified users."
                            icon={<ShieldCheck size={28} />}
                        />
                        <FeatureCard
                            title="Real-Time Bidding"
                            description="Low-latency auction engine. Bid and monitor in real-time with automated anti-snipe protection and market transparency."
                            icon={<Target size={28} />}
                        />
                        <FeatureCard
                            title="5% Margin Flat"
                            description="Transparent pricing. No hidden charges, no middleman markup. We only win when you successfully trade your asset."
                            icon={<Layers size={28} />}
                        />
                    </div>
                </div>
            </section>

            {/* The Edge Section */}
            <section className="py-24 md:py-40 px-6 overflow-hidden">
                <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <motion.div {...fadeInUp} className="flex-1 space-y-10">
                        <h2 className="text-3xl md:text-6xl font-heading font-extrabold tracking-tighter text-slate-900 leading-[1]">
                            How we surpass <br />
                            <span className="text-slate-400">the legacy market.</span>
                        </h2>

                        <div className="space-y-8">
                            {[
                                { title: 'AI Forensic Valuation', desc: 'Precise automated pricing based on local inventory data benchmarks.', icon: Cpu },
                                { title: 'Liquidity Rankings', desc: 'Know exactly how fast your car will sell before you even list it.', icon: TrendingUp },
                                { title: 'Forensic Audits', desc: 'Every vehicle in our catalog passes a 250-point engineering assessment.', icon: BarChart3 }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-10 h-10 rounded-full bg-burgundy/5 flex items-center justify-center text-burgundy flex-shrink-0 mt-1 group-hover:bg-burgundy group-hover:text-white transition-all duration-300">
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-heading font-bold text-slate-900 text-xl mb-1 tracking-tight">{item.title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed font-body">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="flex-1 w-full"
                    >
                        <div className="bg-slate-900 p-10 md:p-20 rounded-[3rem] text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12">
                                <ShieldCheck size={280} />
                            </div>
                            <div className="relative z-10">
                                <span className="text-burgundy-light font-bold tracking-[0.2em] uppercase text-[10px] mb-6 block">Security Protocol</span>
                                <h3 className="text-3xl md:text-5xl font-heading font-extrabold mb-8 tracking-tighter leading-tight">Trade with total <br />autonomy.</h3>
                                <p className="text-slate-400 mb-12 leading-relaxed max-w-sm font-body text-base">
                                    Your identity and funds are protected by bank-grade encryption and KYC verification. We build the trust so you can build your fleet.
                                </p>
                                <Link href="/register" className="inline-flex items-center text-white font-bold group text-lg">
                                    Start Verification <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-32 md:py-60 px-6 text-center">
                <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
                    <h2 className="text-5xl md:text-[9rem] font-heading font-extrabold tracking-tighter text-slate-900 mb-12 leading-[0.8] mix-blend-multiply opacity-10">
                        OWN YOUR MARKET.
                    </h2>
                    <h2 className="text-4xl md:text-7xl font-heading font-extrabold tracking-tighter text-slate-900 mb-12 leading-tight">
                        Experience the <br />Future of Trading.
                    </h2>
                    <Link href="/register" className="bg-burgundy text-white px-14 py-6 rounded-full font-subheading font-bold text-xl hover:bg-burgundy-light transition-all hover:scale-105 inline-flex items-center shadow-2xl shadow-burgundy/30 active:scale-95">
                        Create Free Account <ArrowRight className="ml-3" size={24} />
                    </Link>
                    <p className="mt-10 text-slate-400 text-sm font-subheading font-bold tracking-widest uppercase">No monthly fees. 5% flat commission.</p>
                </motion.div>
            </section>

            {/* Minimal Footer */}
            <footer className="py-12 px-6 border-t border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-6 max-w-screen-xl mx-auto">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">© 2026 Autogaard — Nigeria&apos;s AI Automotive OS</p>
                <div className="flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
                    <Link href="/contact" className="hover:text-slate-900 transition-colors">Support</Link>
                </div>
            </footer>
        </main>
    );
}
