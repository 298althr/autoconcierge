'use client';

import React, { useState } from 'react';
import MotionBackground from '@/components/landing/MotionBackground';
import PillHeader from '@/components/landing/PillHeader';
import PremiumButton from '@/components/ui/PremiumButton';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    const [status, setStatus] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Message successfully transmitted. Our team will contact you shortly.');
    };

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 mb-4">Official Support & Dispute Resolution.</h1>
                        <p className="text-slate-500 font-subheading text-lg max-w-3xl mx-auto">
                            The designated communication portal for formal escrow disputes, compliance inquiries, and high-frequency trading disruptions. All transmissions are logged for legal auditory compliance.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="glass-card p-10 flex flex-col justify-center">
                            <h3 className="text-xl font-heading font-extrabold text-slate-900 mb-8 tracking-tight">Direct Access</h3>
                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-subheading mb-1">Email Protocol</p>
                                        <p className="font-heading font-extrabold text-slate-900">support@Autogaard.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-subheading mb-1">Secure Line</p>
                                        <p className="font-heading font-extrabold text-slate-900">+234 (0) 800 CONCIERGE</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-subheading mb-1">Headquarters</p>
                                        <p className="font-heading font-extrabold text-slate-900">Victoria Island, Lagos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-2 glass-card p-10 md:p-14"
                    >
                        <h3 className="text-2xl font-heading font-extrabold text-slate-900 mb-8 tracking-tight">Transmit Message</h3>

                        {status && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm font-bold font-subheading text-center">
                                {status}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="premium-label">Client Name</label>
                                    <input type="text" className="premium-input bg-slate-50" required placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="premium-label">Contact Email</label>
                                    <input type="email" className="premium-input bg-slate-50" required placeholder="name@domain.com" />
                                </div>
                            </div>
                            <div>
                                <label className="premium-label">Subject</label>
                                <input type="text" className="premium-input bg-slate-50" required placeholder="Escrow inquiry, account issue..." />
                            </div>
                            <div>
                                <label className="premium-label">Message Payload</label>
                                <textarea className="premium-input bg-slate-50 min-h-[150px] resize-y" required placeholder="Detail your request here..."></textarea>
                            </div>
                            <div className="pt-4">
                                <PremiumButton type="submit" icon={Send}>Transmit to Team</PremiumButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}

