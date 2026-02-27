'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    FileText,
    ShieldCheck,
    Truck,
    Zap,
    Paintbrush,
    Wrench,
    History,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const hubs = [
    {
        id: 'diagnostics',
        title: 'Diagnostics Hub',
        description: 'Engine scans, 120-point inspections, and VIN history audits.',
        icon: Activity,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        link: '/dashboard/garage/services/diagnostics'
    },
    {
        id: 'registration',
        title: 'Registration Vault',
        description: 'License renewal, ownership transfer, and plate management.',
        icon: FileText,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        link: '/dashboard/garage/services/registration'
    },
    {
        id: 'insurance',
        title: 'Insurance & Protection',
        description: 'Comprehensive coverage, third-party plans, and add-ons.',
        icon: ShieldCheck,
        color: 'text-burgundy',
        bg: 'bg-burgundy/5',
        link: '/dashboard/garage/services/insurance'
    },
    {
        id: 'logistics',
        title: 'Logistics & Haulage',
        description: 'Customs duty calculator, port clearing, and interstate transport.',
        icon: Truck,
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        link: '/dashboard/garage/services/logistics'
    },
    {
        id: 'performance',
        title: 'Performance & Upgrade',
        description: 'CNG conversions, security tech, and AC optimization.',
        icon: Zap,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        link: '/dashboard/garage/services/performance'
    },
    {
        id: 'refurbishment',
        title: 'Refurbishment Lab',
        description: 'Professional paint services, detailing, and restoration.',
        icon: Paintbrush,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        link: '/dashboard/garage/services/refurbishment'
    }
];

export default function WorkshopHubs() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {hubs.map((hub, index) => (
                <motion.div
                    key={hub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                >
                    <Link href={hub.link}>
                        <div className="glass-card group relative p-5 md:p-6 h-full border border-slate-100 hover:border-burgundy/20 hover:shadow-2xl hover:shadow-burgundy/5 transition-all duration-300 flex flex-col items-center text-center overflow-hidden active:scale-95 !bg-white">
                            <div className={`w-12 h-12 md:w-14 md:h-14 ${hub.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-black/5`}>
                                <hub.icon size={24} className={hub.color} />
                            </div>

                            <h3 className="text-sm md:text-base font-heading font-extrabold text-slate-900 mb-2 leading-tight tracking-tight uppercase">
                                {hub.title}
                            </h3>

                            <p className="text-[10px] md:text-xs text-slate-500 leading-tight font-medium mb-4">
                                {hub.description}
                            </p>

                            <div className="mt-auto flex items-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-burgundy group-hover:gap-2 transition-all">
                                <span>Deploy Protocol</span>
                                <Wrench size={12} className="opacity-0 group-hover:opacity-100 transition-all ml-1" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}

            {/* Service History Shortcut - Compact Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: hubs.length * 0.03 }}
            >
                <Link href="/dashboard/garage/services/history">
                    <div className="bg-slate-900 rounded-[2rem] p-5 md:p-6 h-full flex flex-col items-center justify-center text-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 border border-slate-800">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                            <History size={24} className="text-white" />
                        </div>
                        <h3 className="text-sm md:text-base font-heading font-bold text-white mb-2 uppercase tracking-tight">Dossier</h3>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-tight">Past interventions & health scores.</p>
                        <div className="mt-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/60 flex items-center">
                            Archive <ChevronRight size={10} className="ml-1" />
                        </div>
                    </div>
                </Link>
            </motion.div>
        </div>
    );
}
