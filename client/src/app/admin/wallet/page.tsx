'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    ShieldCheck,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    User,
    Building2,
    Clock,
    ArrowUpRight,
    Loader2,
    AlertCircle,
    RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Base';

export default function AdminWalletPage() {
    const { user, token } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('processing');

    const fetchTransactions = async (status = filterStatus) => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/wallet/admin/transactions?status=${status}`, { token });
            setTransactions(res.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchTransactions();
        }
    }, [token, user]);

    const handleAction = async (id: string, action: 'approve' | 'decline') => {
        setActionLoading(id);
        try {
            await apiFetch(`/wallet/admin/${action}/${id}`, {
                method: 'POST',
                token
            });
            // Update local state instead of full refetch for better UX
            setTransactions(transactions.filter(tx => tx.id !== id));
            setError(null);
        } catch (err: any) {
            setError(`Failed to ${action} transaction: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center p-4">
                <div className="text-center bg-white p-12 rounded-[3rem] border border-red-100 shadow-2xl">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        < ShieldCheck size={40} />
                    </div>
                    <h1 className="text-3xl font-black mb-4">Access Restricted</h1>
                    <p className="text-onyx-light max-w-md mx-auto font-medium">
                        You do not have the necessary permissions to access the Admin Control Center.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="p-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px] mb-2">
                        <ShieldCheck size={14} />
                        <span>System Administration</span>
                    </div>
                    <h1 className="text-4xl font-black">Manual Funding Approval</h1>
                    <p className="text-onyx-light font-medium mt-1">Verify and reconcile bank transfers from customers.</p>
                </div>

                <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    {['processing', 'completed', 'failed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setFilterStatus(s); fetchTransactions(s); }}
                            className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filterStatus === s
                                ? 'bg-onyx text-white shadow-lg'
                                : 'text-onyx-light hover:text-onyx hover:bg-onyx/5'}`}
                        >
                            {s}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-100 mx-2" />
                    <button
                        onClick={() => fetchTransactions()}
                        className="p-2 text-onyx-light hover:text-burgundy transition-colors"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {error && (
                <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-600 font-bold">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-canvas/50">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-onyx-light">User Information</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-onyx-light">Transaction Details</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-onyx-light">Amount</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-onyx-light text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <motion.tr
                                            key={tx.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="hover:bg-canvas/30 transition-colors group"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-onyx/5 rounded-full flex items-center justify-center text-onyx group-hover:bg-burgundy group-hover:text-white transition-colors">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-onyx">{tx.display_name || 'Dealer User'}</div>
                                                        <div className="text-xs text-onyx-light font-bold">{tx.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-onyx font-bold">
                                                        <Building2 size={14} className="text-onyx-light" />
                                                        <span>{tx.description.replace('Manual Bank Transfer', '') || 'Wire Transfer'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-onyx-light font-medium">
                                                        <Clock size={12} />
                                                        <span>{new Date(tx.created_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-lg font-black text-onyx flex items-center">
                                                    <span className="text-xs text-onyx-light mr-1">₦</span>
                                                    {tx.amount.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {filterStatus === 'processing' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleAction(tx.id, 'decline')}
                                                                disabled={!!actionLoading}
                                                                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-onyx-light hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 disabled:opacity-50"
                                                            >
                                                                Decline
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(tx.id, 'approve')}
                                                                disabled={!!actionLoading}
                                                                className="px-6 py-2 bg-emerald text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald/20 flex items-center disabled:opacity-50"
                                                            >
                                                                {actionLoading === tx.id ? <Loader2 size={14} className="animate-spin" /> : 'Approve'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 ${tx.status === 'completed' ? 'bg-emerald/10 text-emerald' : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            {tx.status === 'completed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                            <span>{tx.status}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            {loading ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mb-4" />
                                                    <p className="text-onyx-light font-bold">Scanning Ledger...</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center opacity-40">
                                                    <CheckCircle2 size={48} className="mb-4 text-onyx-light" />
                                                    <p className="text-xl font-black text-onyx">All Clear</p>
                                                    <p className="text-sm text-onyx-light font-medium">No {filterStatus} transactions found.</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
