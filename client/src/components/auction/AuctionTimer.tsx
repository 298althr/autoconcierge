import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
    endTime: string;
    onEnd?: () => void;
}

export const AuctionTimer: React.FC<Props> = ({ endTime, onEnd }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isLow, setIsLow] = useState(false);

    useEffect(() => {
        const calculate = () => {
            const diff = new Date(endTime).getTime() - new Date().getTime();
            if (diff <= 0) {
                setTimeLeft('ENDED');
                onEnd?.();
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setIsLow(diff < 3600000); // Highlight in red when less than 1 hour left
            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        };

        const timer = setInterval(calculate, 1000);
        calculate();
        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className={`flex items-center space-x-2 font-black tabular-nums transition-colors ${isLow ? 'text-burgundy animate-pulse' : 'text-onyx'}`}>
            <Clock size={18} />
            <span className="text-xl tracking-tighter">{timeLeft}</span>
        </div>
    );
};
