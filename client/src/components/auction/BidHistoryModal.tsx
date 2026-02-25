'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { apiFetch } from '@/lib/api';
import { Gavel, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Bid {
    id: string;
    amount: number;
    is_winning: boolean;
    created_at: string;
}

interface BidHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    auctionId: string;
    token: string | null;
}

export const BidHistoryModal = ({ isOpen, onClose, auctionId, token }: BidHistoryModalProps) => {
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && token) {
            fetchBids();
        }
    }, [isOpen, token, auctionId]);

    const fetchBids = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`/auctions/${auctionId}/my-bids`, { token });
            setBids(res.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bid history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Bid Portfolio" maxWidth="lg">
            <div className="space-y-6">
                <p className="text-sm font-subheading text-slate-500 mb-8">
                    Detailed audit trail of your positions for this asset. Statuses reflect real-time market hierarchy.
                </p>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Ledger...</span>
                    </div>
                ) : error ? (
                    <div className="p-8 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle className="text-red-500 mb-4" size={32} />
                        <p className="text-red-900 font-bold text-sm mb-2">Protocol Error</p>
                        <p className="text-red-600/70 text-xs">{error}</p>
                    </div>
                ) : bids.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <Gavel className="text-slate-200" size={48} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No market positions detected</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bids.map((bid, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={bid.id}
                                className="group p-5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 rounded-2xl border border-slate-100 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bid.is_winning ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                                        {bid.is_winning ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-lg font-heading font-black text-slate-900">
                                            ₦{bid.amount.toLocaleString()}
                                        </div>
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Clock size={12} />
                                            <span>{new Date(bid.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${bid.is_winning ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {bid.is_winning ? 'Winning' : 'Outbid'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};
