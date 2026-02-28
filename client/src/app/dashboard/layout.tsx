import React from 'react';
import { Metadata } from 'next';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { NotificationProvider } from '@/context/NotificationContext';

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
            <NotificationProvider>
                <div className="min-h-screen bg-canvas pb-safe-bottom">
                    <DashboardNavbar />

                    <main className="max-w-7xl mx-auto md:px-8 py-4 md:py-6 px-0 md:px-4 pb-32 md:pb-6 overflow-hidden">
                        <div className="px-4 md:px-0">
                            {children}
                        </div>
                    </main>
                </div>
            </NotificationProvider>
        </ProtectedRoute>
    );
}
