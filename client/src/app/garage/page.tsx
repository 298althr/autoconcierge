'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    Car,
    Gavel,
    ChevronRight,
    ArrowUpRight,
    Clock,
    ShieldCheck,
    MapPin,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function GaragePage() {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchGarage = async () => {
        if (!token) return;
        try {
            const res = await apiFetch('/me/garage', { token });
            setVehicles(res.data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGarage();
    }, [token]);

    const handleSettle = async (auctionId: string) => {
        setActionLoading(auctionId);
        try {
            await apiFetch(`/me/settle/${auctionId}`, {
                method: 'POST',
                token
            });
            await fetchGarage(); // Refresh to show 'sold' status
        } catch (err: any) {
            alert(err.message || 'Failed to settle. Ensure you have enough wallet balance.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <main className="min-h-screen bg-canvas pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px] mb-2">
                            <Car size={14} />
                            <span>My Collection</span>
                        </div>
                        <h1 className="text-5xl font-black text-onyx">The Garage</h1>
                        <p className="text-onyx-light font-medium mt-1">Manage your won vehicles and pending settlements.</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                        <button className="px-6 py-2 bg-onyx text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Won</button>
                        <Link href="/bids" className="px-6 py-2 text-onyx-light hover:text-onyx rounded-xl text-xs font-black uppercase tracking-widest">Active Bids</Link>
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
                        <p className="text-onyx-light font-bold uppercase tracking-widest text-xs">Opening Gates...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AnimatePresence mode="popLayout">
                            {vehicles.map((v) => (
                                <motion.div
                                    key={v.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[3.5rem] p-6 shadow-sm border border-gray-100 group"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="w-full sm:w-48 h-48 bg-gray-100 rounded-[2.5rem] overflow-hidden relative shrink-0">
                                            <img
                                                src={v.images[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000'}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={v.model}
                                            />
                                            {v.status === 'settled' && (
                                                <div className="absolute inset-0 bg-emerald/60 backdrop-blur-sm flex items-center justify-center">
                                                    <div className="bg-white/90 p-2 rounded-full shadow-xl">
                                                        <ShieldCheck className="text-emerald" size={24} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col py-2">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-2xl font-black text-onyx leading-tight">{v.year} {v.make} {v.model}</h3>
                                                    <div className="flex items-center space-x-3 text-onyx-light text-[10px] font-bold uppercase tracking-widest mt-1">
                                                        <MapPin size={12} className="text-burgundy" />
                                                        <span>{v.location || 'Pending Pickup'}</span>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${v.status === 'settled' ? 'bg-emerald/10 text-emerald' : 'bg-orange-100 text-orange-600'}`}>
                                                    {v.status === 'settled' ? 'Sold' : 'Won'}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-50">
                                                <div>
                                                    <p className="text-[10px] font-black text-onyx-light uppercase tracking-widest mb-1">Final Price</p>
                                                    <p className="text-xl font-black text-onyx">₦{v.current_price.toLocaleString()}</p>
                                                </div>

                                                {v.status === 'ended' ? (
                                                    <button
                                                        onClick={() => handleSettle(v.id)}
                                                        disabled={!!actionLoading}
                                                        className="px-8 py-3 bg-burgundy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-burgundy/20 hover:bg-burgundy-dark transition-all disabled:opacity-50 flex items-center"
                                                    >
                                                        {actionLoading === v.id ? <Loader2 size={14} className="animate-spin mr-2" /> : <ArrowUpRight size={14} className="mr-2" />}
                                                        Complete Purchase
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={`/vehicles/${v.vehicle_id}`}
                                                        className="px-8 py-3 bg-onyx text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {v.status === 'ended' && (
                                        <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center space-x-3 text-[10px] font-medium text-orange-700">
                                            <Clock size={16} />
                                            <span>Action Required: Please settle the remaining balance within 48 hours to secure ownership.</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {vehicles.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <Gavel size={48} className="mx-auto mb-4 text-onyx-light opacity-20" />
                                <h3 className="text-xl font-black text-onyx mb-1">Your Garage is Empty</h3>
                                <p className="text-onyx-light max-w-xs mx-auto text-sm font-medium">Win your first auction to see it here and start the ownership transition.</p>
                                <Link href="/vehicles" className="mt-6 inline-block px-10 py-4 bg-burgundy text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-burgundy/20">Explore Live Auctions</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
