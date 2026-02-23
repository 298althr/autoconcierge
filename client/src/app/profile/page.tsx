'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
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
        <main className="min-h-screen bg-canvas pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center md:text-left">
                    <h1 className="text-5xl font-black text-onyx mb-2">Account Center</h1>
                    <p className="text-onyx-light font-medium">Manage your personal details and security settings.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & KYC Status */}
                    <div className="md:col-span-1 space-y-6">
                        <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 text-center">
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="w-full h-full bg-canvas rounded-full flex items-center justify-center text-onyx overflow-hidden border-4 border-white shadow-xl">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2.5 bg-burgundy text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <h2 className="text-xl font-black text-onyx mb-1">{user.display_name}</h2>
                            <p className="text-[10px] font-black text-onyx-light uppercase tracking-widest mb-6">{user.role}</p>

                            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${user.kyc_status === 'verified' ? 'bg-emerald/10 text-emerald' :
                                user.kyc_status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                    'bg-red-50 text-red-500'
                                }`}>
                                {user.kyc_status === 'verified' ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} />}
                                <span>KYC {user.kyc_status}</span>
                            </div>
                        </section>

                        <section className="bg-onyx text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/20 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Wallet Balance</p>
                                <div className="text-3xl font-black mb-6">
                                    <span className="text-burgundy text-lg mr-1">₦</span>
                                    {(user.wallet_balance + (wallet?.held || 0)).toLocaleString()}
                                </div>
                                <Link href="/wallet" className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest hover:text-burgundy transition-colors">
                                    <span>Manage Funds</span>
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Information Sections */}
                    <div className="md:col-span-2 space-y-8">
                        <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-onyx-light uppercase tracking-[0.2em] mb-8 flex items-center">
                                <span className="w-8 h-px bg-burgundy/30 mr-4" />
                                <span>Personal Information</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-onyx-light mb-1">
                                        <Mail size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                                    </div>
                                    <p className="text-sm font-black text-onyx">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-onyx-light mb-1">
                                        <Phone size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Phone Number</span>
                                    </div>
                                    <p className="text-sm font-black text-onyx">{user.phone || 'Not provided'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-onyx-light mb-1">
                                        <MapPin size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Default Location</span>
                                    </div>
                                    <p className="text-sm font-black text-onyx">Lagos, Nigeria</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-onyx-light uppercase tracking-[0.2em] mb-8 flex items-center">
                                <span className="w-8 h-px bg-burgundy/30 mr-4" />
                                <span>Verification Status</span>
                            </h3>

                            {user.kyc_status !== 'verified' ? (
                                <div className="p-6 bg-canvas rounded-3xl border border-gray-100 flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center shrink-0">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-onyx mb-1">Complete Identity Verification</h4>
                                        <p className="text-xs text-onyx-light font-medium leading-relaxed mb-4">
                                            To bid on high-value auctions and withdraw funds, you must verify your identity. This process takes less than 2 minutes.
                                        </p>
                                        <Link href="/onboarding" className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-burgundy hover:text-burgundy-dark transition-colors">
                                            <span>Start KYC Now</span>
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-emerald/5 rounded-3xl border border-emerald/10 flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-emerald text-white rounded-2xl flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-onyx mb-1">Your Identity is Verified</h4>
                                        <p className="text-xs text-onyx-light font-medium">Full access to bidding and withdrawals enabled.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
