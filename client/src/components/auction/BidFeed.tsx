import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, User, CheckCircle2 } from 'lucide-react';

interface Props {
    bids: any[];
}

export const BidFeed: React.FC<Props> = ({ bids }) => {
    const formatDate = (dateValue: any) => {
        try {
            const date = dateValue ? new Date(dateValue) : new Date();
            if (isNaN(date.getTime())) return new Date().toLocaleTimeString();
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch (e) {
            return new Date().toLocaleTimeString();
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Gavel size={18} className="text-burgundy" />
                    <h3 className="font-black text-onyx uppercase tracking-wider text-xs font-subheading">Live Bidding Activity</h3>
                </div>
                <div className="text-[10px] font-black text-onyx-light uppercase tracking-widest">{bids.length} BIDS TOTAL</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {bids.map((bid, idx) => (
                        <motion.div
                            key={bid.id || idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-[1.5rem] flex items-center justify-between transition-all ${idx === 0
                                    ? 'bg-[#ECFDF5] border border-[#10B981]/20 shadow-sm scale-[1.02]'
                                    : 'bg-slate-50 border border-slate-100'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${idx === 0 ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    <User size={16} />
                                    {idx === 0 && (
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2 size={12} className="text-[#10B981] fill-[#10B981] text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-xs font-bold text-slate-900 font-heading">
                                        {bid.display_name || 'Anonymous Bidder'}
                                    </div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                        {formatDate(bid.created_at)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-black flex items-center justify-end ${idx === 0 ? 'text-[#059669]' : 'text-slate-900'
                                    } font-heading`}>
                                    <span className="text-[10px] mr-0.5">₦</span>
                                    {bid.amount.toLocaleString()}
                                </div>
                                {idx === 0 && (
                                    <div className="text-[8px] font-extrabold uppercase text-[#059669] tracking-widest mt-0.5 font-subheading">
                                        Current Highest
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {bids.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                        <Gavel size={40} className="mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure position with first bid.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
