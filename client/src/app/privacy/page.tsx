'use client';

import React from 'react';
import MotionBackground from '@/components/landing/MotionBackground';
import PillHeader from '@/components/landing/PillHeader';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 mb-6">Privacy Policy.</h1>
                    <p className="text-slate-500 font-subheading text-lg mb-10 border-b border-slate-100 pb-10">
                        How we process, store, and secure your institutional and personal data.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">1. Data Collection & Forensic Auditing</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm mb-4">
                                Autogaard acts as a central authoritative ledger for vehicle liquidity. To facilitate this, we collect rigorous telemetric, personal, and mechanical data.
                                <strong>1.1 Identity Profiles:</strong> During the mandatory KYC (Know Your Customer) protocol, we collect government-issued biometric IDs (NIN/BVN), facial verification scans, and explicit legal names to bind to digital trading accounts.
                            </p>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                <strong>1.2 Asset Profiles:</strong> Any vehicle listed on the platform undergoes forensic auditing. This includes scraping VIN registries, internal accident databases, and physical 250-point inspection results conducted by authorized engineering nodes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">2. Algorithmic Data Processing</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                The data collected is primarily fed into our proprietary deep-learning valuation engine. By submitting vehicle metrics, you grant Autogaard an irrevocable license to utilize this anonymized asset data to train, calibrate, and enhance our predictive liquidity models across the Nigerian automotive dataset.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">3. Security Standards & Trust Protocol</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm mb-4">
                                <strong>3.1 Transmission:</strong> All live auction bids, chat payloads, and API requests operate over secure WebSocket (WSS) and HTTPS (TLS 1.3) tunnels.
                            </p>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                <strong>3.2 Storage:</strong> Digital wallet balances, settlement thresholds, and passwords are encrypted using AES-256 standard protocols at rest. Financial routing details are tokenized; Autogaard does not store raw bank credentials on our primary database.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">4. Third-Party Disclosures & Legal Jurisdiction</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                Autogaard strictly refuses to monetize your identity or transaction history through third-party advertising networks. However, to maintain the integrity of our Escrow Protocol, we may legally disclose your cryptographic identity and transaction history to verified financial regulators, law enforcement agencies, or involved legal parties in the event of documented fraud, theft, or explicit subpoenas within the jurisdiction of the Federal Republic of Nigeria.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">5. User Cryptographic Rights</h2>
                            <p className="text-slate-600 font-body leading-relaxed text-sm">
                                Users hold the right to demand a complete algorithmic memory wipe (deletion of account). However, this request will be denied if the account is currently locked in an active Escrow Settlement, holds outstanding debt to the platform, or is under active investigation by our anti-fraud nodes.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

