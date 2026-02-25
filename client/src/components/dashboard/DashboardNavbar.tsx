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
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 pb-safe md:sticky md:top-0 md:border-t-0 md:border-b md:pb-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] md:shadow-sm">
            <div className="max-w-7xl mx-auto px-2 md:px-8">
                {/* Desktop Version: Add logo on left, center tabs */}
                <div className="flex md:h-16 h-16 items-center justify-between">

                    {/* Brand Logo (Visible only on Desktop) */}
                    <div className="hidden md:flex items-center shrink-0">
                        <Link href="/dashboard" className="text-xl font-black text-burgundy tracking-tight">
                            AUTOGAARD
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <div className="flex-1 flex justify-around md:justify-end md:gap-8 h-full items-center">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Exact match for dashboard root, fuzzy match for children
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname?.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-3 md:px-4 py-2 rounded-xl transition-colors duration-200 group ${isActive
                                            ? 'text-burgundy'
                                            : 'text-onyx-light hover:text-onyx hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon
                                            size={22}
                                            className={`md:w-5 md:h-5 transition-transform duration-200 ${isActive ? 'scale-110 md:scale-100' : 'group-hover:scale-110 md:group-hover:scale-100'
                                                }`}
                                        />
                                        <span className={`text-[10px] md:text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-burgundy' : 'text-onyx-light group-hover:text-onyx'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
