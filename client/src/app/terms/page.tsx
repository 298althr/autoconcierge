'use client';

import React from 'react';
import MotionBackground from '@/components/landing/MotionBackground';
import PillHeader from '@/components/landing/PillHeader';
import { motion } from 'framer-motion';

export default function TermsPage() {
    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass-card p-10 md:p-16 mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 mb-6">Terms of Service.</h1>
                    <p className="text-slate-500 font-subheading text-lg mb-10 border-b border-slate-100 pb-10">
                        The legal framework for high-frequency automotive trading on Autogaard.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">1. Protocol Framework & Acceptance</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm mb-4">
                                This document outlines the binding operating procedures ("Terms of Service," or "ToS") governing the usage of the Autogaard network ("Autogaard", "Platform", or "Network"), operated by Dealer360 ecosystem. By accessing the application, activating a digital wallet, or requesting an AI forensic valuation, you explicitly acknowledge and consent to these terms. Failure to comply grants Autogaard the right to suspend escrow wallets and freeze assets under examination.
                            </p>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                These Terms constitute a legally enforceable agreement between you (the "Client" or "User") and the Platform regarding the utilization of proprietary high-frequency automotive trading algorithms, liquidity scoring, and real-time auction protocols.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">2. Algorithmic Valuation & Asset Liquidity</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm mb-4">
                                Autogaard provides estimated vehicle market capitalizations via deep-learning frameworks (the "Valuation Engine").
                                <strong>2.1 Acknowledgment of Estimates:</strong> Valuations are predictive models derived from Nigerian market datasets. They are <em>not</em> guaranteed purchase prices unless automatically accepted into our instant-liquidity protocol by an authorized dealer node.
                            </p>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                <strong>2.2 Fraudulent Data:</strong> Manipulating input parameters (e.g., misrepresenting transmission health, withholding accident history, tampering with VINs) violates this agreement, resulting in immediate suspension from the network and potential referral to authorities for fraud.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">3. Escrow Settlement Protocol</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm mb-4">
                                Financial transactions are legally executed through the Autogaard Escrow Protocol to ensure zero-risk asset transfers.
                                <strong>3.1 Asset Lock:</strong> Once a bid is won, the buyer's funds are frozen in the digital vault. The seller's asset title is simultaneously held in trust.
                            </p>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                <strong>3.2 Transaction Resolution:</strong> Funds are only released to the seller upon cryptographic confirmation of the physical asset delivery and passing of the 250-point secondary inspection by an independent verifier. Standard legal recourse applies to assets materially misrepresented at delivery.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">4. Capital Commitments & 5% Protocol Fee</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm mb-4">
                                <strong>4.1 Network Margin:</strong> Autogaard levies a non-negotiable, flat commission of 5% on the final clearing price of any vehicle traded successfully across the platform. This fee is instantly deducted during the Escrow Settlement Protocol.
                            </p>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                <strong>4.2 Bidding Capital:</strong> To participate in live auctions, a Client must inject and maintain liquid capital (Wallet Balance) equal to at least 20% of their intended maximum bid, or hold an A-tier authorization token.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">5. Regulatory & KYC/AML Compliance</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                Autogaard operates under strict KYC (Know Your Customer) and AML (Anti-Money Laundering) requirements. Digital identities must be fully verified by governmental IDs before capital injections or vehicle listings are authorized. Autogaard complies with local data privacy acts and reserves the right to present transactional dossiers to judicial bodies under legally binding subpoenas.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

