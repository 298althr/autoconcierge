const { pool } = require('../config/database');
const settlementService = require('../services/settlementService');

class MeController {
    /**
     * Get vehicles owned by the logged-in user (Garage)
     */
    async getMyGarage(req, res, next) {
        try {
            const result = await pool.query(
                'SELECT * FROM vehicles WHERE owner_id = $1 ORDER BY updated_at DESC',
                [req.user.id]
            );
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get all bids placed by the user
     */
    async getMyBids(req, res, next) {
        try {
            const result = await pool.query(`
                SELECT b.*, v.make, v.model, v.year, a.status as auction_status, a.current_price
                FROM bids b
                JOIN auctions a ON b.auction_id = a.id
                JOIN vehicles v ON a.vehicle_id = v.id
                WHERE b.user_id = $1
                ORDER BY b.created_at DESC
            `, [req.user.id]);

            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const { display_name, phone, avatar_url, address, occupation } = req.body;

            // First get the existing kyc_data to merge the new non-identity fields
            const userRes = await pool.query('SELECT kyc_data FROM users WHERE id = $1', [req.user.id]);
            let currentKycData = typeof userRes.rows[0].kyc_data === 'string' ? JSON.parse(userRes.rows[0].kyc_data || '{}') : (userRes.rows[0].kyc_data || {});

            const updatedKycData = {
                ...currentKycData,
                ...(address && { address }),
                ...(occupation && { occupation })
            };

            const result = await pool.query(
                `UPDATE users 
                 SET display_name = COALESCE($1, display_name), 
                     phone = COALESCE($2, phone), 
                     avatar_url = COALESCE($3, avatar_url),
                     kyc_data = $4
                 WHERE id = $5
                 RETURNING id, email, display_name, phone, avatar_url, role, kyc_data`,
                [display_name, phone, avatar_url, JSON.stringify(updatedKycData), req.user.id]
            );
            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Settle an auction (payment)
     */
    async settleAuction(req, res, next) {
        try {
            const { auctionId } = req.params;
            const result = await settlementService.settleAuction(req.user.id, auctionId);
            res.status(200).json({
                success: true,
                message: 'Auction settled successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new MeController();
