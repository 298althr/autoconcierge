'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PremiumButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    isLoading?: boolean;
    disabled?: boolean;
    tooltip?: string;
    className?: string;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    icon: Icon,
    isLoading,
    disabled,
    tooltip,
    className = "",
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseStyles = "relative inline-flex items-center justify-center font-subheading font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10",
        secondary: "bg-burgundy text-white hover:bg-burgundy-light shadow-lg shadow-burgundy/20",
        outline: "bg-transparent border border-slate-200 text-slate-900 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
    };

    const sizes = {
        sm: "px-5 py-2.5 text-xs rounded-full",
        md: "px-8 py-3.5 text-sm rounded-full",
        lg: "px-10 py-5 text-base rounded-full"
    };

    return (
        <div className="relative inline-block">
            <motion.button
                type={type}
                onClick={onClick}
                disabled={disabled || isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            >
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        {children}
                        {Icon && <Icon size={18} className="transition-transform group-hover:translate-x-1" />}
                    </div>
                )}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
                {tooltip && isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg whitespace-nowrap z-[100] pointer-events-none"
                    >
                        {tooltip}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumButton;
