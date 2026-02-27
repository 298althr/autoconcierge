import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin, Gauge } from 'lucide-react';
import { getAssetUrl, getVehicleImages } from '@/lib/api';

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    condition: string;
    mileage_km: number;
    price: number;
    images: string[];
    location: string;
    trust_score: number;
    status: string;
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
    const isAuction = vehicle.status === 'in_auction';

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden border border-surface-200 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500 group relative">
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-100">
                <Image
                    src={getAssetUrl(getVehicleImages(vehicle.images)[0])}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Status Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <span className="bg-white/95 backdrop-blur-md text-content-primary text-[10px] font-subheading font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-surface-100">
                        {vehicle.condition?.replace('_', ' ') || 'Condition'}
                    </span>
                    {isAuction && (
                        <span className="bg-burgundy text-white text-[10px] font-subheading font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse shadow-md shadow-burgundy/20">
                            Live Auction
                        </span>
                    )}
                </div>

                {/* Trust Score Overlay */}
                <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-surface-100 shadow-sm">
                        <ShieldCheck size={12} className="text-emerald" />
                        <span className="text-[10px] font-subheading font-black text-content-primary">{vehicle.trust_score}%</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-6 relative">
                <div className="mb-4">
                    <h3 className="text-xl font-heading font-extrabold text-content-primary truncate leading-tight group-hover:text-burgundy transition-colors tracking-tight">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex items-center space-x-3 mt-3">
                        <div className="flex items-center space-x-1.5 text-content-muted text-[11px] font-bold uppercase tracking-widest bg-surface-50 px-2.5 py-1 rounded-md">
                            <Gauge size={12} className="text-content-secondary" />
                            <span>{vehicle.mileage_km?.toLocaleString()} km</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-content-muted text-[11px] font-bold uppercase tracking-widest bg-surface-50 px-2.5 py-1 rounded-md">
                            <MapPin size={12} className="text-content-secondary" />
                            <span>{vehicle.location}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between pt-5 border-t border-surface-100 mt-2">
                    <div className="space-y-1">
                        <p className="text-[10px] text-content-muted uppercase font-black tracking-[0.2em]">
                            {isAuction ? 'Current Bid' : 'Ownership Price'}
                        </p>
                        <p className="text-2xl font-heading font-black text-content-primary">
                            <span className="text-sm font-medium text-content-muted mr-1">₦</span>
                            {vehicle.price?.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Hover Action Blur Reveal */}
                <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6 border-t border-surface-100 translate-y-2 group-hover:translate-y-0">
                    <Link
                        href={isAuction ? `/auctions/${(vehicle as any).auction_id}` : `/vehicles/${vehicle.id}`}
                        className="w-full bg-surface-50 border border-surface-200 text-content-primary py-4 rounded-xl text-xs font-heading font-black uppercase tracking-widest text-center shadow-lg hover:shadow-xl hover:border-burgundy hover:text-burgundy transition-all"
                    >
                        {isAuction ? 'Submit Bid' : 'View Spec Sheet'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
