'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Upload,
    Camera,
    MapPin,
    Info,
    Zap,
    Sparkles,
    ShieldCheck,
    AlertCircle,
    Trash2,
    CheckCircle2,
    Loader2,
    Plus,
    Car,
    ArrowRight,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, getAssetUrl } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const STEPS = [
    { id: 'identity', title: 'Identity', description: 'Vehicle identification' },
    { id: 'specs', title: 'Specifications', description: 'Technical details' },
    { id: 'condition', title: 'Condition', description: 'Usage & Health' },
    { id: 'media', title: 'Media', description: 'Visual assets' },
    { id: 'location', title: 'Market', description: 'Value & Logistics' },
    { id: 'summary', title: 'Confirm', description: 'Review & Register' }
];

export default function ValuationWizard() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        trim: '',
        catalog_id: null as number | null,
        vin: '',
        color: '',
        transmission: 'automatic',
        mileage_km: 0,
        condition: 'good',
        location: '',
        price: 0,
        images: [] as string[],
        fuel_type: 'Gasoline',
        body_type: 'Sedan'
    });

    // Catalog State
    const [brands, setBrands] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [engines, setEngines] = useState<any[]>([]);
    const [selectingMakeId, setSelectingMakeId] = useState<string | null>(null);
    const [selectingModelId, setSelectingModelId] = useState<string | null>(null);

    // Valuation Result
    const [valuation, setValuation] = useState<any>(null);
    const [isValuing, setIsValuing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        apiFetch('/catalog/brands').then(res => {
            if (res.data) setBrands(res.data);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectingMakeId) return;
        setModels([]);
        setEngines([]);
        apiFetch(`/catalog/models?makeId=${selectingMakeId}`).then(res => {
            if (res.data) setModels(res.data);
        }).catch(console.error);
    }, [selectingMakeId]);

    useEffect(() => {
        if (!selectingModelId) return;
        setEngines([]);
        apiFetch(`/catalog/engines?modelId=${selectingModelId}`).then(res => {
            if (res.data) setEngines(res.data);
        }).catch(console.error);
    }, [selectingModelId]);

    const nextStep = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePredictValuation = async () => {
        setIsValuing(true);
        try {
            const res = await apiFetch('/valuation/predict', {
                method: 'POST',
                body: {
                    make: formData.make,
                    model: formData.model,
                    year: formData.year,
                    trim: formData.trim,
                    mileage_km: formData.mileage_km,
                    condition: formData.condition,
                    transmission: formData.transmission
                }
            });
            setValuation(res.data);
            setFormData(prev => ({ ...prev, price: res.data.estimated_value }));
        } catch (err: any) {
            console.error('Valuation failed', err);
        } finally {
            setIsValuing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);
        const uploadFormData = new FormData();
        Array.from(files).forEach(file => uploadFormData.append('images', file));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/upload/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadFormData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...data.urls]
                }));
            }
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch('/vehicles', {
                method: 'POST',
                token,
                body: {
                    ...formData,
                    owner_id: user?.id,
                    status: 'available'
                }
            });
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard/garage');
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register vehicle');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-4xl font-heading font-extrabold text-slate-900 mb-4 tracking-tighter italic">Vault Locked.</h1>
                    <p className="text-slate-500 font-subheading mb-8">Your vehicle has been securely registered to your private garage.</p>
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                        <Loader2 className="animate-spin" size={14} />
                        <span>Redirecting to Workshop...</span>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen bg-[#F8FAFC] overflow-x-hidden pt-12 pb-32 px-6">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/dashboard/garage" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Exit Protocol</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex gap-1">
                            {STEPS.map((s, i) => (
                                <div key={s.id} className="flex items-center">
                                    <div className={`w-8 h-1 rounded-full ${step >= i ? 'bg-burgundy' : 'bg-slate-200'}`} />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-burgundy">Step {step + 1}/{STEPS.length}</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-card p-8 md:p-16"
                    >
                        {/* Identity Step */}
                        {step === 0 && (
                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                        <Car size={14} />
                                        <span>Identity Matrix</span>
                                    </div>
                                    <h2 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight italic">What are we registering?</h2>
                                    <p className="text-slate-400 text-sm font-subheading mt-2">Select your vehicle from the global catalog.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="premium-label">Manufacturer</label>
                                        <select
                                            value={selectingMakeId || ''}
                                            onChange={e => {
                                                const id = e.target.value;
                                                setSelectingMakeId(id);
                                                setFormData(prev => ({ ...prev, make: brands.find(b => b.id.toString() === id)?.name || '' }));
                                                setSelectingModelId(null);
                                            }}
                                            className="premium-input"
                                        >
                                            <option value="">Select Brand</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label">Model Line</label>
                                        <select
                                            value={selectingModelId || ''}
                                            onChange={e => {
                                                const id = e.target.value;
                                                setSelectingModelId(id);
                                                const model = models.find(m => m.id.toString() === id);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    model: model?.name || '',
                                                    catalog_id: model?.id || null
                                                }));
                                            }}
                                            className="premium-input"
                                            disabled={!selectingMakeId}
                                        >
                                            <option value="">Select Model</option>
                                            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label">Production Year</label>
                                        <select
                                            value={formData.year}
                                            onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                            className="premium-input"
                                        >
                                            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label">Trim / Edition</label>
                                        <select
                                            value={formData.trim}
                                            onChange={e => setFormData(prev => ({ ...prev, trim: e.target.value }))}
                                            className="premium-input"
                                            disabled={!selectingModelId}
                                        >
                                            <option value="">Standard / Select Trim</option>
                                            {engines.map(en => <option key={en.id} value={en.name}>{en.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end">
                                    <PremiumButton onClick={nextStep} disabled={!formData.make || !formData.model} icon={ChevronRight}>
                                        Technical Specs
                                    </PremiumButton>
                                </div>
                            </div>
                        )}

                        {/* Specs Step */}
                        {step === 1 && (
                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                        <Zap size={14} />
                                        <span>Technical Protocol</span>
                                    </div>
                                    <h2 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight italic">Precision Details.</h2>
                                    <p className="text-slate-400 text-sm font-subheading mt-2">Differentiate your specific asset from the standard catalog.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="premium-label">VIN (Chassis Number)</label>
                                        <input
                                            type="text"
                                            placeholder="17-Digit Identifier"
                                            value={formData.vin}
                                            onChange={e => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                                            className="premium-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label">Exterior Color</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Fuji White"
                                            value={formData.color}
                                            onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                            className="premium-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label">Transmission</label>
                                        <div className="flex gap-4">
                                            {['automatic', 'manual'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setFormData(prev => ({ ...prev, transmission: t }))}
                                                    className={`flex-1 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${formData.transmission === t ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-gray-50 text-slate-400 border-gray-100'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label">Fuel Architecture</label>
                                        <select
                                            value={formData.fuel_type}
                                            onChange={e => setFormData(prev => ({ ...prev, fuel_type: e.target.value }))}
                                            className="premium-input"
                                        >
                                            <option value="Gasoline">Gasoline / Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Hybrid">Hybrid (HEV/PHEV)</option>
                                            <option value="Electric">Pure Electric (BEV)</option>
                                            <option value="CNG">Compressed Natural Gas (CNG)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between">
                                    <PremiumButton variant="outline" onClick={prevStep}>Back</PremiumButton>
                                    <PremiumButton onClick={nextStep} icon={ChevronRight}>
                                        Condition & Mileage
                                    </PremiumButton>
                                </div>
                            </div>
                        )}

                        {/* Condition Step */}
                        {step === 2 && (
                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                        <Activity size={14} />
                                        <span>Health Assessment</span>
                                    </div>
                                    <h2 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight italic">Operational State.</h2>
                                    <p className="text-slate-400 text-sm font-subheading mt-2">Accurate condition mapping ensures liquidation liquidity.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="premium-label ml-0">Total Distance (Kilometers)</label>
                                        <input
                                            type="number"
                                            value={formData.mileage_km}
                                            onChange={e => setFormData(prev => ({ ...prev, mileage_km: parseInt(e.target.value) }))}
                                            className="w-full text-5xl font-heading font-extrabold bg-transparent border-b-2 border-slate-100 focus:border-burgundy outline-none pb-4 transition-colors tracking-tighter"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['excellent', 'good', 'fair', 'poor'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setFormData(prev => ({ ...prev, condition: c }))}
                                                className={`p-6 rounded-3xl border text-left transition-all ${formData.condition === c ? 'bg-white border-burgundy shadow-2xl shadow-burgundy/10 ring-4 ring-burgundy/5' : 'bg-gray-50 border-gray-100 text-slate-400'}`}
                                            >
                                                <h4 className="font-heading font-black uppercase tracking-widest text-sm mb-1">{c}</h4>
                                                <p className="text-[10px] font-medium italic">
                                                    {c === 'excellent' && 'Flawless aesthetic and mechanical state.'}
                                                    {c === 'good' && 'Standard wear, no critical defects.'}
                                                    {c === 'fair' && 'Evident wear, minor maintenance required.'}
                                                    {c === 'poor' && 'Significant restoration needed.'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between">
                                    <PremiumButton variant="outline" onClick={prevStep}>Back</PremiumButton>
                                    <PremiumButton onClick={nextStep} icon={ChevronRight}>
                                        Visual Protocol
                                    </PremiumButton>
                                </div>
                            </div>
                        )}

                        {/* Media Step */}
                        {step === 3 && (
                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                        <Camera size={14} />
                                        <span>Visual Validation</span>
                                    </div>
                                    <h2 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight italic">Evidence Submission.</h2>
                                    <p className="text-slate-400 text-sm font-subheading mt-2">High-fidelity imagery increases valuation confidence.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {formData.images.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden group">
                                            <img src={url} className="w-full h-full object-cover" alt={`Upload ${i}`} />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.length < 5 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-burgundy hover:text-burgundy transition-all bg-slate-50/50 group"
                                        >
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                {loading ? <Loader2 className="animate-spin" /> : <Plus />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Frame</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />

                                <div className="pt-8 flex justify-between">
                                    <PremiumButton variant="outline" onClick={prevStep}>Back</PremiumButton>
                                    <PremiumButton onClick={nextStep} icon={ChevronRight} disabled={formData.images.length === 0}>
                                        Market Valuation
                                    </PremiumButton>
                                </div>
                            </div>
                        )}

                        {/* Location & Pricing Step (Valuation) */}
                        {step === 4 && (
                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                        <MapPin size={14} />
                                        <span>Market Distribution</span>
                                    </div>
                                    <h2 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight italic">Pricing Strategy.</h2>
                                    <p className="text-slate-400 text-sm font-subheading mt-2">Determine local market positioning and suggested ask.</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <label className="premium-label">Operational Location</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Lekki, Lagos"
                                            value={formData.location}
                                            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            className="premium-input"
                                        />
                                    </div>

                                    {!valuation ? (
                                        <button
                                            onClick={handlePredictValuation}
                                            disabled={isValuing}
                                            className="w-full py-12 bg-slate-900 rounded-[3rem] text-white flex flex-col items-center gap-4 group transition-all hover:bg-black"
                                        >
                                            <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center group-hover:rotate-12 transition-transform">
                                                {isValuing ? <Loader2 className="animate-spin" size={32} /> : <Sparkles size={32} />}
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-xl font-heading font-extrabold italic tracking-tight">Generate AI Valuation.</h4>
                                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Runs Llama 3.3 Liquidity Scan</p>
                                            </div>
                                        </button>
                                    ) : (
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-burgundy text-white p-12 rounded-[3.5rem] shadow-2xl shadow-burgundy/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                                <Zap size={180} />
                                            </div>
                                            <div className="relative z-10 text-center">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4">Baseline Market Anchor</p>
                                                <h3 className="text-6xl font-heading font-extrabold italic tracking-tighter mb-4">₦{valuation.estimated_value.toLocaleString()}</h3>
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                    Confidence: {Math.round(valuation.confidence * 100)}%
                                                </div>

                                                <div className="mt-12 space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Your Portfolio Asset Valuation</label>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <span className="text-2xl font-heading font-extrabold">₦</span>
                                                        <input
                                                            type="number"
                                                            value={formData.price}
                                                            onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                                                            className="bg-transparent border-b-2 border-white/20 focus:border-white outline-none w-48 text-3xl font-heading font-extrabold text-center transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="pt-8 flex justify-between">
                                    <PremiumButton variant="outline" onClick={prevStep}>Back</PremiumButton>
                                    <PremiumButton onClick={nextStep} icon={ChevronRight} disabled={!formData.location}>
                                        Registry Summary
                                    </PremiumButton>
                                </div>
                            </div>
                        )}

                        {/* Summary Step */}
                        {step === 5 && (
                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                        <ShieldCheck size={14} />
                                        <span>Final Protocol</span>
                                    </div>
                                    <h2 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight italic">Vault Entry Review.</h2>
                                    <p className="text-slate-400 text-sm font-subheading mt-2">Confirm all data points before locking to your garage.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl">
                                            {formData.images.length > 0 && <img src={formData.images[0]} className="w-full h-full object-cover" alt="Primary" />}
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {formData.images.slice(1).map((link, i) => (
                                                <div key={i} className="aspect-square rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all border border-slate-100">
                                                    <img src={link} className="w-full h-full object-cover" alt="Extra" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{formData.year} {formData.make} {formData.model}</h3>
                                            <p className="text-[10px] font-black uppercase text-burgundy tracking-widest">{formData.trim || 'Standard Edition'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-6">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                                                <p className="text-xs font-bold text-slate-700 capitalize">{formData.condition}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mileage</p>
                                                <p className="text-xs font-bold text-slate-700">{formData.mileage_km.toLocaleString()} KM</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Transmission</p>
                                                <p className="text-xs font-bold text-slate-700 capitalize">{formData.transmission}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                                <p className="text-xs font-bold text-slate-700">{formData.location}</p>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Vault Entry Valuation</p>
                                            <p className="text-3xl font-heading font-extrabold text-slate-900 italic">₦{formData.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}

                                <div className="pt-8 flex justify-between">
                                    <PremiumButton variant="outline" onClick={prevStep}>Edit Details</PremiumButton>
                                    <PremiumButton onClick={handleRegister} isLoading={loading} icon={ShieldCheck}>
                                        Secure Registration
                                    </PremiumButton>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
