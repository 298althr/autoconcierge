'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, User, LogOut, Wallet, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Inventory', href: '/vehicles' },
        { name: 'Auctions', href: '/vehicles?status=in_auction' },
        { name: 'Valuation', href: '/valuation' },
    ];

    return (
        <nav
            className={clsx(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full flex justify-center',
                isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-surface-200 shadow-sm' : 'bg-transparent'
            )}
        >
            <div className="w-full max-w-[1600px] px-6 h-20 flex items-center justify-between">
                {/* Logo Image instead of Text */}
                <Link href="/" className="flex items-center group flex-shrink-0">
                    <Image
                        src="/logo.png"
                        alt="Autogaard"
                        width={200}
                        height={40}
                        className="object-contain hover:opacity-80 transition-opacity"
                        priority
                    />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-content-primary hover:text-burgundy font-medium transition-colors text-[13px] uppercase tracking-wider block"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link href="/wallet" className="flex items-center space-x-2 bg-surface-50 border border-surface-200 px-4 py-2 rounded-xl group hover:border-burgundy-light transition-all text-content-primary">
                                    <Wallet size={18} className="text-burgundy" />
                                    <span className="text-sm font-bold">₦ {user.wallet_balance?.toLocaleString() || '0'}</span>
                                </Link>
                                <Link href="/profile" className="flex items-center space-x-2 text-content-primary hover:text-burgundy transition-colors">
                                    <User size={18} />
                                    <span className="text-sm font-bold hidden lg:block">{user.display_name || 'Profile'}</span>
                                </Link>
                                <button onClick={logout} className="text-content-secondary hover:text-burgundy transition-colors">
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-content-primary hover:text-burgundy text-[13px] font-bold uppercase tracking-wider transition-colors block">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary text-[13px] uppercase tracking-wider py-2.5">
                                    Join
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-content-primary"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-surface-200 p-6 space-y-4 shadow-xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block text-content-primary text-xl font-bold uppercase"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <hr className="border-surface-200" />
                    {user ? (
                        <>
                            <Link href="/profile" className="block text-burgundy text-xl font-bold uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                                My Profile
                            </Link>
                            <button onClick={logout} className="block text-content-secondary text-xl font-bold uppercase">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col space-y-4 pt-2">
                            <Link href="/login" className="text-content-primary text-xl font-bold uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                                Login
                            </Link>
                            <Link href="/register" className="bg-burgundy text-white py-4 rounded-xl text-center font-bold text-lg shadow-md uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
