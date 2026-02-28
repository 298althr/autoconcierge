'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Warehouse, Wallet, User, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

export default function DashboardNavbar() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', href: '/dashboard', icon: Home, exact: true },
        { label: 'Market', href: '/dashboard/market', icon: Car },
        { label: 'Garage', href: '/dashboard/garage', icon: Warehouse },
        { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
        { label: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    return (
        <>
            {/* Desktop Top Navbar & Mobile Top Header */}
            <header className="fixed top-0 left-0 w-full bg-white/40 backdrop-blur-2xl border-b border-white/10 z-[999] md:sticky">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-center relative">
                    {/* Desktop: Integrated Logo & Nav */}
                    <div className="hidden md:flex items-center bg-white/60 backdrop-blur-md rounded-full px-6 py-1.5 border border-white/40 shadow-xl shadow-slate-900/5">
                        <div className="flex items-center gap-1">
                            {navItems.slice(0, 2).map((item) => {
                                const Icon = item.icon;
                                const isActive = item.exact
                                    ? pathname === item.href
                                    : pathname?.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative flex items-center px-4 py-2.5 rounded-full transition-all duration-300 group ${isActive ? 'bg-burgundy text-white shadow-lg' : 'text-onyx-light hover:text-burgundy hover:bg-white'}`}
                                    >
                                        <Icon size={14} className="mr-2" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabPill"
                                                className="absolute inset-0 bg-burgundy rounded-full -z-10"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Middle Logo */}
                        <Link href="/dashboard" className="mx-10 flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
                            <Image
                                src="/autogaard-logo.png"
                                alt="Autogaard"
                                width={320}
                                height={80}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </Link>

                        <div className="flex items-center gap-1">
                            {navItems.slice(2).map((item) => {
                                const Icon = item.icon;
                                const isActive = item.exact
                                    ? pathname === item.href
                                    : pathname?.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative flex items-center px-4 py-2.5 rounded-full transition-all duration-300 group ${isActive ? 'bg-burgundy text-white shadow-lg' : 'text-onyx-light hover:text-burgundy hover:bg-white'}`}
                                    >
                                        <Icon size={14} className="mr-2" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabPill"
                                                className="absolute inset-0 bg-burgundy rounded-full -z-10"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mobile: Centered Logo Layout */}
                    <div className="md:hidden flex-1 flex justify-center">
                        <Link href="/dashboard">
                            <Image
                                src="/autogaard-logo.png"
                                alt="Autogaard"
                                width={240}
                                height={60}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Notification Alert Area - Far Right */}
                    <div className="absolute right-4 md:right-8">
                        <NotificationBell />
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl border-t border-gray-100 z-[999] pb-safe-bottom md:hidden shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex h-16 items-center justify-around px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname?.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center flex-1 h-full pt-1"
                            >
                                <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20 scale-110 -translate-y-1' : 'text-onyx-light'}`}>
                                    <Icon size={20} />
                                </div>
                                <span className={`text-[10px] font-black tracking-tight mt-1 transition-colors ${isActive ? 'text-burgundy' : 'text-onyx-light opacity-50'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Spacer for fixed top header on mobile */}
            <div className="h-16 md:hidden" />
        </>
    );
}
