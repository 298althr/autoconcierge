'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Car,
    Gavel,
    Users,
    Wallet,
    ShieldCheck,
    FileText,
    TrendingUp,
    Settings
} from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
    { name: 'Auctions', href: '/admin/auctions', icon: Gavel },
    { name: 'Users / KYC', href: '/admin/users', icon: Users },
    { name: 'Wallet Approvals', href: '/admin/wallet', icon: Wallet },
    { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
];

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-onyx h-screen sticky top-0 flex flex-col pt-32 pb-8 px-4 border-r border-white/5">
            <div className="flex items-center space-x-3 px-4 mb-10">
                <div className="w-8 h-8 bg-burgundy rounded-lg flex items-center justify-center">
                    <ShieldCheck size={18} className="text-white" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">Control Center</span>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all group",
                                isActive
                                    ? "bg-burgundy text-white shadow-lg shadow-burgundy/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon size={18} className={clsx(
                                "transition-transform group-hover:scale-110",
                                isActive ? "text-white" : "text-white/20 group-hover:text-burgundy"
                            )} />
                            <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center space-x-2 text-burgundy mb-2">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">System Health</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40 font-bold">Uptime 99.9%</span>
                        <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </aside>
    );
};
