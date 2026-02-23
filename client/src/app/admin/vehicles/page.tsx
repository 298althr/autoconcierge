'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    Car,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    ExternalLink,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminVehiclesPage() {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                // We'll use the public endpoint but maybe we need an admin one for full data
                const res = await apiFetch('/vehicles');
                setVehicles(res.data);
            } catch (err) {
                console.error('Failed to fetch vehicles', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, [token]);

    const filteredVehicles = vehicles.filter(v =>
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="p-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px] mb-2">
                        <Car size={14} />
                        <span>Inventory Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-onyx">Vehicle Fleet</h1>
                    <p className="text-onyx-light font-medium">Control and monitor all listed vehicles.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-onyx-light" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Make, Model, VIN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-burgundy transition-all w-80 font-medium text-sm"
                        />
                    </div>
                    <button className="bg-burgundy text-white p-4 rounded-2xl shadow-xl shadow-burgundy/20 hover:scale-105 transition-transform">
                        <Plus size={24} />
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-canvas/50">
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Vehicle</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">VIN / Plate</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Status</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-onyx-light">Owner</th>
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
                                {filteredVehicles.map((v) => (
                                    <motion.tr
                                        key={v.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-canvas/30 transition-colors group"
                                    >
                                        <td className="p-8">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                    <img src={v.images[0]} className="w-full h-full object-cover" alt={v.model} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-onyx text-base">{v.year} {v.make} {v.model}</div>
                                                    <div className="text-[10px] font-bold text-onyx-light uppercase tracking-widest mt-1">{v.condition} • {v.mileage.toLocaleString()} km</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="font-mono text-xs font-bold text-onyx bg-canvas px-3 py-1.5 rounded-lg border border-gray-100 inline-block uppercase tracking-wider">
                                                {v.vin}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${v.status === 'available' ? 'bg-emerald/10 text-emerald' :
                                                    v.status === 'in_auction' ? 'bg-burgundy/10 text-burgundy' :
                                                        'bg-onyx/5 text-onyx-light'
                                                }`}>
                                                {v.status.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="text-xs font-bold text-onyx">System Admin</div>
                                            <div className="text-[10px] text-onyx-light uppercase tracking-widest">ID: {v.owner_id.slice(0, 8)}</div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="p-2.5 text-onyx-light hover:text-onyx hover:bg-canvas rounded-xl transition-all">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-2.5 text-onyx-light hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                                <Link href={`/vehicles/${v.id}`} className="p-2.5 text-onyx-light hover:text-burgundy hover:bg-burgundy/5 rounded-xl transition-all">
                                                    <ExternalLink size={16} />
                                                </Link>
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
