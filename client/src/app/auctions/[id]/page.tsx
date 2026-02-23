'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuction } from '@/hooks/useAuction';
import { useWallet } from '@/hooks/useWallet';
import { AuctionTimer } from '@/components/auction/AuctionTimer';
import { BidFeed } from '@/components/auction/BidFeed';
import { BidPanel } from '@/components/auction/BidPanel';
import {
    AlertCircle,
    ChevronLeft,
    Share2,
    Heart,
    Info,
    MapPin,
    Calendar,
    Activity,
    ShieldCheck,
    CarFront
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuctionRoomPage() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const { auction, loading, error, placeBid } = useAuction(id as string, token);
    const { wallet } = useWallet();

    if (loading) return (
        <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mb-6" />
            <p className="text-onyx-light font-black uppercase tracking-widest text-xs">Entering Auction Room...</p>
        </div>
    );

    if (error || !auction) return (
        <div className="min-h-screen pt-32 flex flex-col items-center justify-center p-4">
            <div className="bg-red-50 text-red-500 p-8 rounded-[3rem] text-center max-w-md border border-red-100">
                <AlertCircle className="mx-auto mb-4" size={48} />
                <h1 className="text-2xl font-black mb-2">Auction Unavailable</h1>
                <p className="font-medium text-red-400 mb-6">{error || 'This auction might have ended or does not exist.'}</p>
                <Link href="/vehicles" className="inline-block px-8 py-3 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Return home</Link>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-canvas pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <Link href="/vehicles" className="inline-flex items-center space-x-2 text-onyx-light hover:text-burgundy transition-colors mb-8 group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to catalog</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Vehicle Details (7 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-white rounded-[3.5rem] p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="aspect-[16/9] w-full rounded-[2.5rem] bg-gray-100 overflow-hidden relative group">
                                <img
                                    src={auction.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2000'}
                                    alt={auction.model}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6 flex space-x-2">
                                    <div className="px-5 py-2 bg-burgundy text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        Live Auction
                                    </div>
                                    <div className="px-5 py-2 bg-white/90 backdrop-blur-md text-onyx rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                                        {auction.bid_count} Bids
                                    </div>
                                </div>
                                <div className="absolute bottom-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-3 bg-white text-onyx rounded-full shadow-xl hover:bg-burgundy hover:text-white transition-all"><Heart size={18} /></button>
                                    <button className="p-3 bg-white text-onyx rounded-full shadow-xl hover:bg-burgundy hover:text-white transition-all"><Share2 size={18} /></button>
                                </div>
                            </div>
                        </section>

                        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                                <div>
                                    <h1 className="text-5xl font-black text-onyx mb-3">{auction.year} {auction.make} {auction.model}</h1>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center space-x-2 px-4 py-2 bg-canvas rounded-xl text-onyx-light font-bold text-xs border border-gray-50">
                                            <MapPin size={14} className="text-burgundy" />
                                            <span>{auction.location || 'Lagos, Nigeria'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-4 py-2 bg-canvas rounded-xl text-onyx-light font-bold text-xs border border-gray-50">
                                            <Calendar size={14} className="text-burgundy" />
                                            <span>Listed {new Date(auction.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-4 py-2 bg-canvas rounded-xl text-onyx-light font-bold text-xs border border-gray-50">
                                            <Activity size={14} className="text-burgundy" />
                                            <span>{auction.mileage_km?.toLocaleString()} km</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-[10px] font-black text-onyx-light uppercase tracking-widest mb-1">Time Remaining</div>
                                    <AuctionTimer endTime={auction.end_time} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="font-black text-onyx uppercase tracking-widest text-xs flex items-center space-x-2">
                                        <ShieldCheck size={16} className="text-burgundy" />
                                        <span>Vehicle Overview</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {Object.entries(auction.specs || {}).map(([key, val]: any) => (
                                            <div key={key} className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-[11px] font-bold text-onyx-light uppercase tracking-widest">{key}</span>
                                                <span className="text-sm font-black text-onyx">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="font-black text-onyx uppercase tracking-widest text-xs flex items-center space-x-2">
                                        <Info size={16} className="text-burgundy" />
                                        <span>Auction terms</span>
                                    </h3>
                                    <div className="p-6 bg-canvas rounded-3xl border border-gray-100 text-xs font-medium text-onyx-light leading-relaxed space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-burgundy mt-1.5 shrink-0" />
                                            <p>20% refundable deposit required to place any bid.</p>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-burgundy mt-1.5 shrink-0" />
                                            <p>Anti-snipe: Any bid in last 2 mins extends deadline by 2 mins.</p>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-burgundy mt-1.5 shrink-0" />
                                            <p>Winning bidder must settle full payment within 48 hours.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bidding (5 cols) */}
                    <div className="lg:col-span-4 space-y-8 sticky top-24">
                        <BidPanel
                            currentPrice={auction.current_price}
                            bidIncrement={auction.bid_increment}
                            depositPct={auction.deposit_pct}
                            walletBalance={wallet?.available || 0}
                            onBid={placeBid}
                            disabled={auction.status !== 'live'}
                        />

                        <BidFeed bids={auction.bids || []} />
                    </div>
                </div>
            </div>
        </main>
    );
}
