import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socketRef.current.on('connect', () => {
                setIsConnected(true);
                console.log('[Socket] Connected');
            });

            socketRef.current.on('disconnect', () => {
                setIsConnected(false);
                console.log('[Socket] Disconnected');
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const joinAuction = (auctionId: string) => {
        socketRef.current?.emit('join_auction', auctionId);
    };

    const leaveAuction = (auctionId: string) => {
        socketRef.current?.emit('leave_auction', auctionId);
    };

    const authenticate = (token: string) => {
        socketRef.current?.emit('authenticate', token);
    };

    return {
        socket: socketRef.current,
        isConnected,
        joinAuction,
        leaveAuction,
        authenticate
    };
}
