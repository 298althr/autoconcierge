'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    Gavel,
    Plus,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Play,
    Timer,
    Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAuctionsPage() {
    const { token } = useAuth();
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const res = await apiFetch('/auctions');
                setAuctions(res.data);
            } catch (err) {
                console.error('Failed to fetch auctions', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, [token]);

    return (
        <main className="p-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px] mb-2">
                        <Gavel size={14} />
                        <span>Marketplace Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-onyx">Auction Management</h1>
                    <p className="text-onyx-light font-medium">Create, schedule and monitor live bidding events.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-8 py-4 bg-burgundy text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-burgundy/20 hover:scale-105 transition-transform">
                        <Plus size={18} />
                        <span>New Auction</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    auctions.map((a) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-onyx/5 transition-all"
                        >
                            <div className="flex items-center space-x-8">
                                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-gray-100 shrink-0 relative">
                                    <img src={a.image_url || a.images?.[0]} className="w-full h-full object-cover" alt={a.model} />
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[8px] font-black uppercase tracking-widest text-onyx">
                                        ID: {a.id.slice(0, 5)}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-black text-onyx">{a.year} {a.make} {a.model}</h3>
                                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${a.status === 'live' ? 'bg-emerald/10 text-emerald animate-pulse' :
                                                a.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-onyx/5 text-onyx-light'
                                            }`}>
                                            {a.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6 text-[10px] font-bold text-onyx-light uppercase tracking-widest">
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={14} className="text-burgundy" />
                                            <span>Starts: {new Date(a.start_time).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Timer size={14} className="text-burgundy" />
                                            <span>Reserve: ₦{a.reserve_price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock size={14} className="text-burgundy" />
                                            <span>Bids: {a.bid_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6 pr-4">
                                <div className="text-right mr-8">
                                    <p className="text-[10px] font-black text-onyx-light uppercase tracking-widest mb-1">Current Price</p>
                                    <p className="text-2xl font-black text-onyx">₦{(a.current_price || a.start_price).toLocaleString()}</p>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    {a.status === 'scheduled' && (
                                        <button className="flex items-center justify-center space-x-2 px-6 py-2 bg-onyx text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald transition-colors">
                                            <Play size={12} />
                                            <span>Go Live</span>
                                        </button>
                                    )}
                                    <button className="flex items-center justify-center space-x-2 px-6 py-2 bg-canvas text-onyx rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors border border-gray-100">
                                        <Settings2 size={12} />
                                        <span>Edit</span>
                                    </button>
                                    {a.status === 'live' && (
                                        <button className="flex items-center justify-center space-x-2 px-6 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
                                            <XCircle size={12} />
                                            <span>End Early</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </main>
    );
}
