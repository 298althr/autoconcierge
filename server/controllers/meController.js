const { pool } = require('../config/database');
const settlementService = require('../services/settlementService');
const notificationService = require('../services/notificationService');

class MeController {
    /**
     * Get vehicles owned by the logged-in user (Garage)
     */
    async getMyGarage(req, res, next) {
        try {
            const result = await pool.query(`
                SELECT v.*, 
                       a.id as active_auction_id, a.status as active_auction_status
                FROM vehicles v
                LEFT JOIN auctions a ON v.id = a.vehicle_id AND a.status IN ('scheduled', 'live', 'buy_now_locked', 'pending_seller_acceptance')
                WHERE v.owner_id = $1 
                ORDER BY v.updated_at DESC
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
     * Get items being sold by the user (Auctions and Pending Escrows)
     */
    async getMySales(req, res, next) {
        try {
            // This query returns both active auctions and active escrows for the user
            const result = await pool.query(`
                SELECT 
                    'escrow' as type,
                    ae.id, ae.stage, ae.status as escrow_status, ae.total_deal_amount as price,
                    v.make, v.model, v.year, v.images, 
                    u.display_name as counterpart_name,
                    ae.updated_at
                FROM auction_escrow ae
                JOIN auctions a ON ae.auction_id = a.id
                JOIN vehicles v ON a.vehicle_id = v.id
                JOIN users u ON ae.buyer_id = u.id
                WHERE ae.seller_id = $1 AND ae.status != 'released'

                UNION ALL

                SELECT 
                    'auction' as type,
                    a.id, a.status as stage, NULL as escrow_status, a.current_price as price,
                    v.make, v.model, v.year, v.images,
                    NULL as counterpart_name,
                    a.updated_at
                FROM auctions a
                JOIN vehicles v ON a.vehicle_id = v.id
                WHERE a.created_by = $1 AND a.status IN ('scheduled', 'live')
                AND NOT EXISTS (SELECT 1 FROM auction_escrow WHERE auction_id = a.id)

                ORDER BY updated_at DESC
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
                     kyc_data = $4,
                     kyc_status = CASE WHEN kyc_status = 'none' THEN 'verified' ELSE kyc_status END
                 WHERE id = $5
                 RETURNING id, email, display_name, phone, avatar_url, role, kyc_status, kyc_data`,
                [display_name, phone, avatar_url, JSON.stringify(updatedKycData), req.user.id]
            );
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

    async getNotifications(req, res, next) {
        try {
            const { limit, offset } = req.query;
            const data = await notificationService.getMyNotifications(req.user.id, limit, offset);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async markNotificationAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const data = await notificationService.markAsRead(req.user.id, id);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async getUnreadCount(req, res, next) {
        try {
            const count = await notificationService.getUnreadCount(req.user.id);
            res.status(200).json({ success: true, count });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new MeController();
