'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';
import {
    User,
    Mail,
    Phone,
    ShieldCheck,
    Camera,
    ChevronRight,
    MapPin,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProfilePage() {
    const { user } = useAuth();
    const { wallet } = useWallet();

    if (!user) return null;

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20 px-6">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12 text-center md:text-left">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center justify-center md:justify-start space-x-2 text-burgundy font-bold uppercase tracking-widest text-[10px] mb-3">
                            <User size={16} />
                            <span>Client Dossier</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight mb-3">Profile Identity.</h1>
                        <p className="text-slate-500 font-subheading text-sm leading-relaxed">Manage authentication details and security clearance.</p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & KYC Status */}
                    <div className="md:col-span-1 space-y-6">
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="glass-card p-10 text-center relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300" />
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 overflow-hidden shadow-inner border border-slate-100/50 transition-transform duration-500 group-hover:scale-105">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-xl shadow-xl hover:bg-burgundy hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                                    <Camera size={18} />
                                </button>
                            </div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-2 tracking-tight">{user.display_name}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 font-subheading">{user.role}</p>

                            <div className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm border ${user.kyc_status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                user.kyc_status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                {user.kyc_status === 'verified' ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} />}
                                <span>Clearance {user.kyc_status}</span>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-shadow"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/10 transition-colors duration-700" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3 font-subheading">Liquid Capital</p>
                                <div className="text-4xl font-heading font-extrabold mb-8 tracking-tight">
                                    <span className="text-white/40 text-2xl mr-1.5 font-body">₦</span>
                                    {(user.wallet_balance + (wallet?.held || 0)).toLocaleString()}
                                </div>
                                <Link href="/wallet" className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors group/link pb-1 border-b border-white/10 hover:border-white/50">
                                    <span>Access Treasury</span>
                                    <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column: Information Sections */}
                    <div className="md:col-span-2 space-y-8">
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="glass-card p-10 md:p-12"
                        >
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center font-subheading">
                                <span className="w-8 h-[2px] bg-slate-200 mr-4 rounded-full" />
                                <span>Personal Credentials</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-slate-400 mb-2">
                                        <Mail size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Contact Protocol</span>
                                    </div>
                                    <p className="text-base font-heading font-extrabold text-slate-900">{user.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-slate-400 mb-2">
                                        <Phone size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Secure Line</span>
                                    </div>
                                    <p className="text-base font-heading font-extrabold text-slate-900">{user.phone || 'Undisclosed'}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-slate-400 mb-2">
                                        <MapPin size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Primary Jurisdiction</span>
                                    </div>
                                    <p className="text-base font-heading font-extrabold text-slate-900">Lagos, Nigeria</p>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="glass-card p-10 md:p-12"
                        >
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center font-subheading">
                                <span className="w-8 h-[2px] bg-slate-200 mr-4 rounded-full" />
                                <span>Clearance Status</span>
                            </h3>

                            {user.kyc_status !== 'verified' ? (
                                <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="font-heading font-extrabold text-slate-900 text-xl mb-2 tracking-tight">Identity Unverified.</h4>
                                        <p className="text-sm text-slate-500 font-subheading leading-relaxed mb-6">
                                            Institutional access requires cryptographic verification. Complete the process to unlock full bidding capabilities.
                                        </p>
                                        <div className="flex justify-center sm:justify-start">
                                            <Link href="/onboarding">
                                                <PremiumButton icon={ShieldCheck} size="sm">
                                                    Initiate Verification
                                                </PremiumButton>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-heading font-extrabold text-slate-900 text-xl mb-1 tracking-tight">Full Clearance Granted.</h4>
                                        <p className="text-sm text-slate-500 font-subheading">All institutional privileges and escrow services active.</p>
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    </div>
                </div>
            </div>
        </main>
    );
}
