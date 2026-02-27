const { pool } = require('../config/database');
const socketService = require('./socketService');

class NotificationService {
    async createNotification(userId, data) {
        const { title, message, type, link, metadata = {} } = data;
        const sql = `
            INSERT INTO notifications (user_id, title, message, type, link, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await pool.query(sql, [userId, title, message, type, link, JSON.stringify(metadata)]);

        // Push notification via socket if user is online
        socketService.sendToUser(userId, 'notification', result.rows[0]);

        return result.rows[0];
    }

    async getMyNotifications(userId, limit = 50, offset = 0) {
        const sql = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(sql, [userId, limit, offset]);
        return result.rows;
    }

    async markAsRead(userId, notificationId) {
        const sql = `
            UPDATE notifications 
            SET is_read = true 
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        const result = await pool.query(sql, [notificationId, userId]);
        return result.rows[0];
    }

    async getUnreadCount(userId) {
        const sql = `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`;
        const result = await pool.query(sql, [userId]);
        return parseInt(result.rows[0].count);
    }

    // Helper for Manual Funding (Admin Alert)
    async notifyManualFundingRequest(user, transaction) {
        // Find all admins
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of adminRes.rows) {
            await this.createNotification(admin.id, {
                title: 'New Manual Funding',
                message: `User ${user.display_name} requested ₦${parseFloat(transaction.amount).toLocaleString()}.`,
                type: 'admin_wallet',
                link: '/admin/wallet',
                metadata: { transaction_id: transaction.id, user_id: user.id }
            });
        }
    }

    // Generic Helper to notify all admins
    async notifyAdmins(data) {
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of adminRes.rows) {
            await this.createNotification(admin.id, data);
        }
    }

    // Helper for Concierge Request (Admin Alert)
    async notifyNewConciergeRequest(user, request) {
        await this.notifyAdmins({
            title: 'New Concierge Request',
            message: `${user.display_name} requested ${request.request_type}.`,
            type: 'admin_concierge',
            link: '/admin/concierge',
            metadata: { request_id: request.id, user_id: user.id }
        });
    }

    // Helper for KYC (Admin Alert)
    async notifyNewKYC(user) {
        await this.notifyAdmins({
            title: 'New KYC Submission',
            message: `${user.display_name} has submitted documents for verification.`,
            type: 'admin_kyc',
            link: '/admin/users',
            metadata: { user_id: user.id }
        });
    }

    // Helper for Funding Status Update (User Alert)
    async notifyFundingStatusUpdate(user, transaction) {
        const status = transaction.status === 'completed' ? 'Approved' : 'Declined';
        await this.createNotification(user.id, {
            title: `Wallet Funding ${status}`,
            message: `Your manual funding of ₦${parseFloat(transaction.amount).toLocaleString()} has been ${status.toLowerCase()}.`,
            type: 'wallet_update',
            link: '/dashboard/wallet',
            metadata: { transaction_id: transaction.id, status: transaction.status }
        });
    }
}

module.exports = new NotificationService();
