import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, User } from 'lucide-react';

interface Props {
    bids: any[];
}

export const BidFeed: React.FC<Props> = ({ bids }) => {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Gavel size={18} className="text-burgundy" />
                    <h3 className="font-black text-onyx uppercase tracking-wider text-xs">Live Bidding Activity</h3>
                </div>
                <div className="text-[10px] font-black text-onyx-light uppercase tracking-widest">{bids.length} Bids Total</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {bids.map((bid, idx) => (
                        <motion.div
                            key={bid.id || idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-2xl flex items-center justify-between transition-colors ${idx === 0 ? 'bg-emerald/5 border border-emerald/10' : 'bg-canvas/50 border border-gray-50'}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-emerald text-white' : 'bg-onyx/5 text-onyx-light'}`}>
                                    <User size={14} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-onyx">{bid.display_name || 'Dealer User'}</div>
                                    <div className="text-[10px] text-onyx-light font-bold">
                                        {new Date(bid.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-black ${idx === 0 ? 'text-emerald text-lg' : 'text-onyx'}`}>
                                    ₦{bid.amount.toLocaleString()}
                                </div>
                                {idx === 0 && <div className="text-[8px] font-black uppercase text-emerald tracking-widest">Winning Bid</div>}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {bids.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-onyx-light opacity-40 py-10">
                        <Gavel size={32} className="mb-2" />
                        <p className="text-xs font-bold">No bids yet. Be the first!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
