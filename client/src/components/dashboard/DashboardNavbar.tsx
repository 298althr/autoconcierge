'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Warehouse, Wallet, User } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe-bottom md:sticky md:top-0 md:border-t-0 md:border-b md:pb-0 shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.08)] md:shadow-sm">
            <div className="max-w-7xl mx-auto px-1 md:px-8">
                {/* Brand & Nav Container */}
                <div className="flex md:h-16 h-16 items-center justify-between">

                    {/* Brand Logo (Visible only on Desktop) */}
                    <div className="hidden md:flex items-center shrink-0">
                        <Link href="/dashboard" className="text-xl font-black text-burgundy tracking-tight">
                            AUTOGAARD
                        </Link>
                    </div>

                    {/* Nav Items - Mobile Bottom Bar / Desktop Top Bar */}
                    <div className="flex-1 flex justify-around md:justify-end md:gap-4 h-full items-center">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname?.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative flex-1 md:flex-none h-full"
                                >
                                    <div
                                        className={`flex flex-col md:flex-row items-center justify-center h-full space-y-1 md:space-y-0 md:space-x-2 px-2 md:px-4 transition-all duration-300 group ${isActive
                                            ? 'text-burgundy'
                                            : 'text-onyx-light hover:text-onyx'
                                            }`}
                                    >
                                        <div className="relative">
                                            <Icon
                                                size={20}
                                                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-active:scale-90'}`}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabDot"
                                                    className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-burgundy rounded-full md:hidden"
                                                />
                                            )}
                                        </div>
                                        <span className={`text-[9px] md:text-sm font-black tracking-tight md:tracking-wide uppercase md:capitalize transition-colors ${isActive ? 'text-burgundy' : 'text-onyx-light'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute bottom-0 left-0 w-full h-[2px] bg-burgundy hidden md:block"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
