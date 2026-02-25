'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Warehouse, Plus, ArrowRight, Car, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function GaragePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'vehicles' | 'valuations'>('vehicles');

    // In the future, these will come from an API endpoint like /me/garage and /me/valuations
    const vehicles: any[] = [];
    const valuations: any[] = [];

    if (!user) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 px-2">
                <div>
                    <div className="flex items-center space-x-2 text-burgundy font-bold uppercase tracking-widest text-[10px] mb-2">
                        <Warehouse size={16} />
                        <span>Asset Portfolio</span>
                    </div>
                    <h1 className="text-3xl font-black text-onyx tracking-tight">Your Garage</h1>
                    <p className="text-sm font-medium text-onyx-light mt-1">Manage vehicles you own or track market valuations.</p>
                </div>
                <div>
                    <Link href="/valuation/wizard" className="flex items-center space-x-2 bg-burgundy hover:bg-burgundy/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-burgundy/20">
                        <Plus size={18} />
                        <span>New Valuation</span>
                    </Link>
                </div>
            </div>

            {/* Segmented Tabs */}
            <div className="bg-white p-1.5 rounded-2xl flex space-x-1 border border-gray-100 shadow-sm max-w-sm">
                <button
                    onClick={() => setActiveTab('vehicles')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'vehicles' ? 'bg-burgundy text-white shadow-md' : 'text-onyx-light hover:bg-gray-50'
                        }`}
                >
                    My Vehicles ({vehicles.length})
                </button>
                <button
                    onClick={() => setActiveTab('valuations')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'valuations' ? 'bg-burgundy text-white shadow-md' : 'text-onyx-light hover:bg-gray-50'
                        }`}
                >
                    Saved Valuations ({valuations.length})
                </button>
            </div>

            {/* Asset Grid area */}
            <div className="min-h-[40vh] pt-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'vehicles' && (
                        <motion.div
                            key="vehicles"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white border text-center border-gray-100 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center min-h-[40vh]"
                        >
                            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                                <Car size={40} />
                            </div>
                            <h3 className="text-xl font-black text-onyx mb-2">No Vehicles Yet</h3>
                            <p className="text-sm font-medium text-onyx-light max-w-md mx-auto mb-6">
                                You don't have any completed vehicle purchases in your garage. Win an auction to add a vehicle here.
                            </p>
                            <Link href="/dashboard/market" className="text-burgundy font-bold text-sm flex items-center hover:underline">
                                Browse Live Auctions <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </motion.div>
                    )}

                    {activeTab === 'valuations' && (
                        <motion.div
                            key="valuations"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white border text-center border-gray-100 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center min-h-[40vh]"
                        >
                            <div className="w-20 h-20 bg-burgundy/5 text-burgundy/40 rounded-full flex items-center justify-center mb-4">
                                <Activity size={40} />
                            </div>
                            <h3 className="text-xl font-black text-onyx mb-2">No Saved Valuations</h3>
                            <p className="text-sm font-medium text-onyx-light max-w-md mx-auto mb-6">
                                Keep track of the market value of your current vehicle or a vehicle you intend to buy.
                            </p>
                            <Link href="/valuation/wizard" className="bg-burgundy text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-burgundy/90 transition-colors shadow-lg shadow-burgundy/20">
                                Value a Vehicle Now
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
