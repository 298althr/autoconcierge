'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GarageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/garage');
    }, [router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-burgundy border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
