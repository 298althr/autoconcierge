import React, { useState, useEffect } from 'react';
import { Gavel, Info, Loader2, Wallet, Zap } from 'lucide-react';
import { Button } from '../ui/Base';

interface Props {
    currentPrice: number;
    bidIncrement: number;
    depositPct: number;
    walletBalance: number;
    buyNowPrice?: number | null;
    kycStatus?: string;
    onBid: (amount: number) => Promise<void>;
    onBuyNow?: () => Promise<void>;
    onViewHistory: () => void;
    disabled?: boolean;
}

export const BidPanel: React.FC<Props> = ({
    currentPrice,
    bidIncrement,
    depositPct,
    walletBalance,
    buyNowPrice,
    kycStatus,
    onBid,
    onBuyNow,
    onViewHistory,
    disabled
}) => {
    const [loading, setLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');

    const nextBid = currentPrice + bidIncrement;
    const currentBidAmount = customAmount ? parseInt(customAmount) : nextBid;

    const depositNeeded = currentBidAmount * (depositPct / 100);
    const hasEnoughBalance = walletBalance >= depositNeeded;

    const KYC_THRESHOLD = 500000;
    const needsKYC = depositNeeded > KYC_THRESHOLD && kycStatus !== 'verified';

    useEffect(() => {
        setCustomAmount('');
    }, [currentPrice]);

    const handleBid = async (amount: number) => {
        if (amount < nextBid) {
            setError(`Minimum bid is ₦${nextBid.toLocaleString()}`);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onBid(amount);
            setCustomAmount('');
        } catch (err: any) {
            setError(err.message || 'Failed to place bid');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!onBuyNow) return;
        setBuyNowLoading(true);
        setError(null);
        try {
            await onBuyNow();
        } catch (err: any) {
            setError(err.message || 'Buy Now failed');
        } finally {
            setBuyNowLoading(false);
        }
    };

    return (
        <div className="bg-onyx text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
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

                <div className="mb-6">
                    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Current Price + Increment</div>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-burgundy font-bold text-lg">₦</span>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    placeholder={nextBid.toString()}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-2xl font-black focus:outline-none focus:border-burgundy/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-8">
                    {[50000, 100000, 250000].map(inc => (
                        <button
                            key={inc}
                            onClick={() => {
                                const base = customAmount ? parseInt(customAmount) : currentPrice;
                                setCustomAmount((base + inc).toString());
                            }}
                            disabled={loading || disabled}
                            className="py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                        >
                            +₦{inc.toLocaleString()}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start space-x-3">
                        <Info size={16} className="text-burgundy shrink-0 mt-0.5" />
                        <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                            Placing this bid will hold <span className="text-white font-bold">₦{depositNeeded.toLocaleString()}</span> ({depositPct}%) from your wallet as a commitment deposit.
                        </p>
                    </div>
                    {!hasEnoughBalance && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-100">
                            <Info size={16} />
                            <p className="text-[11px] font-bold leading-tight">
                                Insufficient balance. Need: ₦{depositNeeded.toLocaleString()}
                            </p>
                        </div>
                    )}
                    {needsKYC && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col space-y-3 text-amber-100">
                            <div className="flex items-center space-x-3">
                                <Info size={16} />
                                <p className="text-[11px] font-bold leading-tight uppercase tracking-tighter">
                                    Account Verification required for high-volume trades.
                                </p>
                            </div>
                            <a href="/dashboard/kyc" className="text-[9px] bg-amber-500 text-white font-black py-2 rounded-xl text-center uppercase tracking-widest">
                                Complete Onboarding
                            </a>
                        </div>
                    )}
                </div>

                {error && <p className="text-xs text-red-400 font-bold mb-4">{error}</p>}

                <div className="mt-auto space-y-3">
                    <Button
                        size="xl"
                        className="w-full bg-burgundy hover:bg-burgundy-dark text-white shadow-xl shadow-burgundy/20 group"
                        disabled={loading || disabled || !hasEnoughBalance || needsKYC}
                        onClick={() => handleBid(currentBidAmount)}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : (
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-xs uppercase tracking-widest font-black">Confirm Bid of ₦{currentBidAmount.toLocaleString()}</span>
                                <Gavel size={18} className="group-hover:rotate-12 transition-transform" />
                            </div>
                        )}
                    </Button>

                    {buyNowPrice && (
                        <button
                            onClick={handleBuyNow}
                            disabled={buyNowLoading || disabled}
                            className="w-full py-4 bg-white text-onyx rounded-2xl flex items-center justify-center space-x-2 hover:bg-slate-100 transition-all font-black uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-50"
                        >
                            {buyNowLoading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    <Zap size={14} className="fill-burgundy text-burgundy" />
                                    <span>Buy Now for ₦{buyNowPrice.toLocaleString()}</span>
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={onViewHistory}
                        className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-burgundy transition-colors border-t border-white/5 mt-6"
                    >
                        View My Bid Portfolio
                    </button>
                </div>
            </div>
        </div>
    );
};
