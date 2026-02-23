'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Base';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
        <div className="min-h-screen bg-canvas pb-20 pt-10">
            <div className="max-w-3xl mx-auto px-4">
                {/* Progress Header */}
                <div className="flex justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${step >= i ? 'bg-burgundy border-burgundy text-white' : 'bg-white border-gray-100 text-gray-400'
                                } transition-all duration-500 font-bold`}>
                                {step > i ? <CheckCircle2 size={18} /> : i + 1}
                            </div>
                            <span className={`mt-2 text-xs font-bold uppercase tracking-widest ${step >= i ? 'text-burgundy' : 'text-gray-400'
                                }`}>{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-50 overflow-hidden relative">

                    {step === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-3xl font-black">Identify your vehicle</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light">Make</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Toyota"
                                        value={formData.make}
                                        onChange={e => setFormData({ ...formData, make: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-burgundy outline-none border-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light">Model</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Camry"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-burgundy outline-none border-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light">Trim / Variant</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. XSE, XLE, SE"
                                        value={formData.trim}
                                        onChange={e => setFormData({ ...formData, trim: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-burgundy outline-none border-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light">Year</label>
                                    <select
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-burgundy outline-none border-none transition-all"
                                    >
                                        {Array.from({ length: 30 }, (_, i) => 2026 - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light">Transmission</label>
                                    <select
                                        value={formData.transmission}
                                        onChange={e => setFormData({ ...formData, transmission: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-burgundy outline-none border-none transition-all"
                                    >
                                        <option value="automatic">Automatic</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light">Mileage (KM)</label>
                                    <input
                                        type="number"
                                        value={formData.mileage_km}
                                        onChange={e => setFormData({ ...formData, mileage_km: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-burgundy outline-none border-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-onyx-light">Year of Entry to NG</label>
                                    <select
                                        value={formData.year_of_entry}
                                        onChange={e => setFormData({ ...formData, year_of_entry: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-burgundy outline-none border-none transition-all"
                                    >
                                        {Array.from({ length: 11 }, (_, i) => 2025 - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center space-x-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="accident_history"
                                        checked={formData.accident_history}
                                        onChange={e => setFormData({ ...formData, accident_history: e.target.checked })}
                                        className="w-5 h-5 accent-burgundy cursor-pointer"
                                    />
                                    <label htmlFor="accident_history" className="text-sm font-black uppercase tracking-widest text-onyx-light cursor-pointer">Has Accident History?</label>
                                </div>
                            </div>
                            <div className="pt-6">
                                <Button onClick={nextStep} className="w-full py-5 text-lg" disabled={!formData.make || !formData.model}>
                                    Continue <ArrowRight className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-3xl font-black">Current Condition</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {['excellent', 'good', 'fair', 'poor'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setFormData({ ...formData, condition: c })}
                                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${formData.condition === c ? 'border-burgundy bg-burgundy/5' : 'border-gray-100 hover:border-burgundy/30'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <p className="font-bold capitalize text-lg">{c}</p>
                                            <p className="text-sm text-onyx-light">
                                                {c === 'excellent' && 'Like new, no mechanical or visual defects.'}
                                                {c === 'good' && 'Minor wear, well-maintained.'}
                                                {c === 'fair' && 'Visible wear, might need minor repairs.'}
                                                {c === 'poor' && 'Significant wear or mechanical issues.'}
                                            </p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.condition === c ? 'border-burgundy bg-burgundy' : 'border-gray-200'
                                            }`}>
                                            {formData.condition === c && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2">
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-bold">{error}</span>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <Button variant="ghost" onClick={prevStep} className="flex-1 py-5">Back</Button>
                                <Button onClick={handlePredict} className="flex-[2] py-5 text-lg" disabled={loading}>
                                    {loading ? 'Analyzing...' : 'Get Valuation'} <Sparkles className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && result && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles size={40} />
                                </div>
                                <h2 className="text-4xl font-black mb-2">Estimation Ready</h2>
                                <p className="text-onyx-light font-medium">Predicted market value in Nigeria</p>
                            </div>

                            <div className="bg-onyx text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 scale-150 opacity-10 rotate-12">
                                    <Zap size={100} />
                                </div>
                                <div className="relative z-10 text-center">
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-2">AI Output ({result.source})</p>
                                    <p className="text-6xl md:text-7xl font-black mb-4 tracking-tighter">₦{result.estimated_value.toLocaleString()}</p>
                                    <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-emerald" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Confidence: {Math.round(result.confidence * 100)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-onyx-light text-center">
                                &quot;{result.reasoning}&quot;
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        // Store result for the sell page
                                        sessionStorage.setItem('pending_listing', JSON.stringify({
                                            ...formData,
                                            estimated_value: result.estimated_value
                                        }));
                                        window.location.href = token ? '/sell' : '/register?redirect=/sell';
                                    }}
                                    className="btn-primary py-5 text-center flex items-center justify-center overflow-hidden"
                                >
                                    Sell at this Price
                                </button>
                                <Button variant="outline" onClick={() => setStep(0)} className="py-5">
                                    Try Another Car
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
