'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car,
    Upload,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    ShieldCheck,
    FileText,
    Info
} from 'lucide-react';
import PremiumButton from '../ui/PremiumButton';
import DocumentUploadZone from './DocumentUploadZone';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const steps = [
    { title: 'Vehicle Info', icon: Car },
    { title: 'Documentation', icon: Upload },
    { title: 'Verification', icon: ShieldCheck }
];

export default function RegisterVehicleHero({ onSuccess }: { onSuccess: () => void }) {
    const { token } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicleId, setVehicleId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        vin: '',
        condition: 'foreign_used' as 'clean' | 'foreign_used' | 'nigerian_used' | 'salvage',
        location: '',
        mileage_km: '',
        price: ''
    });

    const [documents, setDocuments] = useState<{ type: string, url: string }[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = async () => {
        setError(null);
        if (currentStep === 0) {
            // Validation for Step 1
            if (!formData.make || !formData.model || !formData.vin || !formData.location) {
                setError("Please fill in all mandatory fields (Make, Model, VIN, Location).");
                return;
            }

            setIsSubmitting(true);
            try {
                const res = await apiFetch('/registration/initiate', {
                    token,
                    body: {
                        ...formData,
                        mileage_km: parseInt(formData.mileage_km) || 0,
                        price: parseFloat(formData.price) || 0
                    }
                });
                setVehicleId(res.data.id);
                setCurrentStep(1);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsSubmitting(false);
            }
        } else if (currentStep === 1) {
            // Document Validation
            const docTypes = documents.map(d => d.type);
            if (!docTypes.includes('vin_proof')) {
                setError("VIN Proof is mandatory.");
                return;
            }
            if (formData.condition === 'foreign_used' && !docTypes.includes('ownership_title')) {
                setError("Ownership Title is required for Foreign Used vehicles.");
                return;
            }
            if (formData.condition === 'nigerian_used' && !docTypes.includes('registration_card')) {
                setError("Registration Card is required for Nigerian Used vehicles.");
                return;
            }

            setIsSubmitting(true);
            try {
                await apiFetch(`/registration/${vehicleId}/documents`, {
                    token,
                    body: { documents }
                });
                setCurrentStep(2);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const submitFinal = async () => {
        setIsSubmitting(true);
        try {
            await apiFetch(`/registration/${vehicleId}/submit`, { token, method: 'POST' });
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden max-w-4xl mx-auto">
            {/* Header / Progress */}
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group relative">
                            <div className={`
                                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                                ${idx <= currentStep ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20' : 'bg-white text-slate-300 border border-slate-200'}
                            `}>
                                <step.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${idx <= currentStep ? 'text-slate-900' : 'text-slate-300'}`}>
                                {step.title}
                            </span>
                            {idx < steps.length - 1 && (
                                <div className={`absolute left-[3.5rem] top-6 w-16 h-[2px] ${idx < currentStep ? 'bg-burgundy' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="p-10 min-h-[450px]">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Make</label>
                                    <input
                                        name="make" value={formData.make} onChange={handleInputChange}
                                        placeholder="e.g. TOYOTA"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Model</label>
                                    <input
                                        name="model" value={formData.model} onChange={handleInputChange}
                                        placeholder="e.g. CAMRY"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">VIN (Vehicle Identification Number)</label>
                                    <input
                                        name="vin" value={formData.vin} onChange={handleInputChange}
                                        placeholder="17 Characters"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-mono tracking-wider focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Condition</label>
                                    <select
                                        name="condition" value={formData.condition} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy outline-none transition-all appearance-none"
                                    >
                                        <option value="foreign_used">Foreign Used (Tokunbo)</option>
                                        <option value="nigerian_used">Nigerian Used</option>
                                        <option value="clean">Brand New / Clean</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Location</label>
                                    <input
                                        name="location" value={formData.location} onChange={handleInputChange}
                                        placeholder="City, State"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mileage (KM)</label>
                                    <input
                                        name="mileage_km" type="number" value={formData.mileage_km} onChange={handleInputChange}
                                        placeholder="0"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-burgundy/10 focus:border-burgundy outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4 text-xs text-slate-600 leading-relaxed">
                                <Info className="text-burgundy shrink-0" size={16} />
                                <p>To ensure high trust parity, we require authentic documentation. All docs are stored securely and reviewed by our verification team.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DocumentUploadZone
                                    title="VIN Proof / Chassis Number"
                                    type="vin_proof"
                                    isMandatory={true}
                                    onUpload={(url) => setDocuments([...documents, { type: 'vin_proof', url }])}
                                    onRemove={() => setDocuments(documents.filter(d => d.type !== 'vin_proof'))}
                                />
                                <DocumentUploadZone
                                    title={formData.condition === 'foreign_used' ? "Ownership Title (Export Doc)" : "Registration Card (Logbook)"}
                                    type={formData.condition === 'foreign_used' ? 'ownership_title' : 'registration_card'}
                                    isMandatory={true}
                                    onUpload={(url) => setDocuments([...documents, { type: formData.condition === 'foreign_used' ? 'ownership_title' : 'registration_card', url }])}
                                    onRemove={() => setDocuments(documents.filter(d => d.type !== (formData.condition === 'foreign_used' ? 'ownership_title' : 'registration_card')))}
                                />
                                <DocumentUploadZone
                                    title="Customs Duty Documents"
                                    type="customs_duty"
                                    onUpload={(url) => setDocuments([...documents, { type: 'customs_duty', url }])}
                                    onRemove={() => setDocuments(documents.filter(d => d.type !== 'customs_duty'))}
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-heading font-extrabold text-slate-900 mb-4">Review Complete.</h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-sm font-subheading leading-relaxed mb-10">
                                Your vehicle info and {documents.length} verified documents are ready for submission. Once submitted, our team will review the asset for marketplace certification.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                                <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Car size={14} /> {formData.make} {formData.model}
                                </div>
                                <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} /> {documents.length} Documents
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-burgundy/5 border border-burgundy/10 rounded-2xl text-burgundy text-xs font-bold text-center">
                        {error}
                    </motion.div>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="bg-slate-50 px-10 py-8 border-t border-slate-100 flex justify-between items-center">
                <button
                    onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                    disabled={currentStep === 0 || isSubmitting}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all uppercase tracking-widest"
                >
                    <ChevronLeft size={16} /> Back
                </button>

                {currentStep < 2 ? (
                    <PremiumButton
                        onClick={nextStep}
                        isLoading={isSubmitting}
                        icon={ChevronRight}
                    >
                        Save & Continue
                    </PremiumButton>
                ) : (
                    <PremiumButton
                        onClick={submitFinal}
                        variant="secondary"
                        isLoading={isSubmitting}
                        icon={ShieldCheck}
                    >
                        Finalize & Submit
                    </PremiumButton>
                )}
            </div>
        </div>
    );
}
