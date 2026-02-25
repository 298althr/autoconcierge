'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
                <div className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-red-100 max-w-md">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-onyx mb-4">Access Denied</h1>
                    <p className="text-onyx-light font-medium mb-8">This area is reserved for system administrators only. Please return to the homepage.</p>
                    <a href="/" className="btn-primary px-8 py-3 rounded-xl inline-block">Back to Safety</a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-canvas">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
