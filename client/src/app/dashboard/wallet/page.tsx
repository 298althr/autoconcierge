'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import {
    Wallet,
    Plus,
    History,
    ShieldCheck,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FundWalletModal from '@/components/wallet/FundWalletModal';
import { format } from 'date-fns';

export default function WalletPage() {
    const { token } = useAuth();
    const [balanceData, setBalanceData] = useState<any>(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFundModal, setShowFundModal] = useState(false);

    const fetchData = useCallback(async () => {
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
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
            </div>
        );
    }

    const availableBalance = balanceData?.balance || 0;
    const heldBalance = balanceData?.held || 0;
    const totalBalance = availableBalance + heldBalance;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <header className="px-1">
                <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                    <Wallet size={12} />
                    <span>Financial Hub</span>
                </div>
                <h1 className="text-3xl font-black text-onyx tracking-tight">Wallet</h1>
            </header>

            {/* Mobile-First Balance Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-onyx text-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl shadow-onyx/20"
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-2">Total Balance</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">
                        ₦{totalBalance.toLocaleString()}
                    </h2>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-left">
                            <div className="text-[9px] uppercase font-black text-white/30 mb-1 flex items-center gap-1">
                                <Plus size={10} className="text-emerald-400" /> Available
                            </div>
                            <div className="text-lg font-black tracking-tight">₦{availableBalance.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-left">
                            <div className="text-[9px] uppercase font-black text-white/30 mb-1 flex items-center gap-1">
                                <Lock size={10} className="text-amber-400" /> Held
                            </div>
                            <div className="text-lg font-black tracking-tight">₦{heldBalance.toLocaleString()}</div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFundModal(true)}
                        className="mt-8 px-8 py-4 bg-burgundy hover:bg-burgundy-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-burgundy/40 flex items-center gap-2 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Add Capital
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Transactions Ledger */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-onyx font-black text-xs uppercase tracking-widest">
                            <History size={16} className="text-burgundy" />
                            <span>Recent Activity</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {transactions.length > 0 ? (
                            transactions.map((tx: any) => (
                                <TransactionItem key={tx.id} tx={tx} />
                            ))
                        ) : (
                            <div className="bg-white/50 border border-dashed border-gray-200 rounded-3xl py-12 text-center">
                                <p className="text-sm text-gray-400">No transactions recorded.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Security Tips */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
                            <ShieldCheck size={20} />
                        </div>
                        <h4 className="text-sm font-black text-onyx uppercase tracking-tight mb-2">Secured Assets</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Your funds are protected by multi-signature escrow protocols. Deploy capital with absolute confidence.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-onyx text-white rounded-xl flex items-center justify-center mb-4">
                            <CreditCard size={20} />
                        </div>
                        <h4 className="text-sm font-black text-onyx uppercase tracking-tight mb-2">Withdrawal</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            Need to move capital out? Instant withdrawals available to verified accounts.
                        </p>
                        <button className="text-[10px] font-black text-burgundy uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                            Initiate Withdrawal <ChevronRight size={12} />
                        </button>
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
        </div>
    );
}

function TransactionItem({ tx }: { tx: any }) {
    const isIncome = ['funding', 'bid_release', 'escrow_release', 'escrow_refund', 'refund'].includes(tx.type);
    const isOutgoing = ['bid_hold', 'escrow_hold', 'auction_payment', 'commission'].includes(tx.type);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50/50 rounded-3xl border border-gray-100 transition-colors group cursor-default"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-500' :
                    isOutgoing ? 'bg-burgundy/5 text-burgundy' :
                        'bg-gray-50 text-gray-400'
                }`}>
                {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-onyx truncate group-hover:text-burgundy transition-colors">
                    {tx.description || tx.type.replace('_', ' ')}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {format(new Date(tx.created_at), 'MMM dd, HH:mm')} • {tx.status}
                </p>
            </div>

            <div className="text-right">
                <p className={`text-sm font-black tracking-tight ${isIncome ? 'text-emerald-500' : 'text-onyx'}`}>
                    {isIncome ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()}
                </p>
                {tx.balance_after && (
                    <p className="text-[9px] font-bold text-gray-300">
                        Balance: ₦{parseFloat(tx.balance_after).toLocaleString()}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
