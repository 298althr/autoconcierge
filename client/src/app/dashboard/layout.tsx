import React from 'react';
import { Metadata } from 'next';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata: Metadata = {
    title: 'Client Dashboard | Autogaard',
    description: 'Manage your garage, wallet, and active bids.',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-canvas pb-safe-bottom">
                <DashboardNavbar />

                <main className="max-w-7xl mx-auto md:px-8 py-6 px-4 pb-24 md:pb-6">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
