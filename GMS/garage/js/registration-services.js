/**
 * REGISTRATION SERVICES - SHARED UTILITIES
 * Common functions for all Legal, Registration & Compliance services
 */

const RegistrationServices = {

    /**
     * Nigerian States with MVAA/Transport Authority Info
     */
    STATES: {
        lagos: {
            name: 'Lagos State',
            authority: 'MVAA (Motor Vehicle manageristration Agency)',
            location: 'MVAA Alausa Office, Ikeja',
            processingTime: '5-10 days',
            fees: {
                vehicleLicense: 13000,
                registration: 125000,
                roadworthiness: 10000
            }
        },
        abuja: {
            name: 'Federal Capital Territory (Abuja)',
            authority: 'FCT Motor Vehicle manageristration',
            location: 'FCT MVA Office, Central Area',
            processingTime: '7-12 days',
            fees: {
                vehicleLicense: 10000,
                registration: 100000,
                roadworthiness: 10000
            }
        },
        rivers: {
            name: 'Rivers State',
            authority: 'Rivers State Transport Authority',
            location: 'RSTA Office, Port Harcourt',
            processingTime: '7-14 days',
            fees: {
                vehicleLicense: 10000,
                registration: 80000,
                roadworthiness: 8000
            }
        },
        oyo: {
            name: 'Oyo State',
            authority: 'Oyo State Motor Vehicle manageristration',
            location: 'OSMVA Office, Ibadan',
            processingTime: '7-14 days',
            fees: {
                vehicleLicense: 9000,
                registration: 75000,
                roadworthiness: 8000
            }
        },
        other: {
            name: 'Other State',
            authority: 'State Transport Authority',
            location: 'State Capital',
            processingTime: '7-21 days',
            fees: {
                vehicleLicense: 10000,
                registration: 80000,
                roadworthiness: 8000
            }
        }
    },

    /**
     * Document Types
     */
    DOCUMENT_TYPES: {
        'owner-id': {
            label: 'Owner ID',
            description: 'National ID, Driver\'s License, or International Passport',
            required: true,
            maxSize: 5, // MB
            formats: ['pdf', 'jpg', 'jpeg', 'png']
        },
        'vehicle-license': {
            label: 'Vehicle License',
            description: 'Current vehicle license or proof of ownership',
            required: true,
            maxSize: 5,
            formats: ['pdf', 'jpg', 'jpeg', 'png']
        },
        'insurance': {
            label: 'Insurance Certificate',
            description: 'Valid insurance certificate',
            required: true,
            maxSize: 5,
            formats: ['pdf', 'jpg', 'jpeg', 'png']
        },
        'proof-of-address': {
            label: 'Proof of Address',
            description: 'Utility bill or tenancy agreement',
            required: false,
            maxSize: 5,
            formats: ['pdf', 'jpg', 'jpeg', 'png']
        },
        'purchase-receipt': {
            label: 'Purchase Receipt',
            description: 'Original purchase receipt or invoice',
            required: false,
            maxSize: 5,
            formats: ['pdf', 'jpg', 'jpeg', 'png']
        },
        'customs-papers': {
            label: 'Customs Papers',
            description: 'Customs clearance documents (for imported vehicles)',
            required: false,
            maxSize: 10,
            formats: ['pdf']
        },
        'police-report': {
            label: 'Police Report',
            description: 'Police report (for theft or clearance)',
            required: false,
            maxSize: 5,
            formats: ['pdf', 'jpg', 'jpeg', 'png']
        },
        'medical-certificate': {
            label: 'Medical Certificate',
            description: 'Medical certificate (for tint permit)',
            required: false,
            maxSize: 5,
            formats: ['pdf', 'jpg', 'jpeg', 'png']
        }
    },

    /**
     * Service Levels
     */
    SERVICE_LEVELS: {
        standard: {
            name: 'Standard Service',
            description: 'Regular processing time',
            multiplier: 1.0
        },
        expedited: {
            name: 'Expedited Service',
            description: 'Faster processing (where available)',
            multiplier: 1.5,
            additionalFee: 50000
        }
    },

    /**
     * Render Vehicle Card
     */
    renderVehicleCard(vehicle, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !vehicle) return;

        container.innerHTML = `
            <div class="flex items-center gap-3 mb-3">
                <span class="material-symbols-outlined text-primary text-3xl">directions_car</span>
                <div>
                    <h2 class="text-lg font-[var(--font-bebas)] tracking-widest uppercase">${vehicle.make} ${vehicle.model}</h2>
                    <p class="text-[9px] text-text-secondary uppercase tracking-widest">${vehicle.year} • ${vehicle.plateNumber || 'No Plate'}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-bg-surface/50 rounded-xl p-3">
                    <p class="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">VIN</p>
                    <p class="text-xs font-bold">${vehicle.vin ? vehicle.vin.substring(0, 10) + '...' : 'N/A'}</p>
                </div>
                <div class="bg-bg-surface/50 rounded-xl p-3">
                    <p class="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Engine</p>
                    <p class="text-xs font-bold">${vehicle.engine || 'N/A'}</p>
                </div>
            </div>
        `;
    },

    /**
     * Render State Selector
     */
    renderStateSelector(containerId, selectedState = 'lagos') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stateOptions = Object.keys(this.STATES).map(key => {
            const state = this.STATES[key];
            return `
                <option value="${key}" ${key === selectedState ? 'selected' : ''}>
                    ${state.name}
                </option>
            `;
        }).join('');

        container.innerHTML = `
            <select id="state-select" onchange="RegistrationServices.onStateChange(this.value)"
                class="w-full bg-bg-surface border border-border-color rounded-xl p-3 text-sm">
                ${stateOptions}
            </select>
            <div id="state-info" class="mt-3 text-xs text-text-secondary"></div>
        `;

        this.updateStateInfo(selectedState);
    },

    /**
     * Update State Info Display
     */
    updateStateInfo(stateKey) {
        const state = this.STATES[stateKey];
        const infoDiv = document.getElementById('state-info');
        if (!infoDiv || !state) return;

        infoDiv.innerHTML = `
            <div class="space-y-1">
                <p><span class="font-bold">Authority:</span> ${state.authority}</p>
                <p><span class="font-bold">Location:</span> ${state.location}</p>
                <p><span class="font-bold">Processing Time:</span> ${state.processingTime}</p>
            </div>
        `;
    },

    /**
     * State Change Handler
     */
    onStateChange(stateKey) {
        this.updateStateInfo(stateKey);
        // Trigger pricing update if function exists
        if (typeof updatePricing === 'function') {
            updatePricing();
        }
    },

    /**
     * Render Document Upload Widget
     */
    renderDocumentUpload(containerId, requiredDocs = []) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const uploadWidgets = requiredDocs.map(docType => {
            const docInfo = this.DOCUMENT_TYPES[docType];
            if (!docInfo) return '';

            return `
                <div class="document-upload-item mb-4">
                    <label class="block mb-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-bold">
                                ${docInfo.label}
                                ${docInfo.required ? '<span class="text-red-500">*</span>' : ''}
                            </span>
                            <span class="text-xs text-text-secondary">${docInfo.formats.join(', ').toUpperCase()}</span>
                        </div>
                        <p class="text-xs text-text-secondary mt-1">${docInfo.description}</p>
                    </label>
                    <div class="relative">
                        <input type="file" 
                            id="upload-${docType}" 
                            data-doc-type="${docType}"
                            accept="${docInfo.formats.map(f => '.' + f).join(',')}"
                            onchange="RegistrationServices.handleFileUpload(this)"
                            class="hidden">
                        <button onclick="document.getElementById('upload-${docType}').click()"
                            class="w-full py-3 bg-bg-surface border-2 border-dashed border-border-color rounded-xl text-sm hover:border-primary transition-all flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">upload_file</span>
                            <span id="upload-${docType}-label">Choose File (Max ${docInfo.maxSize}MB)</span>
                        </button>
                        <div id="upload-${docType}-preview" class="mt-2 hidden">
                            <div class="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                                <span class="material-symbols-outlined text-primary">check_circle</span>
                                <span class="text-xs flex-1" id="upload-${docType}-filename"></span>
                                <button onclick="RegistrationServices.removeFile('${docType}')" class="text-red-500">
                                    <span class="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h3 class="text-sm font-black uppercase tracking-widest mb-4">Required Documents</h3>
            ${uploadWidgets}
        `;
    },

    /**
     * Handle File Upload
     */
    handleFileUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const docType = input.dataset.docType;
        const docInfo = this.DOCUMENT_TYPES[docType];

        // Validate file size
        const maxSizeBytes = docInfo.maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            this.showToast(`File too large. Maximum size is ${docInfo.maxSize}MB`, 'error');
            input.value = '';
            return;
        }

        // Validate file format
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!docInfo.formats.includes(fileExt)) {
            this.showToast(`Invalid file format. Accepted: ${docInfo.formats.join(', ')}`, 'error');
            input.value = '';
            return;
        }

        // Show preview
        const preview = document.getElementById(`upload-${docType}-preview`);
        const filename = document.getElementById(`upload-${docType}-filename`);

        if (preview && filename) {
            preview.classList.remove('hidden');
            filename.textContent = file.name;
        }

        // Store file info (in production, upload to server)
        if (!window.uploadedDocuments) {
            window.uploadedDocuments = {};
        }
        window.uploadedDocuments[docType] = {
            fileName: file.name,
            fileSize: file.size,
            fileType: fileExt,
            uploadedAt: new Date().toISOString()
        };

        this.showToast(`${docInfo.label} uploaded successfully`, 'success');
    },

    /**
     * Remove Uploaded File
     */
    removeFile(docType) {
        const input = document.getElementById(`upload-${docType}`);
        const preview = document.getElementById(`upload-${docType}-preview`);

        if (input) input.value = '';
        if (preview) preview.classList.add('hidden');

        if (window.uploadedDocuments) {
            delete window.uploadedDocuments[docType];
        }

        this.showToast('File removed', 'success');
    },

    /**
     * Render Fee Breakdown
     */
    renderFeeBreakdown(containerId, fees) {
        const container = document.getElementById(containerId);
        if (!container || !fees) return;

        const feeItems = Object.entries(fees).map(([key, value]) => {
            if (value === 0 && key !== 'total') return '';

            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const isTotal = key === 'total';

            return `
                <div class="flex justify-between py-2 ${isTotal ? 'border-t-2 border-primary font-bold text-primary' : 'border-b border-border-color'}">
                    <span class="${isTotal ? 'text-base' : 'text-sm'}">${label}</span>
                    <span class="${isTotal ? 'text-lg' : 'text-sm'}">${GarageData.formatCurrency(value)}</span>
                </div>
            `;
        }).filter(item => item !== '').join('');

        container.innerHTML = `
            <h3 class="text-sm font-black uppercase tracking-widest mb-3">Fee Breakdown</h3>
            <div class="bg-bg-surface rounded-xl p-4">
                ${feeItems}
            </div>
        `;
    },

    /**
     * Render Timeline Estimator
     */
    renderTimeline(containerId, stages) {
        const container = document.getElementById(containerId);
        if (!container || !stages) return;

        const stageItems = stages.map((stage, index) => `
            <div class="flex gap-3 mb-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        ${index + 1}
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-bold">${stage.name}</p>
                    <p class="text-xs text-text-secondary">${stage.description}</p>
                    ${stage.duration ? `<p class="text-xs text-primary mt-1">${stage.duration}</p>` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <h3 class="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">schedule</span>
                Timeline & Workflow
            </h3>
            <div class="bg-bg-surface rounded-xl p-4">
                ${stageItems}
            </div>
        `;
    },

    /**
     * Show Toast Notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.background = type === 'success' ? 'var(--primary)' : '#ef4444';
        toast.style.color = 'white';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
                <span class="font-bold">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    /**
     * Validate Required Documents
     */
    validateDocuments(requiredDocs) {
        if (!window.uploadedDocuments) {
            window.uploadedDocuments = {};
        }

        const missing = [];
        requiredDocs.forEach(docType => {
            const docInfo = this.DOCUMENT_TYPES[docType];
            if (docInfo.required && !window.uploadedDocuments[docType]) {
                missing.push(docInfo.label);
            }
        });

        return {
            valid: missing.length === 0,
            missing: missing
        };
    },

    /**
     * Save Progress to localStorage
     */
    saveProgress(serviceType, data) {
        const key = `registration_service_${serviceType}_progress`;
        localStorage.setItem(key, JSON.stringify({
            ...data,
            timestamp: new Date().toISOString()
        }));
    },

    /**
     * Load Progress from localStorage
     */
    loadProgress(serviceType) {
        const key = `registration_service_${serviceType}_progress`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    },

    /**
     * Clear Progress
     */
    clearProgress(serviceType) {
        const key = `registration_service_${serviceType}_progress`;
        localStorage.removeItem(key);
    },

    /**
     * Create Service Record
     */
    createServiceRecord(serviceType, configuration) {
        const record = {
            id: `reg-${Date.now().toString(36)}`,
            serviceType: serviceType,
            ...configuration,
            status: 'pending-review',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to GarageData
        return GarageData.createServiceRecord(record);
    }
};

// Make globally available
window.RegistrationServices = RegistrationServices;
