import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function useWallet() {
    const { token } = useAuth();
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWallet = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await apiFetch('/wallet/balance', { token });
            setWallet(res.data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    return { wallet, loading, error, refreshWallet: fetchWallet };
}
