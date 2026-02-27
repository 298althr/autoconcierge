'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Warehouse, Wallet, User } from 'lucide-react';
import { motion } from 'framer-motion';
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
            <header className="fixed top-0 left-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 z-50 md:sticky">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/dashboard" className="text-xl font-black text-burgundy tracking-tight">
                        AUTOGAARD
                    </Link>

                    {/* Desktop Nav Items */}
                    <div className="hidden md:flex items-center gap-2 h-full">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname?.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative flex items-center px-4 h-16 transition-all duration-300 group ${isActive ? 'text-burgundy' : 'text-onyx-light hover:text-onyx'}`}
                                >
                                    <Icon size={18} className="mr-2" />
                                    <span className="text-sm font-bold">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute bottom-0 left-0 w-full h-[3px] bg-burgundy"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                        <div className="ml-4 pl-4 border-l border-gray-100">
                            <NotificationBell />
                        </div>
                    </div>

                    {/* Mobile Only Notification Bell */}
                    <div className="md:hidden">
                        <NotificationBell />
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl border-t border-gray-100 z-50 pb-safe-bottom md:hidden shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.1)]">
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
