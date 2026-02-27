const { query } = require('../config/database');
const vehicleService = require('./vehicleService');

class RegistrationService {
    /**
     * Start a new vehicle registration
     */
    async initiateRegistration(userId, vehicleData) {
        // 1. Basic validation
        if (!vehicleData.vin) throw { status: 400, message: 'VIN is mandatory for registration' };

        // 2. Check if VIN already exists in platform
        const existing = await query('SELECT id FROM vehicles WHERE vin = $1', [vehicleData.vin]);
        if (existing.rows.length > 0) throw { status: 400, message: 'Vehicle with this VIN already registered' };

        // 3. Create vehicle record in 'draft' status
        const vehicle = await vehicleService.createVehicle({
            ...vehicleData,
            owner_id: userId,
            status: 'available', // available for the owner, but not necessarily for sale
            registration_status: 'draft'
        });

        return vehicle;
    }

    /**
     * Upload and link documents to a vehicle
     */
    async uploadDocuments(vehicleId, documents) {
        const results = [];
        for (const doc of documents) {
            const res = await query(`
                INSERT INTO vehicle_documents (vehicle_id, doc_type, doc_url, status)
                VALUES ($1, $2, $3, 'pending')
                RETURNING *
            `, [vehicleId, doc.type, doc.url]);
            results.push(res.rows[0]);
        }

        // Update vehicle registration status to pending_validation
        await query('UPDATE vehicles SET registration_status = $1 WHERE id = $2', ['pending_validation', vehicleId]);

        return results;
    }

    /**
     * Validate the entire registration package
     */
    async submitForVerification(userId, vehicleId) {
        // Check if mandatory documents exist
        const vehicle = await vehicleService.getVehicleById(vehicleId);
        if (!vehicle) throw { status: 404, message: 'Vehicle not found' };
        if (vehicle.owner_id !== userId) throw { status: 403, message: 'Unauthorized' };

        const docs = await query('SELECT doc_type FROM vehicle_documents WHERE vehicle_id = $1', [vehicleId]);
        const docTypes = docs.rows.map(d => d.doc_type);

        // Rule 1: VIN proof always mandatory
        if (!docTypes.includes('vin_proof')) {
            throw { status: 400, message: 'Missing mandatory document: VIN Proof' };
        }

        // Rule 2: Foreign used needs ownership title
        if (vehicle.condition === 'foreign_used' && !docTypes.includes('ownership_title')) {
            throw { status: 400, message: 'Foreign used vehicles require Ownership Title' };
        }

        // Rule 3: Registration card for Nigerian used
        if (vehicle.condition === 'nigerian_used' && !docTypes.includes('registration_card')) {
            throw { status: 400, message: 'Nigerian used vehicles require a Registration Card' };
        }

        await query('UPDATE vehicles SET registration_status = $1 WHERE id = $2', ['pending_validation', vehicleId]);
        return { success: true, message: 'Registration submitted for admin review' };
    }

    async getRegistrationStatus(vehicleId) {
        const vehicle = await query(`
            SELECT v.id, v.registration_status, 
                   json_agg(vd.*) as documents
            FROM vehicles v
            LEFT JOIN vehicle_documents vd ON v.id = vd.vehicle_id
            WHERE v.id = $1
            GROUP BY v.id
        `, [vehicleId]);
        return vehicle.rows[0];
    }
}

module.exports = new RegistrationService();
