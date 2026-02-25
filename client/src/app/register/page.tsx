'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';
import Script from 'next/script';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        display_name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, googleLogin } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleResponse = async (response: any) => {
        setLoading(true);
        setError('');
        try {
            const user = await googleLogin(response.credential);
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');

            if (user.kyc_status === 'none') {
                router.push('/onboarding' + (redirect ? `?redirect=${redirect}` : ''));
            } else {
                router.push(redirect || '/');
            }
        } catch (err: any) {
            setError(err.message || 'Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    const initializeGoogleLogin = () => {
        if (typeof window !== 'undefined' && (window as any).google) {
            (window as any).google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            (window as any).google.accounts.id.renderButton(
                document.getElementById("google-button-container"),
                { theme: "outline", size: "large", width: "100%", shape: "pill" }
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await register(formData);
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');

            if (user.kyc_status === 'none') {
                router.push('/onboarding' + (redirect ? `?redirect=${redirect}` : ''));
            } else {
                router.push(redirect || '/');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] flex flex-col items-center justify-center py-10 overflow-x-hidden overflow-y-auto bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000')` }}
        >
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
            <MotionBackground />

            <div className="w-full max-w-lg px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card p-10 md:p-12 w-full flex flex-col items-center"
                >
                    <Image
                        src="/logo.png"
                        alt="Autogaard Logo"
                        width={240}
                        height={60}
                        className="mb-8"
                    />

                    <div className="text-center w-full mb-10">
                        <h1 className="text-3xl font-heading font-extrabold tracking-tight text-slate-900 mb-2">Join the Future.</h1>
                        <p className="text-slate-500 text-sm font-subheading">Create your high-end trading account.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl mb-6 text-xs font-bold font-subheading text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="premium-label">Full Name</label>
                                <input
                                    type="text"
                                    name="display_name"
                                    value={formData.display_name}
                                    onChange={handleChange}
                                    required
                                    className="premium-input"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="premium-label">Phone <span className="text-slate-300">(Optional)</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="premium-input"
                                    placeholder="+234..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="premium-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="premium-input"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="premium-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="premium-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-4">
                            <PremiumButton
                                type="submit"
                                isLoading={loading}
                                className="w-full"
                                tooltip="Join Autogaard"
                            >
                                Create Account
                            </PremiumButton>
                        </div>
                    </form>

                    <div className="mt-8 w-full flex items-center justify-center space-x-4">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or auto-verify with</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <div className="w-full px-2">
                        <div
                            id="google-button-container"
                            className="w-full mt-6 flex justify-center h-[52px]"
                        ></div>
                    </div>

                    <Script
                        src="https://accounts.google.com/gsi/client"
                        onLoad={initializeGoogleLogin}
                        strategy="afterInteractive"
                    />

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
                            Already verified?
                            <Link href="/login" className="text-slate-900 ml-2 hover:text-burgundy transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

