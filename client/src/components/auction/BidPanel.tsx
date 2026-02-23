import React, { useState } from 'react';
import { Gavel, Info, Loader2, Wallet } from 'lucide-react';
import { Button } from '../ui/Base';

interface Props {
    currentPrice: number;
    bidIncrement: number;
    depositPct: number;
    walletBalance: number;
    onBid: (amount: number) => Promise<void>;
    disabled?: boolean;
}

export const BidPanel: React.FC<Props> = ({ currentPrice, bidIncrement, depositPct, walletBalance, onBid, disabled }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nextBid = currentPrice + bidIncrement;
    const depositNeeded = nextBid * (depositPct / 100);
    const hasEnoughBalance = walletBalance >= depositNeeded;

    const handleBid = async (amount: number) => {
        setLoading(true);
        setError(null);
        try {
            await onBid(amount);
        } catch (err: any) {
            setError(err.message || 'Failed to place bid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-onyx text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px]">
                        <Gavel size={14} />
                        <span>Place Your Bid</span>
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full flex items-center space-x-2 border border-white/5">
                        <Wallet size={12} className="text-burgundy" />
                        <span className="text-[10px] font-black tracking-widest uppercase">
                            Available: ₦{walletBalance.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="mb-10">
                    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Recommended Bid</div>
                    <div className="text-5xl font-black flex items-end">
                        <span className="text-xl text-burgundy mb-2 mr-1">₦</span>
                        {nextBid.toLocaleString()}
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start space-x-3">
                        <Info size={16} className="text-burgundy shrink-0 mt-0.5" />
                        <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                            Placing this bid will hold <span className="text-white font-bold">₦{depositNeeded.toLocaleString()}</span> (20%) from your wallet as a commitment deposit. Held funds are automatically released if you are outbid.
                        </p>
                    </div>
                    {!hasEnoughBalance && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-100">
                            <Info size={16} />
                            <p className="text-[11px] font-bold leading-tight">
                                Insufficient wallet balance for deposit. Minimum required: ₦{depositNeeded.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {error && <p className="text-xs text-red-400 font-bold mb-4">{error}</p>}

                <div className="mt-auto space-y-3">
                    <Button
                        size="xl"
                        className="w-full bg-burgundy hover:bg-burgundy-dark text-white shadow-xl shadow-burgundy/20 group"
                        disabled={loading || disabled || !hasEnoughBalance}
                        onClick={() => handleBid(nextBid)}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : (
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-xs uppercase tracking-widest font-black">Confirm Bid of ₦{nextBid.toLocaleString()}</span>
                                <Gavel size={18} className="group-hover:rotate-12 transition-transform" />
                            </div>
                        )}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        {[nextBid + 100000, nextBid + 250000].map(amt => (
                            <button
                                key={amt}
                                onClick={() => handleBid(amt)}
                                disabled={loading || disabled || !hasEnoughBalance}
                                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                +₦{(amt - nextBid).toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
