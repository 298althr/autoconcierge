'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Base';
import {
    User,
    MapPin,
    CreditCard,
    Camera,
    CheckCircle2,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        id_type: 'National ID',
        id_number: '',
        phone: '',
        occupation: ''
    });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login?redirect=/onboarding');
        }
        if (user && user.kyc_status !== 'none' && step === 1) {
            router.push('/');
        }
        if (user) {
            setFormData(prev => ({ ...prev, full_name: user.display_name }));
        }
    }, [user, isLoading]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!token) return;
        setSubmitting(true);
        try {
            await apiFetch('/auth/kyc/submit', {
                method: 'POST',
                token,
                body: formData
            });
            setStep(4); // Success step
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } catch (err) {
            console.error('KYC Submission failed', err);
            alert('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return null;

    return (
        <main className="min-h-screen bg-canvas pt-24 pb-20">
            <div className="max-w-2xl mx-auto px-4">
                {/* Progress bar */}
                <div className="flex justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${step >= s ? 'bg-burgundy border-burgundy text-white' : 'bg-white border-gray-100 text-gray-400'
                                } transition-all duration-500 font-bold`}>
                                {step > s ? <CheckCircle2 size={18} /> : s}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-50 overflow-hidden">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center space-x-3 text-burgundy mb-2">
                                <User size={24} />
                                <span className="font-bold uppercase tracking-widest text-xs">Profile Verification</span>
                            </div>
                            <h1 className="text-3xl font-black text-onyx">Personal Information</h1>
                            <p className="text-onyx-light font-medium">Let&apos;s get started with your basic details.</p>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Full Name (Mandatory)</label>
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
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                            placeholder="080..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">Occupation (Optional)</label>
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

                            <Button className="w-full py-5 text-lg" onClick={handleNext} disabled={!formData.full_name || !formData.address}>
                                Continue <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center space-x-3 text-burgundy mb-2">
                                <CreditCard size={24} />
                                <span className="font-bold uppercase tracking-widest text-xs">Identity</span>
                            </div>
                            <h1 className="text-3xl font-black text-onyx">Identification Details</h1>
                            <p className="text-onyx-light font-medium">Verify your identity to unlock higher transaction limits.</p>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">ID Type (Mandatory)</label>
                                    <select
                                        value={formData.id_type}
                                        onChange={e => setFormData({ ...formData, id_type: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                    >
                                        <option value="National ID">National ID (NIN)</option>
                                        <option value="International Passport">International Passport</option>
                                        <option value="Driver's License">Driver&apos;s License</option>
                                        <option value="Voter's Card">Voter&apos;s Card</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light ml-1">ID Number (Mandatory)</label>
                                    <input
                                        type="text"
                                        value={formData.id_number}
                                        onChange={e => setFormData({ ...formData, id_number: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy transition-all outline-none font-medium"
                                        placeholder="Enter the number on your ID"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="ghost" className="flex-1 py-5" onClick={handleBack}>Back</Button>
                                <Button className="flex-[2] py-5 text-lg" onClick={handleNext} disabled={!formData.id_number}>
                                    Next Step <ArrowRight className="ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center space-x-3 text-burgundy mb-2">
                                <Camera size={24} />
                                <span className="font-bold uppercase tracking-widest text-xs">Biometrics</span>
                            </div>
                            <h1 className="text-3xl font-black text-onyx">Facial Verification</h1>
                            <p className="text-onyx-light font-medium">Upload a clear photo of yourself for verification.</p>

                            <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center space-y-4 hover:border-burgundy/50 transition-colors cursor-pointer group">
                                <div className="w-16 h-16 bg-gray-50 text-onyx-light rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <Camera size={32} />
                                </div>
                                <div>
                                    <p className="font-bold text-onyx">Click to Upload Selfie</p>
                                    <p className="text-xs text-onyx-light mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>

                            <div className="bg-emerald/5 border border-emerald/10 p-4 rounded-2xl flex items-start space-x-3">
                                <ShieldCheck className="text-emerald mt-0.5" size={18} />
                                <p className="text-[10px] text-onyx-light leading-relaxed font-medium">
                                    Your data is encrypted and stored securely. We only use this for identity verification as required by Nigerian financial regulations.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" className="flex-1 py-5" onClick={handleBack} disabled={submitting}>Back</Button>
                                <Button className="flex-[2] py-5 text-lg shadow-xl shadow-burgundy/20" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Complete Onboarding'}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
                            <div className="w-24 h-24 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-onyx">Verification Pending</h1>
                                <p className="text-onyx-light font-medium mt-2">
                                    Thank you! Your details have been submitted for review.
                                    You can now explore the marketplace while we verify your account.
                                </p>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden max-w-sm mx-auto">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3 }}
                                    className="h-full bg-emerald"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
