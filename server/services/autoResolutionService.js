const certificationService = require('./certificationService');
const { pool } = require('../config/database');

class AutoResolutionService {
    /**
     * Step 3: Auto-Resolution Logic
     * Automatically evaluates a buyer's dispute against the seller's certification.
     */
    async evaluateDispute(escrowId, disputeCategory, buyerEvidence) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get Escrow and Vehicle Certification
            const res = await client.query(`
                SELECT e.*, v.certification_media, v.certification_status, v.certification_score
                FROM auction_escrow e
                JOIN auctions a ON e.auction_id = a.id
                JOIN vehicles v ON a.vehicle_id = v.id
                WHERE e.id = $1 FOR UPDATE
            `, [escrowId]);

            const escrow = res.rows[0];
            if (!escrow) throw { status: 404, message: 'Escrow not found' };

            const certMedia = escrow.certification_media;
            const certScore = parseFloat(escrow.certification_score);

            let autoVerdict = 'escalate'; // Default to human review
            let reason = '';

            // 2. Logic: If buyer disputes a defect that was already declared/captured in certification
            // Selectively check based on category
            if (disputeCategory === 'mechanical') {
                // If certification already shows "Service Engine" or "Flags" in OBD
                const hasObdFlags = certMedia && certMedia.obd_flags && certMedia.obd_flags.length > 0;
                if (hasObdFlags) {
                    autoVerdict = 'reject';
                    reason = 'Disputed mechanical issue was already disclosed in the certified OBD scan.';
                }
            } else if (disputeCategory === 'cosmetic') {
                // If certification media (photos) clearly show the area
                // (Simulated logic: in production, AI would compare buyer photo to cert photo)
                autoVerdict = 'escalate';
                reason = 'Analyzing visual consistency. Admin review required.';
            }

            // 3. Update Escrow Status
            await client.query(`
                UPDATE auction_escrow 
                SET status = $1, dispute_meta = $2, updated_at = NOW() 
                WHERE id = $3
            `, [autoVerdict === 'reject' ? 'active' : 'disputed', JSON.stringify({ category: disputeCategory, verdict: autoVerdict, reason }), escrowId]);

            await client.query('COMMIT');
            return { verdict: autoVerdict, reason };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new AutoResolutionService();
