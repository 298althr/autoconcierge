'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative bg-[#F8FAFC] border border-slate-200/60 rounded-[2.5rem] p-10 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
        >
            <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-burgundy shadow-sm border border-slate-100 mb-8 group-hover:scale-110 group-hover:bg-burgundy group-hover:text-white transition-all duration-500">
                    {icon}
                </div>
                <h3 className="text-2xl font-heading font-extrabold text-slate-900 mb-4 tracking-tight">
                    {title}
                </h3>
                <p className="text-slate-500 font-body leading-relaxed text-sm">
                    {description}
                </p>
            </div>

            {/* Subtle Gradient Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-burgundy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
};

export default FeatureCard;
