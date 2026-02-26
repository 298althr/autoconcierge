import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useSocket } from './useSocket';

export function useAuction(auctionId: string, token: string | null) {
    const [auction, setAuction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, joinAuction, leaveAuction } = useSocket();

    const fetchAuction = useCallback(async () => {
        try {
            const res = await apiFetch(`/auctions/${auctionId}`);
            setAuction(res.data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }, [auctionId]);

    useEffect(() => {
        fetchAuction();
        joinAuction?.(auctionId);

        if (socket) {
            socket.on('new_bid', (bidData: any) => {
                setAuction((prev: any) => {
                    if (!prev) return prev;
                    if (prev.bids?.find((b: any) => b.id === bidData.id)) return prev;
                    return {
                        ...prev,
                        current_price: bidData.amount,
                        bid_count: bidData.bid_count || (prev.bid_count + 1),
                        end_time: bidData.end_time || prev.end_time,
                        bids: [bidData, ...(prev.bids || [])].slice(0, 50)
                    };
                });
            });

            socket.on('auction_status_update', (data: any) => {
                if (data.status === 'extended') {
                    setAuction((prev: any) => ({ ...prev, end_time: data.end_time }));
                } else {
                    fetchAuction();
                }
            });
        }

        return () => {
            leaveAuction?.(auctionId);
            socket?.off('new_bid');
            socket?.off('auction_status_update');
        };
    }, [auctionId, socket, fetchAuction, joinAuction, leaveAuction]);

    const placeBid = async (amount: number) => {
        if (!token) throw new Error('Not logged in');
        const res = await apiFetch(`/auctions/${auctionId}/bid`, {
            method: 'POST',
            body: { amount },
            token
        });
        return res.data;
    };

    const buyNow = async () => {
        if (!token) throw new Error('Not logged in');
        const res = await apiFetch(`/auctions/${auctionId}/buy-now`, {
            method: 'POST',
            token
        });
        await fetchAuction();
        return res.data;
    };

    return { auction, loading, error, placeBid, buyNow, refetch: fetchAuction };
}
