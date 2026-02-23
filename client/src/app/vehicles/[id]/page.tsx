'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Image from 'next/image';
import { ShieldCheck, Gauge, MapPin, Calendar, Fuel, Zap, ArrowLeft, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function VehicleDetail() {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) fetchVehicle();
    }, [id]);

    async function fetchVehicle() {
        try {
            const response = await apiFetch(`/vehicles/${id}`);
            setVehicle(response.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-canvas"><div className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full animate-spin"></div></div>;
    if (error || !vehicle) return <div className="min-h-screen p-20 text-center"><p className="text-red-500 mb-4">{error || 'Vehicle not found'}</p><Link href="/vehicles" className="btn-primary">Back to Browse</Link></div>;

    const isAuction = vehicle.status === 'in_auction';

    return (
        <div className="min-h-screen bg-canvas pb-20">
            {/* Top Nav / Actions */}
            <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
                <Link href="/vehicles" className="flex items-center space-x-2 text-onyx-light hover:text-onyx transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Back to Inventory</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <button className="p-3 bg-white rounded-full shadow-sm hover:text-burgundy transition-colors"><Heart size={20} /></button>
                    <button className="p-3 bg-white rounded-full shadow-sm hover:text-burgundy transition-colors"><Share2 size={20} /></button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Media & Detail */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Gallery Placeholder */}
                    <div className="relative h-[500px] w-full bg-onyx rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src={vehicle.images[0] || '/logo/placeholder-car.jpg'}
                            alt={vehicle.model}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-4xl font-black">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
                            <div className="flex items-center space-x-2 bg-emerald/10 text-emerald px-4 py-2 rounded-full border border-emerald/20">
                                <ShieldCheck size={20} />
                                <span className="font-black text-sm">Trust Score: {vehicle.trust_score}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-xs text-onyx-light uppercase font-bold tracking-widest mb-1">Mileage</span>
                                <div className="flex items-center space-x-2 text-onyx font-bold">
                                    <Gauge size={18} />
                                    <span>{vehicle.mileage_km.toLocaleString()} km</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-onyx-light uppercase font-bold tracking-widest mb-1">Engine</span>
                                <div className="flex items-center space-x-2 text-onyx font-bold">
                                    <Zap size={18} />
                                    <span>{vehicle.engine_code || 'V6 3.5L'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-onyx-light uppercase font-bold tracking-widest mb-1">Location</span>
                                <div className="flex items-center space-x-2 text-onyx font-bold">
                                    <MapPin size={18} />
                                    <span>{vehicle.location}</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-onyx-light uppercase font-bold tracking-widest mb-1">Condition</span>
                                <div className="flex items-center space-x-2 text-onyx font-bold capitalize">
                                    <Calendar size={18} />
                                    <span>{vehicle.condition.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-black mb-4">Description</h2>
                            <p className="text-onyx-light leading-relaxed">
                                Beautifully maintained {vehicle.year} {vehicle.make} {vehicle.model} in {vehicle.condition.replace('_', ' ')} condition.
                                Full inspection reports are available for review. This vehicle has been verified by our agents
                                and is ready for the road.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Auction Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-burgundy/10 sticky top-24">
                        <div className="mb-6">
                            <p className="text-sm text-onyx-light uppercase font-black tracking-widest">
                                {isAuction ? 'Starting Bid' : 'Listed Price'}
                            </p>
                            <p className="text-5xl font-black text-onyx">
                                ₦{vehicle.price.toLocaleString()}
                            </p>
                        </div>

                        {isAuction ? (
                            <div className="space-y-4">
                                <div className="bg-burgundy/5 p-4 rounded-2xl border border-burgundy/10">
                                    <p className="text-xs font-bold text-burgundy uppercase mb-1">Auction Ends In</p>
                                    <p className="text-2xl font-black text-onyx">
                                        {vehicle.auction_end_time ? new Date(vehicle.auction_end_time).toLocaleTimeString() : 'Limited Time'}
                                    </p>
                                </div>
                                <Link href={`/auctions/${vehicle.auction_id}`} className="w-full btn-primary py-4 block text-center text-lg shadow-lg hover:shadow-burgundy/20">
                                    Enter Auction Room
                                </Link>
                                <p className="text-[10px] text-center text-onyx-light">
                                    * ₦{(vehicle.price * 0.2).toLocaleString()} deposit required to bid
                                </p>
                            </div>
                        ) : (
                            <button className="w-full btn-primary py-4 text-center text-lg">
                                Contact Agent
                            </button>
                        )}

                        <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                            <div className="flex items-center space-x-3">
                                <ShieldCheck className="text-emerald" size={24} />
                                <div>
                                    <p className="text-sm font-bold">Verified by AutoConcierge</p>
                                    <p className="text-xs text-onyx-light">Paperwork & physical check complete</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/valuation" className="block bg-onyx text-white p-8 rounded-3xl shadow-lg group">
                        <p className="text-xs text-white/60 font-bold uppercase tracking-widest mb-1">Not sure about the price?</p>
                        <h3 className="text-xl font-bold group-hover:text-burgundy-light transition-colors">Get an AI Valuation &rarr;</h3>
                    </Link>
                </div>

            </div>
        </div>
    );
}
