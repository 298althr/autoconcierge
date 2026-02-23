import React from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Lock,
    Unlock,
    ShoppingBag,
    AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    created_at: string;
}

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
    const getIcon = () => {
        switch (transaction.type) {
            case 'funding':
                return <ArrowDownLeft className="text-emerald" size={20} />;
            case 'withdrawal':
                return <ArrowUpRight className="text-burgundy" size={20} />;
            case 'bid_hold':
                return <Lock className="text-blue-500" size={20} />;
            case 'bid_release':
                return <Unlock className="text-emerald" size={20} />;
            case 'auction_payment':
                return <ShoppingBag className="text-onyx" size={20} />;
            default:
                return <AlertCircle className="text-gray-400" size={20} />;
        }
    };

    const isCredit = ['funding', 'bid_release', 'refund'].includes(transaction.type);

    return (
        <div className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-4 -mx-4 rounded-xl transition-colors group">
            <div className="flex items-center space-x-4">
                <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    isCredit ? "bg-emerald/10" : "bg-onyx/5"
                )}>
                    {getIcon()}
                </div>
                <div>
                    <h4 className="font-bold text-onyx capitalize">{transaction.description || transaction.type.replace('_', ' ')}</h4>
                    <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-black text-onyx-light/40">
                        <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className={clsx(
                            transaction.status === 'completed' ? "text-emerald" :
                                transaction.status === 'processing' ? "text-blue-500" :
                                    transaction.status === 'failed' ? "text-burgundy" : "text-amber-500"
                        )}>{transaction.status}</span>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <p className={clsx(
                    "text-lg font-black",
                    isCredit ? "text-emerald" : "text-onyx"
                )}>
                    {isCredit ? '+' : '-'} ₦{transaction.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-onyx-light/40 font-bold uppercase tracking-tighter">Reference: #{transaction.id.slice(0, 8)}</p>
            </div>
        </div>
    );
};

export default TransactionRow;
