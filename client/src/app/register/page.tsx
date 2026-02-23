'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        display_name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <div className="min-h-screen flex items-center justify-center bg-canvas text-onyx font-body p-4">
            <div className="w-full max-w-md p-8 glass-card">
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/logo/logo-light.png"
                        alt="AutoConcierge Logo"
                        width={200}
                        height={50}
                        className="mb-4"
                    />
                    <h1 className="text-2xl text-center font-display font-black">Join the Future</h1>
                    <p className="text-onyx-light text-sm">Create your free account today</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Full Name</label>
                        <input
                            type="text"
                            name="display_name"
                            value={formData.display_name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none transition-all"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none transition-all"
                            placeholder="08012345678"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded border border-gray-200 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50 flex justify-center items-center mt-4"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-onyx-light">
                    Already have an account?{' '}
                    <Link href="/login" className="text-burgundy font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
