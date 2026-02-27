'use client';

import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

import { usePathname } from 'next/navigation';

const PillHeader = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isLoading } = useAuth();

    // Do not show PillHeader on dashboard pages as they have their own specialized navbar
    // Also, per user requirement, PillHeader should only be visible for non-logged-in users
    if (pathname?.startsWith('/dashboard') || (!isLoading && user)) return null;

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4 md:px-6 pointer-events-none"
            >
                <div className="bg-white/40 backdrop-blur-2xl border border-white/40 rounded-full px-4 py-2 flex items-center gap-2 md:gap-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] pointer-events-auto">
                    {/* Branding Logo */}
                    <Link href="/" className="flex items-center transition-opacity hover:opacity-80 md:mr-0 mr-2">
                        <Image
                            src="/autogaard-logo.png"
                            alt="Autogaard"
                            width={240}
                            height={65}
                            className="h-10 sm:h-12 w-auto object-contain"
                            priority
                        />
                    </Link>

                    <div className="hidden md:block w-px h-4 bg-slate-200/50 mx-2" />

                    {!isLoading && !user && (
                        <>
                            {/* Navigation Links */}
                            <nav className="hidden md:flex items-center gap-1">
                                <Link href="/vehicles" className="px-4 py-2 rounded-full text-[12px] font-subheading font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all">Marketplace</Link>
                                <Link href="/vehicles?status=in_auction" className="px-4 py-2 rounded-full text-[12px] font-subheading font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all">Auctions</Link>
                                <Link href="/valuation" className="px-4 py-2 rounded-full text-[12px] font-subheading font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all">Valuations</Link>
                                <Link href="/compare" className="px-4 py-2 rounded-full text-[12px] font-subheading font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all">Compare</Link>
                            </nav>

                            <div className="hidden md:block w-px h-4 bg-slate-200/50 mx-2" />

                            {/* Dynamic Action Button */}
                            <Link href="/login" className="hidden sm:flex bg-burgundy text-white text-[12px] font-subheading font-bold px-6 py-2.5 rounded-full hover:bg-burgundy-light transition-all shadow-lg shadow-burgundy-900/20 active:scale-95 ml-1">
                                Enter
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden ml-1 p-2 bg-white/60 hover:bg-white text-slate-800 rounded-full transition-colors flex items-center justify-center"
                                aria-label="Open Menu"
                            >
                                <Menu size={20} />
                            </button>
                        </>
                    )}

                    {!isLoading && user && (
                        <Link href="/dashboard" className="flex bg-burgundy text-white text-[12px] font-subheading font-bold px-6 py-2.5 rounded-full hover:bg-burgundy-light transition-all shadow-lg shadow-burgundy-900/20 active:scale-95 ml-1">
                            Dashboard
                        </Link>
                    )}
                </div>
            </motion.header>

            {/* Fullscreen Mobile Modal */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 pointer-events-auto"
                    >
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-8 p-4 bg-slate-100 rounded-full text-slate-900 hover:bg-slate-200 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <nav className="flex flex-col items-center gap-10 text-center w-full">
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="transition-transform active:scale-95 mb-4">
                                <Image src="/autogaard-logo.png" alt="Autogaard" width={220} height={50} priority className="h-8 w-auto" />
                            </Link>

                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/vehicles" className="text-3xl font-heading font-extrabold text-slate-900 hover:text-burgundy transition-colors px-10">Marketplace</Link>
                            <div className="w-16 h-px bg-slate-200" />
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/vehicles?status=in_auction" className="text-3xl font-heading font-extrabold text-slate-900 hover:text-burgundy transition-colors px-10">Auctions</Link>
                            <div className="w-16 h-px bg-slate-200" />
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/valuation" className="text-3xl font-heading font-extrabold text-slate-900 hover:text-burgundy transition-colors px-10">Valuations</Link>
                            <div className="w-16 h-px bg-slate-200" />
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/compare" className="text-3xl font-heading font-extrabold text-slate-900 hover:text-burgundy transition-colors px-10">Compare</Link>

                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/login" className="mt-8 bg-burgundy text-white text-xl font-heading font-extrabold px-12 py-5 rounded-full hover:bg-burgundy-light transition-all shadow-xl shadow-burgundy/20 active:scale-95">
                                Client Portal
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PillHeader;

