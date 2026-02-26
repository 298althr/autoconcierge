const { pool } = require('../config/database');

class CertificationService {
    /**
     * Step 2: Process Forensic Certification
     */
    async processCertification(vehicleId, mediaPack) {
        // Enforce specific angles (Simulated validation)
        const requiredMedia = ['engine_video', 'cold_start', 'obd_scan', 'exterior_360'];
        const missing = requiredMedia.filter(key => !mediaPack[key]);

        if (missing.length > 0) {
            throw { status: 400, message: `Incomplete certification pack. Missing: ${missing.join(', ')}` };
        }

        // Logic: Calculate Confidence Score
        let score = 100.00;

        // Deduction for active faults in OBD
        if (mediaPack.obd_data && mediaPack.obd_data.fault_count > 0) {
            score -= (mediaPack.obd_data.fault_count * 5);
        }

        // Check for continuity (Simulated)
        if (!mediaPack.metadata_valid) {
            score -= 20;
        }

        const status = score >= 80 ? 'certified' : score >= 50 ? 'pending' : 'flagged';

        const client = await pool.connect();
        try {
            await client.query(`
                UPDATE vehicles 
                SET certification_media = $1, 
                    certification_score = $2, 
                    certification_status = $3,
                    updated_at = NOW()
                WHERE id = $4
            `, [JSON.stringify(mediaPack), score, status, vehicleId]);

            return { success: true, status, score };
        } finally {
            client.release();
        }
    }
}

module.exports = new CertificationService();
