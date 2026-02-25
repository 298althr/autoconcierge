'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Base';
import { User, ShieldAlert, LogOut, ChevronRight, Settings, Bell, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function ProfilePage() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const isVerified = user.kyc_status === 'verified';

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-2xl mx-auto"
        >

            {/* Header / Identity Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center shrink-0">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User className="text-burgundy" size={32} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black text-onyx truncate text-ellipsis">{user.display_name}</h1>
                    <p className="text-onyx-light text-sm truncate">{user.email}</p>
                    {user.phone && <p className="text-gray-400 text-xs mt-0.5">{user.phone}</p>}
                </div>
            </motion.div>

            {/* KYC & Limits Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-onyx mb-1">Account Limits</h2>
                        <div className="flex items-center space-x-2">
                            {isVerified ? (
                                <span className="inline-flex items-center px-2 py-1 bg-emerald/10 text-emerald text-xs font-bold rounded-md">
                                    <ShieldCheck size={14} className="mr-1" /> Tier 2 (Verified)
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 bg-amber-500/10 text-amber-600 text-xs font-bold rounded-md">
                                    <ShieldAlert size={14} className="mr-1" /> Tier 1 (Unverified)
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-burgundy">{isVerified ? 'Unlimited' : '₦500k'}</p>
                        <p className="text-xs text-onyx-light font-medium">Max Transaction</p>
                    </div>
                </div>

                {!isVerified && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gray-50 p-4 rounded-2xl"
                    >
                        <p className="text-xs text-onyx-light leading-relaxed mb-3">
                            You are restricted to a total combined volume of ₦500,000 for deposits and bidding. Verify your identity with a valid document to remove these limits.
                        </p>
                        <Button className="w-full text-sm font-bold shadow-sm" variant="outline">
                            Verify Identity Now
                        </Button>
                    </motion.div>
                )}
            </motion.div>

            {/* Settings Main Menu */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden divide-y divide-gray-50">
                <motion.button whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full flex items-center justify-between p-5 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-onyx-light">
                            <Settings size={20} />
                        </div>
                        <span className="font-bold text-sm text-onyx">Account Details</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                </motion.button>
                <motion.button whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full flex items-center justify-between p-5 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-onyx-light">
                            <Lock size={20} />
                        </div>
                        <span className="font-bold text-sm text-onyx">Security & Password</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                </motion.button>
                <motion.button whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full flex items-center justify-between p-5 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-onyx-light">
                            <Bell size={20} />
                        </div>
                        <span className="font-bold text-sm text-onyx">Notifications</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                </motion.button>
            </motion.div>

            {/* Danger Zone */}
            <motion.div variants={itemVariants} className="pt-4 pb-8">
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#fee2e2' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 p-4 rounded-2xl font-black text-red-500 bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
                >
                    <LogOut size={20} />
                    <span>Log Out</span>
                </motion.button>
            </motion.div>

        </motion.div>
    );
}
