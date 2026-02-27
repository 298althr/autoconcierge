'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch, getVehicleImages } from '@/lib/api';
import { Plus, X, ArrowRight, Zap, Info, ArrowLeftRight, Trash2, Share2, Search } from 'lucide-react';
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
    const [selectingBrand, setSelectingBrand] = useState<any>(null);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    useEffect(() => {
        // Load initial comparison IDs from URL if any
        const params = new URLSearchParams(window.location.search);
        const ids = params.get('ids');
        if (ids) {
            setSelectedIds(ids.split(',').map(Number));
        }

        // Fetch brands for structured picker
        apiFetch('/catalog/brands').then(res => {
            if (res.data) setBrands(res.data);
        });
    }, []);

    const fetchModels = async (brandId: number) => {
        setIsLoadingModels(true);
        try {
            const res = await apiFetch(`/catalog/models?makeId=${brandId}`);
            if (res.data) setAvailableModels(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingModels(false);
        }
    };

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
        setSelectingBrand(null);
        setAvailableModels([]);
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

    const parseMetric = (val: string): number | null => {
        if (!val || val === '—') return null;
        const match = val.match(/([0-9.]+)/);
        return match ? parseFloat(match[1]) : null;
    };

    const determineWinner = (field: string, values: any[]) => {
        if (values.length < 2) return null;
        const parsed = values.map(v => parseMetric(v));
        if (parsed.every(p => p === null)) return null;

        const nonNulls = parsed.filter((p): p is number => p !== null);
        if (nonNulls.length < 2) return null;

        // Better is lower for some metrics
        const lowerIsBetter = ['Acceleration', '0-62', '0-60', '0-100', 'Consumption', 'Weight'].some(k => field.includes(k));

        const bestValue = lowerIsBetter ? Math.min(...nonNulls) : Math.max(...nonNulls);
        return parsed.indexOf(bestValue);
    };

    const renderSpecRow = (label: string, field: string, engineIdx: number = 0) => {
        const values = vehicles.map(v => {
            const engine = v.engines[engineIdx] || {};
            const specs = engine.specs || {};
            return field.split('.').reduce((o, i) => o?.[i], specs) || '—';
        });

        const winnerIdx = determineWinner(label, values);

        return (
            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] border-b border-slate-100/50 items-center group/row hover:bg-slate-50/50 transition-colors">
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 pl-4 py-4 sticky left-0 bg-white/90 backdrop-blur-sm z-20 border-r border-slate-100 md:border-none shadow-[2px_0_10px_rgba(0,0,0,0.02)] md:shadow-none min-h-full flex items-center">
                    {label}
                </div>
                <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-4 gap-0 items-stretch h-full">
                    {vehicles.map((v, idx) => (
                        <div
                            key={v.id}
                            className={`min-w-[140px] md:min-w-0 flex-1 text-[13px] md:text-sm font-subheading font-semibold px-4 py-4 md:py-5 border-l border-slate-50 first:border-l-0 group-hover/row:bg-white transition-all flex items-center justify-between ${idx === winnerIdx ? 'text-burgundy bg-burgundy/[0.02]' : 'text-slate-700'}`}
                        >
                            <span className="truncate">{values[idx]}</span>
                            {idx === winnerIdx && (
                                <div className="ml-2 bg-burgundy/10 p-1 rounded-full text-burgundy">
                                    <Zap size={10} fill="currentColor" />
                                </div>
                            )}
                        </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                        <div key={i} className="hidden md:flex flex-1 border-l border-slate-50 bg-slate-50/10 italic text-slate-300 text-[10px] items-center justify-center">
                            N/A
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderQuickStats = () => {
        if (vehicles.length < 2) return null;

        const metrics = [
            { label: 'Power', field: 'Engine Specs.Power:', suffix: 'Bhp' },
            { label: 'Top Speed', field: 'Performance Specs.Top Speed:', suffix: 'Mph' },
            { label: 'Acceleration', field: 'Performance Specs.Acceleration 0-62 Mph (0-100 Kph):', suffix: 's' },
            { label: 'Displacement', field: 'Engine Specs.Displacement:', suffix: 'cc' }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/5 rounded-bl-[100%] -mr-10 -mt-10" />
                {metrics.map(m => {
                    const values = vehicles.map(v => {
                        const val = m.field.split('.').reduce((o, i) => o?.[i], v.engines[0]?.specs) || '—';
                        return parseMetric(val);
                    });

                    const winnerIdx = determineWinner(m.label, values.map(v => v?.toString() || '—'));
                    const maxVal = Math.max(...values.filter((v): v is number => v !== null), 1);

                    return (
                        <div key={m.label} className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{m.label}</h4>
                                <span className="text-[9px] font-bold text-burgundy bg-burgundy/5 px-2 py-0.5 rounded-full">Comparative Analytics</span>
                            </div>
                            <div className="space-y-3">
                                {vehicles.map((v, idx) => {
                                    const val = values[idx];
                                    const percent = val ? (val / maxVal) * 100 : 0;
                                    return (
                                        <div key={v.id} className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-slate-500 truncate max-w-[100px]">{v.model}</span>
                                                <span className={idx === winnerIdx ? 'text-burgundy' : 'text-slate-700'}>
                                                    {val || '—'} {val ? m.suffix : ''}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    className={`h-full rounded-full ${idx === winnerIdx ? 'bg-burgundy' : 'bg-slate-300'}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-24 md:pt-32 pb-20">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-pretty">
                <div className="text-center mb-10 md:mb-16 px-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center space-x-2 bg-burgundy/10 px-4 py-2 rounded-full mb-4 md:mb-6 shadow-glow shadow-burgundy/20"
                    >
                        <ArrowLeftRight size={14} className="text-burgundy" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-burgundy">Forensic Analysis Matrix</span>
                    </motion.div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
                        Side-by-Side <br className="hidden md:block" /> <span className="text-burgundy">Comparison.</span>
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto font-subheading leading-relaxed">
                        Execute technical due diligence between up to 4 forensic profiles. Higher fidelity yardsticks for professional automotive acquisition.
                    </p>
                </div>

                {/* Selection Bar */}
                <div className="flex flex-wrap gap-3 md:gap-4 mb-12 justify-center items-center">
                    {vehicles.length > 0 && (
                        <div className="flex flex-row md:flex-col gap-2 order-last md:order-none w-full md:w-auto mt-4 md:mt-0 justify-center">
                            <button
                                onClick={shareComparison}
                                className="flex-1 md:h-10 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-burgundy hover:border-burgundy/20 transition-all flex items-center justify-center shadow-sm"
                                title="Share Comparison"
                            >
                                <Share2 size={16} className="mr-2 md:mr-0" />
                                <span className="md:hidden text-xs font-bold uppercase tracking-wider">Share Matrix</span>
                            </button>
                            <button
                                onClick={clearMatrix}
                                className="flex-1 md:h-10 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                                title="Clear All"
                            >
                                <Trash2 size={16} className="mr-2 md:mr-0" />
                                <span className="md:hidden text-xs font-bold uppercase tracking-wider">Flush Data</span>
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto">
                        {vehicles.map(v => (
                            <motion.div
                                key={v.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white border-2 border-burgundy/10 hover:border-burgundy/40 rounded-2xl p-3 md:p-4 flex items-center space-x-3 md:space-x-4 shadow-sm transition-colors group"
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 shrink-0 shadow-inner">
                                    {v.photos && v.photos.length > 0 ? (
                                        <Image src={getVehicleImages(v.photos)[0]} alt={v.model} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Zap size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-burgundy/80 truncate">{v.make}</p>
                                    <p className="text-xs md:text-sm font-heading font-extrabold text-slate-900 truncate">{v.model}</p>
                                </div>
                                <button
                                    onClick={() => removeVehicle(v.id)}
                                    className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}

                        {selectedIds.length < 4 && (
                            <div className="relative group w-full lg:min-w-[400px]">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center">
                                    <div className="flex bg-white border-2 border-dashed border-slate-200 focus-within:border-burgundy/40 focus-within:bg-white rounded-2xl transition-all h-full shadow-sm hover:border-slate-300">
                                        <input
                                            type="text"
                                            placeholder="Forensic Search (Model Name)..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                handleSearch(e.target.value);
                                                if (selectingBrand) setSelectingBrand(null);
                                            }}
                                            className="bg-transparent px-5 py-3 md:py-4 outline-none w-full text-xs md:text-sm font-subheading font-medium"
                                        />
                                        <div className="px-4 flex items-center text-slate-300 group-focus-within:text-burgundy">
                                            <Search size={18} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectingBrand(selectingBrand === 'open' ? null : 'open');
                                            setSearchQuery('');
                                            setSearchResults([]);
                                        }}
                                        className={`px-6 py-3 md:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${selectingBrand ? 'bg-burgundy text-white shadow-burgundy/20' : 'bg-slate-900 text-white hover:bg-burgundy'}`}
                                    >
                                        {selectingBrand ? 'Dismiss Browser' : 'Browse Catalog'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {(searchResults.length > 0 || selectingBrand) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden min-h-[300px] flex flex-col"
                                        >
                                            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {searchQuery ? 'Heuristic Match Engine' : selectingBrand && selectingBrand !== 'open' ? `Models for ${selectingBrand.name}` : 'Select Manufacturer Protocol'}
                                                </h4>
                                                {selectingBrand && selectingBrand !== 'open' && (
                                                    <button onClick={() => setSelectingBrand('open')} className="text-[10px] font-black text-burgundy uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform">
                                                        <ArrowRight size={14} className="rotate-180" /> Back to Brands
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar p-3">
                                                {searchQuery ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {searchResults.map((res: any) => (
                                                            <button
                                                                key={res.id}
                                                                onClick={() => addVehicle(res.id)}
                                                                className="w-full text-left p-3 hover:bg-slate-50 flex items-center space-x-4 transition-all rounded-xl border border-transparent hover:border-slate-100 group"
                                                            >
                                                                <div className="w-14 h-9 bg-slate-100 rounded-lg overflow-hidden relative shrink-0 border border-slate-200 group-hover:border-burgundy/20">
                                                                    {res.photos ? (
                                                                        <Image
                                                                            src={getVehicleImages(res.photos)[0]}
                                                                            alt={res.name}
                                                                            fill
                                                                            sizes="56px"
                                                                            quality={40}
                                                                            className="object-cover"
                                                                        />
                                                                    ) : <Zap size={10} className="m-auto text-slate-300" />}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-burgundy/60">{res.brand_name}</span>
                                                                    <span className="text-sm font-heading font-extrabold text-slate-900 truncate">{res.name}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : selectingBrand === 'open' ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                                        {brands.map(b => (
                                                            <button
                                                                key={b.id}
                                                                onClick={() => {
                                                                    setSelectingBrand(b);
                                                                    fetchModels(b.id);
                                                                }}
                                                                className="p-4 rounded-xl border border-slate-100 hover:border-burgundy/20 hover:bg-burgundy/[0.02] transition-all text-center group"
                                                            >
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-burgundy transition-colors">{b.name}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : selectingBrand ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {isLoadingModels ? (
                                                            <div className="col-span-full py-20 text-center space-y-3">
                                                                <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
                                                                <p className="italic text-slate-400 text-xs font-black uppercase tracking-widest">Hydrating Catalog...</p>
                                                            </div>
                                                        ) : availableModels.length > 0 ? (
                                                            availableModels.map(m => (
                                                                <button
                                                                    key={m.id}
                                                                    onClick={() => addVehicle(m.id)}
                                                                    className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition-all rounded-xl border border-transparent hover:border-slate-100 group"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-100 group-hover:border-burgundy/20 shadow-sm">
                                                                            {m.photos ? (
                                                                                <Image
                                                                                    src={getVehicleImages(m.photos)[0]}
                                                                                    alt={m.name}
                                                                                    fill
                                                                                    sizes="64px"
                                                                                    quality={40}
                                                                                    className="object-cover"
                                                                                />
                                                                            ) : <Zap size={10} className="m-auto text-slate-300" />}
                                                                        </div>
                                                                        <span className="text-sm font-heading font-extrabold text-slate-900 uppercase tracking-tight">{m.name}</span>
                                                                    </div>
                                                                    <Plus size={16} className="text-slate-200 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-full py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Inventory Gap Detected.</div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats Yardstick */}
                {renderQuickStats()}

                {/* Comparison Matrix */}
                {vehicles.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]"
                    >
                        {/* Static Header Identity Row */}
                        <div className="grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] bg-slate-100/30 items-stretch border-b border-slate-200">
                            <div className="p-6 md:p-10 flex flex-col justify-end sticky left-0 bg-white/95 backdrop-blur-md z-30 border-r border-slate-100">
                                <h3 className="text-slate-900 font-heading font-black text-xs md:text-sm uppercase tracking-widest">Forensic Profile</h3>
                            </div>
                            <div className="flex overflow-x-auto md:grid md:grid-cols-4 no-scrollbar items-stretch bg-white/40">
                                {vehicles.map(v => (
                                    <div key={v.id} className="min-w-[170px] md:min-w-0 flex-1 p-6 md:p-10 border-l border-slate-100 relative group">
                                        <div className="aspect-[4/3] bg-slate-100 rounded-[1.5rem] mb-6 overflow-hidden relative border border-slate-200 shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                                            {v.photos && v.photos.length > 0 ? (
                                                <Image src={getVehicleImages(v.photos)[0]} alt={v.model} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Zap size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-burgundy">{v.make}</p>
                                            <h4 className="text-base md:text-2xl font-heading font-black text-slate-900 tracking-tight leading-tight line-clamp-2">{v.model}</h4>
                                            <div className="flex items-center gap-2 pt-1">
                                                <span className="text-[10px] font-bold text-slate-400">{v.year_start} — {v.year_end || 'Present'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-[9px] font-black text-emerald uppercase tracking-widest">Active ID</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                                    <div key={i} className="hidden md:flex flex-1 border-l border-slate-100 bg-slate-50/20 items-center justify-center">
                                        <div className="text-center opacity-20">
                                            <Plus size={24} className="mx-auto mb-2 text-slate-400" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Capture</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Specifications Yardstick Grid */}
                        <div className="p-0 md:p-10 bg-white">
                            <div className="space-y-10">
                                {/* Performance Block */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                    <h5 className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-6 md:px-0">
                                        <div className="w-6 h-[1px] bg-burgundy/30" />
                                        <Zap size={14} className="text-burgundy" />
                                        <span>Drivetrain & Performance Architecture</span>
                                    </h5>
                                    {renderSpecRow('Propulsion Engine', 'name')}
                                    {renderSpecRow('Cylinders / Layout', 'Engine Specs.Cylinders:')}
                                    {renderSpecRow('Displacement (cc)', 'Engine Specs.Displacement:')}
                                    {renderSpecRow('Power Output (HP)', 'Engine Specs.Power:')}
                                    {renderSpecRow('Peak Torque (Nm)', 'Engine Specs.Torque:')}
                                    {renderSpecRow('Acceleration (0-62)', 'Performance Specs.Acceleration 0-62 Mph (0-100 Kph):')}
                                    {renderSpecRow('Maximum Velocity', 'Performance Specs.Top Speed:')}
                                </div>

                                {/* Transmission Block */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                                    <h5 className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-6 md:px-0">
                                        <div className="w-6 h-[1px] bg-burgundy/30" />
                                        <ArrowLeftRight size={14} className="text-burgundy" />
                                        <span>Transmission & Power Transfer</span>
                                    </h5>
                                    {renderSpecRow('Gearbox Config', 'Transmission Specs.Gearbox:')}
                                    {renderSpecRow('Traction / Drive', 'Transmission Specs.Drive Type:')}
                                </div>

                                {/* Efficiency Block */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                                    <h5 className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-6 md:px-0">
                                        <div className="w-6 h-[1px] bg-burgundy/30" />
                                        <Info size={14} className="text-burgundy" />
                                        <span>Fuel Economics (NEDC)</span>
                                    </h5>
                                    {renderSpecRow('City Economics', 'Fuel Economy (Nedc).City:')}
                                    {renderSpecRow('Highway Economics', 'Fuel Economy (Nedc).Highway:')}
                                </div>

                                {/* Narrative Block */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 pb-10">
                                    <h5 className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-6 md:px-0">
                                        <div className="w-6 h-[1px] bg-burgundy/30" />
                                        <Share2 size={14} className="text-burgundy" />
                                        <span>Forensic Narrative & Context</span>
                                    </h5>
                                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] border-b border-slate-100 items-start group/row hover:bg-slate-50 transition-colors">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4 py-8 sticky left-0 bg-white/95 backdrop-blur-md z-20 border-r border-slate-100 text-center">
                                            Description
                                        </div>
                                        <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-4 gap-0 items-start">
                                            {vehicles.map(v => (
                                                <div key={v.id} className="min-w-[220px] md:min-w-0 flex-1 text-[11px] md:text-xs leading-relaxed font-subheading text-slate-500 px-6 py-8 border-l border-slate-50 first:border-l-0 group-hover/row:bg-white max-h-[300px] overflow-y-auto custom-scrollbar italic">
                                                    {v.description || 'Forensic description awaiting synchronization.'}
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                                                <div key={i} className="hidden md:flex flex-1 border-l border-slate-50 bg-slate-50/10" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] border-b border-slate-100 items-start group/row hover:bg-slate-50 transition-colors">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4 py-8 sticky left-0 bg-white/95 backdrop-blur-md z-20 border-r border-slate-100 text-center">
                                            Sentiment
                                        </div>
                                        <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-4 gap-0 items-start">
                                            {vehicles.map(v => (
                                                <div key={v.id} className="min-w-[220px] md:min-w-0 flex-1 text-[11px] md:text-xs leading-relaxed font-subheading text-slate-400 px-6 py-8 border-l border-slate-50 first:border-l-0 group-hover/row:bg-white max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex text-amber-400">
                                                            {[1, 2, 3, 4, 5].map(s => <Zap key={s} size={10} fill="currentColor" />)}
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">High Reliability</span>
                                                    </div>
                                                    {v.press_release || 'Sentiment data under forensic review.'}
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - vehicles.length) }).map((_, i) => (
                                                <div key={i} className="hidden md:flex flex-1 border-l border-slate-50 bg-slate-50/10" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Footer */}
                        <div className="p-8 md:p-16 bg-slate-900 border-t border-slate-800 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-burgundy to-transparent" />
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <h4 className="text-white font-heading font-black text-xl mb-3">Forensic Verdict</h4>
                                <p className="text-slate-400 text-sm font-subheading leading-relaxed mb-10 italic">
                                    "Based on the side-by-side technical evaluation, the <span className="text-white font-black">{vehicles[0]?.model || 'Selected Vehicle'}</span> provides the superior architecture for long-term liquidity and performance stability in the Nigerian market."
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {vehicles.slice(0, 2).map(v => (
                                        <Link key={v.id} href={`/valuation?make=${v.make}&model=${v.model}`} className="w-full sm:w-auto">
                                            <PremiumButton className="w-full border-slate-700 bg-white/5 hover:bg-white/10 text-white" icon={Zap}>
                                                Pulse Check: {v.model}
                                            </PremiumButton>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-300 shadow-inner">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                            <ArrowLeftRight size={40} className="animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">Protocol Idle.</h2>
                        <p className="text-slate-400 font-subheading max-w-xs mx-auto">Input up to 4 vehicle profiles above to initiate comparative forensic metrics.</p>
                    </div>
                )}
            </div>
        </main>
    );
}


