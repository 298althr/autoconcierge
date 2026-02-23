'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (adminOnly && user.role !== 'admin') {
                router.push('/');
            }
        }
    }, [user, isLoading, router, adminOnly]);

    if (isLoading || !user || (adminOnly && user.role !== 'admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-canvas">
                <div className="w-10 h-10 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
