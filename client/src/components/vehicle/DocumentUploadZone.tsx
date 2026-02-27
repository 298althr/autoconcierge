'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import PremiumButton from '../ui/PremiumButton';

interface DocumentUploadZoneProps {
    title: string;
    type: 'vin_proof' | 'customs_duty' | 'ownership_title' | 'registration_card';
    isMandatory?: boolean;
    onUpload: (url: string) => void;
    onRemove: () => void;
}

const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
    title,
    type,
    isMandatory = false,
    onUpload,
    onRemove
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        setError(null);
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File too large. Max 5MB.");
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Invalid file type. Please use JPG, PNG, or PDF.");
            return;
        }

        setFile(selectedFile);
        simulateUpload(selectedFile);
    };

    const simulateUpload = async (file: File) => {
        setIsUploading(true);
        // Simulate API call to upload to Cloudinary/S3
        setTimeout(() => {
            const fakeUrl = `https://storage.autogaard.com/docs/${Date.now()}_${file.name}`;
            onUpload(fakeUrl);
            setIsUploading(false);
        }, 1500);
    };

    const handleRemove = () => {
        setFile(null);
        onRemove();
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold tracking-tight text-slate-900">
                    {title} {isMandatory && <span className="text-burgundy">*</span>}
                </label>
            </div>

            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="uploader"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`
                            relative border-2 border-dashed rounded-2xl p-8 
                            transition-all duration-300 flex flex-col items-center justify-center gap-3
                            ${isDragging ? 'border-burgundy bg-burgundy/5 cursor-copy' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}
                        `}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                        />
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <Upload size={20} className="text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-700">Drop your file here or click to browse</p>
                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group"
                    >
                        {isUploading && (
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-burgundy"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5 }}
                            />
                        )}

                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                            <FileText size={18} className="text-slate-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {isUploading ? 'Uploading...' : 'Ready'}</p>
                        </div>

                        {!isUploading && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-emerald" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs font-semibold text-burgundy bg-burgundy/5 p-2 px-3 rounded-lg"
                >
                    <AlertCircle size={14} />
                    {error}
                </motion.div>
            )}
        </div>
    );
};

export default DocumentUploadZone;
