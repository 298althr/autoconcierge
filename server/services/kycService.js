const { pool } = require('../config/database');

class KYCService {
    /**
     * Checks if a transaction amount requires KYC and if the user meets that requirement.
     * Threshold: ₦500,000
     */
    async enforceKYC(userId, amount) {
        // Amounts are in Naira. 500k threshold.
        const KYC_THRESHOLD = 500000;

        if (amount <= KYC_THRESHOLD) {
            return { required: false, allowed: true };
        }

        const result = await pool.query('SELECT kyc_status FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        if (user.kyc_status === 'verified') {
            return { required: true, allowed: true };
        }

        // If not verified, we block and throw an error with specific code for frontend handling
        throw {
            status: 403,
            message: `KYC verification is required for transactions exceeding ₦${KYC_THRESHOLD.toLocaleString()}`,
            code: 'KYC_REQUIRED',
            kyc_status: user.kyc_status,
            threshold: KYC_THRESHOLD
        };
    }
}

module.exports = new KYCService();
