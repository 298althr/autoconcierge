'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

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
                router.push(redirect || '/');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas text-onyx font-body">
            <div className="w-full max-w-md p-8 glass-card">
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/logo/logo-light.png"
                        alt="AutoConcierge Logo"
                        width={200}
                        height={50}
                        className="mb-4"
                    />
                    <h1 className="text-2xl text-center">Welcome Back</h1>
                    <p className="text-onyx-light text-sm">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none transition-all"
                            placeholder="e.g. saviour@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-onyx-light">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-burgundy font-bold hover:underline">
                        Register for free
                    </Link>
                </p>
            </div>
        </div>
    );
}
