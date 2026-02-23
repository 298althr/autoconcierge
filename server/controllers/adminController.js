const { pool } = require('../config/database');

class AdminController {
    /**
     * Get system-wide stats for the dashboard
     */
    async getDashboardStats(req, res, next) {
        try {
            const userCount = await pool.query('SELECT COUNT(*) FROM users');
            const vehicleCount = await pool.query('SELECT COUNT(*) FROM vehicles');
            const liveAuctions = await pool.query("SELECT COUNT(*) FROM auctions WHERE status = 'live'");
            const totalRevenue = await pool.query("SELECT SUM(amount) FROM transactions WHERE type = 'settlement'");

            res.status(200).json({
                success: true,
                data: {
                    users: parseInt(userCount.rows[0].count),
                    vehicles: parseInt(vehicleCount.rows[0].count),
                    live_auctions: parseInt(liveAuctions.rows[0].count),
                    revenue: parseFloat(totalRevenue.rows[0].sum || 0)
                }
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get list of users with search/filter
     */
    async getUsers(req, res, next) {
        try {
            const result = await pool.query('SELECT id, email, display_name, role, kyc_status, created_at FROM users ORDER BY created_at DESC');
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Update KYC status for a user
     */
    async updateKYCStatus(req, res, next) {
        try {
            const { userId, status, reason } = req.body;
            await pool.query(
                'UPDATE users SET kyc_status = $1, updated_at = NOW() WHERE id = $2',
                [status, userId]
            );

            // Log action
            await pool.query(
                'INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
                [req.user.id, 'update_kyc', 'user', userId, JSON.stringify({ status, reason })]
            );

            res.status(200).json({
                success: true,
                message: `User KYC status updated to ${status}`
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get audit logs
     */
    async getAuditLogs(req, res, next) {
        try {
            const result = await pool.query(`
                SELECT a.*, u.email as admin_email 
                FROM admin_audit_log a 
                JOIN users u ON a.admin_id = u.id 
                ORDER BY a.created_at DESC 
                LIMIT 100
            `);
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AdminController();
