'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Base';
import {
    User,
    MapPin,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        phone: '',
        occupation: ''
    });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login?redirect=/onboarding');
        }
        // If user already has phone/address, they shouldn't be here (simplified logic for now)
        if (user && user.phone && (user.address || user.kyc_data?.address)) {
            router.push('/dashboard');
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.display_name || prev.full_name,
                phone: user.phone || prev.phone,
                address: user.address || user.kyc_data?.address || prev.address
            }));
        }
    }, [user, isLoading]);

    const handleSubmit = async () => {
        if (!token) return;
        setSubmitting(true);
        try {
            await apiFetch('/me/profile', {
                method: 'PATCH',
                token,
                body: {
                    display_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    // Store occupation in notes or meta if db supports it, or omit to keep simple.
                }
            });
            // Profile updated, send straight to the new user dashboard
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Profile update failed', err);
            alert('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return null;

    return (
        <main className="min-h-screen bg-canvas pt-24 pb-20">
            <div className="max-w-xl mx-auto px-4">

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-50 overflow-hidden">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center space-x-3 text-burgundy mb-2">
                            <User size={24} />
                            <span className="font-bold uppercase tracking-widest text-xs">Welcome to Autogaard</span>
                        </div>
                        <h1 className="text-3xl font-black text-onyx">Complete Your Profile</h1>
                        <p className="text-onyx-light font-medium">Let&apos;s get your basic details set up so you can access the dashboard.</p>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Full legal Name (Mandatory)</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                    placeholder="Enter your full legal name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Home Address (Mandatory)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-onyx-light" size={18} />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                        placeholder="Street, City, State"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                        placeholder="080..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Occupation</label>
                                    <input
                                        type="text"
                                        value={formData.occupation}
                                        onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                        placeholder="e.g. Engineer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald/5 border border-emerald/10 p-4 rounded-2xl flex items-start space-x-3 mt-4">
                            <ShieldCheck className="text-emerald mt-0.5" size={18} />
                            <p className="text-[10px] text-onyx-light leading-relaxed font-medium">
                                We will not ask for sensitive Identity Documents today. You only need to verify your ID when transacting values exceeding ₦500k.
                            </p>
                        </div>

                        <Button className="w-full py-5 text-lg mt-6 shadow-xl shadow-burgundy/20" onClick={handleSubmit} disabled={!formData.full_name || !formData.address || submitting}>
                            {submitting ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight className="ml-2" /></>}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
