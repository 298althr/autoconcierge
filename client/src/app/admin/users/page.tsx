'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    Users,
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Wallet,
    Mail,
    Phone,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await apiFetch('/admin/users', { token });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleKYCUpdate = async (userId: string, status: 'verified' | 'rejected') => {
        setActionLoading(userId);
        try {
            await apiFetch('/admin/kyc/status', {
                method: 'POST',
                token,
                body: { userId, status }
            });
            await fetchUsers(); // Refresh list
        } catch (err: any) {
            alert(err.message || 'Failed to update KYC');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <main className="p-12">
            <header className="mb-12">
                <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px] mb-2">
                    <ShieldCheck size={14} />
                    <span>User Governance</span>
                </div>
                <h1 className="text-4xl font-black text-onyx">User Management</h1>
                <p className="text-onyx-light font-medium">Verify identities and moderate system participants.</p>
            </header>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-canvas/50">
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Identity</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Contact</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">KYC Status</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Wallet Balance</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <div className="w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {users.map((u) => (
                                    <motion.tr
                                        key={u.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-canvas/30 transition-colors group"
                                    >
                                        <td className="p-8">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-12 h-12 rounded-full bg-onyx text-white flex items-center justify-center font-black text-sm uppercase tracking-tighter">
                                                    {(u.display_name || u.email).charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-onyx text-base">{u.display_name || 'Guest'}</div>
                                                    <div className="text-[10px] font-bold text-onyx-light uppercase tracking-widest mt-1">{u.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 text-xs font-bold text-onyx">
                                                    <Mail size={12} className="text-burgundy" />
                                                    <span>{u.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-[10px] font-bold text-onyx-light uppercase tracking-widest">
                                                    <Phone size={12} className="text-burgundy" />
                                                    <span>{u.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${u.kyc_status === 'verified' ? 'bg-emerald/10 text-emerald' :
                                                    u.kyc_status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-red-50 text-red-500'
                                                }`}>
                                                {u.kyc_status === 'none' ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                                                <span>{u.kyc_status}</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center space-x-2">
                                                <Wallet size={14} className="text-onyx-light" />
                                                <span className="text-sm font-black text-onyx">₦{parseFloat(u.wallet_balance).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                {u.kyc_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleKYCUpdate(u.id, 'verified')}
                                                            disabled={!!actionLoading}
                                                            className="px-4 py-2 bg-emerald text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-dark transition-all disabled:opacity-50"
                                                        >
                                                            {actionLoading === u.id ? <Loader2 size={12} className="animate-spin" /> : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleKYCUpdate(u.id, 'rejected')}
                                                            disabled={!!actionLoading}
                                                            className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2.5 text-onyx-light hover:text-onyx hover:bg-canvas rounded-xl transition-all">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
