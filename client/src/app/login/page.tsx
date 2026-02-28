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

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, googleLogin, user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && user) {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            if (user.kyc_status === 'none') {
                router.replace('/onboarding' + (redirect ? `?redirect=${redirect}` : ''));
            } else {
                router.replace(redirect || '/dashboard');
            }
        }
    }, [user, isLoading, router]);

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
                router.push(redirect || '/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const initializeGoogleLogin = () => {
        if (typeof window !== 'undefined' && (window as any).google) {
            // Strip potential quotes if they were added in Railway dashboard
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.replace(/['"]+/g, '');

            if (!clientId) {
                console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing or empty in environment variables.');
                return;
            }

            console.log('🛡️ Initializing Google Sign-in with ID:', clientId.substring(0, 10) + '...');

            const container = document.getElementById("google-button-container");
            if (!container) return;

            (window as any).google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse,
            });

            (window as any).google.accounts.id.renderButton(
                container,
                { theme: "outline", size: "large", width: "100%", shape: "pill" }
            );
        }
    };

    React.useEffect(() => {
        initializeGoogleLogin();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');

            if (user.kyc_status === 'none') {
                router.push('/onboarding' + (redirect ? `?redirect=${redirect}` : ''));
            } else {
                router.push(redirect || '/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
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

            <div className="w-full max-w-md px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card p-10 md:p-12 w-full flex flex-col items-center"
                >
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Autogaard Logo"
                            width={240}
                            height={60}
                            className="mb-8"
                        />
                    </Link>

                    <div className="text-center w-full mb-10">
                        <h1 className="text-3xl font-heading font-extrabold tracking-tight text-slate-900 mb-2">Welcome Back.</h1>
                        <p className="text-slate-500 text-sm font-subheading">Access your automotive portfolio.</p>
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

                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div>
                            <label className="premium-label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="premium-input"
                                placeholder="saviour@example.com"
                            />
                        </div>

                        <div>
                            <label className="premium-label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                tooltip="Sign in to your dashboard"
                            >
                                Sign In
                            </PremiumButton>
                        </div>
                    </form>

                    <div className="mt-8 w-full flex items-center justify-center space-x-4">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <Script
                        src="https://accounts.google.com/gsi/client"
                        onLoad={initializeGoogleLogin}
                        strategy="afterInteractive"
                    />

                    <div id="google-button-container" className="w-full mt-6 flex justify-center h-[52px]"></div>

                    <div className="mt-8 text-center">

                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
                            No account yet?
                            <Link href="/register" className="text-slate-900 ml-2 hover:text-burgundy transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
