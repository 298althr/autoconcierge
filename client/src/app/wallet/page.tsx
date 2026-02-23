'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    ShieldCheck,
    Clock,
    XCircle,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FundWalletModal from '@/components/wallet/FundWalletModal';
import TransactionRow from '@/components/wallet/TransactionRow';

export default function WalletPage() {
    const { user, token } = useAuth();
    const [balanceData, setBalanceData] = useState<any>(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFundModal, setShowFundModal] = useState(false);

    const fetchData = React.useCallback(async () => {
        if (!token) return;
        try {
            const [balRes, txRes] = await Promise.all([
                apiFetch('/wallet/balance', { token }),
                apiFetch('/wallet/transactions', { token })
            ]);
            setBalanceData(balRes.data);
            setTransactions(txRes.data);
        } catch (err) {
            console.error('Failed to fetch wallet data:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const verifyPayment = async (ref: string, amt: string) => {
            try {
                await apiFetch('/wallet/fund/verify', {
                    method: 'POST',
                    token,
                    body: { reference: ref, amount: amt }
                });
                window.history.replaceState({}, document.title, window.location.pathname);
                fetchData();
            } catch (err) {
                console.error('Verification failed', err);
                fetchData();
            }
        };

        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        const amount = urlParams.get('amount');

        if (ref && amount && token) {
            verifyPayment(ref, amount);
        } else {
            fetchData();
        }
    }, [token, fetchData]);

    useEffect(() => {
        if (!token) return;

        const hasProcessing = transactions.some((tx: any) => tx.status === 'processing');
        if (!hasProcessing) return;

        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, [token, transactions, fetchData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-canvas pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-canvas pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-4">
                <header className="mb-10">
                    <h1 className="text-4xl font-black mb-2">My Wallet</h1>
                    <p className="text-onyx-light font-medium">Manage your funds and track your bidding power.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Balance Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-onyx text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-onyx/20"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Wallet size={120} />
                            </div>

                            <div className="relative z-10">
                                <span className="text-white/60 font-medium uppercase tracking-widest text-xs">Total Balance</span>
                                <h2 className="text-5xl font-black mt-2 mb-8">
                                    ₦ {balanceData?.balance?.toLocaleString() || '0.00'}
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                                        <div className="flex items-center text-white/60 text-xs font-bold uppercase mb-1">
                                            <Lock size={12} className="mr-1" /> Held for Bids
                                        </div>
                                        <div className="text-xl font-bold">₦ {balanceData?.held?.toLocaleString() || '0.00'}</div>
                                    </div>
                                    <div className="bg-burgundy/20 backdrop-blur-md p-4 rounded-2xl border border-burgundy/30">
                                        <div className="flex items-center text-burgundy-light text-xs font-bold uppercase mb-1">
                                            Available to Bid
                                        </div>
                                        <div className="text-xl font-bold">₦ {balanceData?.balance?.toLocaleString() || '0.00'}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-onyx/5 rounded-xl flex items-center justify-center text-onyx">
                                        <History size={20} />
                                    </div>
                                    <h3 className="text-xl font-black">Recent Transactions</h3>
                                </div>
                            </div>

                            <div className="space-y-1">
                                {transactions.length > 0 ? (
                                    transactions.map((tx: any) => (
                                        <TransactionRow key={tx.id} transaction={tx} />
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <p className="text-onyx-light font-medium italic">No transactions found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <button
                            onClick={() => setShowFundModal(true)}
                            className="w-full bg-burgundy hover:bg-burgundy-light text-white p-6 rounded-3xl flex items-center justify-center space-x-3 transition-all shadow-xl shadow-burgundy/20 group"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus size={24} />
                            </div>
                            <span className="text-xl font-bold">Fund Wallet</span>
                        </button>

                        <div className="bg-emerald/5 border border-emerald/10 p-6 rounded-3xl">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald shadow-sm">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h4 className="font-black text-onyx uppercase text-sm tracking-tight mb-1">Secured by Paystack</h4>
                                    <p className="text-xs text-onyx-light leading-relaxed">
                                        All transactions are encrypted and processed through Nigeria&apos;s leading payment gateway.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
                            <h4 className="font-black mb-4 uppercase text-xs tracking-widest text-onyx-light">Wallet Security</h4>
                            <ul className="space-y-4">
                                <li className="flex items-center space-x-3 text-sm font-medium">
                                    <CheckCircle2 size={16} className="text-emerald" />
                                    <span>2FA Protection Enabled</span>
                                </li>
                                <li className="flex items-center space-x-3 text-sm font-medium">
                                    <CheckCircle2 size={16} className="text-emerald" />
                                    <span>Instant Transaction Alerts</span>
                                </li>
                                <li className="flex items-center space-x-3 text-sm font-medium opacity-50">
                                    <Clock size={16} className="text-onyx" />
                                    <span>Multi-sig Settlement (Soon)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showFundModal && (
                    <FundWalletModal
                        onClose={() => setShowFundModal(false)}
                        onSuccess={() => {
                            setShowFundModal(false);
                            fetchData();
                        }}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
