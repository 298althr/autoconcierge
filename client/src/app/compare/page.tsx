'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Plus, X, ArrowRight, Zap, Info, ArrowLeftRight, Trash2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MotionBackground from '@/components/landing/MotionBackground';
import PillHeader from '@/components/landing/PillHeader';
import PremiumButton from '@/components/ui/PremiumButton';
import Image from 'next/image';
import Link from 'next/link';

interface Vehicle {
    id: number;
    make: string;
    model: string;
    year_start: number;
    year_end: number;
    photos: string[];
    engines: any[];
    description?: string;
    press_release?: string;
}

export default function ComparePage() {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        // Load initial comparison IDs from URL if any
        const params = new URLSearchParams(window.location.search);
        const ids = params.get('ids');
        if (ids) {
            setSelectedIds(ids.split(',').map(Number));
        }

        // Fetch brands for search
        apiFetch('/catalog/brands').then(res => {
            if (res.data) setBrands(res.data);
        });
    }, []);

    useEffect(() => {
        if (selectedIds.length > 0) {
            fetchComparisonData();
        } else {
            setVehicles([]);
        }

        // Update URL
        const url = new URL(window.location.href);
        if (selectedIds.length > 0) {
            url.searchParams.set('ids', selectedIds.join(','));
        } else {
            url.searchParams.delete('ids');
        }
        window.history.replaceState({}, '', url.toString());
    }, [selectedIds]);

    const fetchComparisonData = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/catalog/compare?ids=${selectedIds.join(',')}`);
            if (res.data) {
                setVehicles(res.data);
                // Sync selectedIds with found vehicles to remove dead IDs from URL
                const foundIds = res.data.map((v: Vehicle) => v.id);
                if (foundIds.length !== selectedIds.length) {
                    setSelectedIds(foundIds);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Re-using models endpoint or similar if it supports search
            // For now, let's assume we might need a search endpoint
            // Or just fetch some models
            const res = await apiFetch(`/catalog/models?q=${query}`);
            if (res.data) setSearchResults(res.data.slice(0, 10));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const addVehicle = (id: number) => {
        if (selectedIds.length >= 4) return;
        if (selectedIds.includes(id)) return;
        setSelectedIds([...selectedIds, id]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeVehicle = (id: number) => {
        setSelectedIds(selectedIds.filter(v => v !== id));
    };

    const clearMatrix = () => {
        setSelectedIds([]);
    };

    const shareComparison = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        // Could use a toast here if available
        alert('Comparison link copied to clipboard!');
    };

    const renderSpecRow = (label: string, field: string, engineIdx: number = 0) => {
        return (
            <div className="grid grid-cols-[150px_1fr] md:grid-cols-[200px_repeat(auto-fit,minmax(150px,1fr))] border-b border-slate-100/50 py-5 items-center group/row hover:bg-slate-50/50 transition-colors">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">{label}</div>
                <div className="flex gap-4 col-span-1 md:col-span-full ml-[150px] md:ml-0 px-4">
                    {vehicles.map(v => {
                        const engine = v.engines[engineIdx] || {};
                        const specs = engine.specs || {};
                        const val = field.split('.').reduce((o, i) => o?.[i], specs) || '—';
                        return (
                            <div key={v.id} className="flex-1 text-sm font-subheading font-semibold text-slate-700 min-w-[150px] px-2 py-1 rounded-lg group-hover/row:bg-white transition-all">
                                {val}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center space-x-2 bg-burgundy/10 px-4 py-2 rounded-full mb-6"
                    >
                        <ArrowLeftRight size={14} className="text-burgundy" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy">Comparison Protocol</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-slate-900 mb-4">
                        Vehicle Comparison.
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto font-subheading">
                        Select up to 4 vehicles to side-by-side analyze performance, architecture, and value liquidity.
                    </p>
                </div>

                {/* Selection Bar */}
                <div className="flex flex-wrap gap-4 mb-12 justify-center items-stretch">
                    {vehicles.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={shareComparison}
                                className="h-1/2 px-4 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-burgundy hover:border-burgundy/20 transition-all flex items-center justify-center"
                                title="Share Comparison"
                            >
                                <Share2 size={16} />
                            </button>
                            <button
                                onClick={clearMatrix}
                                className="h-1/2 px-4 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center"
                                title="Clear All"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}

                    {vehicles.map(v => (
                        <motion.div
                            key={v.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border-2 border-burgundy/20 rounded-2xl p-4 flex items-center space-x-4 shadow-sm"
                        >
                            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
                                {v.photos && v.photos.length > 0 ? (
                                    <Image src={v.photos[0]} alt={v.model} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Zap size={16} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{v.make}</p>
                                <p className="text-sm font-heading font-bold text-slate-900">{v.model}</p>
                            </div>
                            <button
                                onClick={() => removeVehicle(v.id)}
                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}

                    {selectedIds.length < 4 && (
                        <div className="relative group">
                            <div className="flex bg-white border-2 border-dashed border-slate-200 hover:border-burgundy/40 rounded-2xl transition-all h-full min-w-[250px]">
                                <input
                                    type="text"
                                    placeholder="Search Model to Add..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="bg-transparent px-6 py-4 outline-none w-full text-sm font-subheading font-medium"
                                />
                                <div className="px-4 flex items-center text-slate-300 group-hover:text-burgundy/40">
                                    <Plus size={20} />
                                </div>
                            </div>

                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                    >
                                        {searchResults.map((res: any) => (
                                            <button
                                                key={res.id}
                                                onClick={() => addVehicle(res.id)}
                                                className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center space-x-4 transition-colors border-b last:border-0 border-slate-50"
                                            >
                                                <div className="w-12 h-8 bg-slate-100 rounded-lg overflow-hidden relative shrink-0 border border-slate-200">
                                                    {(() => {
                                                        let photoUrl = '';
                                                        if (res.photos) {
                                                            try {
                                                                const p = typeof res.photos === 'string' && res.photos.startsWith('[')
                                                                    ? JSON.parse(res.photos)
                                                                    : res.photos.split(',');
                                                                photoUrl = Array.isArray(p) ? p[0] : p;
                                                            } catch (e) { photoUrl = res.photos; }
                                                        }
                                                        return photoUrl ? (
                                                            <Image src={photoUrl} alt={res.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <Zap size={12} />
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        {res.brand_name || brands.find(b => b.id === res.brand_id)?.name}
                                                    </span>
                                                    <span className="text-sm font-heading font-bold text-slate-900">{res.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Comparison Grid */}
                {vehicles.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card overflow-hidden"
                    >
                        {/* Header Row */}
                        <div className="grid grid-cols-[150px_1fr] md:grid-cols-[200px_repeat(auto-fit,minmax(150px,1fr))] bg-slate-900/5 items-stretch border-b border-slate-200">
                            <div className="p-6 md:p-8 flex flex-col justify-end">
                                <h3 className="text-slate-900 font-heading font-bold text-lg">Identity</h3>
                            </div>
                            <div className="flex gap-4 ml-[150px] md:ml-0 overflow-x-auto md:overflow-visible no-scrollbar">
                                {vehicles.map(v => (
                                    <div key={v.id} className="flex-1 min-w-[150px] p-6 md:p-8 border-l border-slate-200/50 bg-white/50 backdrop-blur-sm">
                                        <div className="aspect-[16/9] bg-slate-100 rounded-xl mb-6 overflow-hidden relative border border-slate-200 shadow-sm">
                                            {v.photos && v.photos.length > 0 ? (
                                                <Image src={v.photos[0]} alt={v.model} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Zap size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy mb-1">{v.make}</p>
                                        <h4 className="text-xl md:text-2xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">{v.model}</h4>
                                        <p className="text-xs font-subheading font-bold text-slate-400 mt-2">{v.year_start} — {v.year_end || 'Present'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Specifications List */}
                        <div className="p-6 md:p-12 space-y-12">
                            <div>
                                <h5 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">
                                    <Zap size={14} className="text-burgundy" />
                                    <span>Core Architecture</span>
                                </h5>
                                {renderSpecRow('Engine Variant', 'name')}
                                {renderSpecRow('Configuration', 'Engine Specs.Cylinders:')}
                                {renderSpecRow('Displacement', 'Engine Specs.Displacement:')}
                                {renderSpecRow('Power Output', 'Engine Specs.Power:')}
                                {renderSpecRow('Peak Torque', 'Engine Specs.Torque:')}
                            </div>

                            <div>
                                <h5 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">
                                    <Info size={14} className="text-burgundy" />
                                    <span>Transmission & Drive</span>
                                </h5>
                                {renderSpecRow('Gearbox', 'Transmission Specs.Gearbox:')}
                                {renderSpecRow('Drive Type', 'Transmission Specs.Drive Type:')}
                            </div>

                            <div>
                                <h5 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">
                                    <Info size={14} className="text-burgundy" />
                                    <span>Narrative & Press Release</span>
                                </h5>
                                <div className="grid grid-cols-[150px_1fr] md:grid-cols-[200px_repeat(auto-fit,minmax(150px,1fr))] border-b border-slate-100/50 py-5 items-start group/row hover:bg-slate-50/50 transition-colors">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4 py-2">Deep Description</div>
                                    <div className="flex gap-4 col-span-1 md:col-span-full ml-[150px] md:ml-0 px-4">
                                        {vehicles.map(v => (
                                            <div key={v.id} className="flex-1 text-[11px] leading-relaxed font-subheading text-slate-500 min-w-[150px] px-2 py-4 rounded-lg group-hover/row:bg-white transition-all max-h-48 overflow-y-auto custom-scrollbar">
                                                {v.description || 'No descriptive data available.'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-[150px_1fr] md:grid-cols-[200px_repeat(auto-fit,minmax(150px,1fr))] border-b border-slate-100/50 py-5 items-start group/row hover:bg-slate-50/50 transition-colors">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4 py-2">Press Release</div>
                                    <div className="flex gap-4 col-span-1 md:col-span-full ml-[150px] md:ml-0 px-4">
                                        {vehicles.map(v => (
                                            <div key={v.id} className="flex-1 text-[11px] leading-relaxed font-subheading text-slate-400 italic min-w-[150px] px-2 py-4 rounded-lg group-hover/row:bg-white transition-all max-h-48 overflow-y-auto custom-scrollbar" dangerouslySetInnerHTML={{ __html: v.press_release || 'No press release recorded.' }}>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 justify-center">
                            {vehicles.map(v => (
                                <Link key={v.id} href={`/valuation?make=${v.make}&model=${v.model}`}>
                                    <PremiumButton variant="outline" className="bg-white" icon={ArrowRight}>
                                        Value My {v.model}
                                    </PremiumButton>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <ArrowLeftRight size={32} />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">Comparison Matrix Empty.</h2>
                        <p className="text-slate-500 font-subheading">Use the search protocol above to begin side-by-side analysis.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
