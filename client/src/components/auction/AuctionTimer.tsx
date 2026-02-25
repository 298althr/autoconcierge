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

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            setIsLow(diff < 300000); // Less than 5 mins
            setTimeLeft(`${h}h ${m}m ${s}s`);
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
