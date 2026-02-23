'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Base';
import {
    Car,
    CheckCircle2,
    ArrowRight,
    AlertCircle,
    Camera,
    MapPin,
    Tags,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SellPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: 2020,
        condition: 'good',
        mileage_km: 0,
        price: 0,
        location: 'Lagos',
        color: '',
        vin: ''
    });

    useEffect(() => {
        // Load data from valuation if available
        const saved = sessionStorage.getItem('pending_listing');
        if (saved) {
            const data = JSON.parse(saved);
            setFormData(prev => ({
                ...prev,
                make: data.make,
                model: data.model,
                year: data.year,
                condition: data.condition,
                mileage_km: data.mileage_km,
                price: data.estimated_value
            }));
            // Clear it so it doesn't persist forever
            sessionStorage.removeItem('pending_listing');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        setError('');

        try {
            await apiFetch('/vehicles', {
                method: 'POST',
                token,
                body: formData
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/vehicles');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to list vehicle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg"
                >
                    <div className="w-20 h-20 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-black mb-4 text-onyx">Listing Created!</h1>
                    <p className="text-onyx-light font-medium mb-8">
                        Your {formData.year} {formData.make} {formData.model} has been listed successfully.
                        Redirecting you to the inventory...
                    </p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3 }}
                            className="h-full bg-emerald"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-canvas pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-10">
                    <div className="flex items-center space-x-3 text-burgundy mb-2">
                        <Car size={24} />
                        <span className="font-bold uppercase tracking-widest text-xs">Vehicle Listing</span>
                    </div>
                    <h1 className="text-4xl font-black">List Your Vehicle</h1>
                    <p className="text-onyx-light font-medium mt-2">Complete the details below to list your car for sale.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Column */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-8">
                            {/* Basic Info */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-black flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-onyx text-white flex items-center justify-center text-sm mr-3">1</span>
                                    Vehicle Details
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Make</label>
                                        <input
                                            type="text"
                                            value={formData.make}
                                            onChange={e => setFormData({ ...formData, make: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Model</label>
                                        <input
                                            type="text"
                                            value={formData.model}
                                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Year</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Mileage (KM)</label>
                                        <input
                                            type="number"
                                            value={formData.mileage_km}
                                            onChange={e => setFormData({ ...formData, mileage_km: parseInt(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Specific Info */}
                            <section className="space-y-6 pt-4 border-t border-gray-50">
                                <h2 className="text-xl font-black flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-onyx text-white flex items-center justify-center text-sm mr-3">2</span>
                                    Specifications
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">VIN (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.vin}
                                            onChange={e => setFormData({ ...formData, vin: e.target.value })}
                                            placeholder="17-digit vehicle ID"
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium uppercase"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Color</label>
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                            placeholder="e.g. Metallic Black"
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Location</label>
                                        <select
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                        >
                                            <option value="Lagos">Lagos</option>
                                            <option value="Abuja">Abuja</option>
                                            <option value="Port Harcourt">Port Harcourt</option>
                                            <option value="Ibadan">Ibadan</option>
                                            <option value="Kano">Kano</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Asking Price (₦)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-emerald/5 text-emerald border-2 border-emerald/10 focus:ring-2 focus:ring-emerald transition-all outline-none font-black text-lg"
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center space-x-2 border border-red-100">
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-bold">{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 text-lg rounded-2xl shadow-xl shadow-burgundy/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" /> Publishing...
                                    </>
                                ) : (
                                    <>
                                        List Vehicle Now <ArrowRight className="ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Sidebar / Tips */}
                    <div className="space-y-6">
                        <div className="bg-onyx text-white p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-xl font-black mb-6">Listing Tips</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Camera className="text-burgundy-light" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Photos Matter</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed">You can add photos to your listing from your dashboard after creation.</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Tags className="text-burgundy-light" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Be Competitive</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed">Our AI suggested ₦{formData.price.toLocaleString()}. Listings close to AI valuation sell 40% faster.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-emerald/5 border border-emerald/10 p-6 rounded-[2rem] flex items-start space-x-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald shadow-sm shrink-0">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h4 className="font-black text-onyx uppercase text-xs tracking-tight mb-1">Fast Review</h4>
                                <p className="text-[10px] text-onyx-light leading-relaxed font-medium">
                                    Verified users enjoy instant listing. Your car will be visible in the marketplace within 30 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
