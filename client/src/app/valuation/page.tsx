'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import MotionBackground from '@/components/landing/MotionBackground';
import PillHeader from '@/components/landing/PillHeader';
import PremiumButton from '@/components/ui/PremiumButton';

const STEPS = [
    { id: 'vehicle', title: 'Vehicle Info', description: 'What are you valuing?' },
    { id: 'condition', title: 'Condition', description: 'Be honest for best results' },
    { id: 'result', title: 'Estimation', description: 'AI-powered market analysis' }
];

export default function ValuationPage() {
    const { token } = useAuth();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        trim: '',
        year: 2020,
        transmission: 'automatic',
        mileage_km: 50000,
        year_of_entry: 2024,
        accident_history: false,
        condition: 'good'
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [brands, setBrands] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [engines, setEngines] = useState<any[]>([]);

    const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

    React.useEffect(() => {
        apiFetch('/catalog/brands').then(res => {
            if (res.data) setBrands(res.data);
        }).catch(console.error);
    }, []);

    React.useEffect(() => {
        if (!selectedMakeId) return;
        setModels([]);
        setEngines([]);
        setFormData(prev => ({ ...prev, model: '', trim: '' }));
        setSelectedModelId(null);
        apiFetch(`/catalog/models?makeId=${selectedMakeId}`).then(res => {
            if (res.data) setModels(res.data);
        }).catch(console.error);
    }, [selectedMakeId]);

    React.useEffect(() => {
        if (!selectedModelId) return;
        setEngines([]);
        setFormData(prev => ({ ...prev, trim: '' }));
        apiFetch(`/catalog/engines?modelId=${selectedModelId}`).then(res => {
            if (res.data) setEngines(res.data);
        }).catch(console.error);
    }, [selectedModelId]);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handlePredict = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiFetch('/valuation/predict', {
                method: 'POST',
                body: formData
            });
            setResult(response.data);
            nextStep();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-3xl mx-auto px-6 relative z-10">
                {/* Progress Header */}
                <div className="flex justify-between mb-16 relative">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center group">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: step >= i ? '#600018' : '#ffffff',
                                    borderColor: step >= i ? '#600018' : '#E2E8F0',
                                    color: step >= i ? '#ffffff' : '#94A3B8'
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 font-bold shadow-lg shadow-blurry"
                            >
                                {step > i ? <CheckCircle2 size={18} /> : i + 1}
                            </motion.div>
                            <span className={`mt-4 text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${step >= i ? 'text-burgundy' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card p-8 md:p-12 overflow-hidden relative"
                >
                    {step === 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-slate-900 mb-2">Identify your vehicle.</h2>
                                <p className="text-slate-500 text-sm font-subheading">Provide exact details for a forensic valuation.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="premium-label">Make</label>
                                    <select
                                        value={selectedMakeId || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setSelectedMakeId(val);
                                            const bName = brands.find(b => b.id.toString() === val)?.name || '';
                                            setFormData({ ...formData, make: bName });
                                        }}
                                        className="premium-input"
                                    >
                                        <option value="">Select Make</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="premium-label">Model</label>
                                    <select
                                        value={selectedModelId || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setSelectedModelId(val);
                                            const mName = models.find(m => m.id.toString() === val)?.name || '';
                                            setFormData({ ...formData, model: mName });
                                        }}
                                        className="premium-input"
                                        disabled={!selectedMakeId || models.length === 0}
                                    >
                                        <option value="">Select Model</option>
                                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="premium-label">Trim / Engine</label>
                                    <select
                                        value={formData.trim}
                                        onChange={e => setFormData({ ...formData, trim: e.target.value })}
                                        className="premium-input"
                                        disabled={!selectedModelId || engines.length === 0}
                                    >
                                        <option value="">Select Edition</option>
                                        {engines.map(e => (
                                            <option key={e.id} value={e.name}>
                                                {e.name} {e.specs?.['Engine Specs']?.['Displacement:'] ? `— ${e.specs['Engine Specs']['Displacement:']}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="premium-label">Year</label>
                                    <select value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="premium-input">
                                        {Array.from({ length: 30 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="premium-label">Transmission</label>
                                    <select value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })} className="premium-input">
                                        <option value="automatic">Automatic</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="premium-label">Mileage (KM)</label>
                                    <input type="number" value={formData.mileage_km} onChange={e => setFormData({ ...formData, mileage_km: parseInt(e.target.value) })} className="premium-input" />
                                </div>
                                <div>
                                    <label className="premium-label">Year of Entry to NG</label>
                                    <select value={formData.year_of_entry} onChange={e => setFormData({ ...formData, year_of_entry: parseInt(e.target.value) })} className="premium-input">
                                        {Array.from({ length: 11 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center space-x-3 pt-6 px-4">
                                    <input type="checkbox" id="accident_history" checked={formData.accident_history} onChange={e => setFormData({ ...formData, accident_history: e.target.checked })} className="w-5 h-5 accent-burgundy cursor-pointer rounded" />
                                    <label htmlFor="accident_history" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer">Has Accident History?</label>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end">
                                <PremiumButton onClick={nextStep} disabled={!formData.make || !formData.model} icon={ArrowRight} tooltip="Proceed to Condition Check">
                                    Assemble Profile
                                </PremiumButton>
                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-slate-900 mb-2">Current Condition.</h2>
                                <p className="text-slate-500 text-sm font-subheading">Precision affects liquidity matching.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {['excellent', 'good', 'fair', 'poor'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setFormData({ ...formData, condition: c })}
                                        className={`flex items-center justify-between p-6 rounded-2xl border transition-all text-left ${formData.condition === c ? 'border-burgundy bg-burgundy/5 shadow-md shadow-burgundy/10' : 'border-slate-200 bg-white hover:border-burgundy/30'}`}
                                    >
                                        <div>
                                            <p className="font-heading font-bold capitalize text-lg text-slate-900">{c}</p>
                                            <p className="text-xs font-body text-slate-500 mt-1">
                                                {c === 'excellent' && 'Like new, no mechanical or visual defects.'}
                                                {c === 'good' && 'Minor wear, well-maintained.'}
                                                {c === 'fair' && 'Visible wear, might need minor repairs.'}
                                                {c === 'poor' && 'Significant wear or mechanical issues.'}
                                            </p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.condition === c ? 'border-burgundy bg-burgundy' : 'border-slate-200'}`}>
                                            {formData.condition === c && <motion.div layoutId="checkdot" className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2 text-xs font-bold font-subheading">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <div className="flex gap-4 pt-6 justify-between">
                                <PremiumButton variant="ghost" onClick={prevStep} icon={ArrowLeft} tooltip="Return to Vehicle Info">Back</PremiumButton>
                                <PremiumButton onClick={handlePredict} isLoading={loading} icon={Sparkles} tooltip="Run ML Engine">
                                    Get Valuation Engine Result
                                </PremiumButton>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-10"
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 bg-slate-900/5 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <Sparkles size={24} />
                                </motion.div>
                                <h2 className="text-4xl font-heading font-extrabold mb-2 text-slate-900 tracking-tight">Market Protocol Complete.</h2>
                                <p className="text-slate-500 text-sm font-subheading">Analyzed real-time liquidity datasets.</p>
                            </div>

                            <div className="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-5 transition-transform group-hover:rotate-12 group-hover:scale-110">
                                    <Zap size={140} />
                                </div>
                                <div className="relative z-10 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-3">AI Engine Output ({result.source})</p>
                                    <p className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tighter">₦{result.estimated_value.toLocaleString()}</p>
                                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-50">Confidence: {Math.round(result.confidence * 100)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center shadow-inner">
                                <p className="text-sm text-slate-600 font-body leading-relaxed max-w-lg mx-auto italic">&quot;{result.reasoning}&quot;</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PremiumButton
                                    onClick={() => {
                                        sessionStorage.setItem('pending_listing', JSON.stringify({ ...formData, estimated_value: result.estimated_value }));
                                        window.location.href = token ? '/sell' : '/register?redirect=/sell';
                                    }}
                                    className="w-full"
                                    icon={Zap}
                                    tooltip="Initiate Escrow Protocol"
                                >
                                    Liquidate Asset at Price
                                </PremiumButton>
                                <PremiumButton variant="outline" onClick={() => setStep(0)} className="w-full" tooltip="Reset state">
                                    Reset Engine
                                </PremiumButton>
                            </div>
                        </motion.div>
                    )}

                </motion.div>
            </div>
        </main>
    );
}
