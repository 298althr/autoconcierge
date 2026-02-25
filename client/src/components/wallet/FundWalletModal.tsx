'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    CreditCard,
    ShieldCheck,
    Building2,
    Copy,
    Check,
    AlertCircle,
    Clock,
    ArrowRight,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Base';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface FundWalletModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const FundWalletModal = ({ onClose, onSuccess }: FundWalletModalProps) => {
    const { token, user } = useAuth();
    const [step, setStep] = useState(1); // 1: Amount, 2: Method, 3: Manual Details, 4: Processing
    const [amount, setAmount] = useState('50000');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const amounts = ['50000', '100000', '500000', '1000000'];
    const KYC_LIMIT = 5000000;

    const needsKYC = parseFloat(amount) > KYC_LIMIT && user?.kyc_status !== 'verified';

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleProceed = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 1000) {
            setError('Minimum funding is ₦1,000');
            return;
        }
        if (needsKYC) {
            setError('Transactions over ₦5,000,000 require verified KYC.');
            return;
        }
        setStep(2);
    };

    const handleMethodSelect = async (m: 'paystack' | 'manual') => {
        if (m === 'paystack') {
            setLoading(true);
            setError(null);
            try {
                const response = await apiFetch('/wallet/fund/initialize', {
                    method: 'POST',
                    token,
                    body: { amount: parseFloat(amount) }
                });

                if (response.status === true || response.authorization_url) {
                    // Redirect to Paystack checkout (or our simulated local callback)
                    window.location.href = response.data?.authorization_url || response.authorization_url;
                } else {
                    throw new Error(response.message || 'Failed to initialize payment');
                }
            } catch (err: any) {
                setError(err.message || 'Payment initialization failed');
                setLoading(false);
            }
        } else {
            setStep(3);
        }
    };

    const handleManualSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await apiFetch('/wallet/fund/manual', {
                method: 'POST',
                token,
                body: {
                    amount: parseFloat(amount),
                    bank_name: 'Providus Bank',
                    account_number: '13084122881'
                }
            });
            setStep(4);
        } catch (err: any) {
            setError(err.message || 'Failed to submit manual payment notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-onyx/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            {step > 1 && step < 4 && (
                                <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-onyx/5 rounded-full transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <div>
                                <h3 className="text-2xl font-black">
                                    {step === 1 ? 'Fund Wallet' :
                                        step === 2 ? 'Payment Method' :
                                            step === 3 ? 'Manual Transfer' :
                                                'Submission Received'}
                                </h3>
                                <p className="text-onyx-light text-sm font-medium">
                                    {step < 4 ? `Step ${step} of 3` : 'Awaiting confirmation'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-onyx/5 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {step === 4 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="w-20 h-20 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock size={40} className="animate-pulse" />
                                </div>
                                <h4 className="text-2xl font-black text-onyx mb-3">Payment Processing</h4>
                                <p className="text-onyx-light font-medium px-4 mb-8 leading-relaxed">
                                    We&apos;ve received your payment notification. Our finance team verifies transactions manually, which takes an <span className="text-onyx font-bold">average of 1 hour</span>.
                                    <br /><br />
                                    <span className="text-burgundy font-bold">Please be patient</span> while we secure your funds. You can close this window now.
                                </p>
                                <div className="bg-canvas border border-gray-100 p-6 rounded-3xl mb-8">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-onyx-light font-bold uppercase tracking-widest text-[10px]">Reference</span>
                                        <span className="font-black text-onyx"># MANUAL-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-onyx-light font-bold uppercase tracking-widest text-[10px]">Estimated Time</span>
                                        <span className="font-black text-emerald">60 Minutes</span>
                                    </div>
                                </div>
                                <Button className="w-full py-5 text-lg" onClick={() => { onSuccess(); onClose(); }}>
                                    Go to My Wallet
                                </Button>
                            </motion.div>
                        ) : loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-16 h-16 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto mb-6"></div>
                                <h4 className="text-xl font-black text-onyx mb-2">Submitting Request...</h4>
                                <p className="text-onyx-light font-medium">Please do not refresh the page.</p>
                            </motion.div>
                        ) : (
                            <>
                                {error && (
                                    <div className="bg-burgundy/5 border border-burgundy/10 p-4 rounded-xl flex items-center space-x-3 text-burgundy text-sm font-medium mb-6">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-onyx-light block mb-3">Select Amount (₦)</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {amounts.map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setAmount(val)}
                                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${amount === val
                                                            ? 'bg-burgundy/5 border-burgundy text-burgundy'
                                                            : 'bg-white border-gray-100 text-onyx hover:border-burgundy/20'
                                                            }`}
                                                    >
                                                        ₦ {parseInt(val).toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="text-xs font-black uppercase tracking-widest text-onyx-light block mb-3">Manual amount</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-onyx-light font-bold text-xl">₦</div>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full bg-canvas border-2 border-gray-100 rounded-2xl py-4 pl-10 pr-4 font-bold text-2xl focus:border-burgundy focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {needsKYC ? (
                                            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl space-y-3">
                                                <div className="flex items-start space-x-3 text-amber-700">
                                                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                                    <div className="text-xs font-medium leading-relaxed">
                                                        <p className="font-bold text-sm mb-1">KYC Verification Required</p>
                                                        Transactions above ₦5,000,000 are restricted for unverified accounts according to CBN regulations.
                                                    </div>
                                                </div>
                                                <Link href="/onboarding" className="block w-full py-3 bg-amber-600 text-white text-center rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors">
                                                    Complete KYC Verification
                                                </Link>
                                            </div>
                                        ) : (
                                            <Button className="w-full py-5 text-lg" onClick={handleProceed}>
                                                Choose Payment Method <ArrowRight className="ml-2" size={18} />
                                            </Button>
                                        )}
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                        <button
                                            onClick={() => handleMethodSelect('paystack')}
                                            className="w-full p-6 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-between group hover:border-burgundy transition-all"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-burgundy/5 rounded-2xl flex items-center justify-center text-burgundy group-hover:bg-burgundy group-hover:text-white transition-all">
                                                    <CreditCard size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-black text-onyx">Paystack (Cards & Bank Transfer)</h4>
                                                    <p className="text-xs text-onyx-light font-medium">Automatic verification • Instant</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-burgundy/10 group-hover:text-burgundy transition-all">
                                                <ArrowRight size={16} />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleMethodSelect('manual')}
                                            className="w-full p-6 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-between group hover:border-burgundy transition-all"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-burgundy/5 rounded-2xl flex items-center justify-center text-burgundy group-hover:bg-burgundy group-hover:text-white transition-all">
                                                    <Building2 size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-black text-onyx">Manual Wire Transfer</h4>
                                                    <p className="text-xs text-onyx-light font-medium">Direct deposit to our bank account</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-burgundy/10 group-hover:text-burgundy transition-all">
                                                <ArrowRight size={16} />
                                            </div>
                                        </button>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="bg-canvas border border-gray-100 p-8 rounded-[2rem] space-y-6">
                                            <div className="flex items-center justify-between">
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/en/a/ac/Providus_Bank_logo.png"
                                                    alt="Providus Bank"
                                                    className="h-20 object-contain grayscale hover:grayscale-0 transition-all"
                                                />
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-onyx-light">Bank Name</p>
                                                    <p className="font-bold text-onyx">Providus Bank</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-onyx-light">Account Number</p>
                                                        <p className="text-xl font-black text-onyx tracking-wider">13084122881</p>
                                                    </div>
                                                    <button onClick={() => handleCopy('13084122881')} className="p-3 bg-canvas rounded-xl text-onyx-light hover:text-burgundy transition-colors">
                                                        {copied ? <Check size={18} className="text-emerald" /> : <Copy size={18} />}
                                                    </button>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-onyx-light">Account Name</p>
                                                    <p className="font-bold text-onyx">VIVIOUR LTD.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-emerald/5 border border-emerald/10 p-4 rounded-2xl flex items-start space-x-3">
                                            <Clock className="text-emerald shrink-0 mt-0.5" size={18} />
                                            <p className="text-[10px] text-onyx-light leading-relaxed font-medium">
                                                After making your payment, click the button below. Our finance team will verify and credit your wallet within 1-2 hours on average.
                                            </p>
                                        </div>

                                        <Button
                                            className="w-full py-5 text-lg shadow-xl shadow-burgundy/20"
                                            onClick={handleManualSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : 'I have made the payment'}
                                        </Button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FundWalletModal;
