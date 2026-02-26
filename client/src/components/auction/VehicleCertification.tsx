import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertTriangle, Shield, Upload, Play, Info } from 'lucide-react';

interface CertificationStep {
    id: string;
    title: string;
    description: string;
    icon: any;
    status: 'pending' | 'recording' | 'completed' | 'failed';
    mediaUrl?: string;
}

const VehicleCertification: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [steps, setSteps] = useState<CertificationStep[]>([
        {
            id: 'engine_video',
            title: 'Engine Bay Forensic',
            description: 'Record 30s of engine running. Keep camera steady over belts and manifolds.',
            icon: Camera,
            status: 'pending'
        },
        {
            id: 'cold_start',
            title: 'Cold Start Audio',
            description: 'Record the ignition process. Captures valve timing and initial idle sound.',
            icon: Play,
            status: 'pending'
        },
        {
            id: 'obd_scan',
            title: 'OBD Metadata Sync',
            description: 'Plug in your OBD-II scanner and sync the report via Bluetooth or Photo.',
            icon: Shield,
            status: 'pending'
        },
        {
            id: 'exterior_360',
            title: '360° Forensic Walkaround',
            description: 'Slow 360° walk. AI will automatically tag panels and structural points.',
            icon: Camera,
            status: 'pending'
        }
    ]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

    const startStep = (index: number) => {
        const newSteps = [...steps];
        newSteps[index].status = 'recording';
        setSteps(newSteps);

        // Simulate recording/upload
        setTimeout(() => {
            completeStep(index, `https://storage.autogaard.com/temp/${steps[index].id}.mp4`);
        }, 3000);
    };

    const completeStep = (index: number, url: string) => {
        const newSteps = [...steps];
        newSteps[index].status = 'completed';
        newSteps[index].mediaUrl = url;
        setSteps(newSteps);

        if (index < steps.length - 1) {
            setActiveStep(index + 1);
        }
    };

    const submitForAIReview = async () => {
        setIsProcessing(true);
        // Simulate AI Score Calculation
        setTimeout(() => {
            setIsProcessing(false);
            setConfidenceScore(94.2);
        }, 3000);
    };

    const allCompleted = steps.every(s => s.status === 'completed');

    return (
        <div className="max-w-2xl mx-auto p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        Forensic Certification
                    </h2>
                    <p className="text-slate-400 text-sm">Vehicle ID: {vehicleId.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AI-Trusted</span>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`p-5 rounded-2xl border transition-all ${activeStep === index
                                ? 'bg-slate-800 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                : 'bg-slate-800/50 border-slate-700 opacity-60'
                            } ${step.status === 'completed' ? 'border-emerald-500/50 !opacity-100' : ''}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${step.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                    activeStep === index ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-500'
                                }`}>
                                {step.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-lg">{step.title}</h3>
                                    {step.status === 'completed' && <span className="text-xs text-emerald-400 font-medium">Verified</span>}
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>

                                {activeStep === index && step.status === 'pending' && (
                                    <button
                                        onClick={() => startStep(index)}
                                        className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                        Open Secure Camera
                                    </button>
                                )}

                                {step.status === 'recording' && (
                                    <div className="mt-4 flex items-center gap-3 text-red-400 animate-pulse bg-red-400/10 p-3 rounded-xl">
                                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Recording Session...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {allCompleted && !confidenceScore && (
                <button
                    onClick={submitForAIReview}
                    disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Calculating Trust Score...
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6" />
                            Submit for Forensic Certification
                        </>
                    )}
                </button>
            )}

            {confidenceScore && (
                <div className="p-8 bg-slate-800 rounded-3xl border border-emerald-500/30 text-center animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center p-6 bg-emerald-500/10 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Certification Granted</h3>
                    <div className="text-5xl font-black text-emerald-400 mb-4">{confidenceScore}%</div>
                    <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                        Your vehicle has been verified with high confidence. Fraud protection and Escrow release are now active for this listing.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Metadata</span>
                            <span className="text-emerald-400 text-xs font-semibold">VALIDATED</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Consistency</span>
                            <span className="text-emerald-400 text-xs font-semibold">98.1% MATCH</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-400/80 text-xs leading-relaxed">
                    <strong>Seller Ethics Warning:</strong> Manipulation of camera angles or sensor spoofing results in an immediate platform ban and forfeiture of loyalty trust credits.
                </p>
            </div>
        </div>
    );
};

export default VehicleCertification;
