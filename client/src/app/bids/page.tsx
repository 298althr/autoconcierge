'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    Gavel,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    ShoppingBag,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function BidsPage() {
    const { token } = useAuth();
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBids = async () => {
            if (!token) return;
            try {
                const res = await apiFetch('/me/bids', { token });
                setBids(res.data);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, [token]);

    return (
        <main className="min-h-screen bg-canvas pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px] mb-2">
                            <History size={14} />
                            <span>Activity Tracker</span>
                        </div>
                        <h1 className="text-5xl font-black text-onyx">My Bids</h1>
                        <p className="text-onyx-light font-medium mt-1">Track your active bids and participation history.</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                        <Link href="/garage" className="px-6 py-2 text-onyx-light hover:text-onyx rounded-xl text-xs font-black uppercase tracking-widest">Won</Link>
                        <button className="px-6 py-2 bg-onyx text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Active Bids</button>
                    </div>
                </header>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-600 font-bold">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="py-20 flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mb-4" />
                        <p className="text-onyx-light font-bold uppercase tracking-widest text-xs">Fetching Records...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-canvas/50">
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Vehicle Detail</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Status</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Bidding State</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <AnimatePresence mode="popLayout">
                                        {bids.map((bid) => (
                                            <motion.tr
                                                key={bid.auction_id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-canvas/30 transition-colors group"
                                            >
                                                <td className="p-8">
                                                    <div className="flex items-center space-x-6">
                                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                                                            <img src={bid.images[0]} className="w-full h-full object-cover" alt={bid.model} />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-onyx text-lg">{bid.year} {bid.make} {bid.model}</div>
                                                            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-onyx-light mt-1">
                                                                <Clock size={12} className="text-burgundy" />
                                                                <span>Participated {new Date(bid.bid_time).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${bid.auction_status === 'live' ? 'bg-burgundy/10 text-burgundy animate-pulse' : 'bg-onyx/5 text-onyx-light'
                                                        }`}>
                                                        <span>{bid.auction_status}</span>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="space-y-1">
                                                        <div className="text-lg font-black text-onyx flex items-center">
                                                            <span className="text-xs text-onyx-light mr-1">₦</span>
                                                            {bid.current_price.toLocaleString()}
                                                        </div>
                                                        <div className={`flex items-center space-x-1 text-[8px] font-black uppercase tracking-[0.2em] ${bid.is_winning ? 'text-emerald' : 'text-red-500'
                                                            }`}>
                                                            {bid.is_winning ? (
                                                                <>
                                                                    <CheckCircle2 size={10} />
                                                                    <span>Currently Highest</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertCircle size={10} />
                                                                    <span>Outbid</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <Link
                                                        href={bid.auction_status === 'live' ? `/auctions/${bid.auction_id}` : `/vehicles/${bid.auction_id}`}
                                                        className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-onyx group-hover:text-burgundy transition-colors"
                                                    >
                                                        <span>{bid.auction_status === 'live' ? 'Go to Room' : 'View Result'}</span>
                                                        <ArrowUpRight size={14} />
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>

                                    {bids.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-20 text-center">
                                                <Gavel size={48} className="mx-auto mb-4 text-onyx-light opacity-20" />
                                                <h3 className="text-xl font-black text-onyx">No Bidding History</h3>
                                                <p className="text-sm text-onyx-light font-medium">You haven't placed any bids yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
