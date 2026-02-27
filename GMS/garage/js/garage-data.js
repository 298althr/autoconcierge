/**
 * GARAGE DATA MODULE — Dealer360
 * Shared data layer for all Garage Workshop pages.
 * Uses localStorage for MVP persistence.
 */

const GarageData = (() => {

    // ─── KEYS ───
    const KEYS = {
        VEHICLES: 'd360_user_vehicles',
        ACTIVE: 'd360_active_vehicle',
        SERVICES: 'd360_service_records',
        INVOICES: 'd360_invoices',
        CONCIERGE: 'd360_concierge_tasks',
        CHAT: 'd360_chat_sessions'
    };

    // ─── SEED DATA ───
    const SEED_VEHICLES = [
        {
            id: 'v001',
            make: 'Toyota', model: 'Camry', year: 2018,
            vin: '4T1BF1FK9JU123456',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
            status: 'in-transit',
            location: 'On ship from Houston',
            eta: '28 Days',
            purchasePrice: 1800000,
            currentValue: 4600000,
            mileage: 45200,
            color: 'Silver',
            fuelType: 'Petrol',
            transmission: 'Automatic',
            scores: { beauty: 6, performance: 7, comfort: 5, tech: 4, reliability: 7 },
            registeredAt: '2026-01-15T09:00:00Z',
        },
        {
            id: 'v002',
            make: 'Lexus', model: 'RX350', year: 2020,
            vin: '2T2BZMCA1LC123789',
            image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
            status: 'upgrade-phase',
            location: 'AutoCraft Lagos',
            eta: '5 Days',
            purchasePrice: 6200000,
            currentValue: 10500000,
            mileage: 32100,
            color: 'Pearl White',
            fuelType: 'Petrol',
            transmission: 'Automatic',
            scores: { beauty: 7, performance: 8, comfort: 7, tech: 6, reliability: 8 },
            registeredAt: '2025-12-01T09:00:00Z',
        },
        {
            id: 'v003',
            make: 'Honda', model: 'Accord', year: 2015,
            vin: '1HGCR2F34FA123456',
            image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800',
            status: 'in-use',
            location: 'Lagos',
            eta: null,
            purchasePrice: 3500000,
            currentValue: 4200000,
            mileage: 87300,
            color: 'Midnight Blue',
            fuelType: 'Petrol',
            transmission: 'Automatic',
            scores: { beauty: 5, performance: 6, comfort: 5, tech: 3, reliability: 6 },
            registeredAt: '2024-06-10T09:00:00Z',
        }
    ];

    const SEED_SERVICES = [
        {
            id: 'svc-001',
            vehicleId: 'v002',
            type: 'upgrade',
            title: 'Premium Body Kit — 2024 Look',
            status: 'in-progress',
            createdAt: '2026-02-01T09:00:00Z',
            partnerName: 'AutoCraft Lagos Terminal',
            invoiceTotal: 1350000,
            paidAt: '2026-02-02T14:00:00Z',
            paymentDeadline: '2026-02-04T09:00:00Z',
            contractSigned: true,
            signatureData: null,
            assignedAt: '2026-02-01T10:30:00Z',
            workStartedAt: '2026-02-02T15:00:00Z',
            qualityCheckAt: null,
            completedAt: null,
            verifiedAt: null,
            rating: null,
            feedback: null,
            beforeScores: { beauty: 7, performance: 8, comfort: 7, tech: 6, value: 10500000 },
            afterScores: { beauty: 9, performance: 8, comfort: 8, tech: 8, value: 14200000 },
            lineItems: [
                { name: 'Front Bumper Kit', price: 450000 },
                { name: 'Side Skirts', price: 280000 },
                { name: 'Rear Diffuser', price: 320000 },
                { name: 'Installation & Paint', price: 300000 }
            ]
        },
        {
            id: 'svc-002',
            vehicleId: 'v003',
            type: 'engine-scan',
            title: 'Engine Scan — OBD-II Diagnostic',
            status: 'completed',
            createdAt: '2026-01-20T10:00:00Z',
            partnerName: 'QuickFix Diagnostics',
            invoiceTotal: 15000,
            paidAt: '2026-01-20T11:00:00Z',
            paymentDeadline: '2026-01-23T10:00:00Z',
            contractSigned: true,
            signatureData: null,
            assignedAt: '2026-01-20T10:15:00Z',
            workStartedAt: '2026-01-20T11:30:00Z',
            qualityCheckAt: '2026-01-20T12:00:00Z',
            completedAt: '2026-01-20T12:15:00Z',
            verifiedAt: null,
            rating: null,
            feedback: null,
            beforeScores: { beauty: 5, performance: 6, comfort: 5, tech: 3, value: 4200000 },
            afterScores: { beauty: 5, performance: 6, comfort: 5, tech: 3, value: 4200000 },
            lineItems: [
                { name: 'OBD-II Diagnostic Scan', price: 15000 }
            ]
        },
    ];

    // ─── INIT ───
    function init() {
        if (!localStorage.getItem(KEYS.VEHICLES)) {
            localStorage.setItem(KEYS.VEHICLES, JSON.stringify(SEED_VEHICLES));
        }
        if (!localStorage.getItem(KEYS.SERVICES)) {
            localStorage.setItem(KEYS.SERVICES, JSON.stringify(SEED_SERVICES));
        }
    }

    // --- SYSTEM CONFIGURATION (manager controlled) ---
    const CONFIG_KEY = 'dealer360_garage_config';
    const DEFAULT_CONFIG = {
        commissionRate: 0.15,
        exchangeRate: 1600, // NGN/USD
        servicePrices: {
            'pre-purchase-inspection': { base: 25000, standard: 50000, comprehensive: 100000 },
            'vin-check': { base: 15000, comprehensive: 50000 },
            'ownership-transfer': { base: 150000, expedited: 200000 },
            'customs-clearance': { base: 350000, max: 800000 },
            'cng-conversion': { '65L': 750000, '75L': 850000, '100L': 1100000 },
            'repaint': { 'sedan': 350000, 'suv': 450000, 'truck': 650000 },
            'engine-scan': { base: 25000 },
            'diagnostic': { base: 65000 }
        }
    };

    function getSystemConfig() {
        const data = localStorage.getItem(CONFIG_KEY);
        return data ? JSON.parse(data) : DEFAULT_CONFIG;
    }

    function updateSystemConfig(newConfig) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    }

    // --- WORKFLOW ENGINE ---
    const WORKFLOW_STEPS = [
        { id: 1, key: 'submitted', label: 'User Submitted', status: 'pending' },
        { id: 2, key: 'manager_reviewed', label: 'manager Reviewed', status: 'pending' },
        { id: 3, key: 'partner_assigned', label: 'Partner Assigned', status: 'pending' },
        { id: 4, key: 'quote_provided', label: 'Quote Provided', status: 'awaiting-payment' },
        { id: 5, key: 'user_approved', label: 'User Approved', status: 'awaiting-payment' },
        { id: 6, key: 'contract_signed', label: 'Contract Signed', status: 'awaiting-payment' },
        { id: 7, key: 'payment_received', label: 'Payment Received', status: 'in-progress' },
        { id: 8, key: 'service_started', label: 'Service Started', status: 'in-progress' },
        { id: 9, key: 'in_progress', label: 'Work In Progress', status: 'in-progress' },
        { id: 10, key: 'quality_check', label: 'Quality Check', status: 'in-progress' },
        { id: 11, key: 'completed', label: 'Service Completed', status: 'completed' },
        { id: 12, key: 'user_verified', label: 'User Verified', status: 'completed' },
        { id: 13, key: 'feedback_provided', label: 'Feedback Provided', status: 'completed' },
        { id: 14, key: 'closed', label: 'Record Closed', status: 'completed' }
    ];

    // --- VEHICLE MANAGEMENT ───
    function getUserVehicles() {
        init();
        return JSON.parse(localStorage.getItem(KEYS.VEHICLES) || '[]');
    }

    function getVehicleById(id) {
        return getUserVehicles().find(v => v.id === id) || null;
    }

    function getActiveVehicle() {
        const stored = localStorage.getItem(KEYS.ACTIVE);
        return stored ? JSON.parse(stored) : null;
    }

    function setActiveVehicle(vehicleId) {
        const vehicle = getVehicleById(vehicleId);
        if (vehicle) {
            localStorage.setItem(KEYS.ACTIVE, JSON.stringify(vehicle));
        }
        return vehicle;
    }

    function updateVehicle(vehicleId, updates) {
        const vehicles = getUserVehicles();
        const idx = vehicles.findIndex(v => v.id === vehicleId);
        if (idx > -1) {
            vehicles[idx] = { ...vehicles[idx], ...updates };
            localStorage.setItem(KEYS.VEHICLES, JSON.stringify(vehicles));
            // Also update active if it's the same vehicle
            const active = getActiveVehicle();
            if (active && active.id === vehicleId) {
                localStorage.setItem(KEYS.ACTIVE, JSON.stringify(vehicles[idx]));
            }
        }
        return vehicles[idx];
    }

    // ─── SERVICE RECORDS ───
    function getAllServiceRecords() {
        init();
        return JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
    }

    function getServiceRecords(vehicleId, filters = {}) {
        let records = getAllServiceRecords().filter(s => s.vehicleId === vehicleId);
        if (filters.status) {
            records = records.filter(s => s.status === filters.status);
        }
        if (filters.type) {
            records = records.filter(s => s.type === filters.type);
        }
        // Sort by date descending
        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return records;
    }

    function getServiceById(serviceId) {
        return getAllServiceRecords().find(s => s.id === serviceId) || null;
    }

    function createServiceRecord(data) {
        const records = getAllServiceRecords();
        const config = getSystemConfig();
        const recordId = 'svc-' + Date.now();

        const record = {
            id: recordId,
            vehicleId: data.vehicleId,
            type: data.type,
            title: data.title,
            status: 'pending',
            currentStep: 1, // 14-step workflow start
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            partnerName: data.partnerName || 'Dealer360 Operations',
            invoiceTotal: data.invoiceTotal || 0,
            commission: data.commission || (data.invoiceTotal * config.commissionRate),
            paidAt: null,
            paymentDeadline: null,
            contractSigned: false,
            workflow: {
                submitted: new Date().toISOString()
            },
            details: data.details || {},
            lineItems: data.lineItems || [],
            notifications: [{
                message: `Service request for ${data.title} initiated.`,
                timestamp: new Date().toISOString(),
                channel: 'system'
            }]
        };
        records.push(record);
        localStorage.setItem(KEYS.SERVICES, JSON.stringify(records));
        return record;
    }

    function updateServiceRecord(serviceId, updates) {
        const records = getAllServiceRecords();
        const idx = records.findIndex(s => s.id === serviceId);
        if (idx > -1) {
            records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(KEYS.SERVICES, JSON.stringify(records));
            return records[idx];
        }
        return null;
    }

    function updateServiceStatus(serviceId, nextStepIndex) {
        const record = getServiceById(serviceId);
        if (!record) return null;

        const step = WORKFLOW_STEPS[nextStepIndex - 1];
        const updates = {
            currentStep: nextStepIndex,
            status: step.status,
            workflow: { ...record.workflow, [step.key]: new Date().toISOString() },
            notifications: [
                ...record.notifications,
                { message: `Workflow transitioned to: ${step.label}`, timestamp: new Date().toISOString(), channel: 'system' }
            ]
        };
        return updateServiceRecord(serviceId, updates);
    }

    // ─── CONTRACT ───
    function signContract(serviceId, signatureDataUrl) {
        const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        return updateServiceRecord(serviceId, {
            contractSigned: true,
            signatureImage: signatureDataUrl,
            status: 'awaiting-payment',
            currentStep: 6, // Contract signed step
            paymentDeadline: deadline,
        });
    }

    // ─── PAYMENT ───
    function recordPayment(serviceId, method) {
        return updateServiceRecord(serviceId, {
            status: 'in-progress',
            currentStep: 7, // Payment received step
            paidAt: new Date().toISOString(),
            paymentMethod: method,
        });
    }

    function getPaymentDeadline(serviceId) {
        const record = getServiceById(serviceId);
        return record ? record.paymentDeadline : null;
    }

    function isPaymentOverdue(serviceId) {
        const deadline = getPaymentDeadline(serviceId);
        if (!deadline) return false;
        return new Date() > new Date(deadline);
    }

    // ─── HELPERS ───
    function formatCurrency(amount) {
        return '₦' + Number(amount).toLocaleString('en-NG');
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function getStatusConfig(status) {
        const map = {
            'pending': { label: 'Pending', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'schedule' },
            'awaiting-payment': { label: 'Awaiting Payment', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'payments' },
            'in-progress': { label: 'In Progress', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'sync' },
            'completed': { label: 'Completed', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: 'check_circle' },
            'cancelled': { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'cancel' },
        };
        return map[status] || map['pending'];
    }

    function getServiceTypeConfig(type) {
        const map = {
            'engine-scan': { label: 'Engine Scan', icon: 'precision_manufacturing', color: 'text-blue-400' },
            'diagnostic': { label: 'Full Diagnostic', icon: 'monitor_heart', color: 'text-purple-400' },
            'upgrade': { label: 'Upgrade', icon: 'auto_awesome', color: 'text-amber-400' },
            'registration': { label: 'Registration', icon: 'description', color: 'text-cyan-400' },
            'repaint': { label: 'Repaint', icon: 'palette', color: 'text-pink-400' },
            'logistics': { label: 'Logistics', icon: 'local_shipping', color: 'text-sky-400' }
        };
        return map[type] || { label: type, icon: 'build', color: 'text-primary' };
    }

    function getVehicleStatusConfig(status) {
        const map = {
            'in-transit': { label: '🚢 In Transit', class: 'status-transit' },
            'upgrade-phase': { label: '🔧 Upgrade Phase', class: 'status-upgrade' },
            'in-use': { label: '✅ In Use', class: 'status-ready' },
        };
        return map[status] || { label: status, class: '' };
    }

    function getServiceCountForVehicle(vehicleId) {
        return getServiceRecords(vehicleId).length;
    }

    function getTotalSpentForVehicle(vehicleId) {
        return getServiceRecords(vehicleId)
            .filter(s => s.paidAt)
            .reduce((sum, s) => sum + (s.invoiceTotal || 0), 0);
    }

    // ─── CALCULATORS ENGINE ───
    const Calculators = {
        calculateCustoms: (fob, rate = null, engineType = 'ice') => {
            const config = getSystemConfig();
            const actualRate = rate || config.exchangeRate;
            const cifNaira = (fob * actualRate) * 1.1;

            const idRate = engineType === 'ev' ? 0.1 : 0.2;
            const nacRate = 0.15;

            const ID = cifNaira * idRate;
            const surcharge = ID * 0.07;
            const etls = cifNaira * 0.005;
            const nac = cifNaira * nacRate;
            const fcs = cifNaira * 0.04;

            const subtotalBeforeVat = cifNaira + ID + surcharge + etls + nac + fcs;
            const vat = engineType === 'ev' ? 0 : subtotalBeforeVat * 0.075;

            const governmentDuty = ID + surcharge + etls + nac + fcs + vat;
            const commission = governmentDuty * config.commissionRate;

            return {
                cif: cifNaira,
                importDuty: ID,
                surcharge,
                etls,
                nac,
                fcs,
                vat,
                totalDuty: governmentDuty,
                commission: commission,
                grandTotal: governmentDuty + commission
            };
        },

        calculateCNG: (tankSize) => {
            const config = getSystemConfig();
            const base = config.servicePrices['cng-conversion'][tankSize] || 750000;
            const commission = base * config.commissionRate;
            return { base, commission, total: base + commission };
        },

        calculatePaint: (vehicleType, tier = 'standard') => {
            const config = getSystemConfig();
            let base = config.servicePrices['repaint'][vehicleType] || 350000;
            if (tier === 'premium') base *= 1.4;

            const commission = base * config.commissionRate;
            return { base, commission, total: base + commission };
        }
    };

    // ─── PUBLIC API ───
    return {
        init,
        getUserVehicles,
        getVehicleById,
        getActiveVehicle,
        setActiveVehicle,
        updateVehicle,
        getAllServiceRecords,
        getServiceRecords,
        getServiceById,
        createServiceRecord,
        updateServiceRecord,
        updateServiceStatus,
        signContract,
        recordPayment,
        getPaymentDeadline,
        isPaymentOverdue,
        formatCurrency,
        formatDate,
        getStatusConfig,
        getServiceTypeConfig,
        getVehicleStatusConfig,
        getServiceCountForVehicle,
        getTotalSpentForVehicle,
        Calculators,
        // CONCIERGE & CHAT
        getConciergeTasks: () => JSON.parse(localStorage.getItem(KEYS.CONCIERGE)) || [],
        createConciergeTask: (data) => {
            const tasks = GarageData.getConciergeTasks();
            const task = {
                id: 'ct-' + Date.now(),
                type: data.type || 'tactical-query',
                title: data.title,
                status: 'pending-triage',
                userId: data.userId || 'u001',
                priority: data.priority || 'medium',
                createdAt: new Date().toISOString(),
                ...data
            };
            tasks.push(task);
            localStorage.setItem(KEYS.CONCIERGE, JSON.stringify(tasks));
            return task;
        },
        updateConciergeTask: (id, updates) => {
            const tasks = GarageData.getConciergeTasks();
            const idx = tasks.findIndex(t => t.id === id);
            if (idx > -1) {
                tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
                localStorage.setItem(KEYS.CONCIERGE, JSON.stringify(tasks));
                return tasks[idx];
            }
            return null;
        },
        getChatSessions: () => JSON.parse(localStorage.getItem(KEYS.CHAT)) || [],
        saveChatMessage: (sessionId, msg) => {
            const sessions = GarageData.getChatSessions();
            let session = sessions.find(s => s.id === sessionId);
            if (!session) {
                session = { id: sessionId, messages: [], updatedAt: new Date().toISOString() };
                sessions.push(session);
            }
            session.messages.push({
                ...msg,
                timestamp: new Date().toISOString()
            });
            session.updatedAt = new Date().toISOString();
            localStorage.setItem(KEYS.CHAT, JSON.stringify(sessions));
            return session;
        },

        getSystemConfig,
        updateSystemConfig,
        getWorkflowSteps: () => WORKFLOW_STEPS
    };

})();

// Auto-init on load
GarageData.init();
